import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { deleteMyAccount, exportMyData, saveJson } from './accountApi';

// Yanlışlıkla silmeyi önlemek için yazılması gereken kelime
const CONFIRM_WORD = 'SİL';

export function AccountSection({ userId, email }: { userId: string; email: string | undefined }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const download = async () => {
    setExporting(true);
    setError(null);
    setNotice(null);
    try {
      const data = await exportMyData(userId, email);
      await saveJson(`kukki-verilerim-${new Date().toISOString().slice(0, 10)}.json`, data);
      setNotice('📦 Verilerin hazırlandı.');
    } catch (e) {
      console.warn('Veriler indirilemedi', e);
      setError('Verilerin hazırlanamadı, tekrar dene.');
    } finally {
      setExporting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError(null);
    try {
      // Başarılıysa oturum kapanır ve giriş ekranına yönlenilir
      await deleteMyAccount(userId);
    } catch (e) {
      console.warn('Hesap silinemedi', e);
      setError('Hesabın silinemedi. İnternet bağlantını kontrol edip tekrar dene; sorun sürerse bize yaz.');
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <AppText variant="headlineMd">⚙️ Hesap</AppText>
      <GameButton label={exporting ? 'Hazırlanıyor...' : '📦 Verilerimi İndir'} variant="soft" onPress={download} disabled={exporting} />
      <AppText variant="bodySm" color="textMuted">
        Kilerin, tariflerin, planın, listelerin, yorumların ve puanların tek bir dosyada.
      </AppText>

      {!confirming ? (
        <GameButton label="🗑️ Hesabımı Sil" variant="soft" onPress={() => setConfirming(true)} />
      ) : (
        <View style={[styles.danger, { borderColor: c.error }]}>
          <AppText variant="labelLg" color="error">
            Hesabını ve tüm verilerini kalıcı olarak silmek üzeresin
          </AppText>
          <AppText variant="bodySm" color="textMuted">
            Kilerin, tariflerin (paylaştıkların dahil), fotoğrafların, koleksiyonların, planın, yorumların ve puanların
            geri getirilemeyecek şekilde silinir. Önce verilerini indirmek isteyebilirsin.
          </AppText>
          <AppText variant="labelMd">Onaylamak için {CONFIRM_WORD} yaz:</AppText>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            autoCapitalize="characters"
            accessibilityLabel={`Onay için ${CONFIRM_WORD} yaz`}
            placeholder={CONFIRM_WORD}
            placeholderTextColor={c.textMuted}
            style={[styles.input, { backgroundColor: c.surfaceLow, color: c.text }]}
          />
          <View style={styles.row}>
            <GameButton
              label="Vazgeç"
              variant="soft"
              onPress={() => {
                setConfirming(false);
                setTyped('');
              }}
              style={styles.flex}
            />
            <GameButton
              label={deleting ? 'Siliniyor...' : 'Kalıcı Olarak Sil'}
              icon="delete-forever"
              onPress={remove}
              disabled={deleting || typed.trim().toLocaleUpperCase('tr-TR') !== CONFIRM_WORD}
              style={styles.flex}
            />
          </View>
        </View>
      )}

      {notice && (
        <AppText variant="bodySm" color="tertiary">
          {notice}
        </AppText>
      )}
      {error && <FormError text={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  danger: { borderWidth: 1.5, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  input: { fontFamily: FONT.bold, fontSize: 16, padding: SPACING.md, borderRadius: RADIUS.md },
  row: { flexDirection: 'row', gap: SPACING.sm },
  flex: { flex: 1 },
});

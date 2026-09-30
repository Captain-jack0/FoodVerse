import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/ui/Chip';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { REPORT_REASONS, reportContent, type ReportReason, type ReportTarget } from '../moderationApi';

type ReportButtonProps = { targetType: ReportTarget; targetId: string };

/** "🚩 Şikayet et" bağlantısı + sebep seçme penceresi */
export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setReason(null);
    setNote('');
    setError(null);
  };

  const submit = async () => {
    if (!reason) {
      setError('Bir sebep seç.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await reportContent(targetType, targetId, reason, note);
      setDone(result === 'duplicate' ? 'Bunu zaten şikayet etmiştin 👍' : 'Teşekkürler, şikayetin yöneticiye iletildi 🙏');
      close();
    } catch (e) {
      console.warn('Şikayet gönderilemedi', e);
      setError('Şikayet gönderilemedi, tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AppText variant="labelSm" color="textMuted">
        {done}
      </AppText>
    );
  }

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} hitSlop={6}>
        <AppText variant="labelMd" color="textMuted">
          🚩 Şikayet et
        </AppText>
      </Pressable>

      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={close}>
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Kapat">
            <Pressable style={[styles.card, { backgroundColor: c.card }]} onPress={() => undefined} accessibilityViewIsModal>
              <AppText variant="headlineMd">🚩 Neden şikayet ediyorsun?</AppText>
              <AppText variant="bodySm" color="textMuted">
                3 farklı kişi şikayet ederse içerik incelenene kadar gizlenir. Şikayetin anonimdir.
              </AppText>
              <View style={styles.reasons}>
                {REPORT_REASONS.map((r) => (
                  <Chip key={r.id} label={r.label} selected={reason === r.id} onPress={() => setReason(r.id)} />
                ))}
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="İstersen kısaca açıkla (isteğe bağlı)"
                placeholderTextColor={c.textMuted}
                maxLength={300}
                multiline
                accessibilityLabel="Şikayet açıklaması"
                style={[styles.input, { backgroundColor: c.surfaceLow, color: c.text }]}
              />
              {error && <FormError text={error} />}
              <View style={styles.actions}>
                <GameButton label="Vazgeç" variant="soft" onPress={close} style={styles.flex} />
                <GameButton label={busy ? '...' : 'Gönder'} icon="flag" onPress={submit} disabled={busy} style={styles.flex} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 23, 71, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  card: { width: '100%', maxWidth: 460, borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  input: {
    minHeight: 64,
    fontFamily: FONT.medium,
    fontSize: 15,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  flex: { flex: 1 },
});

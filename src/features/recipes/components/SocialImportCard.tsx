import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { parseSocialUrl } from '../recipeUtils';

type Feedback = { kind: 'error' | 'success'; text: string } | null;

const MAX_URL_LENGTH = 500;
const PLATFORM_NAME = { instagram: 'Instagram', tiktok: 'TikTok' } as const;

export function SocialImportCard({ isWide }: { isWide: boolean }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const paste = async () => {
    try {
      setUrl((await Clipboard.getStringAsync()).slice(0, MAX_URL_LENGTH));
      setFeedback(null);
    } catch (error) {
      console.warn('Panodan okunamadı', error);
      setFeedback({ kind: 'error', text: 'Panoya erişilemedi, linki elle yapıştırabilirsin.' });
    }
  };

  const submit = () => {
    const platform = parseSocialUrl(url);
    if (!platform) {
      setFeedback({ kind: 'error', text: 'Şimdilik sadece Instagram veya TikTok linki (https://...) alabiliyorum.' });
      return;
    }
    // ponytail: yapay zeka ile otomatik ayıklama gelene kadar link forma kaynak olarak taşınır
    setFeedback({
      kind: 'success',
      text: `${PLATFORM_NAME[platform]} linki alındı! 🎉 Malzemeleri ve adımları yaz, linki kaynağa ekledik.`,
    });
    router.push({ pathname: '/tarif/yeni', params: { url: url.trim() } });
    setUrl('');
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surfaceLow }, isWide && styles.cardWide]}>
      <View style={[styles.texts, isWide && styles.flex]}>
        <View style={[styles.badge, { backgroundColor: c.card }]}>
          <MaterialIcons name="auto-awesome" size={14} color={c.primary} />
          <AppText variant="labelSm" color="primary">
            YAPAY ZEKA MUTFAK SİHİRBAZI
          </AppText>
        </View>
        <AppText variant={isWide ? 'headlineLg' : 'headlineMd'}>Sosyal Medyadan Tarif Çek</AppText>
        <AppText variant={isWide ? 'bodyLg' : 'bodySm'} color="textMuted">
          Instagram Reels veya TikTok linkini yapıştır; malzemeler, püf noktaları ve adımlar defterine sıcacık bir
          düzende aktarılsın.
        </AppText>
      </View>

      <View style={[styles.form, isWide && styles.flex]}>
        <View style={[styles.inputRow, { backgroundColor: c.card }]}>
          <MaterialIcons name="link" size={20} color={c.textMuted} />
          <TextInput
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setFeedback(null);
            }}
            onSubmitEditing={submit}
            maxLength={MAX_URL_LENGTH}
            placeholder="https://instagram.com/reel/..."
            placeholderTextColor={c.textMuted}
            accessibilityLabel="Instagram veya TikTok linki"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.input, { color: c.text }]}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Panodan yapıştır" onPress={paste} hitSlop={8}>
            <MaterialIcons name="content-paste" size={20} color={c.primary} />
          </Pressable>
        </View>
        <GameButton label="Büyülü Şefe Dönüştür" icon="auto-fix-high" variant="primary" onPress={submit} disabled={!url.trim()} />
        {feedback && (
          <AppText variant="bodySm" color={feedback.kind === 'error' ? 'error' : 'tertiary'} accessibilityLiveRegion="polite">
            {feedback.text}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  cardWide: { flexDirection: 'row', alignItems: 'center', padding: SPACING.xl, gap: SPACING.xl },
  flex: { flex: 1 },
  texts: { gap: SPACING.sm },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  form: { gap: SPACING.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  input: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: 12, minWidth: 0 },
});

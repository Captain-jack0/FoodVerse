import { useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { logProfanityAttempt } from '@/features/moderation/moderationApi';
import { containsProfanity, PROFANITY_MESSAGE } from '@/features/moderation/profanity';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { COMMENT_MAX, validateComment } from '../commentUtils';

type CommentComposerProps = {
  /** Tarif sahibi kendi tarifine öneri yazamaz */
  canSuggest: boolean;
  onSend: (body: string, isSuggestion: boolean) => Promise<boolean>;
};

export function CommentComposer({ canSuggest, onSend }: CommentComposerProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [body, setBody] = useState('');
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const problem = validateComment(body);
    if (problem) {
      setError(problem);
      return;
    }
    if (containsProfanity(body)) {
      logProfanityAttempt('yorum');
      setError(PROFANITY_MESSAGE);
      return;
    }
    setSending(true);
    const ok = await onSend(body, canSuggest && isSuggestion);
    setSending(false);
    if (ok) {
      setBody('');
      setIsSuggestion(false);
    }
  };

  return (
    <View style={[styles.box, { backgroundColor: c.card }]}>
      <TextInput
        value={body}
        onChangeText={(v) => {
          setBody(v);
          setError(null);
        }}
        placeholder={isSuggestion ? 'Önerin ne? (örn: Tuzu yarıya indirince daha dengeli oluyor)' : 'Yorumunu yaz…'}
        placeholderTextColor={c.textMuted}
        accessibilityLabel="Yorum"
        maxLength={COMMENT_MAX}
        multiline
        style={[styles.input, { backgroundColor: c.surfaceLow, color: c.text }]}
      />
      {error && (
        <AppText variant="bodySm" color="error">
          {error}
        </AppText>
      )}
      <View style={styles.row}>
        {canSuggest ? (
          <Pressable style={styles.toggle} onPress={() => setIsSuggestion((v) => !v)} accessibilityRole="switch">
            <Switch
              value={isSuggestion}
              onValueChange={setIsSuggestion}
              accessibilityLabel="Bu bir öneri"
              trackColor={{ true: c.secondaryContainer, false: c.surfaceHigh }}
              thumbColor={isSuggestion ? c.onSecondaryContainer : c.card}
            />
            <AppText variant="labelMd">💡 Bu bir öneri</AppText>
          </Pressable>
        ) : (
          <View style={styles.flex} />
        )}
        <GameButton label={sending ? '...' : 'Gönder'} icon="send" onPress={send} disabled={sending} />
      </View>
      {canSuggest && isSuggestion && (
        <AppText variant="bodySm" color="textMuted">
          Tarif sahibi önerini uygularsa yeni sürümde adın anılır ve ileride Şef Puanı kazanırsın.
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  input: {
    minHeight: 72,
    fontFamily: FONT.medium,
    fontSize: 15,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexShrink: 1 },
  flex: { flex: 1 },
});

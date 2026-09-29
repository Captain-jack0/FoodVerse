import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import type { ListenState } from '../useSpeechRecognition';

type AssistantBarProps = {
  listen: ListenState;
  muted: boolean;
  speaking: boolean;
  lastHeard: string | null;
  feedback: string | null;
  onToggleMute: () => void;
  onText: (text: string) => void;
};

export function AssistantBar({ listen, muted, speaking, lastHeard, feedback, onToggleMute, onText }: AssistantBarProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [text, setText] = useState('');

  const status = !listen.supported
    ? 'Sesli komut bu cihazda yakında; yazarak komut verebilirsin.'
    : listen.error
      ? listen.error
      : muted
        ? 'Susturuldu — dinlemiyorum.'
        : speaking
          ? 'Konuşuyorum…'
          : listen.listening
            ? 'Dinliyorum… "sonraki", "tekrar", "10 dakika zamanlayıcı"'
            : 'Mikrofon hazırlanıyor…';

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onText(value);
    setText('');
  };

  const live = listen.supported && !muted && listen.listening && !listen.error;

  return (
    <View style={[styles.bar, { backgroundColor: c.surfaceLow }]}>
      <View style={styles.row}>
        <View style={[styles.mic, { backgroundColor: live ? c.primaryContainer : c.surfaceHigh }]}>
          <MaterialIcons name={live ? 'mic' : 'mic-off'} size={22} color={live ? c.onPrimary : c.textMuted} />
        </View>
        <AppText variant="bodySm" color={listen.error ? 'error' : 'textMuted'} style={styles.flex} accessibilityLiveRegion="polite">
          {status}
        </AppText>
        {listen.supported && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Dinlemeyi aç' : 'Sustur'}
            onPress={onToggleMute}
            style={[styles.muteButton, { backgroundColor: c.card }]}>
            <MaterialIcons name={muted ? 'volume-off' : 'hearing'} size={18} color={c.primary} />
            <AppText variant="labelMd" color="primary">
              {muted ? 'Dinle' : 'Sustur'}
            </AppText>
          </Pressable>
        )}
      </View>

      {(lastHeard || feedback) && (
        <View style={[styles.bubble, { backgroundColor: c.card }]}>
          {lastHeard && (
            <AppText variant="bodySm" color="textMuted">
              🗣️ “{lastHeard}”
            </AppText>
          )}
          {feedback && <AppText variant="labelMd">🤖 {feedback}</AppText>}
        </View>
      )}

      <View style={[styles.inputRow, { backgroundColor: c.card }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="Komut yaz: sonraki, tekrar, malzemeler…"
          placeholderTextColor={c.textMuted}
          accessibilityLabel="Yazılı komut"
          maxLength={120}
          returnKeyType="send"
          style={[styles.input, { color: c.text }]}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Komutu gönder" onPress={submit} hitSlop={8}>
          <MaterialIcons name="send" size={22} color={c.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderRadius: RADIUS.xl, padding: SPACING.md, gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  flex: { flex: 1 },
  mic: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  bubble: { borderRadius: RADIUS.md, padding: SPACING.sm, gap: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full },
  input: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: 10, minWidth: 0 },
});

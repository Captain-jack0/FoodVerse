import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import type { Comment } from '../commentsApi';

type PublishVersionModalProps = {
  nextVersion: number;
  openSuggestions: Comment[];
  onPublish: (note: string, appliedIds: string[]) => Promise<boolean>;
  onClose: () => void;
};

export function PublishVersionModal({ nextVersion, openSuggestions, onPublish, onClose }: PublishVersionModalProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [note, setNote] = useState('');
  const [applied, setApplied] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => setApplied((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const publish = async () => {
    setBusy(true);
    const ok = await onPublish(note, applied);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable style={[styles.card, { backgroundColor: c.card }]} onPress={() => undefined} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content}>
            <AppText variant="headlineMd">🚀 Sürüm {nextVersion}&apos;i yayınla</AppText>
            <AppText variant="bodySm" color="textMuted">
              Tarifin şu anki hali (malzemeler, adımlar, püf noktası) sürüm geçmişine kaydedilir. Önce Düzenle ile
              değişiklikleri yapmış olmalısın.
            </AppText>

            <AppText variant="labelLg">Neler değişti?</AppText>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="örn: Tuz yarıya indirildi, pişirme süresi 5 dk uzatıldı"
              placeholderTextColor={c.textMuted}
              maxLength={200}
              multiline
              accessibilityLabel="Değişiklik notu"
              style={[styles.input, { backgroundColor: c.surfaceLow, color: c.text }]}
            />

            {openSuggestions.length > 0 && (
              <>
                <AppText variant="labelLg">Bu sürümde uyguladığın öneriler</AppText>
                {openSuggestions.map((s) => {
                  const checked = applied.includes(s.id);
                  return (
                    <Pressable
                      key={s.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      onPress={() => toggle(s.id)}
                      style={[styles.suggestion, { backgroundColor: checked ? c.surfaceHigh : c.surfaceLow }]}>
                      <MaterialIcons
                        name={checked ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={checked ? c.primary : c.outline}
                      />
                      <AppText variant="bodySm" style={styles.flex} numberOfLines={3}>
                        <AppText variant="labelMd">{s.author.name}: </AppText>
                        {s.body}
                      </AppText>
                    </Pressable>
                  );
                })}
              </>
            )}

            <GameButton label={busy ? 'Yayınlanıyor...' : 'Sürümü Yayınla'} icon="rocket-launch" onPress={publish} disabled={busy} />
            <GameButton label="Vazgeç" variant="soft" onPress={onClose} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
  card: { width: '100%', maxWidth: 500, maxHeight: '90%', borderRadius: RADIUS.xl, overflow: 'hidden' },
  content: { padding: SPACING.lg, gap: SPACING.sm },
  input: {
    minHeight: 64,
    fontFamily: FONT.medium,
    fontSize: 15,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    textAlignVertical: 'top',
  },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md },
  flex: { flex: 1 },
});

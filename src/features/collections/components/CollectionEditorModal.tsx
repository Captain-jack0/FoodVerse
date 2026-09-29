import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { COLLECTION_EMOJIS, COLLECTION_NAME_MAX, validateCollectionName } from '../collectionUtils';
import type { Collection } from '../types';

type CollectionEditorModalProps = {
  /** Verilirse düzenleme, verilmezse yeni koleksiyon */
  editing?: Collection;
  existing: Collection[];
  onSave: (name: string, emoji: string) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onClose: () => void;
};

export function CollectionEditorModal({ editing, existing, onSave, onDelete, onClose }: CollectionEditorModalProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [name, setName] = useState(editing?.name ?? '');
  const [emoji, setEmoji] = useState(editing?.emoji ?? COLLECTION_EMOJIS[0]);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    const problem = validateCollectionName(name, existing, editing?.id);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    const ok = await onSave(name, emoji);
    setBusy(false);
    if (ok) onClose();
  };

  const remove = async () => {
    if (!onDelete) return;
    setBusy(true);
    const ok = await onDelete();
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable style={[styles.card, { backgroundColor: c.card }]} onPress={() => undefined} accessibilityViewIsModal>
          <AppText variant="headlineMd">
            {emoji} {editing ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon'}
          </AppText>
          <TextField
            label="Ad"
            icon="collections-bookmark"
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(undefined);
            }}
            onSubmitEditing={save}
            error={error}
            placeholder="örn: Hafta İçi Pratikler"
            maxLength={COLLECTION_NAME_MAX}
          />
          <AppText variant="labelLg">Simge</AppText>
          <View style={styles.emojis}>
            {COLLECTION_EMOJIS.map((e) => (
              <Pressable
                key={e}
                accessibilityRole="radio"
                accessibilityState={{ checked: emoji === e }}
                accessibilityLabel={`Simge ${e}`}
                onPress={() => setEmoji(e)}
                style={[styles.emojiOption, { backgroundColor: c.surfaceLow, borderColor: emoji === e ? c.primary : 'transparent' }]}>
                <AppText style={styles.emojiText}>{e}</AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <GameButton label="Vazgeç" variant="soft" onPress={onClose} style={styles.flex} />
            <GameButton label={busy ? '...' : 'Kaydet'} icon="save" onPress={save} disabled={busy} style={styles.flex} />
          </View>

          {editing && onDelete && (
            confirmDelete ? (
              <View style={styles.confirm}>
                <AppText variant="bodySm" color="textMuted">
                  Koleksiyon silinir; içindeki tarifler defterinde kalır.
                </AppText>
                <View style={styles.actions}>
                  <GameButton label="Vazgeç" variant="soft" onPress={() => setConfirmDelete(false)} style={styles.flex} />
                  <GameButton label="Evet, sil" icon="delete" onPress={remove} disabled={busy} style={styles.flex} />
                </View>
              </View>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={styles.deleteLink}>
                <AppText variant="labelLg" color="error">
                  Koleksiyonu sil
                </AppText>
              </Pressable>
            )
          )}
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
  card: { width: '100%', maxWidth: 460, borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  emojis: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  emojiOption: { width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 24, lineHeight: 30 },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  flex: { flex: 1 },
  confirm: { gap: SPACING.xs, marginTop: SPACING.sm },
  deleteLink: { alignSelf: 'center', padding: SPACING.sm },
});

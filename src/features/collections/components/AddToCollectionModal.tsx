import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { Collection } from '../types';

type AddToCollectionModalProps = {
  recipeId: string;
  recipeTitle: string;
  collections: Collection[];
  error: string | null;
  onToggle: (collectionId: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
};

export function AddToCollectionModal({
  recipeId,
  recipeTitle,
  collections,
  error,
  onToggle,
  onCreateNew,
  onClose,
}: AddToCollectionModalProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable style={[styles.card, { backgroundColor: c.card }]} onPress={() => undefined} accessibilityViewIsModal>
          <AppText variant="headlineMd">📚 Koleksiyonlara ekle</AppText>
          <AppText variant="bodySm" color="textMuted">
            {recipeTitle} hangi koleksiyonlarda olsun? Birden fazla seçebilirsin.
          </AppText>

          <ScrollView contentContainerStyle={styles.list}>
            {collections.length === 0 && (
              <AppText variant="bodySm" color="textMuted">
                Henüz koleksiyonun yok. Hemen bir tane oluştur!
              </AppText>
            )}
            {collections.map((col) => {
              const checked = col.recipeIds.includes(recipeId);
              return (
                <Pressable
                  key={col.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  onPress={() => onToggle(col.id)}
                  style={[styles.row, { backgroundColor: checked ? c.surfaceHigh : c.surfaceLow }]}>
                  <AppText style={styles.emoji}>{col.emoji}</AppText>
                  <AppText variant="labelLg" style={styles.flex}>
                    {col.name}
                  </AppText>
                  <MaterialIcons
                    name={checked ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={checked ? c.primary : c.outline}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          {error && <FormError text={error} />}
          <GameButton label="Yeni Koleksiyon" icon="add" variant="soft" onPress={onCreateNew} />
          <GameButton label="Tamam" onPress={onClose} />
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
  card: { width: '100%', maxWidth: 460, maxHeight: '85%', borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  list: { gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md },
  emoji: { fontSize: 24, lineHeight: 30 },
  flex: { flex: 1 },
});

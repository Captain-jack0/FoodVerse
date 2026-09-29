import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { filterRecipes } from '@/features/recipes/recipeUtils';
import type { Recipe } from '@/features/recipes/types';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

type RecipePickerModalProps = {
  title: string;
  recipes: Recipe[];
  onPick: (recipeId: string) => void;
  onClose: () => void;
};

export function RecipePickerModal({ title, recipes, onPick, onClose }: RecipePickerModalProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [query, setQuery] = useState('');
  // Favoriler ve çok pişirilenler önce
  const sorted = [...filterRecipes(recipes, 'all', query)].sort(
    (a, b) => Number(b.favorite) - Number(a.favorite) || b.cookedCount - a.cookedCount,
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable style={[styles.card, { backgroundColor: c.card }]} onPress={() => undefined} accessibilityViewIsModal>
          <View style={styles.header}>
            <AppText variant="headlineMd" style={styles.flex}>
              {title}
            </AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={c.textMuted} />
            </Pressable>
          </View>
          <View style={[styles.search, { backgroundColor: c.surfaceLow }]}>
            <MaterialIcons name="search" size={20} color={c.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tarif ara..."
              placeholderTextColor={c.textMuted}
              accessibilityLabel="Tarif ara"
              maxLength={60}
              style={[styles.searchInput, { color: c.text }]}
            />
          </View>
          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {sorted.length === 0 ? (
              <AppText variant="bodySm" color="textMuted">
                Tarif bulunamadı.
              </AppText>
            ) : (
              sorted.map((r) => (
                <Pressable
                  key={r.id}
                  accessibilityRole="button"
                  onPress={() => onPick(r.id)}
                  style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.surfaceHigh : c.surfaceLow }]}>
                  <AppText style={styles.emoji}>{r.emoji}</AppText>
                  <View style={styles.flex}>
                    <AppText variant="labelLg" numberOfLines={1}>
                      {r.title}
                    </AppText>
                    <AppText variant="bodySm" color="textMuted">
                      ⏱ {r.minutes} dk{r.favorite ? ' · ❤️' : ''}
                    </AppText>
                  </View>
                  <MaterialIcons name="add-circle-outline" size={22} color={c.primary} />
                </Pressable>
              ))
            )}
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
  card: { width: '100%', maxWidth: 480, maxHeight: '85%', borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  flex: { flex: 1 },
  search: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full },
  searchInput: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: 10, minWidth: 0 },
  list: { gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md },
  emoji: { fontSize: 28, lineHeight: 34 },
});

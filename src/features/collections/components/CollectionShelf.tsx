import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { starterSuggestions } from '../collectionUtils';
import type { Collection } from '../types';

type CollectionShelfProps = {
  collections: Collection[];
  totalRecipes: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  onEdit: (collection: Collection) => void;
  onQuickCreate: (name: string, emoji: string) => void;
};

function ShelfCard({
  selected,
  onPress,
  label,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? c.primary : c.card,
          boxShadow: selected ? `0 3px 0 ${c.pressShadow}` : '0 3px 0 rgba(48, 60, 108, 0.08)',
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}>
      {children}
    </Pressable>
  );
}

/** Tarif Defteri'nin üstündeki koleksiyon rafı */
export function CollectionShelf({
  collections,
  totalRecipes,
  selectedId,
  onSelect,
  onCreate,
  onEdit,
  onQuickCreate,
}: CollectionShelfProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const suggestions = collections.length < 2 ? starterSuggestions(collections).slice(0, 3) : [];
  const text = (selected: boolean) => (selected ? c.onPrimary : c.text);

  return (
    <View style={styles.wrapper}>
      <AppText variant="labelMd" color="textMuted">
        📚 KOLEKSİYONLARIM
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <ShelfCard selected={selectedId === null} onPress={() => onSelect(null)} label="Tüm tarifler">
          <AppText style={styles.emoji}>📖</AppText>
          <AppText variant="labelLg" style={{ color: text(selectedId === null) }}>
            Tüm Tarifler
          </AppText>
          <AppText variant="labelSm" style={{ color: text(selectedId === null) }}>
            {totalRecipes} tarif
          </AppText>
        </ShelfCard>

        {collections.map((col) => {
          const selected = col.id === selectedId;
          return (
            <ShelfCard key={col.id} selected={selected} onPress={() => onSelect(col.id)} label={`${col.name} koleksiyonu`}>
              <AppText style={styles.emoji}>{col.emoji}</AppText>
              <AppText variant="labelLg" numberOfLines={1} style={{ color: text(selected) }}>
                {col.name}
              </AppText>
              <View style={styles.meta}>
                <AppText variant="labelSm" style={{ color: text(selected) }}>
                  {col.recipeIds.length} tarif
                </AppText>
                {selected && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${col.name} koleksiyonunu düzenle`}
                    onPress={() => onEdit(col)}
                    hitSlop={8}>
                    <MaterialIcons name="edit" size={16} color={c.onPrimary} />
                  </Pressable>
                )}
              </View>
            </ShelfCard>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={onCreate}
          style={[styles.card, styles.newCard, { borderColor: c.outline }]}>
          <MaterialIcons name="add" size={28} color={c.primary} />
          <AppText variant="labelLg" color="primary">
            Yeni Koleksiyon
          </AppText>
        </Pressable>
      </ScrollView>

      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <AppText variant="bodySm" color="textMuted">
            💡 Hızlı başla:
          </AppText>
          {suggestions.map((s) => (
            <Pressable
              key={s.name}
              accessibilityRole="button"
              accessibilityLabel={`${s.name} koleksiyonu oluştur`}
              onPress={() => onQuickCreate(s.name, s.emoji)}
              style={[styles.suggestion, { backgroundColor: c.surfaceHigh }]}>
              <AppText variant="labelMd">
                + {s.emoji} {s.name}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SPACING.sm },
  row: { gap: SPACING.sm, paddingVertical: SPACING.xs, paddingHorizontal: 2 },
  card: { width: 140, minHeight: 104, borderRadius: RADIUS.lg, padding: SPACING.md, gap: 2, justifyContent: 'flex-end' },
  newCard: { borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28, lineHeight: 34 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm },
  suggestion: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
});

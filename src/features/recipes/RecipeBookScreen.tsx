import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { BookStatsCard } from './components/BookStatsCard';
import { RecipeCard } from './components/RecipeCard';
import { SocialImportCard } from './components/SocialImportCard';
import { FILTER_TAGS, MOCK_RECIPES, RECIPE_TAGS } from './mockRecipes';
import { bookStats, filterRecipes, type RecipeFilter } from './recipeUtils';
import type { Recipe } from './types';

const MAX_QUERY_LENGTH = 60;

function gridColumns(width: number) {
  if (width >= 1200) return 3;
  if (width >= 700) return 2;
  return 1;
}

export function RecipeBookScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const { width } = useWindowDimensions();

  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [query, setQuery] = useState('');

  const visible = filterRecipes(recipes, filter, query);
  const stats = bookStats(recipes);
  const columns = gridColumns(width);

  const toggleFavorite = (id: string) =>
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)));

  // ponytail: tarif id'si asistana taşınınca sesli adım adım pişirme başlayacak
  const cook = () => router.push('/asistan');

  return (
    <Screen>
      <SocialImportCard isWide={isWide} />

      <View style={[styles.toolbar, isWide && styles.toolbarWide]}>
        <View style={[styles.search, { backgroundColor: c.surfaceHigh }, isWide && styles.searchWide]}>
          <MaterialIcons name="search" size={20} color={c.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Tariflerimde ara..."
            placeholderTextColor={c.textMuted}
            accessibilityLabel="Tariflerde ara"
            style={[styles.searchInput, { color: c.text }]}
          />
        </View>
        <GameButton label="Yeni Tarif Ekle" icon="add-circle-outline" variant="sunny" onPress={() => router.push('/tarif/yeni')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={`📖 Tümü (${recipes.length})`} selected={filter === 'all'} onPress={() => setFilter('all')} />
        {FILTER_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={`${RECIPE_TAGS[tag].emoji} ${RECIPE_TAGS[tag].label}`}
            selected={filter === tag}
            onPress={() => setFilter((prev) => (prev === tag ? 'all' : tag))}
          />
        ))}
      </ScrollView>

      {visible.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.surfaceLow }]}>
          <AppText style={styles.emptyEmoji}>🔍</AppText>
          <AppText variant="headlineMd">Bu rafta tarif yok</AppText>
          <AppText variant="bodySm" color="textMuted">
            Başka bir filtre dene ya da yeni bir tarif ekle.
          </AppText>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((recipe) => (
            <View key={recipe.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
              <RecipeCard recipe={recipe} onToggleFavorite={toggleFavorite} onCook={cook} />
            </View>
          ))}
        </View>
      )}

      <BookStatsCard
        stats={stats}
        mostCookedTitle={recipes.find((r) => r.id === stats.mostCooked)?.title ?? null}
        isWide={isWide}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: SPACING.sm, marginTop: SPACING.sm },
  toolbarWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  searchWide: { flex: 1, maxWidth: 420 },
  searchInput: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: 10, minWidth: 0 },
  chips: { gap: SPACING.sm, paddingVertical: SPACING.xs, paddingHorizontal: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  cell: { padding: 8 },
  empty: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.xs },
  emptyEmoji: { fontSize: 40, lineHeight: 50 },
});

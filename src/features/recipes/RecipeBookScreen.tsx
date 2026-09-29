import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { CollectionEditorModal } from '@/features/collections/components/CollectionEditorModal';
import { CollectionShelf } from '@/features/collections/components/CollectionShelf';
import type { Collection } from '@/features/collections/types';
import { useCollections } from '@/features/collections/useCollections';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { BookStatsCard } from './components/BookStatsCard';
import { RecipeCard } from './components/RecipeCard';
import { SocialImportCard } from './components/SocialImportCard';
import { FILTER_TAGS, RECIPE_TAGS } from './recipeTags';
import { bookStats, filterRecipes, type RecipeFilter } from './recipeUtils';
import { useMyRecipes } from './useMyRecipes';

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

  const { recipes, status, actionError, reload, toggleFavorite } = useMyRecipes();
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [query, setQuery] = useState('');
  const collections = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  // null: kapalı, 'new': yeni koleksiyon, Collection: düzenleme
  const [editor, setEditor] = useState<'new' | Collection | null>(null);
  const selectedCollection = collections.collections.find((col) => col.id === selectedCollectionId) ?? null;

  // ponytail: koleksiyonda başkasının tarifleri olursa (Keşfet) burada onları da çekmek gerekecek
  const visible = filterRecipes(recipes, filter, query).filter(
    (r) => !selectedCollection || selectedCollection.recipeIds.includes(r.id),
  );
  const stats = bookStats(recipes);
  const columns = gridColumns(width);

  const cook = (id: string) => router.push({ pathname: '/pisir/[id]', params: { id } });
  const open = (id: string) => router.push({ pathname: '/tarif/[id]', params: { id } });
  const newRecipe = () => router.push('/tarif/yeni');
  const hasRecipes = status === 'ready' && recipes.length > 0;

  return (
    <Screen>
      <SocialImportCard isWide={isWide} />

      {status !== 'ready' ? (
        <LoadState status={status} onRetry={reload} />
      ) : !hasRecipes ? (
        <HintCard
          emoji="📖"
          title="Tarif defterin henüz boş"
          text="İki yolu var: yukarıya Instagram/TikTok linki yapıştır ya da kendi tarifini adım adım yaz. Eklediğin tarifler Kiler'deki önerilerde de görünür.">
          <GameButton label="İlk Tarifimi Yaz" icon="edit-note" variant="sunny" onPress={newRecipe} />
        </HintCard>
      ) : (
        <>
          <CollectionShelf
            collections={collections.collections}
            totalRecipes={recipes.length}
            selectedId={selectedCollectionId}
            onSelect={setSelectedCollectionId}
            onCreate={() => setEditor('new')}
            onEdit={setEditor}
            onQuickCreate={(name, emoji) => collections.create(name, emoji)}
          />
          {collections.actionError && <FormError text={collections.actionError} />}

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
            <GameButton label="Yeni Tarif Ekle" icon="add-circle-outline" variant="sunny" onPress={newRecipe} />
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

          {actionError && <FormError text={actionError} />}

          {visible.length === 0 ? (
            selectedCollection && selectedCollection.recipeIds.length === 0 ? (
              <HintCard
                emoji={selectedCollection.emoji}
                title={`${selectedCollection.name} henüz boş`}
                text="Bir tarifi açıp 📚 Koleksiyona ekle butonuyla bu koleksiyona ekleyebilirsin."
              />
            ) : (
              <HintCard emoji="🔍" title="Bu rafta tarif yok" text="Başka bir filtre ya da arama dene." />
            )
          ) : (
            <View style={styles.grid}>
              {visible.map((recipe) => (
                <View key={recipe.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
                  <RecipeCard recipe={recipe} onToggleFavorite={toggleFavorite} onCook={cook} onOpen={open} />
                </View>
              ))}
            </View>
          )}

          <BookStatsCard
            stats={stats}
            mostCookedTitle={recipes.find((r) => r.id === stats.mostCooked)?.title ?? null}
            isWide={isWide}
          />
        </>
      )}
      {editor && (
        <CollectionEditorModal
          editing={editor === 'new' ? undefined : editor}
          existing={collections.collections}
          onSave={(name, emoji) =>
            editor === 'new' ? collections.create(name, emoji) : collections.rename(editor.id, name, emoji)
          }
          onDelete={
            editor === 'new'
              ? undefined
              : async () => {
                  const ok = await collections.remove(editor.id);
                  if (ok) setSelectedCollectionId(null);
                  return ok;
                }
          }
          onClose={() => setEditor(null)}
        />
      )}
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
});

import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type ScrollView as ScrollViewType } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { Tag } from '@/components/ui/Tag';
import { useMyRecipes } from '@/features/recipes/useMyRecipes';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { SPACING } from '@/theme/tokens';

import { CATEGORIES } from './categories';
import { DailyQuestCard } from './components/DailyQuestCard';
import { MagicPotCard } from './components/MagicPotCard';
import { PantryHero } from './components/PantryHero';
import { PantryItemCard } from './components/PantryItemCard';
import { RecipeSuggestionCard } from './components/RecipeSuggestionCard';
import { freshnessScore, rankRecipes } from './pantryUtils';
import { pantryQuest } from './pantryQuest';
import type { PantryCategory } from './types';
import { usePantry } from './usePantry';

const SUGGESTION_COUNT = 2;

type CategoryFilter = PantryCategory | 'all';

function gridColumns(width: number) {
  if (width >= 1200) return 4;
  if (width >= 900) return 3;
  return 2;
}

export function PantryScreen() {
  const { theme } = useKukkiTheme();
  const isWide = useIsWide();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewType>(null);
  const suggestionsY = useRef(0);

  const pantry = usePantry();
  const { recipes } = useMyRecipes();
  const { items } = pantry;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const selected = items.filter((item) => selectedIds.includes(item.id));
  const visible = category === 'all' ? items : items.filter((item) => item.category === category);
  const suggestions = rankRecipes(recipes, items, selected).slice(0, SUGGESTION_COUNT);
  const usedCategories = (Object.keys(CATEGORIES) as PantryCategory[]).filter((cat) =>
    items.some((item) => item.category === cat),
  );
  const columns = gridColumns(width);

  const toggle = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const showSuggestions = () => {
    // Geniş ekranda öneriler zaten tencerenin altında görünüyor
    if (!isWide) scrollRef.current?.scrollTo({ y: suggestionsY.current, animated: true });
  };

  // ponytail: tarif detay sayfası gelene kadar Tarifler sekmesine gider
  const openRecipe = () => router.push('/tarifler');

  const shelfBody =
    pantry.status !== 'ready' ? (
      <LoadState status={pantry.status} onRetry={pantry.reload} />
    ) : items.length === 0 ? (
      <HintCard
        emoji="🧺"
        title="Kilerin bomboş!"
        text="Yukarıdaki kutuya dolabındaki ilk malzemeyi yaz. Kategorisini ve ne kadar dayanacağını seçersen, bozulmadan önce seni uyarırız."
      />
    ) : (
      <>
        <AppText variant="bodySm" color="textMuted">
          {"💡 Malzemeye dokununca Sihirli Tencere'ye eklenir; 🗑️ ile kilerden kaldırırsın."}
        </AppText>
        <View style={styles.grid}>
          {visible.map((item) => (
            <View key={item.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
              <PantryItemCard
                item={item}
                selected={selectedIds.includes(item.id)}
                onToggle={toggle}
                onRemove={pantry.remove}
              />
            </View>
          ))}
        </View>
      </>
    );

  const shelf = (
    <View style={styles.section}>
      {items.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={`Hepsi (${items.length})`} selected={category === 'all'} onPress={() => setCategory('all')} />
          {usedCategories.map((cat) => (
            <Chip
              key={cat}
              label={`${CATEGORIES[cat].emoji} ${CATEGORIES[cat].label} (${items.filter((i) => i.category === cat).length})`}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.shelfHeader}>
        <MaterialIcons name="kitchen" size={24} color={theme.colors.primary} />
        <AppText variant={isWide ? 'headlineLg' : 'headlineLgMobile'}>Kiler Rafım</AppText>
        {items.length > 0 && <Tag label={`${selected.length} Seçili`} />}
      </View>
      {pantry.actionError && <FormError text={pantry.actionError} />}
      {shelfBody}
    </View>
  );

  const suggestionsBody =
    recipes.length === 0 ? (
      <HintCard
        emoji="📖"
        title="Öneri için tarif lazım"
        text="Tarif Defteri'ne tarif ekledikçe, kilerindekilerle en uyumlu olanları burada sıralarız.">
        <GameButton label="Tarif Defterine Git" icon="menu-book" variant="soft" onPress={() => router.push('/tarifler')} />
      </HintCard>
    ) : (
      suggestions.map((ranked, index) => (
        <RecipeSuggestionCard key={ranked.recipe.id} ranked={ranked} highlighted={index === 0} onOpen={openRecipe} />
      ))
    );

  const sidebar = (
    <>
      <MagicPotCard selected={selected} onCook={showSuggestions} />
      <View style={styles.section} onLayout={(e) => (suggestionsY.current = e.nativeEvent.layout.y)}>
        <AppText variant="labelMd" color="textMuted">
          ANLIK TARİF ÖNERİLERİ
        </AppText>
        {suggestionsBody}
      </View>
    </>
  );

  const hero = (
    <PantryHero itemCount={items.length} freshness={freshnessScore(items)} isWide={isWide} onAdd={pantry.add} />
  );
  const quest = <DailyQuestCard quest={pantryQuest(items, selectedIds)} />;

  return (
    <Screen ref={scrollRef}>
      {isWide ? (
        <View style={styles.columns}>
          <View style={styles.main}>
            {hero}
            {shelf}
          </View>
          <View style={styles.side}>
            {quest}
            {sidebar}
          </View>
        </View>
      ) : (
        <>
          {hero}
          {quest}
          {shelf}
          {sidebar}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.lg },
  main: { flex: 1, gap: SPACING.lg, minWidth: 0 },
  side: { width: 380, gap: SPACING.lg },
  section: { gap: SPACING.sm },
  chips: { gap: SPACING.sm, paddingVertical: SPACING.xs, paddingHorizontal: 2 },
  shelfHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { padding: 6 },
});

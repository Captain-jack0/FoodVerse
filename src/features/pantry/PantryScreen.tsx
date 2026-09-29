import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type ScrollView as ScrollViewType } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { Tag } from '@/components/ui/Tag';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { SPACING } from '@/theme/tokens';

import { DailyQuestCard } from './components/DailyQuestCard';
import { MagicPotCard } from './components/MagicPotCard';
import { PantryHero } from './components/PantryHero';
import { PantryItemCard } from './components/PantryItemCard';
import { RecipeSuggestionCard } from './components/RecipeSuggestionCard';
import { CATEGORIES, inDays, MOCK_PANTRY, MOCK_RECIPES } from './mockPantry';
import { daysLeft, freshnessScore, rankRecipes } from './pantryUtils';
import type { PantryCategory, PantryItem } from './types';

const QUEST_XP = 50;
const SUGGESTION_COUNT = 2;
const NEW_ITEM_SHELF_DAYS = 7;

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

  const [items, setItems] = useState<PantryItem[]>(MOCK_PANTRY);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const selected = items.filter((item) => selectedIds.includes(item.id));
  const visible = category === 'all' ? items : items.filter((item) => item.category === category);
  const expiring = items.filter((item) => daysLeft(item.expiresOn) <= 1);
  const rescued = expiring.filter((item) => selectedIds.includes(item.id)).length;
  const suggestions = rankRecipes(MOCK_RECIPES, items, selected).slice(0, SUGGESTION_COUNT);
  const usedCategories = (Object.keys(CATEGORIES) as PantryCategory[]).filter((cat) =>
    items.some((item) => item.category === cat),
  );
  const columns = gridColumns(width);

  const toggle = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const addItem = (name: string) =>
    setItems((prev) => [
      {
        id: `local-${Date.now()}`,
        name,
        emoji: CATEGORIES.diger.emoji,
        category: 'diger',
        quantity: '1 adet',
        expiresOn: inDays(NEW_ITEM_SHELF_DAYS),
      },
      ...prev,
    ]);

  const showSuggestions = () => {
    // Geniş ekranda öneriler zaten tencerenin altında görünüyor
    if (!isWide) scrollRef.current?.scrollTo({ y: suggestionsY.current, animated: true });
  };

  // ponytail: tarif detay sayfası gelene kadar Tarifler sekmesine gider
  const openRecipe = () => router.push('/tarifler');

  const shelf = (
    <View style={styles.section}>
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

      <View style={styles.shelfHeader}>
        <MaterialIcons name="kitchen" size={24} color={theme.colors.primary} />
        <AppText variant={isWide ? 'headlineLg' : 'headlineLgMobile'}>Kiler Rafım</AppText>
        <Tag label={`${selected.length} Seçili`} />
      </View>
      <AppText variant="bodySm" color="textMuted">
        Tencereye eklemek için malzemeye dokun.
      </AppText>

      <View style={styles.grid}>
        {visible.map((item) => (
          <View key={item.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
            <PantryItemCard item={item} selected={selectedIds.includes(item.id)} onToggle={toggle} />
          </View>
        ))}
      </View>
    </View>
  );

  const sidebar = (
    <>
      <MagicPotCard selected={selected} onCook={showSuggestions} />
      <View style={styles.section} onLayout={(e) => (suggestionsY.current = e.nativeEvent.layout.y)}>
        <AppText variant="labelMd" color="textMuted">
          ANLIK TARİF ÖNERİLERİ
        </AppText>
        {suggestions.map((ranked, index) => (
          <RecipeSuggestionCard
            key={ranked.recipe.id}
            ranked={ranked}
            highlighted={index === 0}
            onOpen={openRecipe}
          />
        ))}
      </View>
    </>
  );

  const hero = (
    <PantryHero itemCount={items.length} freshness={freshnessScore(items)} isWide={isWide} onAdd={addItem} />
  );
  const quest = <DailyQuestCard target={expiring.length} rescued={rescued} xp={QUEST_XP} />;

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

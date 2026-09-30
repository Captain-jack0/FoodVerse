import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { inDays } from '@/features/pantry/categories';
import { usePantry } from '@/features/pantry/usePantry';
import { useMyRecipes } from '@/features/recipes/useMyRecipes';
import { itemsToAdd } from '@/features/shopping/shoppingUtils';
import type { useShoppingList } from '@/features/shopping/useShoppingList';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { DayCard } from './components/DayCard';
import { RecipePickerModal } from './components/RecipePickerModal';
import { formatWeekRange, weekDays, weeklyMissing } from './plannerUtils';
import { SLOTS, type MealSlot } from './types';
import { useWeekPlans } from './useWeekPlans';

function dayColumns(width: number) {
  if (width >= 1200) return 7;
  if (width >= 900) return 4;
  if (width >= 600) return 2;
  return 1;
}

type WeeklyPlannerProps = { shopping: ReturnType<typeof useShoppingList> };

export function WeeklyPlanner({ shopping }: WeeklyPlannerProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const { width } = useWindowDimensions();

  // Ekran açıldığındaki gün sabit tutulur (render sırasında saat okunmaz)
  const [baseDate] = useState(() => new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const today = inDays(0, baseDate);
  const days = weekDays(new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + weekOffset * 7));
  const week = useWeekPlans(days[0].date, days[6].date);
  const { recipes } = useMyRecipes();
  const pantry = usePantry();
  const recipesById = new Map(recipes.map((r) => [r.id, r]));

  const [picking, setPicking] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const columns = dayColumns(width);
  const pickingDay = picking ? days.find((d) => d.date === picking.date) : undefined;
  const pickingSlot = picking ? SLOTS.find((s) => s.id === picking.slot) : undefined;

  const addWeekMissing = async () => {
    setNotice(null);
    const toAdd = itemsToAdd(shopping.items, weeklyMissing(week.plans, recipes, pantry.items));
    if (toAdd.length === 0) {
      setNotice('Bu haftanın tüm malzemeleri kilerinde ya da listende var 👍');
      return;
    }
    const ok = await shopping.add(toAdd);
    if (ok) setNotice(`🛒 Haftanın ${toAdd.length} eksik malzemesi alışveriş listene eklendi.`);
  };

  const body =
    week.status !== 'ready' ? (
      <LoadState status={week.status} onRetry={week.reload} />
    ) : recipes.length === 0 ? (
      <HintCard emoji="📖" title="Önce birkaç tarif ekle" text="Planlayıcı, Tarif Defteri'ndeki tariflerinle çalışır.">
        <GameButton label="Tarif Defterine Git" icon="menu-book" variant="soft" onPress={() => router.push('/tarifler')} />
      </HintCard>
    ) : (
      <>
        <View style={styles.grid}>
          {days.map((day) => (
            <View key={day.date} style={[styles.cell, { width: `${100 / columns}%` }]}>
              <DayCard
                day={day}
                isToday={day.date === today}
                plans={week.plans.filter((p) => p.date === day.date)}
                recipesById={recipesById}
                onAdd={(slot) => setPicking({ date: day.date, slot })}
                onOpen={(id) => router.push({ pathname: '/tarif/[id]', params: { id } })}
                onRemove={week.unassign}
              />
            </View>
          ))}
        </View>
        {week.plans.length > 0 && (
          <GameButton
            label="Haftanın Eksiklerini Listeye Ekle"
            icon="add-shopping-cart"
            variant="sunny"
            onPress={addWeekMissing}
            disabled={pantry.status !== 'ready' || shopping.status !== 'ready'}
          />
        )}
      </>
    );

  return (
    <View style={styles.section}>
      <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
        <AppText variant="labelMd" color="primary">
          HAFTALIK PLANLAYICI
        </AppText>
        <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Haftanın Menüsü</AppText>
        <AppText variant="bodySm" color="textMuted">
          Öğünlere tarif ata; eksikleri tek dokunuşla alışveriş listene gönder.
        </AppText>
        <View style={styles.weekNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Önceki hafta"
            onPress={() => setWeekOffset((w) => w - 1)}
            style={[styles.navButton, { backgroundColor: c.card }]}>
            <MaterialIcons name="chevron-left" size={24} color={c.text} />
          </Pressable>
          <View style={styles.weekLabel}>
            <AppText variant="labelLg">{formatWeekRange(days)}</AppText>
            {weekOffset !== 0 && (
              <Pressable accessibilityRole="button" onPress={() => setWeekOffset(0)}>
                <AppText variant="labelSm" color="primary">
                  Bu haftaya dön
                </AppText>
              </Pressable>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sonraki hafta"
            onPress={() => setWeekOffset((w) => w + 1)}
            style={[styles.navButton, { backgroundColor: c.card }]}>
            <MaterialIcons name="chevron-right" size={24} color={c.text} />
          </Pressable>
        </View>
      </View>

      {week.actionError && <FormError text={week.actionError} />}
      {notice && (
        <View style={[styles.notice, { backgroundColor: c.secondaryContainer }]}>
          <AppText variant="bodySm" color="onSecondaryContainer">
            {notice}
          </AppText>
        </View>
      )}
      {body}

      {picking && pickingDay && pickingSlot && (
        <RecipePickerModal
          title={`${pickingDay.long} · ${pickingSlot.emoji} ${pickingSlot.label}`}
          recipes={recipes}
          onClose={() => setPicking(null)}
          onPick={(recipeId) => {
            week.assign(picking.date, picking.slot, recipeId);
            setPicking(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: SPACING.md },
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.xs },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },
  navButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { alignItems: 'center', gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  cell: { padding: 4 },
  notice: { borderRadius: RADIUS.md, padding: SPACING.md },
});

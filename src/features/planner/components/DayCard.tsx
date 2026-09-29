import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import type { Recipe } from '@/features/recipes/types';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { WeekDay } from '../plannerUtils';
import { SLOTS, type MealPlan, type MealSlot } from '../types';

type DayCardProps = {
  day: WeekDay;
  isToday: boolean;
  plans: MealPlan[];
  recipesById: Map<string, Recipe>;
  onAdd: (slot: MealSlot) => void;
  onOpen: (recipeId: string) => void;
  onRemove: (planId: string) => void;
};

export function DayCard({ day, isToday, plans, recipesById, onAdd, onOpen, onRemove }: DayCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: isToday ? c.primary : 'transparent' },
      ]}>
      <View style={styles.header}>
        <AppText variant="labelLg" color={isToday ? 'primary' : 'text'}>
          {day.long}
        </AppText>
        <AppText variant="labelSm" color="textMuted">
          {isToday ? 'Bugün' : day.dayOfMonth}
        </AppText>
      </View>

      {SLOTS.map((slot) => {
        const plan = plans.find((p) => p.slot === slot.id);
        const recipe = plan ? recipesById.get(plan.recipeId) : undefined;
        return plan && recipe ? (
          <View key={slot.id} style={[styles.slot, { backgroundColor: c.surfaceLow }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${day.long} ${slot.label}: ${recipe.title}`}
              onPress={() => onOpen(recipe.id)}
              style={styles.slotMain}>
              <AppText style={styles.emoji}>{recipe.emoji}</AppText>
              <View style={styles.flex}>
                <AppText variant="labelSm" color="textMuted">
                  {slot.emoji} {slot.label}
                </AppText>
                <AppText variant="labelMd" numberOfLines={2}>
                  {recipe.title}
                </AppText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${slot.label} planını kaldır`}
              onPress={() => onRemove(plan.id)}
              hitSlop={8}>
              <MaterialIcons name="close" size={18} color={c.textMuted} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            key={slot.id}
            accessibilityRole="button"
            accessibilityLabel={`${day.long} ${slot.label} için tarif ekle`}
            onPress={() => onAdd(slot.id)}
            style={[styles.emptySlot, { borderColor: c.outline }]}>
            <AppText variant="labelSm" color="textMuted">
              {slot.emoji} {slot.label}
            </AppText>
            <MaterialIcons name="add" size={18} color={c.primary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, padding: SPACING.sm, gap: 6, borderWidth: 2, height: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: RADIUS.md },
  slotMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
  emoji: { fontSize: 22, lineHeight: 28 },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});

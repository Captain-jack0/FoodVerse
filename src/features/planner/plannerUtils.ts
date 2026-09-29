import { inDays } from '@/features/pantry/categories';
import { matchRecipe } from '@/features/pantry/pantryUtils';
import type { PantryItem } from '@/features/pantry/types';
import type { Ingredient, Recipe } from '@/features/recipes/types';

import type { MealPlan } from './types';

const SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export type WeekDay = { date: string; short: string; long: string; dayOfMonth: number; month: number };

/** anchor'ın bulunduğu haftanın günleri (Pazartesi–Pazar) */
export function weekDays(anchor: Date): WeekDay[] {
  // getDay: Pazar=0 → Pazartesi başlangıcına göre kaydır
  const offset = (anchor.getDay() + 6) % 7;
  const monday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - offset);
  return SHORT.map((short, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return { date: inDays(0, d), short, long: LONG[i], dayOfMonth: d.getDate(), month: d.getMonth() };
  });
}

export function formatWeekRange(days: WeekDay[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  return `${first.dayOfMonth} ${MONTHS[first.month]} – ${last.dayOfMonth} ${MONTHS[last.month]}`;
}

const key = (name: string) => name.trim().toLocaleLowerCase('tr-TR');

/** Plandaki tüm tariflerin kilerde olmayan malzemeleri; aynı malzemenin miktarları birleştirilir */
export function weeklyMissing(plans: MealPlan[], recipes: Recipe[], pantry: PantryItem[]): Ingredient[] {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const merged = new Map<string, Ingredient>();

  for (const plan of plans) {
    const recipe = byId.get(plan.recipeId);
    if (!recipe) continue;
    const { missing } = matchRecipe(recipe, pantry);
    for (const ing of recipe.ingredients.filter((i) => missing.includes(i.name))) {
      const k = key(ing.name);
      const existing = merged.get(k);
      if (!existing) {
        merged.set(k, { name: k, amount: ing.amount.trim() });
      } else if (ing.amount.trim()) {
        merged.set(k, {
          name: k,
          amount: existing.amount ? `${existing.amount} + ${ing.amount.trim()}` : ing.amount.trim(),
        });
      }
    }
  }
  return [...merged.values()];
}

import type { ExpiryStatus, PantryItem, RecipeSuggestion } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Son kullanma tarihine kalan gün (bugün = 0, geçmiş = negatif) */
export function daysLeft(expiresOn: string, today: Date = new Date()): number {
  const [y, m, d] = expiresOn.split('-').map(Number);
  // UTC ile karşılaştır ki yaz saati geçişleri bir günü kaydırmasın
  const expiry = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((expiry - now) / DAY_MS);
}

export function expiryStatus(days: number): ExpiryStatus {
  if (days <= 1) return 'danger';
  if (days <= 3) return 'warning';
  if (days < 30) return 'ok';
  return 'longLasting';
}

export function expiryLabel(days: number): string {
  if (days < 0) return 'Süresi geçti!';
  if (days === 0) return 'Bugün son gün!';
  if (days === 1) return 'Yarın son gün!';
  if (days < 30) return `${days} gün kaldı`;
  return `Taze (${Math.round(days / 30)} ay)`;
}

/** En az 2 günü olan malzemelerin yüzdesi */
export function freshnessScore(items: PantryItem[], today: Date = new Date()): number {
  if (items.length === 0) return 100;
  const fresh = items.filter((item) => daysLeft(item.expiresOn, today) >= 2).length;
  return Math.round((fresh / items.length) * 100);
}

const normalize = (text: string) => text.toLocaleLowerCase('tr-TR');

function hasIngredient(ingredient: string, items: PantryItem[]): boolean {
  const needle = normalize(ingredient);
  return items.some((item) => normalize(item.name).includes(needle));
}

export type RecipeMatch = { have: string[]; missing: string[]; percent: number };

export function matchRecipe(recipe: RecipeSuggestion, pantry: PantryItem[]): RecipeMatch {
  const have = recipe.ingredients.filter((ing) => hasIngredient(ing, pantry));
  const missing = recipe.ingredients.filter((ing) => !hasIngredient(ing, pantry));
  const percent = recipe.ingredients.length === 0 ? 0 : Math.round((have.length / recipe.ingredients.length) * 100);
  return { have, missing, percent };
}

export type RankedRecipe = { recipe: RecipeSuggestion; match: RecipeMatch; usesSelected: number };

/** Önce seçili malzemeleri en çok kullanan, sonra eşleşme yüzdesi en yüksek tarif */
export function rankRecipes(
  recipes: RecipeSuggestion[],
  pantry: PantryItem[],
  selected: PantryItem[],
): RankedRecipe[] {
  return recipes
    .map((recipe) => ({
      recipe,
      match: matchRecipe(recipe, pantry),
      usesSelected: recipe.ingredients.filter((ing) => hasIngredient(ing, selected)).length,
    }))
    .sort((a, b) => b.usesSelected - a.usesSelected || b.match.percent - a.match.percent);
}

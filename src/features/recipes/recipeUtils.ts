import type { Recipe, RecipeTag, SocialPlatform } from './types';

export const QUICK_MINUTES = 15;

export type RecipeFilter = 'all' | RecipeTag;

// Sadece gerçek instagram.com / tiktok.com alan adları ve boş olmayan bir yol
const SOCIAL_URL = /^https:\/\/(?:(?:www|m|vm|vt)\.)?(instagram|tiktok)\.com\/[^\s/][^\s]*$/i;

export function parseSocialUrl(input: string): SocialPlatform | null {
  const match = SOCIAL_URL.exec(input.trim());
  if (!match) return null;
  return match[1].toLowerCase() as SocialPlatform;
}

const normalize = (text: string) => text.toLocaleLowerCase('tr-TR');

export function filterRecipes(recipes: Recipe[], filter: RecipeFilter, query: string): Recipe[] {
  const needle = normalize(query.trim());
  return recipes.filter((recipe) => {
    const matchesFilter =
      filter === 'all' || (filter === 'hizli' ? recipe.minutes <= QUICK_MINUTES : recipe.tags.includes(filter));
    return matchesFilter && (!needle || normalize(recipe.title).includes(needle));
  });
}

export type BookStats = {
  total: number;
  imported: number;
  favorites: number;
  totalCooked: number;
  /** En çok pişirilen tarifin id'si */
  mostCooked: string | null;
};

export function bookStats(recipes: Recipe[]): BookStats {
  const top = recipes.reduce<Recipe | null>(
    (best, r) => (best === null || r.cookedCount > best.cookedCount ? r : best),
    null,
  );
  return {
    total: recipes.length,
    imported: recipes.filter((r) => r.source.type === 'instagram' || r.source.type === 'tiktok').length,
    favorites: recipes.filter((r) => r.favorite).length,
    totalCooked: recipes.reduce((sum, r) => sum + r.cookedCount, 0),
    mostCooked: top?.id ?? null,
  };
}

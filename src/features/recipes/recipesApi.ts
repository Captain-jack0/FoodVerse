import { supabase } from '@/lib/supabase';

import { RECIPE_COLUMNS, toRecipe, type RecipeRow } from './recipeMapper';
import type { Recipe } from './types';

/** Kullanıcının kendi tarifleri + favori ve pişirme sayısı bilgisi */
export async function fetchMyRecipes(userId: string): Promise<Recipe[]> {
  const [recipes, favorites, cooks] = await Promise.all([
    supabase.from('recipes').select(RECIPE_COLUMNS).eq('author_id', userId).order('created_at', { ascending: false }),
    supabase.from('favorites').select('recipe_id'),
    // ponytail: pişirme sayısı istemcide sayılıyor; kayıt çoğalınca sunucu tarafı count'a geçilecek
    supabase.from('cook_logs').select('recipe_id'),
  ]);
  if (recipes.error) throw recipes.error;
  if (favorites.error) throw favorites.error;
  if (cooks.error) throw cooks.error;

  const favoriteIds = new Set(favorites.data.map((f) => f.recipe_id as string));
  const cookCounts = new Map<string, number>();
  for (const { recipe_id } of cooks.data) {
    cookCounts.set(recipe_id, (cookCounts.get(recipe_id) ?? 0) + 1);
  }

  return (recipes.data as RecipeRow[]).map((row) =>
    toRecipe(row, { favorite: favoriteIds.has(row.id), cookedCount: cookCounts.get(row.id) ?? 0 }),
  );
}

export async function setFavorite(recipeId: string, favorite: boolean): Promise<void> {
  const { error } = favorite
    ? await supabase.from('favorites').insert({ recipe_id: recipeId })
    : await supabase.from('favorites').delete().eq('recipe_id', recipeId);
  if (error) throw error;
}

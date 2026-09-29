import { supabase } from '@/lib/supabase';

import type { toRecipeInsert } from './recipeDraft';
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

export async function insertRecipe(payload: ReturnType<typeof toRecipeInsert>): Promise<string> {
  const { data, error } = await supabase.from('recipes').insert(payload).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export type RecipeDetail = { recipe: Recipe; authorId: string };

/** Tek tarif (RLS: kendi tarifin ya da herkese açık tarif) */
export async function fetchRecipe(id: string): Promise<RecipeDetail | null> {
  const [recipe, favorite, cooks] = await Promise.all([
    supabase.from('recipes').select(`${RECIPE_COLUMNS}, author_id`).eq('id', id).maybeSingle(),
    supabase.from('favorites').select('recipe_id').eq('recipe_id', id).maybeSingle(),
    supabase.from('cook_logs').select('id', { count: 'exact', head: true }).eq('recipe_id', id),
  ]);
  if (recipe.error) throw recipe.error;
  if (favorite.error) throw favorite.error;
  if (cooks.error) throw cooks.error;
  if (!recipe.data) return null;

  const row = recipe.data as RecipeRow & { author_id: string };
  return {
    recipe: toRecipe(row, { favorite: favorite.data !== null, cookedCount: cooks.count ?? 0 }),
    authorId: row.author_id,
  };
}

export async function logCook(recipeId: string): Promise<void> {
  const { error } = await supabase.from('cook_logs').insert({ recipe_id: recipeId });
  if (error) throw error;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

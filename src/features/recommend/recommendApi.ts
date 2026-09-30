import { RECIPE_COLUMNS, toRecipe, type RecipeRow } from '@/features/recipes/recipeMapper';
import { supabase } from '@/lib/supabase';

import type { Candidate } from './recommend';

// ponytail: topluluktan en yeni 100 paylaşım istemcide puanlanır; büyüyünce sunucu tarafı öneri RPC'si
const COMMUNITY_POOL = 100;

/** Topluluğun paylaştığı (benim olmayan) tarifler + ortalama puanları */
export async function fetchCommunityPool(userId: string): Promise<Candidate[]> {
  const recipes = await supabase
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .eq('visibility', 'public')
    .neq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(COMMUNITY_POOL);
  if (recipes.error) throw recipes.error;
  const rows = recipes.data as RecipeRow[];
  if (rows.length === 0) return [];

  const ratings = await supabase
    .from('ratings')
    .select('recipe_id, stars')
    .in(
      'recipe_id',
      rows.map((r) => r.id),
    );
  if (ratings.error) throw ratings.error;

  const sums = new Map<string, { total: number; count: number }>();
  for (const { recipe_id, stars } of ratings.data as { recipe_id: string; stars: number }[]) {
    const s = sums.get(recipe_id) ?? { total: 0, count: 0 };
    sums.set(recipe_id, { total: s.total + stars, count: s.count + 1 });
  }

  return rows.map((row) => {
    const s = sums.get(row.id);
    return {
      recipe: toRecipe(row, { favorite: false, cookedCount: 0 }),
      origin: 'community' as const,
      avgRating: s ? s.total / s.count : 0,
      ratingCount: s?.count ?? 0,
    };
  });
}

/** recipeId → son pişirme zamanı (kendi kayıtlarım) */
export async function fetchLastCooked(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('cook_logs')
    .select('recipe_id, cooked_at')
    .order('cooked_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  const last: Record<string, string> = {};
  for (const { recipe_id, cooked_at } of data as { recipe_id: string; cooked_at: string }[]) {
    if (!(recipe_id in last)) last[recipe_id] = cooked_at;
  }
  return last;
}

export async function fetchPreferences(userId: string): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from('profile_settings').select('preferences').eq('id', userId).single();
  if (error) throw error;
  return (data.preferences as Record<string, unknown> | null) ?? {};
}

/** Diğer anahtarları (örn. tour_done) koruyarak tercih etiketlerini yazar */
export async function savePreferenceTags(userId: string, current: Record<string, unknown>, tags: string[]) {
  const { error } = await supabase
    .from('profile_settings')
    .update({ preferences: { ...current, tags } })
    .eq('id', userId);
  if (error) throw error;
}

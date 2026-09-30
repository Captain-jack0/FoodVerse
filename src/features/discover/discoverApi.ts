import { supabase } from '@/lib/supabase';

import { toDiscoverItem, type DiscoverItem, type DiscoverRow } from './discoverMapper';

export type DiscoverSort = 'trend' | 'top' | 'new';

export const PAGE_SIZE = 20;

export async function fetchDiscover(sort: DiscoverSort, query: string, offset: number): Promise<DiscoverItem[]> {
  const { data, error } = await supabase.rpc('discover_feed', {
    p_sort: sort,
    p_query: query.trim(),
    p_limit: PAGE_SIZE,
    p_offset: offset,
  });
  if (error) throw error;
  return (data as DiscoverRow[]).map(toDiscoverItem);
}

export type PublicStats = {
  avgRating: number;
  ratingCount: number;
  saveCount: number;
  cookCount: number;
  myRating: number | null;
};

export async function fetchPublicStats(recipeId: string): Promise<PublicStats | null> {
  const { data, error } = await supabase.rpc('recipe_public_stats', { p_recipe_id: recipeId });
  if (error) throw error;
  const row = (data as Record<string, number | string | null>[])[0];
  if (!row) return null;
  return {
    avgRating: Number(row.avg_rating),
    ratingCount: Number(row.rating_count),
    saveCount: Number(row.save_count),
    cookCount: Number(row.cook_count),
    myRating: row.my_rating === null ? null : Number(row.my_rating),
  };
}

/** 1–5 yıldız; aynı kişi tekrar oylarsa puanı güncellenir */
export async function rateRecipe(recipeId: string, stars: number): Promise<void> {
  const { error } = await supabase
    .from('ratings')
    .upsert({ recipe_id: recipeId, stars }, { onConflict: 'user_id,recipe_id' });
  if (error) throw error;
}

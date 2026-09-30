import { supabase } from '@/lib/supabase';

export type RecipeVersion = {
  id: string;
  version: number;
  note: string;
  createdAt: string;
  /** Yayın anındaki tarif (başlık, malzemeler, adımlar...) */
  snapshot: {
    title?: string;
    ingredients?: { name: string; amount: string }[];
    steps?: string[];
    tip?: string | null;
  };
};

export async function fetchVersions(recipeId: string): Promise<RecipeVersion[]> {
  const { data, error } = await supabase
    .from('recipe_versions')
    .select('id, version, note, created_at, snapshot')
    .eq('recipe_id', recipeId)
    .order('version', { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id as string,
    version: row.version as number,
    note: row.note as string,
    createdAt: row.created_at as string,
    snapshot: (row.snapshot ?? {}) as RecipeVersion['snapshot'],
  }));
}

/** Tarifin şu anki halini yeni sürüm olarak saklar; seçilen öneriler "uygulandı" olur */
export async function publishVersion(recipeId: string, note: string, appliedSuggestionIds: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('publish_recipe_version', {
    p_recipe_id: recipeId,
    p_note: note.trim(),
    p_applied: appliedSuggestionIds,
  });
  if (error) throw error;
  return data as number;
}

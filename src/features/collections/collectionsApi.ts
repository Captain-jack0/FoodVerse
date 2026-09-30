import { supabase } from '@/lib/supabase';

import type { Collection } from './types';

const COLUMNS = 'id, name, emoji, collection_recipes(recipe_id)';

type CollectionRow = { id: string; name: string; emoji: string; collection_recipes: { recipe_id: string }[] | null };

const toCollection = (row: CollectionRow): Collection => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  recipeIds: (row.collection_recipes ?? []).map((r) => r.recipe_id),
});

export async function fetchMyCollections(userId: string): Promise<Collection[]> {
  const { data, error } = await supabase.from('collections').select(COLUMNS).eq('owner_id', userId).order('created_at');
  if (error) throw error;
  return (data as CollectionRow[]).map(toCollection);
}

export async function createCollection(name: string, emoji: string): Promise<Collection> {
  const { data, error } = await supabase.from('collections').insert({ name: name.trim(), emoji }).select(COLUMNS).single();
  if (error) throw error;
  return toCollection(data as CollectionRow);
}

export async function updateCollection(id: string, name: string, emoji: string): Promise<void> {
  const { error } = await supabase.from('collections').update({ name: name.trim(), emoji }).eq('id', id);
  if (error) throw error;
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw error;
}

export async function setInCollection(collectionId: string, recipeId: string, inCollection: boolean): Promise<void> {
  const { error } = inCollection
    ? await supabase.from('collection_recipes').insert({ collection_id: collectionId, recipe_id: recipeId })
    : await supabase.from('collection_recipes').delete().eq('collection_id', collectionId).eq('recipe_id', recipeId);
  if (error) throw error;
}

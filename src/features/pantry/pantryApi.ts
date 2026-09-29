import { supabase } from '@/lib/supabase';

import type { PantryCategory, PantryItem } from './types';

const COLUMNS = 'id, name, emoji, category, quantity, expires_on';

type PantryRow = {
  id: string;
  name: string;
  emoji: string;
  category: PantryCategory;
  quantity: string;
  expires_on: string;
};

const toPantryItem = (row: PantryRow): PantryItem => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  category: row.category,
  quantity: row.quantity,
  expiresOn: row.expires_on,
});

export type NewPantryItem = Omit<PantryItem, 'id'>;

export async function fetchPantry(): Promise<PantryItem[]> {
  const { data, error } = await supabase.from('pantry_items').select(COLUMNS).order('expires_on');
  if (error) throw error;
  return (data as PantryRow[]).map(toPantryItem);
}

export async function insertPantryItem(item: NewPantryItem): Promise<PantryItem> {
  const { data, error } = await supabase
    .from('pantry_items')
    .insert({
      name: item.name,
      emoji: item.emoji,
      category: item.category,
      quantity: item.quantity,
      expires_on: item.expiresOn,
    })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toPantryItem(data as PantryRow);
}

export async function deletePantryItem(id: string): Promise<void> {
  const { error } = await supabase.from('pantry_items').delete().eq('id', id);
  if (error) throw error;
}

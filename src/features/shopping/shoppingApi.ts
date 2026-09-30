import { supabase } from '@/lib/supabase';

import type { NewShoppingItem, ShoppingItem } from './types';

const COLUMNS = 'id, name, amount, checked, recipe_id';

type ShoppingRow = { id: string; name: string; amount: string; checked: boolean; recipe_id: string | null };

const toItem = (row: ShoppingRow): ShoppingItem => ({
  id: row.id,
  name: row.name,
  amount: row.amount,
  checked: row.checked,
  recipeId: row.recipe_id,
});

export async function fetchShoppingList(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase.from('shopping_items').select(COLUMNS).order('created_at');
  if (error) throw error;
  return (data as ShoppingRow[]).map(toItem);
}

export async function insertShoppingItems(items: NewShoppingItem[]): Promise<ShoppingItem[]> {
  if (items.length === 0) return [];
  const { data, error } = await supabase
    .from('shopping_items')
    .insert(items.map((i) => ({ name: i.name, amount: i.amount, recipe_id: i.recipeId ?? null })))
    .select(COLUMNS);
  if (error) throw error;
  return (data as ShoppingRow[]).map(toItem);
}

export async function setChecked(id: string, checked: boolean): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ checked }).eq('id', id);
  if (error) throw error;
}

export async function deleteShoppingItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('shopping_items').delete().in('id', ids);
  if (error) throw error;
}

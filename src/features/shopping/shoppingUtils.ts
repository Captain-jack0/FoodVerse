import type { Ingredient } from '@/features/recipes/types';

import type { ShoppingItem } from './types';

const key = (name: string) => name.trim().toLocaleLowerCase('tr-TR');

/**
 * Listeye eklenecek eksikler: listede henüz alınmamış olarak duranlar ve
 * kendi içindeki tekrarlar atlanır.
 */
export function itemsToAdd(existing: ShoppingItem[], missing: Ingredient[]): Ingredient[] {
  const seen = new Set(existing.filter((i) => !i.checked).map((i) => key(i.name)));
  return missing.flatMap((ing) => {
    const k = key(ing.name);
    if (!k || seen.has(k)) return [];
    seen.add(k);
    return [{ name: ing.name.trim(), amount: ing.amount.trim() }];
  });
}

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { CATEGORIES, guessCategory, inDays } from '@/features/pantry/categories';
import { insertPantryItem } from '@/features/pantry/pantryApi';
import type { LoadStatus } from '@/lib/loadStatus';

import { deleteShoppingItems, fetchShoppingList, insertShoppingItems, setChecked } from './shoppingApi';
import type { NewShoppingItem, ShoppingItem } from './types';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchShoppingList().then(
      (data) => {
        setItems(data);
        setStatus('ready');
      },
      (error: unknown) => {
        console.warn('Alışveriş listesi yüklenemedi', error);
        setStatus('error');
      },
    );
  }, []);

  // Tarif sayfasından eklenenler dönüşte görünsün
  useFocusEffect(load);

  const reload = () => {
    setStatus('loading');
    load();
  };

  const add = async (newItems: NewShoppingItem[]): Promise<boolean> => {
    setActionError(null);
    try {
      const created = await insertShoppingItems(newItems);
      setItems((prev) => [...prev, ...created]);
      return true;
    } catch (error) {
      console.warn('Listeye eklenemedi', error);
      setActionError('Listeye eklenemedi, tekrar dene.');
      return false;
    }
  };

  const toggle = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const next = !target.checked;
    setActionError(null);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: next } : i)));
    try {
      await setChecked(id, next);
    } catch (error) {
      console.warn('Madde güncellenemedi', error);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !next } : i)));
      setActionError('Madde güncellenemedi, tekrar dene.');
    }
  };

  const remove = async (ids: string[]) => {
    const previous = items;
    setActionError(null);
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    try {
      await deleteShoppingItems(ids);
    } catch (error) {
      console.warn('Madde silinemedi', error);
      setItems(previous);
      setActionError('Silinemedi, tekrar dene.');
    }
  };

  /** Sepettekileri tahmini kategori ve dayanma süresiyle kilere ekler, listeden siler */
  const moveCheckedToPantry = async (): Promise<number> => {
    const checked = items.filter((i) => i.checked);
    setActionError(null);
    const moved: string[] = [];
    for (const item of checked) {
      const category = guessCategory(item.name);
      try {
        await insertPantryItem({
          name: item.name,
          emoji: CATEGORIES[category].emoji,
          category,
          quantity: item.amount || '1 adet',
          expiresOn: inDays(CATEGORIES[category].shelfDays),
        });
        moved.push(item.id);
      } catch (error) {
        console.warn('Kilere aktarılamadı', item.name, error);
      }
    }
    await remove(moved);
    if (moved.length < checked.length) {
      setActionError(`${checked.length - moved.length} malzeme kilere aktarılamadı, tekrar dene.`);
    }
    return moved.length;
  };

  return { items, status, actionError, reload, add, toggle, remove, moveCheckedToPantry };
}

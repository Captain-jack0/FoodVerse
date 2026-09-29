import { useCallback, useEffect, useState } from 'react';

import type { LoadStatus } from '@/lib/loadStatus';

import { deletePantryItem, fetchPantry, insertPantryItem, type NewPantryItem } from './pantryApi';
import type { PantryItem } from './types';

const byExpiry = (a: PantryItem, b: PantryItem) => a.expiresOn.localeCompare(b.expiresOn);

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      fetchPantry().then(
        (data) => {
          setItems(data);
          setStatus('ready');
        },
        (error: unknown) => {
          console.warn('Kiler yüklenemedi', error);
          setStatus('error');
        },
      ),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const reload = () => {
    setStatus('loading');
    load();
  };

  const add = async (item: NewPantryItem): Promise<boolean> => {
    setActionError(null);
    try {
      const created = await insertPantryItem(item);
      setItems((prev) => [...prev, created].sort(byExpiry));
      return true;
    } catch (error) {
      console.warn('Malzeme eklenemedi', error);
      setActionError('Malzeme eklenemedi. İnternet bağlantını kontrol edip tekrar dene.');
      return false;
    }
  };

  const remove = async (id: string) => {
    setActionError(null);
    const previous = items;
    // Önce ekrandan kaldır, hata olursa geri getir
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deletePantryItem(id);
    } catch (error) {
      console.warn('Malzeme silinemedi', error);
      setItems(previous);
      setActionError('Malzeme silinemedi, tekrar dene.');
    }
  };

  return { items, status, actionError, reload, add, remove };
}

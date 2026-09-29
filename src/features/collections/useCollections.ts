import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import type { LoadStatus } from '@/lib/loadStatus';

import {
  createCollection,
  deleteCollection,
  fetchMyCollections,
  setInCollection,
  updateCollection,
} from './collectionsApi';
import type { Collection } from './types';

export function useCollections() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    fetchMyCollections(userId).then(
      (data) => {
        setCollections(data);
        setStatus('ready');
      },
      (error: unknown) => {
        console.warn('Koleksiyonlar yüklenemedi', error);
        setStatus('error');
      },
    );
  }, [userId]);

  useFocusEffect(load);

  /** İşlemi çalıştırır; hata olursa mesaj gösterip false döner */
  const run = async (action: () => Promise<void>, failMessage: string): Promise<boolean> => {
    setActionError(null);
    try {
      await action();
      return true;
    } catch (error) {
      console.warn(failMessage, error);
      setActionError(failMessage);
      return false;
    }
  };

  const create = (name: string, emoji: string) =>
    run(async () => {
      const created = await createCollection(name, emoji);
      setCollections((prev) => [...prev, created]);
    }, 'Koleksiyon oluşturulamadı, tekrar dene.');

  const rename = (id: string, name: string, emoji: string) =>
    run(async () => {
      await updateCollection(id, name, emoji);
      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name: name.trim(), emoji } : c)));
    }, 'Koleksiyon güncellenemedi, tekrar dene.');

  const remove = (id: string) =>
    run(async () => {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    }, 'Koleksiyon silinemedi, tekrar dene.');

  const toggleRecipe = (collectionId: string, recipeId: string) => {
    const target = collections.find((c) => c.id === collectionId);
    if (!target) return Promise.resolve(false);
    const add = !target.recipeIds.includes(recipeId);
    return run(async () => {
      await setInCollection(collectionId, recipeId, add);
      setCollections((prev) =>
        prev.map((c) =>
          c.id !== collectionId
            ? c
            : { ...c, recipeIds: add ? [...c.recipeIds, recipeId] : c.recipeIds.filter((r) => r !== recipeId) },
        ),
      );
    }, 'Koleksiyon güncellenemedi, tekrar dene.');
  };

  return { collections, status, actionError, create, rename, remove, toggleRecipe };
}

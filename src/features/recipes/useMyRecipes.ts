import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import type { LoadStatus } from '@/lib/loadStatus';

import { fetchMyRecipes, setFavorite } from './recipesApi';
import type { Recipe } from './types';

export function useMyRecipes() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    fetchMyRecipes(userId).then(
      (data) => {
        setRecipes(data);
        setStatus('ready');
      },
      (error: unknown) => {
        console.warn('Tarifler yüklenemedi', error);
        setStatus('error');
      },
    );
  }, [userId]);

  // Ekran her odaklandığında tazele (örn. yeni tarif kaydedip geri dönünce)
  useFocusEffect(load);

  const reload = () => {
    setStatus('loading');
    load();
  };

  const toggleFavorite = async (id: string) => {
    const target = recipes.find((r) => r.id === id);
    if (!target) return;
    const next = !target.favorite;
    setActionError(null);
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: next } : r)));
    try {
      await setFavorite(id, next);
    } catch (error) {
      console.warn('Favori güncellenemedi', error);
      setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: !next } : r)));
      setActionError('Favori güncellenemedi, tekrar dene.');
    }
  };

  return { recipes, status, actionError, reload, toggleFavorite };
}

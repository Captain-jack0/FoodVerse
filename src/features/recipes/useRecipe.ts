import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { LoadStatus } from '@/lib/loadStatus';

import { fetchRecipe, type RecipeDetail } from './recipesApi';

/** Tek tarifi yükler; 'missing' = bulunamadı ya da görme yetkisi yok */
export function useRecipe(id: string | undefined) {
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [status, setStatus] = useState<LoadStatus | 'missing'>('loading');

  const load = useCallback(() => {
    if (!id) return;
    fetchRecipe(id).then(
      (data) => {
        setDetail(data);
        setStatus(data ? 'ready' : 'missing');
      },
      (error: unknown) => {
        console.warn('Tarif yüklenemedi', error);
        setStatus('error');
      },
    );
  }, [id]);

  useFocusEffect(load);

  const reload = () => {
    setStatus('loading');
    load();
  };

  return { detail, status, reload, setDetail };
}

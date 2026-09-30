import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import type { PantryItem } from '@/features/pantry/types';
import type { Recipe } from '@/features/recipes/types';

import { readPreferenceTags, type PreferenceId } from './preferences';
import { dailyPick, recommend, type Candidate } from './recommend';
import { fetchCommunityPool, fetchLastCooked, fetchPreferences } from './recommendApi';

type Inputs = { ownRecipes: Recipe[]; pantry: PantryItem[]; selectedIds?: string[] };

/** Kendi defteri + topluluk tariflerini kiler, tercih ve geçmişe göre sıralar */
export function useRecommendations({ ownRecipes, pantry, selectedIds = [] }: Inputs) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [community, setCommunity] = useState<Candidate[]>([]);
  const [lastCooked, setLastCooked] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState<PreferenceId[]>([]);
  // Ekran açıldığındaki gün (render sırasında saat okunmasın)
  const [today] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let cancelled = false;
      // Her biri bağımsız: biri başarısız olursa diğerleriyle öneri yine çalışır
      fetchCommunityPool(userId).then(
        (c) => !cancelled && setCommunity(c),
        (e: unknown) => console.warn('Topluluk önerileri okunamadı', e),
      );
      fetchLastCooked().then(
        (l) => !cancelled && setLastCooked(l),
        (e: unknown) => console.warn('Pişirme geçmişi okunamadı', e),
      );
      fetchPreferences(userId).then(
        (p) => !cancelled && setPreferences(readPreferenceTags(p)),
        (e: unknown) => console.warn('Tercihler okunamadı', e),
      );
      return () => {
        cancelled = true;
      };
    }, [userId]),
  );

  const own: Candidate[] = ownRecipes.map((recipe) => ({ recipe, origin: 'own', avgRating: 0, ratingCount: 0 }));
  const ranked = recommend([...own, ...community], { pantry, preferences, selectedIds, lastCooked, today });

  return { ranked, daily: dailyPick(ranked, today), preferences };
}

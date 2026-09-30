import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { LoadStatus } from '@/lib/loadStatus';

import { deletePlan, fetchPlans, upsertPlan } from './plannerApi';
import type { MealPlan, MealSlot } from './types';

export function useWeekPlans(from: string, to: string) {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchPlans(from, to).then(
      (data) => {
        setPlans(data);
        setStatus('ready');
      },
      (error: unknown) => {
        console.warn('Plan yüklenemedi', error);
        setStatus('error');
      },
    );
  }, [from, to]);

  // Hafta değişince ve ekrana dönünce tazele
  useFocusEffect(load);

  const reload = () => {
    setStatus('loading');
    load();
  };

  const assign = async (date: string, slot: MealSlot, recipeId: string) => {
    setActionError(null);
    try {
      const saved = await upsertPlan(date, slot, recipeId);
      setPlans((prev) => [...prev.filter((p) => !(p.date === date && p.slot === slot)), saved]);
    } catch (error) {
      console.warn('Plana eklenemedi', error);
      setActionError('Plana eklenemedi, tekrar dene.');
    }
  };

  const unassign = async (id: string) => {
    const previous = plans;
    setActionError(null);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePlan(id);
    } catch (error) {
      console.warn('Plandan çıkarılamadı', error);
      setPlans(previous);
      setActionError('Plandan çıkarılamadı, tekrar dene.');
    }
  };

  return { plans, status, actionError, reload, assign, unassign };
}

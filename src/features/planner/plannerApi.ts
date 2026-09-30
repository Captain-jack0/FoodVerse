import { supabase } from '@/lib/supabase';

import type { MealPlan, MealSlot } from './types';

const COLUMNS = 'id, plan_date, slot, recipe_id';

type PlanRow = { id: string; plan_date: string; slot: MealSlot; recipe_id: string };

const toPlan = (row: PlanRow): MealPlan => ({ id: row.id, date: row.plan_date, slot: row.slot, recipeId: row.recipe_id });

export async function fetchPlans(from: string, to: string): Promise<MealPlan[]> {
  const { data, error } = await supabase.from('meal_plans').select(COLUMNS).gte('plan_date', from).lte('plan_date', to);
  if (error) throw error;
  return (data as PlanRow[]).map(toPlan);
}

/** Öğüne tarif atar; o öğünde tarif varsa yerine geçer */
export async function upsertPlan(date: string, slot: MealSlot, recipeId: string): Promise<MealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert({ plan_date: date, slot, recipe_id: recipeId }, { onConflict: 'user_id,plan_date,slot' })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toPlan(data as PlanRow);
}

export async function deletePlan(id: string): Promise<void> {
  const { error } = await supabase.from('meal_plans').delete().eq('id', id);
  if (error) throw error;
}

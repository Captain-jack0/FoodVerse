/// <reference types="jest" />

import type { PantryItem } from '@/features/pantry/types';
import type { Recipe } from '@/features/recipes/types';

import { formatWeekRange, weekDays, weeklyMissing } from './plannerUtils';
import type { MealPlan } from './types';

describe('weekDays', () => {
  it('pazartesiden başlayan 7 gün döner (Çarşamba verildiğinde)', () => {
    const days = weekDays(new Date(2026, 8, 30)); // 30 Eylül 2026 Çarşamba
    expect(days.map((d) => d.date)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(days[0]).toMatchObject({ short: 'Pzt', long: 'Pazartesi', dayOfMonth: 28 });
    expect(days[6].short).toBe('Paz');
  });

  it('pazar günü verilince o haftanın pazartesisine döner', () => {
    expect(weekDays(new Date(2026, 9, 4))[0].date).toBe('2026-09-28');
  });
});

describe('formatWeekRange', () => {
  it('ay geçişini Türkçe yazar', () => {
    expect(formatWeekRange(weekDays(new Date(2026, 8, 30)))).toBe('28 Eyl – 4 Eki');
  });
});

describe('weeklyMissing', () => {
  const recipe = (id: string, ings: [string, string][]): Recipe => ({
    id,
    title: id,
    emoji: '🍲',
    description: '',
    minutes: 10,
    difficulty: 1,
    tags: [],
    source: { type: 'manual' },
    cookedCount: 0,
    favorite: false,
    ingredients: ings.map(([name, amount]) => ({ name, amount })),
    steps: [],
    photoUrl: null,
  });
  const pantry: PantryItem[] = [
    { id: 'p', name: 'Kırmızı Soğan', emoji: '🧅', category: 'sebze', quantity: '1', expiresOn: '2026-10-10' },
  ];
  const recipes = [
    recipe('corba', [
      ['soğan', '1 adet'],
      ['mercimek', '1 bardak'],
    ]),
    recipe('makarna', [
      ['sarımsak', '2 diş'],
      ['Mercimek', '1/2 bardak'],
    ]),
  ];
  const plans: MealPlan[] = [
    { id: '1', date: '2026-09-28', slot: 'aksam', recipeId: 'corba' },
    { id: '2', date: '2026-09-29', slot: 'ogle', recipeId: 'makarna' },
    { id: '3', date: '2026-09-30', slot: 'aksam', recipeId: 'silinmis' },
  ];

  it('kilerde olmayanları toplar, aynı malzemenin miktarlarını birleştirir', () => {
    expect(weeklyMissing(plans, recipes, pantry)).toEqual([
      { name: 'mercimek', amount: '1 bardak + 1/2 bardak' },
      { name: 'sarımsak', amount: '2 diş' },
    ]);
  });
});

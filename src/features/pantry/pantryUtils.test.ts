/// <reference types="jest" />

import type { Recipe } from '@/features/recipes/types';

import type { PantryItem } from './types';
import {
  daysLeft,
  expiryLabel,
  expiryStatus,
  freshnessScore,
  matchRecipe,
  rankRecipes,
} from './pantryUtils';

const TODAY = new Date(2026, 8, 29); // 29 Eylül 2026

function item(name: string, expiresOn: string): PantryItem {
  return { id: name, name, emoji: '🥫', category: 'diger', quantity: '1', expiresOn };
}

describe('daysLeft', () => {
  it('bugün için 0, yarın için 1, dün için -1 döner', () => {
    expect(daysLeft('2026-09-29', TODAY)).toBe(0);
    expect(daysLeft('2026-09-30', TODAY)).toBe(1);
    expect(daysLeft('2026-09-28', TODAY)).toBe(-1);
  });

  it('ay geçişlerini doğru sayar', () => {
    expect(daysLeft('2026-10-04', TODAY)).toBe(5);
  });
});

describe('expiryStatus / expiryLabel', () => {
  it.each([
    [-2, 'danger', 'Süresi geçti!'],
    [0, 'danger', 'Bugün son gün!'],
    [1, 'danger', 'Yarın son gün!'],
    [3, 'warning', '3 gün kaldı'],
    [12, 'ok', '12 gün kaldı'],
    [180, 'longLasting', 'Taze (6 ay)'],
  ])('%i gün → %s / %s', (days, status, label) => {
    expect(expiryStatus(days)).toBe(status);
    expect(expiryLabel(days)).toBe(label);
  });
});

describe('freshnessScore', () => {
  it('boş kilerde 100 döner', () => {
    expect(freshnessScore([], TODAY)).toBe(100);
  });

  it('en az 2 günü olan malzemelerin yüzdesini döner', () => {
    const items = [
      item('a', '2026-09-30'), // 1 gün → taze sayılmaz
      item('b', '2026-10-05'),
      item('c', '2026-10-10'),
      item('d', '2026-11-01'),
    ];
    expect(freshnessScore(items, TODAY)).toBe(75);
  });
});

describe('matchRecipe / rankRecipes', () => {
  const pantry = [item('Kültür Mantarı', '2026-10-03'), item('Yemek Kreması', '2026-09-30'), item('Penne Makarna', '2027-03-01')];
  const recipe = (id: string, names: string[]): Recipe => ({
    id,
    title: id,
    emoji: '🍽️',
    description: '',
    minutes: 20,
    difficulty: 1,
    tags: [],
    source: { type: 'manual' },
    cookedCount: 0,
    favorite: false,
    ingredients: names.map((name) => ({ name, amount: '1' })),
    steps: [],
  });
  const penne = recipe('penne', ['mantar', 'krema', 'penne', 'sarımsak']);
  const sebze = recipe('sebze', ['kabak', 'domates', 'zeytinyağı']);

  it('kısmi ve Türkçe büyük/küçük harf duyarsız eşleşir', () => {
    const match = matchRecipe(penne, pantry);
    expect(match.have).toEqual(['mantar', 'krema', 'penne']);
    expect(match.missing).toEqual(['sarımsak']);
    expect(match.percent).toBe(75);
  });

  it('seçili malzemeleri kullanan tarifi öne alır', () => {
    const ranked = rankRecipes([sebze, penne], pantry, [pantry[1]]);
    expect(ranked.map((r) => r.recipe.id)).toEqual(['penne', 'sebze']);
  });
});

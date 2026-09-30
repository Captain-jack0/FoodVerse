/// <reference types="jest" />

import type { PantryItem } from '@/features/pantry/types';
import type { Recipe } from '@/features/recipes/types';

import { dailyPick, recommend, type Candidate, type RecommendContext } from './recommend';
import { readPreferenceTags } from './preferences';

const TODAY = new Date(2026, 8, 30);

function recipe(id: string, ings: string[], extra: Partial<Recipe> = {}): Recipe {
  return {
    id,
    title: id,
    emoji: '🍲',
    description: '',
    minutes: 30,
    difficulty: 1,
    tags: [],
    source: { type: 'manual' },
    cookedCount: 0,
    favorite: false,
    ingredients: ings.map((name) => ({ name, amount: '1' })),
    steps: ['x'],
    photoUrl: null,
    ...extra,
  };
}

const own = (r: Recipe): Candidate => ({ recipe: r, origin: 'own', avgRating: 0, ratingCount: 0 });

const pantry: PantryItem[] = [
  { id: 'p1', name: 'Yemek Kreması', emoji: '🥛', category: 'sut', quantity: '1', expiresOn: '2026-10-01' },
  { id: 'p2', name: 'Kültür Mantarı', emoji: '🍄', category: 'sebze', quantity: '1', expiresOn: '2026-10-05' },
  { id: 'p3', name: 'Penne', emoji: '🍝', category: 'bakliyat', quantity: '1', expiresOn: '2027-01-01' },
];

const base: RecommendContext = { pantry, preferences: [], selectedIds: [], lastCooked: {}, today: TODAY };

describe('recommend', () => {
  it('kilerle daha çok eşleşen ve bozulacak malzemeyi kurtaran tarifi öne alır', () => {
    const ranked = recommend([own(recipe('salata', ['marul', 'domates'])), own(recipe('penne', ['penne', 'krema', 'mantar']))], base);
    expect(ranked[0].candidate.recipe.id).toBe('penne');
    expect(ranked[0].reasons).toEqual(expect.arrayContaining(['🧺 Kilerindeki 3 malzemeyle', '🛟 Krema bozulmadan değerlendirilir']));
  });

  it('vejetaryen tercihte etli tarifi geriye atar', () => {
    const ranked = recommend(
      [own(recipe('tavuk', ['tavuk göğsü', 'krema', 'mantar'])), own(recipe('sebze', ['kabak', 'domates']))],
      { ...base, preferences: ['vejetaryen'] },
    );
    expect(ranked[0].candidate.recipe.id).toBe('sebze');
    expect(ranked.find((r) => r.candidate.recipe.id === 'tavuk')?.reasons).toContain('🥩 İçinde et var');
  });

  it('glutensiz tercihte makarnalı tarifi geriye atar', () => {
    const ranked = recommend(
      [own(recipe('penne', ['penne', 'krema', 'mantar'])), own(recipe('omlet', ['yumurta', 'mantar']))],
      { ...base, preferences: ['glutensiz'] },
    );
    expect(ranked[0].candidate.recipe.id).toBe('omlet');
  });

  it('pratik tercihte kısa tarif artı puan ve gerekçe alır', () => {
    const [top] = recommend(
      [own(recipe('uzun', ['marul'], { minutes: 90 })), own(recipe('kisa', ['marul'], { minutes: 15 }))],
      { ...base, preferences: ['pratik'] },
    );
    expect(top.candidate.recipe.id).toBe('kisa');
    expect(top.reasons).toContain('⚡ Sadece 15 dk');
  });

  it('dün pişirileni geriye atar, favoriyi öne alır', () => {
    const ranked = recommend(
      [
        own(recipe('dun', ['marul'], { favorite: true })),
        own(recipe('fav', ['marul'], { favorite: true })),
        own(recipe('duz', ['marul'])),
      ],
      { ...base, lastCooked: { dun: '2026-09-29T19:00:00Z' } },
    );
    expect(ranked.map((r) => r.candidate.recipe.id)).toEqual(['fav', 'duz', 'dun']);
  });

  it('topluluktan yüksek puanlı tarif gerekçesiyle gelir; tek oylu 5 yıldız abartılmaz', () => {
    const community = (id: string, avg: number, count: number): Candidate => ({
      recipe: recipe(id, ['marul']),
      origin: 'community',
      avgRating: avg,
      ratingCount: count,
    });
    const ranked = recommend([community('tek', 5, 1), community('cok', 4.6, 30)], base);
    expect(ranked[0].candidate.recipe.id).toBe('cok');
    expect(ranked[0].reasons).toContain('⭐ Toplulukta 4.6');
  });

  it('seçili (tencereye atılan) malzemeleri kullanan tarifi öne alır', () => {
    const ranked = recommend(
      [own(recipe('mantarli', ['mantar', 'marul'])), own(recipe('kremali', ['krema', 'marul']))],
      { ...base, selectedIds: ['p2'] },
    );
    expect(ranked[0].candidate.recipe.id).toBe('mantarli');
  });
});

describe('dailyPick', () => {
  const list = recommend([own(recipe('a', ['penne'])), own(recipe('b', ['penne'])), own(recipe('c', ['penne']))], base);

  it('aynı gün hep aynı tarifi seçer', () => {
    expect(dailyPick(list, TODAY)?.candidate.recipe.id).toBe(dailyPick(list, TODAY)?.candidate.recipe.id);
  });

  it('boş listede null', () => {
    expect(dailyPick([], TODAY)).toBeNull();
  });
});

describe('readPreferenceTags', () => {
  it('bilinmeyen ve bozuk değerleri atar', () => {
    expect(readPreferenceTags({ tags: ['vejetaryen', 'uydurma', 5], tour_done: true })).toEqual(['vejetaryen']);
    expect(readPreferenceTags(null)).toEqual([]);
  });
});

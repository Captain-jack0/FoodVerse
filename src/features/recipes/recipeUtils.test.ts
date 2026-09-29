/// <reference types="jest" />

import type { Recipe } from './types';
import { bookStats, filterRecipes, parseSocialUrl, QUICK_MINUTES } from './recipeUtils';

function recipe(partial: Partial<Recipe> & Pick<Recipe, 'id'>): Recipe {
  return {
    title: partial.id,
    emoji: '🍽️',
    description: '',
    minutes: 30,
    difficulty: 1,
    tags: [],
    source: { type: 'manual' },
    cookedCount: 0,
    favorite: false,
    ingredients: [],
    steps: [],
    ...partial,
  };
}

describe('parseSocialUrl', () => {
  it.each([
    ['https://www.instagram.com/reel/abc123/', 'instagram'],
    ['https://instagram.com/p/xyz', 'instagram'],
    ['https://www.tiktok.com/@sef/video/123', 'tiktok'],
    ['https://vm.tiktok.com/ZMabc/', 'tiktok'],
    ['  https://www.instagram.com/reel/abc  ', 'instagram'],
  ])('%s → %s', (url, platform) => {
    expect(parseSocialUrl(url)).toBe(platform);
  });

  it.each([
    [''],
    ['instagram.com/reel/abc'],
    ['https://youtube.com/watch?v=1'],
    ['https://instagram.com.evil.site/reel/abc'],
    ['https://www.instagram.com/'],
    ['javascript:alert(1)'],
  ])('geçersiz: %s', (url) => {
    expect(parseSocialUrl(url)).toBeNull();
  });
});

describe('filterRecipes', () => {
  const recipes = [
    recipe({ id: 'pankek', title: 'Pofuduk Japon Pankeki', minutes: 20, tags: ['tatli'] }),
    recipe({ id: 'corba', title: 'Kremalı Balkabağı Çorbası', minutes: 15, tags: ['hafif'] }),
    recipe({ id: 'kofte', title: 'Anne Köftesi', minutes: 35, tags: ['firin', 'anne'] }),
  ];

  it('tümü filtresinde hepsini döner', () => {
    expect(filterRecipes(recipes, 'all', '')).toHaveLength(3);
  });

  it('hızlı filtresi süreye göre çalışır', () => {
    expect(filterRecipes(recipes, 'hizli', '').map((r) => r.id)).toEqual(['corba']);
    expect(QUICK_MINUTES).toBe(15);
  });

  it('etiket filtresi', () => {
    expect(filterRecipes(recipes, 'firin', '').map((r) => r.id)).toEqual(['kofte']);
  });

  it('arama Türkçe büyük/küçük harf duyarsız', () => {
    expect(filterRecipes(recipes, 'all', 'KÖFTE').map((r) => r.id)).toEqual(['kofte']);
    expect(filterRecipes(recipes, 'all', 'çorba').map((r) => r.id)).toEqual(['corba']);
  });
});

describe('bookStats', () => {
  it('toplam, içe aktarılan ve en çok pişirileni hesaplar', () => {
    const stats = bookStats([
      recipe({ id: 'a', cookedCount: 3, source: { type: 'instagram', url: 'x' } }),
      recipe({ id: 'b', cookedCount: 9, favorite: true }),
      recipe({ id: 'c', cookedCount: 1, source: { type: 'tiktok', url: 'y' } }),
    ]);
    expect(stats).toEqual({ total: 3, imported: 2, favorites: 1, totalCooked: 13, mostCooked: 'b' });
  });

  it('boş defterde en çok pişirilen yok', () => {
    expect(bookStats([]).mostCooked).toBeNull();
  });
});

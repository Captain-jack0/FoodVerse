/// <reference types="jest" />

import { draftFromRecipe, emptyDraft, toRecipeInsert, validateDraft, type RecipeDraft } from './recipeDraft';
import type { Recipe } from './types';

const valid: RecipeDraft = {
  ...emptyDraft(),
  title: '  Mercimek Çorbası ',
  minutes: '30',
  ingredients: [
    { name: ' Mercimek ', amount: '1 su bardağı' },
    { name: '', amount: '' },
  ],
  steps: ['Kavur.', '  ', 'Pişir.'],
};

describe('validateDraft', () => {
  it('geçerli taslakta hata yok', () => {
    expect(validateDraft(valid)).toEqual({});
  });

  it('zorunlu alanları ve süre aralığını kontrol eder', () => {
    expect(validateDraft({ ...emptyDraft(), minutes: '0' })).toEqual({
      title: 'Tarifine bir ad ver.',
      minutes: 'Süre 1 ile 1440 dakika arasında olmalı.',
      ingredients: 'En az bir malzeme ekle.',
      steps: 'En az bir adım yaz.',
    });
    expect(validateDraft({ ...valid, minutes: 'yarım saat' }).minutes).toBe('Süre 1 ile 1440 dakika arasında olmalı.');
  });

  it('geçersiz sosyal medya linkini yakalar', () => {
    expect(validateDraft({ ...valid, sourceUrl: 'https://youtube.com/x' }).sourceUrl).toBe(
      'Sadece Instagram veya TikTok linki ekleyebilirsin.',
    );
  });
});

describe('toRecipeInsert', () => {
  it('boşlukları temizler, boş satırları atar, kaynağı linkten çıkarır', () => {
    const payload = toRecipeInsert({ ...valid, sourceUrl: 'https://vm.tiktok.com/abc/', isPublic: true });
    expect(payload).toMatchObject({
      title: 'Mercimek Çorbası',
      minutes: 30,
      ingredients: [{ name: 'Mercimek', amount: '1 su bardağı' }],
      steps: ['Kavur.', 'Pişir.'],
      source_type: 'tiktok',
      source_url: 'https://vm.tiktok.com/abc/',
      visibility: 'public',
      tip: null,
    });
  });

  it('link yoksa seçilen kaynak tipini kullanır', () => {
    expect(toRecipeInsert({ ...valid, sourceType: 'family' })).toMatchObject({
      source_type: 'family',
      source_url: null,
      visibility: 'private',
    });
  });
});

describe('draftFromRecipe', () => {
  const recipe: Recipe = {
    id: 'r1',
    title: 'Pankek',
    emoji: '🥞',
    description: 'Yumuşacık',
    minutes: 20,
    difficulty: 2,
    tags: ['tatli'],
    source: { type: 'instagram', url: 'https://www.instagram.com/reel/x/' },
    tip: 'Kısık ateş',
    cookedCount: 4,
    favorite: true,
    ingredients: [{ name: 'yumurta', amount: '2' }],
    steps: ['Çırp.', 'Pişir.'],
  };

  it('tarifi forma doldurur; forma yazılıp kaydedilince aynı veri çıkar', () => {
    const draft = draftFromRecipe(recipe, true);
    expect(draft).toMatchObject({ minutes: '20', sourceUrl: 'https://www.instagram.com/reel/x/', isPublic: true, tip: 'Kısık ateş' });
    expect(validateDraft(draft)).toEqual({});
    expect(toRecipeInsert(draft)).toMatchObject({
      title: 'Pankek',
      minutes: 20,
      difficulty: 2,
      tags: ['tatli'],
      source_type: 'instagram',
      source_url: 'https://www.instagram.com/reel/x/',
      tip: 'Kısık ateş',
      ingredients: [{ name: 'yumurta', amount: '2' }],
      steps: ['Çırp.', 'Pişir.'],
      visibility: 'public',
    });
  });

  it('aile tarifinde kaynak tipi korunur', () => {
    expect(draftFromRecipe({ ...recipe, source: { type: 'family' }, tip: undefined }, false)).toMatchObject({
      sourceType: 'family',
      sourceUrl: '',
      tip: '',
      isPublic: false,
    });
  });
});

/// <reference types="jest" />

import { emptyDraft, toRecipeInsert, validateDraft, type RecipeDraft } from './recipeDraft';

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

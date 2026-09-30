/// <reference types="jest" />

import { STARTER_COLLECTIONS, starterSuggestions, validateCollectionName } from './collectionUtils';
import type { Collection } from './types';

const col = (id: string, name: string): Collection => ({ id, name, emoji: '📚', recipeIds: [] });

describe('validateCollectionName', () => {
  const existing = [col('1', 'Kahvaltılıklar'), col('2', 'Anne Defteri')];

  it('geçerli adda hata yok', () => {
    expect(validateCollectionName('  Misafir Menüsü ', existing)).toBeNull();
  });

  it('boş, çok uzun ve aynı isimli koleksiyonu reddeder (Türkçe harf duyarsız)', () => {
    expect(validateCollectionName('   ', existing)).toBe('Koleksiyona bir ad ver.');
    expect(validateCollectionName('a'.repeat(41), existing)).toBe('Ad en fazla 40 karakter olabilir.');
    expect(validateCollectionName('KAHVALTILIKLAR', existing)).toBe('Bu adda bir koleksiyonun zaten var.');
  });

  it('düzenlerken kendi adını tekrar kullanabilir', () => {
    expect(validateCollectionName('Anne Defteri', existing, '2')).toBeNull();
  });
});

describe('starterSuggestions', () => {
  it('zaten oluşturulmuş önerileri gizler', () => {
    const names = starterSuggestions([col('1', 'kahvaltılıklar')]).map((s) => s.name);
    expect(names).not.toContain('Kahvaltılıklar');
    expect(names.length).toBe(STARTER_COLLECTIONS.length - 1);
  });
});

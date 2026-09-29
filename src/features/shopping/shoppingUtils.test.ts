/// <reference types="jest" />

import { guessCategory } from '@/features/pantry/categories';

import { itemsToAdd } from './shoppingUtils';
import type { ShoppingItem } from './types';

const item = (name: string, checked = false): ShoppingItem => ({ id: name, name, amount: '', checked, recipeId: null });

describe('itemsToAdd', () => {
  it('listede zaten olan (alınmamış) malzemeleri tekrar eklemez, Türkçe harf duyarsız', () => {
    const existing = [item('Sarımsak'), item('krema', true)];
    const missing = [
      { name: 'sarımsak', amount: '2 diş' },
      { name: 'Krema', amount: '200 ml' },
      { name: 'krema', amount: '100 ml' },
      { name: ' ', amount: '' },
    ];
    // sepete atılmış (checked) krema tekrar alınması gerekebilir → eklenir, ama bir kez
    expect(itemsToAdd(existing, missing)).toEqual([{ name: 'Krema', amount: '200 ml' }]);
  });
});

describe('guessCategory', () => {
  it.each([
    ['Süt', 'sut'],
    ['Eski Kaşar', 'sut'],
    ['tavuk göğsü', 'et'],
    ['Kırmızı Mercimek', 'bakliyat'],
    ['pul biber', 'baharat'],
    ['Sivri Biber', 'sebze'],
    ['Kültür Mantarı', 'sebze'],
    ['Deterjan', 'diger'],
  ])('%s → %s', (name, category) => {
    expect(guessCategory(name)).toBe(category);
  });
});

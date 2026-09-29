/// <reference types="jest" />

import { toRecipe, type RecipeRow } from './recipeMapper';

const row: RecipeRow = {
  id: 'r1',
  title: 'Mercimek Çorbası',
  emoji: '🍲',
  description: 'Klasik',
  minutes: 30,
  difficulty: 2,
  tags: ['hafif', 'bilinmeyen'],
  source_type: 'instagram',
  source_url: 'https://www.instagram.com/reel/x/',
  tip: null,
  ingredients: [{ name: 'mercimek', amount: '1 su bardağı' }, { name: 5 }, 'bozuk', { name: 'soğan' }],
  steps: ['Kavur.', 42, 'Pişir.'],
};

describe('toRecipe', () => {
  it('satırı Recipe modeline çevirir, favori ve pişirme sayısını ekler', () => {
    const recipe = toRecipe(row, { favorite: true, cookedCount: 3 });
    expect(recipe).toMatchObject({
      id: 'r1',
      title: 'Mercimek Çorbası',
      minutes: 30,
      difficulty: 2,
      source: { type: 'instagram', url: 'https://www.instagram.com/reel/x/' },
      favorite: true,
      cookedCount: 3,
    });
    expect(recipe.tip).toBeUndefined();
  });

  it('bilinmeyen etiketleri ve bozuk jsonb öğelerini ayıklar', () => {
    const recipe = toRecipe(row, { favorite: false, cookedCount: 0 });
    expect(recipe.tags).toEqual(['hafif']);
    expect(recipe.ingredients).toEqual([
      { name: 'mercimek', amount: '1 su bardağı' },
      { name: 'soğan', amount: '' },
    ]);
    expect(recipe.steps).toEqual(['Kavur.', 'Pişir.']);
  });

  it('manuel/aile kaynağında url taşımaz, geçersiz zorluğu 1 yapar', () => {
    const recipe = toRecipe({ ...row, source_type: 'family', source_url: null, difficulty: 9 }, { favorite: false, cookedCount: 0 });
    expect(recipe.source).toEqual({ type: 'family' });
    expect(recipe.difficulty).toBe(1);
  });
});

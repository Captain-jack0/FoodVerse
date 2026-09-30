/// <reference types="jest" />

import { toDiscoverItem, type DiscoverRow } from './discoverMapper';

const row: DiscoverRow = {
  id: 'r1',
  title: 'Mercimek Çorbası',
  emoji: '🍲',
  description: 'Klasik',
  minutes: 30,
  difficulty: 2,
  tags: ['hafif', 'bilinmeyen'],
  created_at: '2026-09-30T10:00:00Z',
  author_id: 'u1',
  author_name: 'Şef Deniz',
  author_avatar: null,
  author_level: 3,
  avg_rating: '4.33',
  rating_count: '3',
  save_count: 7,
  cook_count: '12',
};

describe('toDiscoverItem', () => {
  it('numeric/bigint alanları sayıya çevirir, bilinmeyen etiketleri atar', () => {
    expect(toDiscoverItem(row)).toEqual({
      id: 'r1',
      title: 'Mercimek Çorbası',
      emoji: '🍲',
      description: 'Klasik',
      minutes: 30,
      difficulty: 2,
      tags: ['hafif'],
      createdAt: '2026-09-30T10:00:00Z',
      author: { id: 'u1', name: 'Şef Deniz', avatarUrl: null, level: 3 },
      avgRating: 4.33,
      ratingCount: 3,
      saveCount: 7,
      cookCount: 12,
    });
  });

  it('bozuk zorluk değerini 1 yapar', () => {
    expect(toDiscoverItem({ ...row, difficulty: 7 }).difficulty).toBe(1);
  });
});

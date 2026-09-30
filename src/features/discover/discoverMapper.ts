import { RECIPE_TAGS } from '@/features/recipes/recipeTags';
import type { Difficulty, RecipeTag } from '@/features/recipes/types';

export type Author = { id: string; name: string; avatarUrl: string | null; level: number };

export type DiscoverItem = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minutes: number;
  difficulty: Difficulty;
  tags: RecipeTag[];
  photoUrl: string | null;
  createdAt: string;
  author: Author;
  avgRating: number;
  ratingCount: number;
  saveCount: number;
  cookCount: number;
};

/** discover_feed RPC satırı; Postgres numeric/bigint alanları JSON'da metin gelebilir */
export type DiscoverRow = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minutes: number;
  difficulty: number;
  tags: string[];
  photo_url: string | null;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_level: number;
  avg_rating: number | string;
  rating_count: number | string;
  save_count: number | string;
  cook_count: number | string;
};

export function toDiscoverItem(row: DiscoverRow): DiscoverItem {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    minutes: row.minutes,
    difficulty: ([1, 2, 3].includes(row.difficulty) ? row.difficulty : 1) as Difficulty,
    tags: row.tags.filter((t): t is RecipeTag => t in RECIPE_TAGS),
    photoUrl: row.photo_url ?? null,
    createdAt: row.created_at,
    author: { id: row.author_id, name: row.author_name, avatarUrl: row.author_avatar, level: row.author_level },
    avgRating: Number(row.avg_rating),
    ratingCount: Number(row.rating_count),
    saveCount: Number(row.save_count),
    cookCount: Number(row.cook_count),
  };
}

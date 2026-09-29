import { RECIPE_TAGS } from './recipeTags';
import type { Difficulty, Ingredient, Recipe, RecipeSource, RecipeTag } from './types';

/** Supabase recipes tablosundan gelen satır (jsonb alanları güvenilmez kabul edilir) */
export type RecipeRow = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minutes: number;
  difficulty: number;
  tags: string[];
  source_type: string;
  source_url: string | null;
  tip: string | null;
  ingredients: unknown;
  steps: unknown;
};

export const RECIPE_COLUMNS =
  'id, title, emoji, description, minutes, difficulty, tags, source_type, source_url, tip, ingredients, steps';

function toSource(type: string, url: string | null): RecipeSource {
  if ((type === 'instagram' || type === 'tiktok') && url) return { type, url };
  if (type === 'family') return { type: 'family' };
  return { type: 'manual' };
}

function toIngredients(value: unknown): Ingredient[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const { name, amount } = item as Record<string, unknown>;
    if (typeof name !== 'string' || !name) return [];
    return [{ name, amount: typeof amount === 'string' ? amount : '' }];
  });
}

function toSteps(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string') : [];
}

export function toRecipe(row: RecipeRow, extra: { favorite: boolean; cookedCount: number }): Recipe {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    minutes: row.minutes,
    difficulty: ([1, 2, 3].includes(row.difficulty) ? row.difficulty : 1) as Difficulty,
    tags: row.tags.filter((t): t is RecipeTag => t in RECIPE_TAGS),
    source: toSource(row.source_type, row.source_url),
    tip: row.tip ?? undefined,
    ingredients: toIngredients(row.ingredients),
    steps: toSteps(row.steps),
    ...extra,
  };
}

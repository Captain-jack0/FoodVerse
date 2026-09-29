import { parseSocialUrl } from './recipeUtils';
import type { Difficulty, Ingredient, RecipeTag } from './types';

/** Veritabanı kısıtlarıyla (0001_init.sql) aynı sınırlar */
export const LIMITS = {
  title: 80,
  description: 500,
  tip: 500,
  ingredientName: 40,
  ingredientAmount: 40,
  step: 500,
  maxIngredients: 40,
  maxSteps: 30,
  maxMinutes: 1440,
} as const;

export type RecipeDraft = {
  title: string;
  emoji: string;
  description: string;
  /** Formda metin olarak tutulur */
  minutes: string;
  difficulty: Difficulty;
  tags: RecipeTag[];
  sourceType: 'manual' | 'family';
  sourceUrl: string;
  tip: string;
  ingredients: Ingredient[];
  steps: string[];
  isPublic: boolean;
};

export function emptyDraft(sourceUrl = ''): RecipeDraft {
  return {
    title: '',
    emoji: '🍲',
    description: '',
    minutes: '',
    difficulty: 1,
    tags: [],
    sourceType: 'manual',
    sourceUrl,
    tip: '',
    ingredients: [{ name: '', amount: '' }],
    steps: [''],
    isPublic: false,
  };
}

const cleanIngredients = (list: Ingredient[]) =>
  list.map((i) => ({ name: i.name.trim(), amount: i.amount.trim() })).filter((i) => i.name);

const cleanSteps = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);

function parseMinutes(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const n = Number(value);
  return n >= 1 && n <= LIMITS.maxMinutes ? n : null;
}

export type DraftErrors = Partial<Record<'title' | 'minutes' | 'ingredients' | 'steps' | 'sourceUrl', string>>;

export function validateDraft(draft: RecipeDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.title.trim()) errors.title = 'Tarifine bir ad ver.';
  if (parseMinutes(draft.minutes) === null) errors.minutes = `Süre 1 ile ${LIMITS.maxMinutes} dakika arasında olmalı.`;
  if (cleanIngredients(draft.ingredients).length === 0) errors.ingredients = 'En az bir malzeme ekle.';
  if (cleanSteps(draft.steps).length === 0) errors.steps = 'En az bir adım yaz.';
  if (draft.sourceUrl.trim() && !parseSocialUrl(draft.sourceUrl)) {
    errors.sourceUrl = 'Sadece Instagram veya TikTok linki ekleyebilirsin.';
  }
  return errors;
}

/** Doğrulanmış taslağı recipes tablosuna eklenecek satıra çevirir */
export function toRecipeInsert(draft: RecipeDraft) {
  const url = draft.sourceUrl.trim();
  const platform = url ? parseSocialUrl(url) : null;
  return {
    title: draft.title.trim(),
    emoji: draft.emoji,
    description: draft.description.trim(),
    minutes: parseMinutes(draft.minutes) ?? 1,
    difficulty: draft.difficulty,
    tags: draft.tags,
    source_type: platform ?? draft.sourceType,
    source_url: platform ? url : null,
    tip: draft.tip.trim() || null,
    ingredients: cleanIngredients(draft.ingredients),
    steps: cleanSteps(draft.steps),
    visibility: draft.isPublic ? 'public' : 'private',
  };
}

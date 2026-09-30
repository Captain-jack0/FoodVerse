export type RecipeTag = 'hizli' | 'firin' | 'hafif' | 'tatli' | 'anne';

export type RecipeSource =
  | { type: 'instagram'; url: string }
  | { type: 'tiktok'; url: string }
  | { type: 'manual' }
  | { type: 'family' };

export type Difficulty = 1 | 2 | 3;

export type Ingredient = {
  /** Kilerle eşleştirilen kısa ad, örn. "mantar" */
  name: string;
  amount: string;
};

export type Recipe = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minutes: number;
  difficulty: Difficulty;
  tags: RecipeTag[];
  source: RecipeSource;
  tip?: string;
  cookedCount: number;
  favorite: boolean;
  ingredients: Ingredient[];
  steps: string[];
  /** Tarif fotoğrafı (yoksa emoji gösterilir) */
  photoUrl: string | null;
};

export type SocialPlatform = 'instagram' | 'tiktok';

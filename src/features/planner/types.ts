export type MealSlot = 'kahvalti' | 'ogle' | 'aksam';

export type MealPlan = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  slot: MealSlot;
  recipeId: string;
};

export const SLOTS: { id: MealSlot; label: string; emoji: string }[] = [
  { id: 'kahvalti', label: 'Kahvaltı', emoji: '🌅' },
  { id: 'ogle', label: 'Öğle', emoji: '☀️' },
  { id: 'aksam', label: 'Akşam', emoji: '🌙' },
];

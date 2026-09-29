export type ShoppingItem = {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
  recipeId: string | null;
};

export type NewShoppingItem = { name: string; amount: string; recipeId?: string };

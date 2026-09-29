export type PantryCategory = 'sebze' | 'sut' | 'et' | 'bakliyat' | 'baharat' | 'diger';

export type PantryItem = {
  id: string;
  name: string;
  emoji: string;
  category: PantryCategory;
  /** Örn. "350 gr", "1 Paket (500 gr)" */
  quantity: string;
  /** YYYY-MM-DD */
  expiresOn: string;
};

export type RecipeSuggestion = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minutes: number;
  /** Kilerdeki malzeme adlarıyla eşleştirilir (küçük harf, Türkçe) */
  ingredients: string[];
};

export type ExpiryStatus = 'danger' | 'warning' | 'ok' | 'longLasting';

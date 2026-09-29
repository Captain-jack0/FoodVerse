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

export type ExpiryStatus = 'danger' | 'warning' | 'ok' | 'longLasting';

import type { PantryCategory, PantryItem, RecipeSuggestion } from './types';

export const CATEGORIES: Record<PantryCategory, { label: string; emoji: string }> = {
  sebze: { label: 'Sebzeler', emoji: '🥕' },
  sut: { label: 'Süt Ürünleri', emoji: '🥛' },
  et: { label: 'Et & Tavuk', emoji: '🍗' },
  bakliyat: { label: 'Bakliyat', emoji: '🌾' },
  baharat: { label: 'Baharat & Sos', emoji: '🌿' },
  diger: { label: 'Diğer', emoji: '🥫' },
};

/** Bugünden n gün sonrası, YYYY-MM-DD */
export function inDays(n: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + n);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ponytail: örnek veri; Supabase pantry_items tablosu bağlanınca kaldırılacak
export const MOCK_PANTRY: PantryItem[] = [
  { id: 'p1', name: 'Kültür Mantarı', emoji: '🍄', category: 'sebze', quantity: '350 gr', expiresOn: inDays(4) },
  { id: 'p2', name: 'Yemek Kreması', emoji: '🥛', category: 'sut', quantity: '1 Kutu (200 ml)', expiresOn: inDays(1) },
  { id: 'p3', name: 'Penne Makarna', emoji: '🍝', category: 'bakliyat', quantity: '1 Paket (500 gr)', expiresOn: inDays(180) },
  { id: 'p4', name: 'Eski Kaşar', emoji: '🧀', category: 'sut', quantity: '150 gr', expiresOn: inDays(12) },
  { id: 'p5', name: 'Tavuk Fileto', emoji: '🍗', category: 'et', quantity: '400 gr', expiresOn: inDays(2) },
  { id: 'p6', name: 'Taze Kabak', emoji: '🥒', category: 'sebze', quantity: '3 adet', expiresOn: inDays(5) },
  { id: 'p7', name: 'Taze Fesleğen', emoji: '🌿', category: 'baharat', quantity: '1 demet', expiresOn: inDays(3) },
  { id: 'p8', name: 'Salkım Domates', emoji: '🍅', category: 'sebze', quantity: '4 adet', expiresOn: inDays(1) },
  { id: 'p9', name: 'Kırmızı Mercimek', emoji: '🫘', category: 'bakliyat', quantity: '1 kg', expiresOn: inDays(240) },
  { id: 'p10', name: 'Tereyağı', emoji: '🧈', category: 'sut', quantity: '250 gr', expiresOn: inDays(20) },
];

export const MOCK_RECIPES: RecipeSuggestion[] = [
  {
    id: 'r1',
    title: 'Kremalı Mantarlı Penne',
    emoji: '🍝',
    description: 'Dolabındaki krema ve mantarları değerlendirmek için harika bir gün!',
    minutes: 20,
    ingredients: ['mantar', 'krema', 'penne', 'sarımsak'],
  },
  {
    id: 'r2',
    title: 'Fırında Baharatlı Sebze',
    emoji: '🥘',
    description: 'Kabak ve domatesleri fırında karamelize lezzete dönüştür.',
    minutes: 35,
    ingredients: ['kabak', 'domates', 'fesleğen', 'zeytinyağı'],
  },
  {
    id: 'r3',
    title: 'Mercimek Çorbası',
    emoji: '🍲',
    description: 'Tereyağlı, limonlu klasik; soğuk günlerin kurtarıcısı.',
    minutes: 30,
    ingredients: ['mercimek', 'tereyağı', 'soğan', 'havuç'],
  },
  {
    id: 'r4',
    title: 'Kaşarlı Tavuk Sote',
    emoji: '🍳',
    description: 'Yarın son günü olan domatesle tek tavada pratik akşam yemeği.',
    minutes: 25,
    ingredients: ['tavuk', 'domates', 'kaşar', 'biber'],
  },
];

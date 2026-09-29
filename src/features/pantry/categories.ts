import type { PantryCategory } from './types';

export const CATEGORIES: Record<PantryCategory, { label: string; emoji: string; shelfDays: number }> = {
  sebze: { label: 'Sebzeler', emoji: '🥕', shelfDays: 5 },
  sut: { label: 'Süt Ürünleri', emoji: '🥛', shelfDays: 7 },
  et: { label: 'Et & Tavuk', emoji: '🍗', shelfDays: 3 },
  bakliyat: { label: 'Bakliyat', emoji: '🌾', shelfDays: 180 },
  baharat: { label: 'Baharat & Sos', emoji: '🌿', shelfDays: 90 },
  diger: { label: 'Diğer', emoji: '🥫', shelfDays: 14 },
};

// CATEGORIES[*].shelfDays değerlerinin hepsi burada olmalı (tahmin seçili görünsün)
export const SHELF_LIFE = [
  { label: '3 gün', days: 3 },
  { label: '5 gün', days: 5 },
  { label: '1 hafta', days: 7 },
  { label: '2 hafta', days: 14 },
  { label: '1 ay', days: 30 },
  { label: '3 ay', days: 90 },
  { label: '6 ay', days: 180 },
];

/** Bugünden n gün sonrası, YYYY-MM-DD */
export function inDays(n: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + n);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Sıra önemli: "pul biber" baharat, "biber" sebze olmalı → özel olanlar önce
// ponytail: basit anahtar kelime listesi; yanlış tahmini kullanıcı formda düzeltebilir
const KEYWORDS: [PantryCategory, string[]][] = [
  ['baharat', ['pul biber', 'karabiber', 'isot', 'kimyon', 'tuz', 'nane', 'kekik', 'fesleğen', 'maydanoz', 'dereotu', 'salça', 'sos', 'sirke', 'tarçın', 'zerdeçal', 'muskat', 'zencefil']],
  ['sut', ['süt', 'yoğurt', 'peynir', 'kaşar', 'krema', 'tereyağ', 'kaymak', 'lor', 'labne', 'yumurta']],
  ['et', ['tavuk', 'kıyma', 'et', 'köfte', 'balık', 'somon', 'hindi', 'sucuk', 'pastırma', 'karides']],
  ['bakliyat', ['mercimek', 'nohut', 'fasulye', 'pirinç', 'bulgur', 'makarna', 'penne', 'spagetti', 'erişte', 'un', 'yulaf', 'irmik']],
  ['sebze', ['domates', 'biber', 'soğan', 'sarımsak', 'patates', 'havuç', 'kabak', 'patlıcan', 'mantar', 'ıspanak', 'marul', 'salatalık', 'brokoli', 'pırasa', 'limon', 'elma', 'muz', 'balkabağı']],
];

/** Malzeme adından kilerdeki kategoriyi tahmin eder */
export function guessCategory(name: string): PantryCategory {
  const words = name.toLocaleLowerCase('tr-TR').split(/\s+/).filter(Boolean);
  const text = words.join(' ');
  for (const [category, keys] of KEYWORDS) {
    // Tek kelimelik anahtarlar kelime başıyla eşleşsin ("et" → "etli" evet, "deterjan" hayır)
    if (keys.some((k) => (k.includes(' ') ? text.includes(k) : words.some((w) => w.startsWith(k))))) {
      return category;
    }
  }
  return 'diger';
}

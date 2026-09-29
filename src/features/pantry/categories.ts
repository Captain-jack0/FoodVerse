import type { PantryCategory } from './types';

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

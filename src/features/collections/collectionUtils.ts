import type { Collection } from './types';

export const COLLECTION_NAME_MAX = 40;

export const COLLECTION_EMOJIS = ['📚', '🍳', '👵', '🎉', '🥗', '🍰', '🍲', '⚡', '🌙', '❤️', '🧁', '🥘'];

/** Yeni kullanıcıya tek dokunuşla önerilen koleksiyonlar */
export const STARTER_COLLECTIONS = [
  { name: 'Kahvaltılıklar', emoji: '🍳' },
  { name: 'Anne Defteri', emoji: '👵' },
  { name: 'Misafir Menüsü', emoji: '🎉' },
  { name: 'Tatlı Krizleri', emoji: '🍰' },
];

const key = (name: string) => name.trim().toLocaleLowerCase('tr-TR');

/** Hata mesajı ya da null; editingId verilirse o koleksiyonun kendi adı çakışma sayılmaz */
export function validateCollectionName(name: string, existing: Collection[], editingId?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Koleksiyona bir ad ver.';
  if (trimmed.length > COLLECTION_NAME_MAX) return `Ad en fazla ${COLLECTION_NAME_MAX} karakter olabilir.`;
  if (existing.some((c) => c.id !== editingId && key(c.name) === key(trimmed))) {
    return 'Bu adda bir koleksiyonun zaten var.';
  }
  return null;
}

export function starterSuggestions(existing: Collection[]) {
  const names = new Set(existing.map((c) => key(c.name)));
  return STARTER_COLLECTIONS.filter((s) => !names.has(key(s.name)));
}

/**
 * Küfür filtresi — supabase/migrations/0007_moderation.sql içindeki contains_profanity ile AYNI liste.
 * Uygulamada anında uyarı için; asıl engel veritabanında (atlatılamaz).
 * ponytail: basit kelime listesi; kaçaklar şikayet sistemiyle yakalanır, liste büyütülebilir
 */

// Sadece tam kelime olarak eşleşenler ("götür", "sikke" gibi masum kelimeler yakalanmasın)
const EXACT_WORDS = new Set(['amk', 'aq', 'mk', 'oç', 'sik', 'göt', 'götü', 'götün']);

// Kelime başı olarak eşleşenler (ekli halleri de yakalar)
const ROOTS = [
  'orospu', 'siktir', 'sikiş', 'sikik', 'sikim', 'yarrak', 'amcık', 'amına', 'amina', 'pezevenk',
  'yavşak', 'şerefsiz', 'kahpe', 'puşt', 'dalyarak', 'taşak', 'sürtük', 'gavat', 'ibne', 'piç',
];

// Rakamla gizlenmiş harfler: 0→o, 1→i, 3→e, 4→a, @→a, $→s
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '@': 'a', $: 's' };

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .replace(/[0134@$]/g, (ch) => LEET[ch]);
  const tokens = normalized.split(/[^a-zçğıöşü]+/).filter(Boolean);
  return tokens.some((tok) => EXACT_WORDS.has(tok) || ROOTS.some((root) => tok.startsWith(root)));
}

export const PROFANITY_MESSAGE =
  'Bu ifade topluluk kurallarımıza uygun değil, lütfen düzeltip tekrar dene. 🙏 (Tekrarlanan denemeler yöneticiye bildirilir.)';

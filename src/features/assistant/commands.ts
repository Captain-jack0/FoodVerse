/**
 * Kural tabanlı Türkçe komut çözücü (yapay zekâ gerektirmez).
 * ponytail: anahtar kelime eşleştirme; serbest sorular için ileride LLM eklenecek.
 */

export type Command =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'repeat' }
  | { type: 'ingredients' }
  | { type: 'timer'; minutes: number | null }
  | { type: 'cancelTimer' }
  | { type: 'timeLeft' }
  | { type: 'stopSpeaking' }
  | { type: 'finish' };

const ONES: Record<string, number> = {
  bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9,
};
const TENS: Record<string, number> = { on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50, altmış: 60 };

const normalize = (text: string) => text.toLocaleLowerCase('tr-TR').replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();

/** "on beş" → 15, "20" → 20; sayıyı bulamazsa null. Kelime dizisinin başından okur. */
function readNumber(words: string[]): number | null {
  if (words.length === 0) return null;
  const digit = /^(\d+)(?:-(\d+))?$/.exec(words[0]);
  // "10-12" gibi aralıklarda üst sınırı al (zamanlayıcı erken çalmasın)
  if (digit) return Number(digit[2] ?? digit[1]);
  let total = 0;
  let i = 0;
  if (words[i] in TENS) total += TENS[words[i++]];
  if (i < words.length && words[i] in ONES) total += ONES[words[i++]];
  return total > 0 ? total : null;
}

/** Metindeki süreyi dakika olarak bulur ("yarım saat", "bir buçuk saat", "10 dk") */
export function parseMinutes(text: string): number | null {
  const t = normalize(text);
  if (/yarım saat/.test(t)) return 30;
  const words = t.split(' ');
  for (let i = 0; i < words.length; i++) {
    const unit = words[i];
    const isMinute = unit === 'dakika' || unit === 'dk' || unit.startsWith('dakika');
    const isHour = unit === 'saat' || unit.startsWith('saat');
    if (!isMinute && !isHour) continue;
    // Birimden önceki en fazla 3 kelimede sayıyı ara ("bir buçuk saat", "on beş dakika")
    for (let back = Math.min(3, i); back >= 1; back--) {
      const slice = words.slice(i - back, i);
      const half = slice[slice.length - 1] === 'buçuk';
      const n = readNumber(half ? slice.slice(0, -1) : slice);
      if (n !== null) return isHour ? n * 60 + (half ? 30 : 0) : n;
    }
  }
  return null;
}

/** Pişirme adımında geçen süre (zamanlayıcı önerisi için) */
export function stepDurationMinutes(step: string): number | null {
  return parseMinutes(step);
}

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

export function parseCommand(input: string): Command | null {
  const t = normalize(input);
  if (!t) return null;

  if (has(t, ['zamanlayıcı', 'alarm', 'sayaç'])) {
    if (has(t, ['iptal', 'durdur', 'kapat', 'sil'])) return { type: 'cancelTimer' };
    return { type: 'timer', minutes: parseMinutes(t) };
  }
  if (has(t, ['kaç dakika', 'ne kadar kaldı', 'kalan süre'])) return { type: 'timeLeft' };
  if (/(^| )\d+ ?(dakika|dk)( |$)/.test(t) && has(t, ['kur', 'başlat'])) return { type: 'timer', minutes: parseMinutes(t) };
  if (has(t, ['malzeme'])) return { type: 'ingredients' };
  if (has(t, ['pişirdim', 'bitti', 'tamamlandı', 'bitirdim'])) return { type: 'finish' };
  if (has(t, ['tekrar', 'bir daha', 'yinele', 'anlamadım'])) return { type: 'repeat' };
  if (has(t, ['önceki', 'geri'])) return { type: 'prev' };
  if (has(t, ['sonraki', 'ileri', 'devam', 'geç'])) return { type: 'next' };
  if (/(^| )(sus|dur|sessiz)( |$)/.test(t)) return { type: 'stopSpeaking' };
  return null;
}

// admin_penalize_user ile aynı sıra: 1 saat → 1 gün → 1 hafta → 1 ay → 1 yıl → kalıcı
const LADDER = ['1 saat', '1 gün', '1 hafta', '1 ay', '1 yıl', 'kalıcı'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/** Kullanıcının daha önce aldığı ceza sayısına göre bir sonraki ceza */
export function nextPenaltyLabel(previousCount: number): string {
  return LADDER[Math.min(previousCount, LADDER.length - 1)];
}

/** "1 Eki 15:30 tarihine kadar" / "kalıcı olarak" */
export function penaltyUntilText(endsAt: string | null): string {
  if (!endsAt) return 'kalıcı olarak';
  const d = new Date(endsAt);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hh}:${mm} tarihine kadar`;
}

const field = (error: unknown, key: 'message' | 'code') =>
  typeof error === 'object' && error !== null && key in error ? String((error as Record<string, unknown>)[key]) : '';

/** Veritabanındaki küfür filtresine takıldı */
export const isProfanityError = (error: unknown) => field(error, 'message').includes('KUFUR_ENGELI');

/** Yetki (RLS) reddi — örn. cezalı kullanıcı yorum yazmaya çalıştı */
export const isPermissionError = (error: unknown) => field(error, 'code') === '42501';

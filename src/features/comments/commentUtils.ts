export const COMMENT_MAX = 1000;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "5 dakika önce", "dün", "3 hafta önce" */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < MINUTE) return 'az önce';
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} dakika önce`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} saat önce`;
  const days = Math.floor(seconds / DAY);
  if (days === 1) return 'dün';
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  if (days < 365) return `${Math.floor(days / 30)} ay önce`;
  return `${Math.floor(days / 365)} yıl önce`;
}

export function validateComment(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return 'Bir şeyler yaz.';
  if (trimmed.length > COMMENT_MAX) return `Yorum en fazla ${COMMENT_MAX} karakter olabilir.`;
  return null;
}

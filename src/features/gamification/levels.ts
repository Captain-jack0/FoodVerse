const LEVEL_TITLES = ['Mutfak Çırağı', 'Usta Çırak', 'Kalfa Aşçı', 'Usta Şef', 'Baş Şef'];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(Math.max(level, 1), LEVEL_TITLES.length) - 1];
}

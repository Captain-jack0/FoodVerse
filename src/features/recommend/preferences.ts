export const PREFERENCES = [
  { id: 'vejetaryen', label: 'Vejetaryen 🥑' },
  { id: 'pratik', label: 'Pratik & Hızlı ⚡' },
  { id: 'tatli', label: 'Tatlı Tutkunu 🍓' },
  { id: 'glutensiz', label: 'Glutensiz 🌾' },
] as const;

export type PreferenceId = (typeof PREFERENCES)[number]['id'];

const IDS = new Set<string>(PREFERENCES.map((p) => p.id));

/** profile_settings.preferences.tags → güvenli tercih listesi */
export function readPreferenceTags(preferences: unknown): PreferenceId[] {
  const tags = (preferences as { tags?: unknown } | null)?.tags;
  return Array.isArray(tags) ? tags.filter((t): t is PreferenceId => typeof t === 'string' && IDS.has(t)) : [];
}

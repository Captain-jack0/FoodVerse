import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/ui/Chip';
import { FormError } from '@/components/ui/FormError';
import { SPACING } from '@/theme/tokens';

import { PREFERENCES, readPreferenceTags, type PreferenceId } from '../preferences';
import { fetchPreferences, savePreferenceTags } from '../recommendApi';

/** Profilde tercih düzenleme; öneriler buna göre sıralanır */
export function PreferencesEditor({ userId }: { userId: string }) {
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [tags, setTags] = useState<PreferenceId[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPreferences(userId).then(
      (p) => {
        if (cancelled) return;
        setRaw(p);
        setTags(readPreferenceTags(p));
      },
      (e: unknown) => {
        console.warn('Tercihler okunamadı', e);
        if (!cancelled) setError('Tercihlerin yüklenemedi.');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = async (id: PreferenceId) => {
    if (!raw) return;
    const previous = tags;
    const next = tags.includes(id) ? tags.filter((t) => t !== id) : [...tags, id];
    setTags(next);
    setError(null);
    try {
      await savePreferenceTags(userId, raw, next);
      setRaw({ ...raw, tags: next });
    } catch (e) {
      console.warn('Tercih kaydedilemedi', e);
      setTags(previous);
      setError('Tercihin kaydedilemedi, tekrar dene.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="headlineMd">🍽️ Mutfak Tercihlerim</AppText>
      <AppText variant="bodySm" color="textMuted">
        Önerileri buna göre sıralarız: vejetaryende etli, glutensizde unlu tarifler geriye düşer; pratikte kısa tarifler
        öne çıkar.
      </AppText>
      <View style={styles.chips}>
        {PREFERENCES.map((p) => (
          <Chip key={p.id} label={p.label} selected={tags.includes(p.id)} onPress={() => toggle(p.id)} />
        ))}
      </View>
      {error && <FormError text={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
});

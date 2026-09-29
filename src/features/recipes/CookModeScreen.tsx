import { MaterialIcons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { logCook } from './recipesApi';
import { useRecipe } from './useRecipe';

const SPEECH_OPTIONS: Speech.SpeechOptions = { language: 'tr-TR', rate: 0.95 };

export function CookModeScreen() {
  // Mutfakta eller doluyken ekran kararmasın
  useKeepAwake();
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, status, reload } = useRecipe(id);
  const [index, setIndex] = useState(0);
  const [autoRead, setAutoRead] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = detail?.recipe.steps ?? [];
  const step = steps[index];

  useEffect(() => {
    if (autoRead && step) Speech.speak(`Adım ${index + 1}. ${step}`, SPEECH_OPTIONS);
    return () => {
      Speech.stop();
    };
  }, [autoRead, index, step]);

  if (status !== 'ready' || !detail) {
    return (
      <>
        <StackHeader title="Pişirme Modu" />
        <Screen>
          {status === 'missing' ? (
            <HintCard emoji="🕵️" title="Tarif bulunamadı" text="Bu tarif silinmiş olabilir." />
          ) : (
            <LoadState status={status === 'error' ? 'error' : 'loading'} onRetry={reload} />
          )}
        </Screen>
      </>
    );
  }

  const { recipe } = detail;
  const isLast = index === steps.length - 1;
  const progress = steps.length === 0 ? 0 : ((index + 1) / steps.length) * 100;

  const speak = () => {
    Speech.stop();
    if (step) Speech.speak(`Adım ${index + 1}. ${step}`, SPEECH_OPTIONS);
  };

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      await logCook(recipe.id);
      Speech.stop();
      setFinished(true);
    } catch (e) {
      console.warn('Pişirme kaydedilemedi', e);
      setError('Kaydedilemedi, internet bağlantını kontrol edip tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  if (finished) {
    return (
      <>
        <StackHeader title="Afiyet olsun!" />
        <Screen>
          <View style={[styles.done, { backgroundColor: c.secondaryContainer }]}>
            <AppText style={styles.doneEmoji}>🎉{recipe.emoji}</AppText>
            <AppText variant="headlineLg" color="onSecondaryContainer" style={styles.center}>
              Afiyet olsun, Şef!
            </AppText>
            <AppText variant="bodyMd" color="onSecondaryContainer" style={styles.center}>
              {recipe.title} {recipe.cookedCount + 1}. kez pişirildi. Mutfak serin büyüyor! 🔥
            </AppText>
          </View>
          <GameButton label="Tarife Dön" icon="arrow-back" onPress={() => router.back()} />
        </Screen>
      </>
    );
  }

  if (steps.length === 0) {
    return (
      <>
        <StackHeader title="Pişirme Modu" />
        <Screen>
          <HintCard emoji="📝" title="Bu tarifte adım yok" text="Pişirme modu için tarife adım eklemelisin." />
        </Screen>
      </>
    );
  }

  return (
    <>
      <StackHeader title={recipe.title} />
      <Screen>
        <View style={styles.progressRow}>
          <AppText variant="labelLg" color="primary">
            ADIM {index + 1} / {steps.length}
          </AppText>
          <View style={styles.autoRead}>
            <AppText variant="labelMd" color="textMuted">
              🔊 Otomatik oku
            </AppText>
            <Switch
              value={autoRead}
              onValueChange={setAutoRead}
              accessibilityLabel="Adımları otomatik sesli oku"
              trackColor={{ true: c.primaryContainer, false: c.surfaceHigh }}
              thumbColor={autoRead ? c.primary : c.card}
            />
          </View>
        </View>
        <View
          style={[styles.track, { backgroundColor: c.surfaceHigh }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}>
          <View style={[styles.fill, { backgroundColor: c.primary, width: `${progress}%` }]} />
        </View>

        <View style={[styles.stepCard, { backgroundColor: c.card }]}>
          <AppText variant="headlineLg" accessibilityLiveRegion="polite">
            {step}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bu adımı sesli oku"
            onPress={speak}
            style={[styles.speakButton, { backgroundColor: c.surfaceLow }]}>
            <MaterialIcons name="volume-up" size={22} color={c.primary} />
            <AppText variant="labelLg" color="primary">
              Sesli oku
            </AppText>
          </Pressable>
        </View>

        <View style={styles.nav}>
          <GameButton
            label="Geri"
            icon="arrow-back"
            variant="soft"
            disabled={index === 0}
            onPress={() => setIndex((i) => i - 1)}
            style={styles.flex}
          />
          {isLast ? (
            <GameButton
              label={saving ? 'Kaydediliyor...' : 'Pişirdim! 🎉'}
              variant="sunny"
              disabled={saving}
              onPress={finish}
              style={styles.flex}
            />
          ) : (
            <GameButton label="İleri" icon="arrow-forward" onPress={() => setIndex((i) => i + 1)} style={styles.flex} />
          )}
        </View>
        {error && <FormError text={error} />}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showIngredients }}
          onPress={() => setShowIngredients((v) => !v)}
          style={[styles.ingredientsToggle, { backgroundColor: c.surfaceLow }]}>
          <AppText variant="labelLg">🧺 Malzemeler ({recipe.ingredients.length})</AppText>
          <MaterialIcons name={showIngredients ? 'expand-less' : 'expand-more'} size={24} color={c.text} />
        </Pressable>
        {showIngredients &&
          recipe.ingredients.map((ing, i) => (
            <View key={`${ing.name}-${i}`} style={styles.ingredient}>
              <AppText variant="bodyMd" style={styles.flex}>
                • {ing.name}
              </AppText>
              <AppText variant="bodySm" color="textMuted">
                {ing.amount}
              </AppText>
            </View>
          ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm },
  autoRead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  track: { height: 10, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: RADIUS.full },
  stepCard: {
    minHeight: 220,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.lg,
    justifyContent: 'space-between',
    boxShadow: '0 8px 24px rgba(48, 60, 108, 0.08)',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  nav: { flexDirection: 'row', gap: SPACING.sm },
  ingredientsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  ingredient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md },
  done: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm },
  doneEmoji: { fontSize: 64, lineHeight: 78 },
});

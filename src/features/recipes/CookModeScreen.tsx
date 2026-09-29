import { MaterialIcons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Vibration, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { parseCommand, stepDurationMinutes } from '@/features/assistant/commands';
import { AssistantBar } from '@/features/assistant/components/AssistantBar';
import { TimerCard } from '@/features/assistant/components/TimerCard';
import { useCountdown } from '@/features/assistant/useCountdown';
import { useSpeaker } from '@/features/assistant/useSpeaker';
import { useSpeechRecognition } from '@/features/assistant/useSpeechRecognition';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { logCook } from './recipesApi';
import { useRecipe } from './useRecipe';

export function CookModeScreen() {
  // Mutfakta eller doluyken ekran kararmasın
  useKeepAwake();
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, status, reload } = useRecipe(id);
  const [index, setIndex] = useState(0);
  const [autoRead, setAutoRead] = useState(true);
  const [muted, setMuted] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const speaker = useSpeaker();
  const timer = useCountdown(() => {
    Vibration.vibrate([0, 500, 300, 500]);
    setFeedback('⏰ Zamanlayıcı bitti!');
    speaker.say('Zamanlayıcı bitti!');
  });

  const recipe = detail?.recipe;
  const steps = recipe?.steps ?? [];
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const stepText = (i: number) => `Adım ${i + 1}. ${steps[i]}`;

  const goTo = (next: number) => {
    if (next < 0 || next >= steps.length) return;
    setIndex(next);
    if (autoRead) speaker.say(stepText(next));
  };

  const finish = async () => {
    if (!recipe) return;
    setSaving(true);
    setError(null);
    try {
      await logCook(recipe.id);
      speaker.stop();
      timer.cancel();
      setFinished(true);
    } catch (e) {
      console.warn('Pişirme kaydedilemedi', e);
      setError('Kaydedilemedi, internet bağlantını kontrol edip tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  const reply = (text: string) => {
    setFeedback(text);
    speaker.say(text);
  };

  const handleText = (text: string) => {
    setLastHeard(text);
    const command = parseCommand(text);
    if (!command) {
      setFeedback('Bunu anlayamadım. "Sonraki", "tekrar", "malzemeler" ya da "10 dakika zamanlayıcı" diyebilirsin.');
      return;
    }
    switch (command.type) {
      case 'next':
        if (isLast) reply('Bu son adım. Bitirdiysen "pişirdim" de.');
        else {
          setFeedback('Sonraki adım');
          goTo(index + 1);
        }
        break;
      case 'prev':
        if (index === 0) reply('Zaten ilk adımdayız.');
        else {
          setFeedback('Önceki adım');
          goTo(index - 1);
        }
        break;
      case 'repeat':
        setFeedback('Tekrar okuyorum');
        speaker.say(stepText(index));
        break;
      case 'ingredients':
        reply(`Malzemeler: ${(recipe?.ingredients ?? []).map((i) => `${i.amount} ${i.name}`.trim()).join(', ')}`);
        break;
      case 'timer': {
        const minutes = command.minutes ?? (step ? stepDurationMinutes(step) : null);
        if (!minutes) reply('Kaç dakika? Örneğin "on dakika zamanlayıcı kur" de.');
        else {
          timer.start(minutes);
          reply(`${minutes} dakikalık zamanlayıcı başladı.`);
        }
        break;
      }
      case 'cancelTimer':
        timer.cancel();
        reply('Zamanlayıcıyı iptal ettim.');
        break;
      case 'timeLeft': {
        if (!timer.running) reply('Çalışan bir zamanlayıcı yok.');
        else {
          const m = Math.floor(timer.remainingSeconds / 60);
          const s = timer.remainingSeconds % 60;
          reply(m > 0 ? `${m} dakika ${s} saniye kaldı.` : `${s} saniye kaldı.`);
        }
        break;
      }
      case 'stopSpeaking':
        speaker.stop();
        setFeedback('Sustum 🤫');
        break;
      case 'finish':
        if (isLast) finish();
        else reply('Daha adımlar var. Son adıma gelince "pişirdim" de.');
        break;
    }
  };

  // "Hep dinlesin": pişirme ekranında sürekli dinler; asistan konuşurken kendi sesini duymasın diye durur
  const listen = useSpeechRecognition({
    enabled: !muted && !finished && steps.length > 0,
    paused: speaker.speaking,
    onFinalText: handleText,
  });

  if (status !== 'ready' || !detail || !recipe) {
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

  const progress = ((index + 1) / steps.length) * 100;

  return (
    <>
      <StackHeader title={recipe.title} />
      <Screen>
        <AssistantBar
          listen={listen}
          muted={muted}
          speaking={speaker.speaking}
          lastHeard={lastHeard}
          feedback={feedback}
          onToggleMute={() => setMuted((m) => !m)}
          onText={handleText}
        />

        <View style={styles.progressRow}>
          <AppText variant="labelLg" color="primary">
            ADIM {index + 1} / {steps.length}
          </AppText>
          <View style={styles.autoRead}>
            <AppText variant="labelMd" color="textMuted">
              🔊 Adımları sesli oku
            </AppText>
            <Switch
              value={autoRead}
              onValueChange={setAutoRead}
              accessibilityLabel="Adımları sesli oku"
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
            onPress={() => speaker.say(stepText(index))}
            style={[styles.speakButton, { backgroundColor: c.surfaceLow }]}>
            <MaterialIcons name="volume-up" size={22} color={c.primary} />
            <AppText variant="labelLg" color="primary">
              Sesli oku
            </AppText>
          </Pressable>
        </View>

        <TimerCard
          running={timer.running}
          remainingSeconds={timer.remainingSeconds}
          suggestedMinutes={step ? stepDurationMinutes(step) : null}
          onStart={timer.start}
          onCancel={timer.cancel}
        />

        <View style={styles.nav}>
          <GameButton
            label="Geri"
            icon="arrow-back"
            variant="soft"
            disabled={index === 0}
            onPress={() => goTo(index - 1)}
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
            <GameButton label="İleri" icon="arrow-forward" onPress={() => goTo(index + 1)} style={styles.flex} />
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

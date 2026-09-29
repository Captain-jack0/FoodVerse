import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { useWelcomeTour } from './useWelcomeTour';

type Step = { emoji: string; title: string; text: string; soon?: boolean };

const STEPS: Step[] = [
  {
    emoji: '👋🍳',
    title: 'Mutfağına Hoş Geldin!',
    text: 'Kukki Kitchen senin sanal mutfağın. Pişirdikçe XP kazanır, seviye atlar, mutfak serini büyütürsün. Hadi kısaca etrafı gezelim!',
  },
  {
    emoji: '🧺',
    title: 'Sanal Kiler',
    text: 'Dolabındaki malzemeleri ekle; son kullanma tarihi yaklaşanları sana hatırlatalım. Bozulmak üzere olanları kurtarmak günlük görevin olacak.',
  },
  {
    emoji: '📖',
    title: 'Tarif Defteri',
    text: 'Kendi tariflerini yaz ya da Instagram/TikTok linkini yapıştır. Defterindeki tarifler, kilerindekilere göre sana önerilir.',
  },
  {
    emoji: '🪄',
    title: 'Sihirli Tencere',
    text: 'Kilerde malzemelere dokun, tencereye at; elindekilerle en uyumlu tarifleri eşleşme yüzdesiyle sıralayalım.',
  },
  {
    emoji: '🎙️📅',
    title: 'Asistan, Planlayıcı ve Keşfet',
    text: 'Elin hamurluyken sesli adım adım tarif, haftalık menü ve eksiklerden alışveriş listesi, topluluğun tarifleri… Çok yakında!',
    soon: true,
  },
  {
    emoji: '🏆',
    title: 'İlk Görevin Hazır',
    text: 'Kilerine 3 malzeme ekleyerek başla. Sağ üstteki profil butonundan temanı da değiştirebilirsin. Afiyet olsun, Şef!',
  },
];

export function WelcomeTour() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { profile } = useAuth();
  const { visible, finish } = useWelcomeTour();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const title = index === 0 && profile ? `Hoş Geldin, ${profile.display_name}!` : step.title;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: c.card }]} accessibilityViewIsModal>
          <View style={styles.topRow}>
            <AppText variant="labelMd" color="primary">
              MUTFAK TURU · {index + 1}/{STEPS.length}
            </AppText>
            {!isLast && (
              <Pressable accessibilityRole="button" onPress={finish} hitSlop={8}>
                <AppText variant="labelLg" color="textMuted">
                  Atla
                </AppText>
              </Pressable>
            )}
          </View>

          <View style={[styles.illustration, { backgroundColor: c.surfaceLow }]}>
            <AppText style={styles.emoji}>{step.emoji}</AppText>
            {step.soon && (
              <View style={[styles.soon, { backgroundColor: c.secondaryContainer }]}>
                <AppText variant="labelSm" color="onSecondaryContainer">
                  Yakında
                </AppText>
              </View>
            )}
          </View>

          <AppText variant="headlineLgMobile" style={styles.center} accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="bodyMd" color="textMuted" style={styles.center}>
            {step.text}
          </AppText>

          <View style={styles.dots} accessibilityElementsHidden>
            {STEPS.map((s, i) => (
              <View
                key={s.title}
                style={[styles.dot, { backgroundColor: i === index ? c.primary : c.surfaceHigh }, i === index && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            {index > 0 && (
              <GameButton label="Geri" variant="soft" onPress={() => setIndex((i) => i - 1)} style={styles.flex} />
            )}
            <GameButton
              label={isLast ? 'Hadi Başlayalım! 🚀' : 'İleri'}
              icon={isLast ? undefined : 'arrow-forward'}
              variant={isLast ? 'accent' : 'primary'}
              onPress={isLast ? finish : () => setIndex((i) => i + 1)}
              style={styles.flex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 23, 71, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  illustration: { height: 140, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, lineHeight: 78 },
  soon: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  center: { textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  flex: { flex: 1 },
});

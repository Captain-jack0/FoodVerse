import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

type HintCardProps = {
  emoji: string;
  title: string;
  text: string;
  /** Kartın altındaki buton vb. */
  children?: ReactNode;
};

/** Boş durumlarda kullanıcıya ne yapacağını anlatan yönlendirici kart */
export function HintCard({ emoji, title, text, children }: HintCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  return (
    <View style={[styles.card, { backgroundColor: c.surfaceLow, borderColor: c.outline }]}>
      <AppText style={styles.emoji}>{emoji}</AppText>
      <AppText variant="headlineMd" style={styles.center}>
        {title}
      </AppText>
      <AppText variant="bodySm" color="textMuted" style={styles.center}>
        {text}
      </AppText>
      {children}
    </View>
  );
}

/** Yükleniyor / hata durumu */
export function LoadState({ status, onRetry }: { status: 'loading' | 'error'; onRetry: () => void }) {
  return status === 'loading' ? (
    <HintCard emoji="🍳" title="Mutfak ısınıyor..." text="Verilerin getiriliyor." />
  ) : (
    <HintCard emoji="🔌" title="Bağlantı kurulamadı" text="İnternet bağlantını kontrol edip tekrar dene.">
      <AppText variant="labelLg" color="primary" onPress={onRetry} accessibilityRole="button">
        Tekrar dene
      </AppText>
    </HintCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emoji: { fontSize: 40, lineHeight: 50 },
  center: { textAlign: 'center' },
});

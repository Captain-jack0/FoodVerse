import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/components/navigation/Brand';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

type AuthShellProps = {
  /** Geniş ekranda soldaki karşılama paneli */
  hero: ReactNode;
  children: ReactNode;
};

/** Giriş/Kayıt ortak iskeleti: web'de iki panel, mobilde logo + form kartı */
export function AuthShell({ hero, children }: AuthShellProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.page,
        { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.lg },
      ]}>
      {isWide ? (
        <View style={styles.row}>
          <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>{hero}</View>
          <View style={[styles.card, styles.flex, { backgroundColor: c.card }]}>{children}</View>
        </View>
      ) : (
        <View style={styles.stack}>
          <Brand compact={false} />
          <View style={[styles.card, { backgroundColor: c.card }]}>{children}</View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.lg, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  stack: { gap: SPACING.lg, width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center' },
  flex: { flex: 1 },
  hero: { flex: 1, borderRadius: RADIUS.xxl, padding: SPACING.xl, gap: SPACING.lg, justifyContent: 'center' },
  card: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    boxShadow: '0 8px 32px rgba(48, 60, 108, 0.08)',
  },
});

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { MAX_CONTENT_WIDTH, SPACING } from '@/theme/tokens';

/** Her sayfanın kaydırılabilir gövdesi: tema arka planı + web'de ortalanmış maksimum genişlik */
export function Screen({ children }: { children: ReactNode }) {
  const { theme } = useKukkiTheme();
  const isWide = useIsWide();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: isWide ? SPACING.xl : SPACING.md, paddingVertical: isWide ? SPACING.xl : SPACING.md },
      ]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: SPACING.md },
});

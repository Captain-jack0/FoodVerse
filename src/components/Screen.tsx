import type { ReactNode, Ref } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { MAX_CONTENT_WIDTH, SPACING } from '@/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  ref?: Ref<ScrollView>;
};

/** Her sayfanın kaydırılabilir gövdesi: tema arka planı + web'de ortalanmış maksimum genişlik */
export function Screen({ children, ref }: ScreenProps) {
  const { theme } = useKukkiTheme();
  const isWide = useIsWide();

  return (
    <ScrollView
      ref={ref}
      style={{ backgroundColor: theme.colors.background }}
      keyboardShouldPersistTaps="handled"
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

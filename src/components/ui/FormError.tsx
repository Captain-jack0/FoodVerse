import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

export function FormError({ text }: { text: string }) {
  const { theme } = useKukkiTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.colors.surfaceLow, borderColor: theme.colors.error }]}>
      <AppText variant="bodySm" color="error" accessibilityLiveRegion="assertive">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm },
});

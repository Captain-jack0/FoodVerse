import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Filtre çipi */
export function Chip({ label, selected, onPress }: ChipProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.primary : c.card,
          boxShadow: selected ? `0 2px 0 ${c.pressShadow}` : '0 1px 3px rgba(0, 0, 0, 0.06)',
          transform: [{ translateY: pressed ? 1 : 0 }],
        },
      ]}>
      <AppText variant="labelLg" style={{ color: selected ? c.onPrimary : c.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
});

import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, type ThemeColors } from '@/theme/tokens';

type Variant = 'primary' | 'accent' | 'sunny' | 'soft';

type GameButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_COLORS: Record<Variant, { bg: keyof ThemeColors; fg: keyof ThemeColors }> = {
  primary: { bg: 'primary', fg: 'onPrimary' },
  accent: { bg: 'primaryContainer', fg: 'onPrimary' },
  sunny: { bg: 'secondaryContainer', fg: 'onSecondaryContainer' },
  soft: { bg: 'surfaceHigh', fg: 'text' },
};

const PRESS_DEPTH = 4;

/** Tasarımdaki "basılınca aşağı inen" oyunsu buton */
export function GameButton({ label, onPress, variant = 'primary', icon, disabled, style }: GameButtonProps) {
  const { theme } = useKukkiTheme();
  const { bg, fg } = VARIANT_COLORS[variant];
  const fgColor = theme.colors[fg];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: theme.colors[bg],
          opacity: disabled ? 0.5 : 1,
          boxShadow: `0 ${pressed ? 1 : PRESS_DEPTH}px 0 ${theme.colors.pressShadow}`,
          transform: [{ translateY: pressed ? PRESS_DEPTH - 1 : 0 }],
        },
        style,
      ]}>
      {icon && <MaterialIcons name={icon} size={20} color={fgColor} />}
      <AppText variant="labelLg" style={{ color: fgColor }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 48,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
});

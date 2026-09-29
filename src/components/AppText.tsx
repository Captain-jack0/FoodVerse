import { Text, type TextProps } from 'react-native';

import { useKukkiTheme } from '@/theme/ThemeProvider';
import { TYPOGRAPHY, type ThemeColors, type TypographyVariant } from '@/theme/tokens';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: keyof ThemeColors;
};

export function AppText({ variant = 'bodyMd', color = 'text', style, ...rest }: AppTextProps) {
  const { theme } = useKukkiTheme();
  return <Text {...rest} style={[TYPOGRAPHY[variant], { color: theme.colors[color] }, style]} />;
}

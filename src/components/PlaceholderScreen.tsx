import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

// ponytail: gerçek ekranlar yazılana kadar geçici sayfa
export function PlaceholderScreen({ eyebrow, title, description, icon }: Props) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
        <View style={[styles.iconCircle, { backgroundColor: c.primaryContainer }]}>
          <MaterialIcons name={icon} size={32} color={c.onPrimary} />
        </View>
        <AppText variant="labelMd" color="primary">
          {eyebrow.toLocaleUpperCase('tr-TR')}
        </AppText>
        <AppText variant="headlineLg">{title}</AppText>
        <AppText variant="bodyMd" color="textMuted">
          {description}
        </AppText>
        <View style={[styles.badge, { backgroundColor: c.secondaryContainer }]}>
          <AppText variant="labelMd" color="onSecondaryContainer">
            Yakında burada 🍳
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, type ThemeColors } from '@/theme/tokens';

type FeatureRowProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  iconBg: keyof ThemeColors;
  title: string;
  text: string;
};

/** Karşılama panelindeki özellik kartı */
export function FeatureRow({ icon, iconBg, title, text }: FeatureRowProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  return (
    <View style={[styles.row, { backgroundColor: c.card }]}>
      <View style={[styles.icon, { backgroundColor: c[iconBg] }]}>
        <MaterialIcons name={icon} size={18} color={c.text} />
      </View>
      <View style={styles.texts}>
        <AppText variant="labelLg">{title}</AppText>
        <AppText variant="bodySm" color="textMuted">
          {text}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});

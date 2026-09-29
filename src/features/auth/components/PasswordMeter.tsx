import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { passwordStrength } from '../authValidation';

const LABELS = ['Kolay', 'Lezzetli', 'Kırılmaz'];

export function PasswordMeter({ password }: { password: string }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const score = passwordStrength(password);

  return (
    <View
      style={styles.wrapper}
      accessibilityLabel={`Şifre gücü: ${score === 0 ? 'Zayıf' : LABELS[score - 1]}`}>
      <View style={styles.bars}>
        {LABELS.map((label, i) => (
          <View
            key={label}
            style={[styles.bar, { backgroundColor: i < score ? c.secondaryContainer : c.surfaceHigh }]}
          />
        ))}
      </View>
      <View style={styles.bars}>
        {LABELS.map((label, i) => (
          <AppText
            key={label}
            variant="labelSm"
            color={i < score ? 'onSecondaryContainer' : 'textMuted'}
            style={[styles.label, i === 1 && styles.center, i === 2 && styles.right]}>
            {label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  bars: { flexDirection: 'row', gap: SPACING.sm },
  bar: { flex: 1, height: 6, borderRadius: RADIUS.full },
  label: { flex: 1 },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
});

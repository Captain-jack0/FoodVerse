import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { formatClock } from '../useCountdown';

type TimerCardProps = {
  running: boolean;
  remainingSeconds: number;
  /** Adımda geçen süre; varsa başlatma önerisi gösterilir */
  suggestedMinutes: number | null;
  onStart: (minutes: number) => void;
  onCancel: () => void;
};

export function TimerCard({ running, remainingSeconds, suggestedMinutes, onStart, onCancel }: TimerCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  if (running) {
    return (
      <View style={[styles.card, { backgroundColor: c.secondaryContainer }]}>
        <MaterialIcons name="timer" size={28} color={c.onSecondaryContainer} />
        <View style={styles.flex}>
          <AppText variant="labelSm" color="onSecondaryContainer">
            ZAMANLAYICI
          </AppText>
          <AppText variant="headlineLg" color="onSecondaryContainer" accessibilityLabel={`${formatClock(remainingSeconds)} kaldı`}>
            {formatClock(remainingSeconds)}
          </AppText>
        </View>
        <GameButton label="İptal" icon="close" variant="soft" onPress={onCancel} />
      </View>
    );
  }

  if (suggestedMinutes === null) return null;

  return (
    <GameButton
      label={`⏱ ${suggestedMinutes} dk zamanlayıcı başlat`}
      variant="sunny"
      onPress={() => onStart(suggestedMinutes)}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl },
  flex: { flex: 1 },
});

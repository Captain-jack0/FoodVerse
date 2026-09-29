import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

export type Quest = {
  label: string;
  title: string;
  description: string;
  doneTitle: string;
  doneDescription: string;
  current: number;
  target: number;
  unit: string;
  xp: number;
};

export function DailyQuestCard({ quest }: { quest: Quest }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { current, target } = quest;
  const done = target > 0 && current >= target;
  const progress = target === 0 ? 1 : Math.min(current / target, 1);
  const percent = Math.round(progress * 100);

  return (
    <View style={[styles.card, { backgroundColor: c.secondaryContainer }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: c.card }]}>
          <MaterialIcons name="bolt" size={14} color={c.onSecondaryContainer} />
          <AppText variant="labelSm" color="onSecondaryContainer">
            {quest.label}
          </AppText>
        </View>
        <Tag label={`+${quest.xp} XP`} bg="card" fg="primary" />
      </View>

      <View style={styles.titleRow}>
        <MaterialIcons name={done ? 'emoji-events' : 'flag'} size={30} color={c.onSecondaryContainer} />
        <AppText variant="headlineMd" color="onSecondaryContainer" style={styles.flex}>
          {done ? quest.doneTitle : quest.title}
        </AppText>
      </View>
      <AppText variant="bodySm" color="onSecondaryContainer">
        {done ? quest.doneDescription : quest.description}
      </AppText>

      <View style={styles.progressLabel}>
        <AppText variant="labelMd" color="onSecondaryContainer">
          İlerleme ({Math.min(current, target)}/{target} {quest.unit})
        </AppText>
        <AppText variant="labelMd" color="onSecondaryContainer">
          %{percent}
        </AppText>
      </View>
      <View
        style={[styles.track, { backgroundColor: c.card }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}>
        <View style={[styles.fill, { backgroundColor: c.primary, width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  flex: { flex: 1 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  track: { height: 10, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: RADIUS.full },
});

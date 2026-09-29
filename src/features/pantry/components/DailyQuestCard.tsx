import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

type DailyQuestCardProps = {
  /** Kurtarılması gereken (son 2 günü kalan) malzeme sayısı */
  target: number;
  /** Bunlardan tencereye atılan */
  rescued: number;
  xp: number;
};

export function DailyQuestCard({ target, rescued, xp }: DailyQuestCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const done = target > 0 && rescued >= target;
  const progress = target === 0 ? 1 : Math.min(rescued / target, 1);

  return (
    <View style={[styles.card, { backgroundColor: c.secondaryContainer }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: c.card }]}>
          <MaterialIcons name="bolt" size={14} color={c.onSecondaryContainer} />
          <AppText variant="labelSm" color="onSecondaryContainer">
            Günlük Mutfak Görevi
          </AppText>
        </View>
        <Tag label={`+${xp} XP`} bg="card" fg="primary" />
      </View>

      <View style={styles.titleRow}>
        <MaterialIcons name={done ? 'emoji-events' : 'timer'} size={30} color={c.onSecondaryContainer} />
        <AppText variant="headlineMd" color="onSecondaryContainer" style={styles.flex}>
          {done ? 'Görev Tamam! 🎉' : 'Kurtarma Operasyonu!'}
        </AppText>
      </View>
      <AppText variant="bodySm" color="onSecondaryContainer">
        {target === 0
          ? 'Bugün bozulmak üzere olan malzeme yok, harika gidiyorsun!'
          : done
            ? `${target} malzemeyi israftan kurtardın. Şimdi pişirme zamanı!`
            : `Son kullanma tarihi yaklaşan ${target} malzemeyi tencereye at, israfı önle.`}
      </AppText>

      <View style={styles.progressLabel}>
        <AppText variant="labelMd" color="onSecondaryContainer">
          İlerleme ({Math.min(rescued, target)}/{target} Malzeme)
        </AppText>
        <AppText variant="labelMd" color="onSecondaryContainer">
          %{Math.round(progress * 100)}
        </AppText>
      </View>
      <View
        style={[styles.track, { backgroundColor: c.card }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
        <View style={[styles.fill, { backgroundColor: c.primary, width: `${progress * 100}%` }]} />
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

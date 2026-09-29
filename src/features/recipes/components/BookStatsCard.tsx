import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { BookStats } from '../recipeUtils';

type BookStatsCardProps = {
  stats: BookStats;
  mostCookedTitle: string | null;
  isWide: boolean;
};

export function BookStatsCard({ stats, mostCookedTitle, isWide }: BookStatsCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <View style={[styles.card, { backgroundColor: c.card }, isWide && styles.row]}>
      <View style={[styles.icon, { backgroundColor: c.primaryContainer }]}>
        <MaterialIcons name="menu-book" size={32} color={c.onPrimary} />
      </View>
      <View style={styles.texts}>
        <AppText variant="headlineMd">Defter İstatistiği</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Defterinde <AppText variant="labelLg">{stats.total} tarif</AppText> var, bunların {stats.imported} tanesi
          sosyal medyadan. Toplam <AppText variant="labelLg">{stats.totalCooked} kez</AppText> pişirdin!
        </AppText>
        {mostCookedTitle && (
          <View style={styles.inline}>
            <AppText variant="bodySm" color="textMuted">
              En çok pişirilen:
            </AppText>
            <Tag label={mostCookedTitle} bg="secondaryContainer" fg="onSecondaryContainer" />
          </View>
        )}
      </View>
      <View style={[styles.fav, { backgroundColor: c.surfaceLow }]}>
        <MaterialIcons name="favorite" size={18} color={c.primary} />
        <AppText variant="labelMd">{stats.favorites} Favori</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.06)' },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  fav: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
});

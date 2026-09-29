import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { NewPantryItem } from '../pantryApi';
import { AddPantryItemForm } from './AddPantryItemForm';

type PantryHeroProps = {
  itemCount: number;
  freshness: number;
  isWide: boolean;
  onAdd: (item: NewPantryItem) => Promise<boolean>;
};

function freshnessWord(score: number) {
  if (score >= 90) return 'Mükemmel';
  if (score >= 70) return 'İyi';
  return 'Dikkat';
}

export function PantryHero({ itemCount, freshness, isWide, onAdd }: PantryHeroProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
      <View style={[styles.top, !isWide && styles.topStacked]}>
        <View style={styles.titles}>
          <View style={styles.eyebrow}>
            <View style={[styles.dot, { backgroundColor: c.primary }]} />
            <AppText variant="labelMd" color="primary">
              KİLER ÖZETİ & STOK DURUMU
            </AppText>
          </View>
          <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Mutfakta Ne Var Ne Yok?</AppText>
          <AppText variant="bodyMd" color="textMuted">
            {itemCount === 0
              ? 'Dolabındakileri buraya ekle, bozulmadan önce seni uyaralım!'
              : `Dolabındaki ${itemCount} malzemeyi canlı takip et, israfı önle!`}
          </AppText>
        </View>

        {itemCount > 0 && (
          <View style={[styles.scorePill, { backgroundColor: c.card }]}>
            <MaterialIcons name="eco" size={22} color={c.onSecondaryContainer} />
            <View>
              <AppText variant="labelSm" color="textMuted">
                Tazelik Skoru
              </AppText>
              <AppText variant="headlineMd">
                %{freshness} {freshnessWord(freshness)}
              </AppText>
            </View>
          </View>
        )}
      </View>

      <AddPantryItemForm isWide={isWide} onAdd={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.lg, overflow: 'hidden' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.md },
  topStacked: { flexDirection: 'column' },
  titles: { flex: 1, gap: SPACING.xs },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
});

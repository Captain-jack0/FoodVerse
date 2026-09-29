import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { PantryItem } from '../types';

type MagicPotCardProps = {
  selected: PantryItem[];
  onCook: () => void;
};

export function MagicPotCard({ selected, onCook }: MagicPotCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={styles.header}>
        <MaterialIcons name="auto-awesome" size={24} color={c.primary} />
        <AppText variant="headlineMd" style={styles.flex}>
          Sihirli Tencere
        </AppText>
        <Tag label="Yapay Zeka" bg="primaryContainer" fg="onPrimaryContainer" />
      </View>
      <AppText variant="bodySm" color="textMuted">
        Kilerden malzeme seç; onlara en uygun tarifleri sıralayalım!
      </AppText>

      <View style={[styles.pot, { backgroundColor: c.surfaceLow }]}>
        <View style={styles.potHeader}>
          <AppText variant="labelMd" color="textMuted">
            Tenceredeki Malzemeler:
          </AppText>
          <AppText variant="labelMd" color="primary">
            {selected.length} Seçili
          </AppText>
        </View>
        {selected.length === 0 ? (
          <AppText variant="bodySm" color="textMuted">
            Henüz boş. Kiler rafından malzemelere dokun 👆
          </AppText>
        ) : (
          <View style={styles.chips}>
            {selected.map((item) => (
              <View key={item.id} style={[styles.chip, { backgroundColor: c.card }]}>
                <AppText variant="labelSm">
                  {item.emoji} {item.name}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </View>

      <GameButton label="Bugün Ne Pişirsem?" icon="soup-kitchen" onPress={onCook} disabled={selected.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.08)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  flex: { flex: 1 },
  pot: { borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  potHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
});

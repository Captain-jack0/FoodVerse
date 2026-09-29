import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, type ThemeColors } from '@/theme/tokens';

import { CATEGORIES } from '../categories';
import { daysLeft, expiryLabel, expiryStatus } from '../pantryUtils';
import type { ExpiryStatus, PantryItem } from '../types';

type PantryItemCardProps = {
  item: PantryItem;
  selected: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

const STATUS_COLOR: Record<ExpiryStatus, keyof ThemeColors> = {
  danger: 'error',
  warning: 'onSecondaryContainer',
  ok: 'tertiary',
  longLasting: 'onSecondaryContainer',
};

export function PantryItemCard({ item, selected, onToggle, onRemove }: PantryItemCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const days = daysLeft(item.expiresOn);
  const statusColor = c[STATUS_COLOR[expiryStatus(days)]];

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${item.name}, ${item.quantity}, ${expiryLabel(days)}`}
      onPress={() => onToggle(item.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: selected ? c.primary : 'transparent',
          boxShadow: selected ? `0 4px 0 ${c.pressShadow}` : '0 4px 0 rgba(48, 60, 108, 0.08)',
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}>
      <View style={styles.top}>
        <View style={[styles.emojiCircle, { backgroundColor: c.surfaceHigh }]}>
          <AppText style={styles.emoji}>{item.emoji}</AppText>
        </View>
        <View
          style={[
            styles.check,
            selected ? { backgroundColor: c.primary } : { borderColor: c.outline, borderWidth: 2 },
          ]}>
          {selected && <MaterialIcons name="check" size={14} color={c.onPrimary} />}
        </View>
      </View>

      <Tag label={CATEGORIES[item.category].label} bg="secondaryContainer" fg="onSecondaryContainer" />
      <AppText variant="labelLg" numberOfLines={1}>
        {item.name}
      </AppText>
      <AppText variant="bodySm" color="textMuted" numberOfLines={1}>
        {item.quantity}
      </AppText>
      <View style={styles.bottom}>
        <View style={styles.status}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <AppText variant="labelSm" style={{ color: statusColor }}>
            {expiryLabel(days)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.name} kilerden kaldır`}
          onPress={() => onRemove(item.id)}
          hitSlop={8}>
          <MaterialIcons name="delete-outline" size={20} color={c.textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, padding: SPACING.md, gap: 6, borderWidth: 2, height: '100%' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  emojiCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28, lineHeight: 34 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});

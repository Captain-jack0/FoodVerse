import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { ShoppingItem } from '../types';

type ShoppingItemRowProps = {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ShoppingItemRow({ item, onToggle, onRemove }: ShoppingItemRowProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <View style={[styles.row, { backgroundColor: c.card, opacity: item.checked ? 0.7 : 1 }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.checked }}
        accessibilityLabel={`${item.name} ${item.amount}`}
        onPress={() => onToggle(item.id)}
        style={styles.main}>
        <View
          style={[
            styles.box,
            item.checked ? { backgroundColor: c.tertiary, borderColor: c.tertiary } : { borderColor: c.outline },
          ]}>
          {item.checked && <MaterialIcons name="check" size={16} color={c.onPrimary} />}
        </View>
        <AppText variant="bodyMd" style={[styles.name, item.checked && styles.strike]} numberOfLines={2}>
          {item.name}
        </AppText>
        {item.amount ? (
          <AppText variant="bodySm" color="textMuted">
            {item.amount}
          </AppText>
        ) : null}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${item.name} listeden sil`} onPress={() => onRemove(item.id)} hitSlop={8}>
        <MaterialIcons name="close" size={20} color={c.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    boxShadow: '0 2px 0 rgba(48, 60, 108, 0.06)',
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
});

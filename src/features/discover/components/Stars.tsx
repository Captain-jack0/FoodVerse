import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';

const STARS = [1, 2, 3, 4, 5];

/** Ortalama puan gösterimi: ★★★★☆ 4.3 (12) */
export function StarRating({ value, count, size = 16 }: { value: number; count: number; size?: number }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const label = count === 0 ? 'Henüz puan yok' : `${value.toFixed(1)} yıldız, ${count} oy`;

  return (
    <View style={styles.row} accessibilityLabel={label}>
      {STARS.map((n) => (
        <MaterialIcons
          key={n}
          name={value >= n - 0.25 ? 'star' : value >= n - 0.75 ? 'star-half' : 'star-border'}
          size={size}
          color={count === 0 ? c.outline : c.onSecondaryContainer}
        />
      ))}
      <AppText variant="labelSm" color="textMuted">
        {count === 0 ? ' Yeni' : ` ${value.toFixed(1)} (${count})`}
      </AppText>
    </View>
  );
}

/** Kullanıcının puan vermesi için dokunulabilir yıldızlar */
export function StarPicker({ value, onChange, disabled }: { value: number | null; onChange: (stars: number) => void; disabled?: boolean }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={`Puanın: ${value ?? 0} yıldız`}>
      {STARS.map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={`${n} yıldız ver`}
          onPress={() => onChange(n)}
          disabled={disabled}
          hitSlop={4}>
          <MaterialIcons name={value !== null && value >= n ? 'star' : 'star-border'} size={34} color={c.onSecondaryContainer} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, type ThemeColors } from '@/theme/tokens';

type TagProps = {
  label: string;
  bg?: keyof ThemeColors;
  fg?: keyof ThemeColors;
};

/** Küçük renkli etiket (kategori, eşleşme yüzdesi, XP vb.) */
export function Tag({ label, bg = 'surfaceHigh', fg = 'text' }: TagProps) {
  const { theme } = useKukkiTheme();
  return (
    <View style={[styles.tag, { backgroundColor: theme.colors[bg] }]}>
      <AppText variant="labelSm" color={fg} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
});

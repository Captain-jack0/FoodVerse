import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKukkiTheme } from '@/theme/ThemeProvider';
import { SPACING } from '@/theme/tokens';

import { Brand } from './Brand';
import { UserBadges } from './UserBadges';

export function MobileHeader() {
  const { theme } = useKukkiTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.navBackground, paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <Brand compact />
        <UserBadges compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { boxShadow: '0 1px 8px rgba(0, 0, 0, 0.04)', zIndex: 1 },
  inner: {
    height: 64,
    paddingHorizontal: SPACING.gutterMobile,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

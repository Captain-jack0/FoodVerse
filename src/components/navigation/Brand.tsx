import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { SPACING } from '@/theme/tokens';

export function Brand({ compact }: { compact: boolean }) {
  return (
    <View style={styles.row}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={compact ? styles.logoSmall : styles.logo}
        accessibilityLabel="Kukki Kitchen logosu"
      />
      {compact ? (
        <View>
          <AppText variant="labelMd" color="primary">
            KUKKI
          </AppText>
          <AppText variant="labelSm" color="textMuted">
            Kitchen
          </AppText>
        </View>
      ) : (
        <AppText variant="headlineMd">Kukki Kitchen</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logo: { width: 44, height: 44, borderRadius: 12 },
  logoSmall: { width: 32, height: 32, borderRadius: 8 },
});

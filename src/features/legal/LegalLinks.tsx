import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { SPACING } from '@/theme/tokens';

/** Giriş/kayıt ve profil altındaki yasal bağlantılar */
export function LegalLinks() {
  return (
    <View style={styles.row} accessibilityRole="menu">
      <Link href="/hakkimizda">
        <AppText variant="labelSm" color="textMuted">
          Hakkımızda
        </AppText>
      </Link>
      <AppText variant="labelSm" color="textMuted">
        ·
      </AppText>
      <Link href={{ pathname: '/yasal/[doc]', params: { doc: 'kvkk' } }}>
        <AppText variant="labelSm" color="textMuted">
          KVKK
        </AppText>
      </Link>
      <AppText variant="labelSm" color="textMuted">
        ·
      </AppText>
      <Link href={{ pathname: '/yasal/[doc]', params: { doc: 'gizlilik' } }}>
        <AppText variant="labelSm" color="textMuted">
          Gizlilik
        </AppText>
      </Link>
      <AppText variant="labelSm" color="textMuted">
        ·
      </AppText>
      <Link href={{ pathname: '/yasal/[doc]', params: { doc: 'kosullar' } }}>
        <AppText variant="labelSm" color="textMuted">
          Kullanım Koşulları
        </AppText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs },
});

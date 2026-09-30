import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { ActivePenalty } from '../moderationApi';
import { penaltyUntilText } from '../penalties';

/** Cezalı kullanıcıya neden paylaşım yapamadığını anlatır */
export function MuteBanner({ penalty }: { penalty: ActivePenalty }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  return (
    <View style={[styles.banner, { backgroundColor: c.surfaceHigh, borderColor: c.error }]} accessibilityRole="alert">
      <AppText variant="labelLg" color="error">
        🔇 Topluluk cezası
      </AppText>
      <AppText variant="bodySm" color="text">
        Topluluk kurallarını ihlal ettiğin için {penaltyUntilText(penalty.endsAt)} tarif paylaşamaz, yorum yazamaz ve
        puan veremezsin. Kilerin, defterin ve planın her zamanki gibi çalışıyor.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: RADIUS.lg, borderWidth: 1.5, padding: SPACING.md, gap: 4 },
});

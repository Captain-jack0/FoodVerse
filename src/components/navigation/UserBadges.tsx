import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/AuthProvider';
import { levelTitle } from '@/features/gamification/levels';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

/** Seri, seviye/XP, bildirim ve profil rozetleri. compact = mobil başlık */
export function UserBadges({ compact }: { compact: boolean }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { profile } = useAuth();
  const level = profile?.level ?? 1;

  return (
    <View style={styles.row}>
      {compact ? (
        <>
          <View style={[styles.pill, { backgroundColor: c.secondaryContainer }]}>
            <MaterialIcons name="local-fire-department" size={16} color={c.onSecondaryContainer} />
            <AppText variant="labelSm" color="onSecondaryContainer">
              {profile?.streak_days ?? 0} Gün
            </AppText>
          </View>
          <View style={[styles.pill, { backgroundColor: c.surfaceHigh }]}>
            <MaterialIcons name="military-tech" size={16} color={c.tertiary} />
            <AppText variant="labelSm">Sv. {level}</AppText>
          </View>
        </>
      ) : (
        <View style={[styles.pill, styles.levelPill, { backgroundColor: c.secondaryContainer }]}>
          <MaterialIcons name="star-outline" size={18} color={c.onSecondaryContainer} />
          <AppText variant="labelMd" color="onSecondaryContainer">
            Seviye {level}: {levelTitle(level)}
          </AppText>
          <View style={[styles.xp, { backgroundColor: c.card }]}>
            <AppText variant="labelSm" color="onSecondaryContainer">
              {profile?.xp ?? 0} XP
            </AppText>
          </View>
        </View>
      )}

      {/* ponytail: bildirim butonu, bildirimler özelliği gelince eklenecek */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profil ve ayarlar"
        onPress={() => router.push('/profil')}
        style={styles.avatarButton}>
        <Avatar url={profile?.avatar_url} name={profile?.display_name ?? 'Şef'} size={compact ? 32 : 40} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  levelPill: { paddingVertical: 6, paddingHorizontal: SPACING.md, gap: SPACING.sm, marginRight: SPACING.sm },
  xp: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  avatarButton: { marginLeft: 4 },
});

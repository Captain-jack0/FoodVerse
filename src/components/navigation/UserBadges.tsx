import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { MOCK_USER } from '@/data/mockUser';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

/** Seri, seviye/XP, bildirim ve profil rozetleri. compact = mobil başlık */
export function UserBadges({ compact }: { compact: boolean }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const user = MOCK_USER;

  return (
    <View style={styles.row}>
      {compact ? (
        <>
          <View style={[styles.pill, { backgroundColor: c.secondaryContainer }]}>
            <MaterialIcons name="local-fire-department" size={16} color={c.onSecondaryContainer} />
            <AppText variant="labelSm" color="onSecondaryContainer">
              {user.streakDays} Gün
            </AppText>
          </View>
          <View style={[styles.pill, { backgroundColor: c.surfaceHigh }]}>
            <MaterialIcons name="military-tech" size={16} color={c.tertiary} />
            <AppText variant="labelSm">Sv. {user.level}</AppText>
          </View>
        </>
      ) : (
        <View style={[styles.pill, styles.levelPill, { backgroundColor: c.secondaryContainer }]}>
          <MaterialIcons name="star-outline" size={18} color={c.onSecondaryContainer} />
          <AppText variant="labelMd" color="onSecondaryContainer">
            Seviye {user.level}: {user.levelTitle}
          </AppText>
          <View style={[styles.xp, { backgroundColor: c.card }]}>
            <AppText variant="labelSm" color="onSecondaryContainer">
              {user.xp} XP
            </AppText>
          </View>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bildirimler"
        style={[styles.iconButton, !compact && { backgroundColor: c.surfaceHigh }]}>
        <MaterialIcons name="notifications-none" size={22} color={c.textMuted} />
        {user.unreadNotifications > 0 && <View style={[styles.dot, { backgroundColor: c.primary }]} />}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profil"
        style={[styles.avatar, compact && styles.avatarSmall, { backgroundColor: c.primary }]}>
        <MaterialIcons name="person" size={compact ? 18 : 22} color={c.onPrimary} />
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: { width: 32, height: 32 },
  dot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

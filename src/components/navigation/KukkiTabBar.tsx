import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { MAX_CONTENT_WIDTH, RADIUS, SPACING } from '@/theme/tokens';

import { Brand } from './Brand';
import { CENTER_TAB, TABS } from './tabs';
import { UserBadges } from './UserBadges';

/** Geniş ekranda (web) üst menü, dar ekranda (mobil) alt sekme çubuğu */
export function KukkiTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const isWide = useIsWide();
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  const items = state.routes.map((route, index) => {
    const tab = TABS.find((t) => t.name === route.name);
    const focused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    };
    return { key: route.key, tab, focused, onPress };
  });

  if (isWide) {
    return (
      <View style={[styles.topBar, { backgroundColor: c.navBackground, paddingTop: insets.top }]}>
        <View style={styles.topInner}>
          <Brand compact={false} />
          <View style={styles.topLinks}>
            {items.map(({ key, tab, focused, onPress }) => (
              <Pressable
                key={key}
                onPress={onPress}
                accessibilityRole="link"
                accessibilityState={{ selected: focused }}
                style={[styles.topLink, focused && { backgroundColor: c.surfaceHigh }]}>
                <AppText variant="labelLg" color={focused ? 'primary' : 'text'}>
                  {tab?.webLabel}
                </AppText>
              </Pressable>
            ))}
          </View>
          <UserBadges compact={false} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bottomBar,
        { backgroundColor: c.navBackground, paddingBottom: Math.max(insets.bottom, SPACING.sm) },
      ]}>
      {items.map(({ key, tab, focused, onPress }) => {
        const isCenter = tab?.name === CENTER_TAB;
        const color = focused ? c.primary : c.textMuted;
        return (
          <Pressable
            key={key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={tab?.label}
            accessibilityState={{ selected: focused }}
            style={styles.bottomItem}>
            {isCenter ? (
              <View
                style={[
                  styles.centerButton,
                  {
                    backgroundColor: c.primaryContainer,
                    borderColor: c.background,
                    boxShadow: `0 4px 0 ${c.pressShadow}`,
                  },
                ]}>
                <MaterialIcons name={tab.icon} size={30} color={c.onPrimary} />
              </View>
            ) : (
              <MaterialIcons name={tab?.icon ?? 'circle'} size={24} color={color} />
            )}
            <AppText variant="labelSm" style={{ color: isCenter ? c.text : color }}>
              {tab?.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    zIndex: 10,
    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.04)',
  },
  topInner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    height: 80,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  topLinks: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexShrink: 1 },
  topLink: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: SPACING.sm,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.06)',
  },
  bottomItem: { flex: 1, alignItems: 'center', gap: 4, minHeight: 48, justifyContent: 'flex-end' },
  centerButton: {
    width: 64,
    height: 64,
    marginTop: -32,
    borderRadius: RADIUS.full,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

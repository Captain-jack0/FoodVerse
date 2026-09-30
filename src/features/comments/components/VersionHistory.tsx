import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { Comment } from '../commentsApi';
import { timeAgo } from '../commentUtils';
import type { RecipeVersion } from '../versionsApi';

type VersionHistoryProps = {
  versions: RecipeVersion[];
  comments: Comment[];
};

/** Sürüm geçmişi: not, uygulanan öneriler (önerenin adıyla) ve o sürümün malzeme/adımları */
export function VersionHistory({ versions, comments }: VersionHistoryProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [openId, setOpenId] = useState<string | null>(null);

  if (versions.length === 0) return null;

  return (
    <View style={styles.list}>
      {versions.map((v) => {
        const credits = comments.filter((cm) => cm.resolvedVersion === v.version && cm.suggestionStatus === 'applied');
        const open = openId === v.id;
        return (
          <View key={v.id} style={[styles.item, { backgroundColor: c.surfaceLow }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpenId(open ? null : v.id)}
              style={styles.header}>
              <View style={[styles.badge, { backgroundColor: c.primaryContainer }]}>
                <AppText variant="labelMd" color="onPrimary">
                  v{v.version}
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="labelLg">{v.note || 'Güncellendi'}</AppText>
                <AppText variant="labelSm" color="textMuted">
                  {timeAgo(v.createdAt)}
                  {credits.length > 0 && ` · 💡 ${credits.map((cm) => cm.author.name).join(', ')} önerisiyle`}
                </AppText>
              </View>
              <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} color={c.textMuted} />
            </Pressable>
            {open && (
              <View style={styles.snapshot}>
                {(v.snapshot.ingredients ?? []).map((ing, i) => (
                  <AppText key={`i${i}`} variant="bodySm">
                    • {ing.name} {ing.amount}
                  </AppText>
                ))}
                {(v.snapshot.steps ?? []).map((step, i) => (
                  <AppText key={`s${i}`} variant="bodySm" color="textMuted">
                    {i + 1}. {step}
                  </AppText>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.sm },
  item: { borderRadius: RADIUS.lg, padding: SPACING.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  flex: { flex: 1 },
  snapshot: { gap: 2, paddingTop: SPACING.sm, paddingHorizontal: SPACING.sm },
});

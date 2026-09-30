import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { RecipeCover } from '@/components/ui/RecipeCover';
import { Tag } from '@/components/ui/Tag';
import { levelTitle } from '@/features/gamification/levels';
import { DIFFICULTY_LABEL, RECIPE_TAGS } from '@/features/recipes/recipeTags';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { DiscoverItem } from '../discoverMapper';
import { StarRating } from './Stars';

export function DiscoverCard({ item }: { item: DiscoverItem }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const firstTag = item.tags[0];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.author.name} tarifi`}
      onPress={() => router.push({ pathname: '/tarif/[id]', params: { id: item.id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.card, transform: [{ translateY: pressed ? 2 : 0 }] },
      ]}>
      <RecipeCover photoUrl={item.photoUrl} emoji={item.emoji} height={130} emojiSize={64}>
        {firstTag && (
          <View style={styles.topLeft}>
            <Tag label={`${RECIPE_TAGS[firstTag].emoji} ${RECIPE_TAGS[firstTag].label}`} bg="card" />
          </View>
        )}
        <View style={styles.bottomRight}>
          <Tag label={`⏱ ${item.minutes} dk · ${DIFFICULTY_LABEL[item.difficulty]}`} bg="card" />
        </View>
      </RecipeCover>

      <View style={styles.body}>
        <AppText variant="headlineMd" numberOfLines={2}>
          {item.title}
        </AppText>
        <StarRating value={item.avgRating} count={item.ratingCount} />
        <View style={styles.author}>
          <Avatar url={item.author.avatarUrl} name={item.author.name} size={28} />
          <View style={styles.flex}>
            <AppText variant="labelMd" numberOfLines={1}>
              {item.author.name}
            </AppText>
            <AppText variant="labelSm" color="textMuted">
              Sv. {item.author.level} · {levelTitle(item.author.level)}
            </AppText>
          </View>
        </View>
        <View style={styles.meta}>
          <AppText variant="labelSm" color="textMuted">
            📚 {item.saveCount} kayıt
          </AppText>
          <AppText variant="labelSm" color="textMuted">
            🔁 {item.cookCount} kez pişirildi
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, overflow: 'hidden', height: '100%', boxShadow: '0 4px 0 rgba(48, 60, 108, 0.08)' },
  topLeft: { position: 'absolute', top: SPACING.sm, left: SPACING.sm },
  bottomRight: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm },
  body: { padding: SPACING.md, gap: SPACING.sm },
  author: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  flex: { flex: 1 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
});

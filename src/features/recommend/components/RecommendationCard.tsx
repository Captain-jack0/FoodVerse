import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { RecipeCover } from '@/components/ui/RecipeCover';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { Recommendation } from '../recommend';

type RecommendationCardProps = {
  rec: Recommendation;
  /** Örn. "🌟 Günün Tarifi" — varsa kart öne çıkar */
  badge?: string;
  onOpen: () => void;
};

const MAX_REASONS = 3;

/** Öneri kartı: neden önerildiği (gerekçeler), eşleşme ve kaynak */
export function RecommendationCard({ rec, badge, onOpen }: RecommendationCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { recipe, origin } = rec.candidate;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: badge ? c.secondaryContainer : 'transparent' },
      ]}>
      <RecipeCover photoUrl={recipe.photoUrl} emoji={recipe.emoji} height={120} emojiSize={56} bg={badge ? 'secondaryContainer' : 'surfaceHigh'}>
        <View style={styles.topLeft}>
          {badge ? (
            <Tag label={badge} bg="card" fg="onSecondaryContainer" />
          ) : (
            <Tag label={`%${rec.matchPercent} Eşleşme`} bg="secondaryContainer" fg="onSecondaryContainer" />
          )}
        </View>
        {origin === 'community' && (
          <View style={styles.topRight}>
            <Tag label="🌍 Topluluktan" bg="card" fg="tertiary" />
          </View>
        )}
        <View style={styles.bottomRight}>
          <Tag label={`⏱ ${recipe.minutes} dk`} bg="card" />
        </View>
      </RecipeCover>

      <View style={styles.body}>
        <AppText variant="headlineMd">{recipe.title}</AppText>
        {rec.reasons.slice(0, MAX_REASONS).map((reason) => (
          <AppText key={reason} variant="labelMd" color="textMuted">
            {reason}
          </AppText>
        ))}
        <GameButton
          label={badge ? 'Hadi Pişirelim' : 'Tarife Göz At'}
          icon={badge ? 'play-arrow' : 'chevron-right'}
          variant={badge ? 'sunny' : 'soft'}
          onPress={onOpen}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 2, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.08)' },
  topLeft: { position: 'absolute', top: SPACING.sm, left: SPACING.sm },
  topRight: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
  bottomRight: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm },
  body: { padding: SPACING.md, gap: 4 },
});

import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import type { RankedRecipe } from '../pantryUtils';

type RecipeSuggestionCardProps = {
  ranked: RankedRecipe;
  highlighted: boolean;
  onOpen: () => void;
};

function missingText(missing: string[]) {
  if (missing.length === 0) return 'Hiçbir şey eksik değil!';
  if (missing.length === 1) return `Sadece ${missing[0]} eksik`;
  return `${missing.length} malzeme eksik`;
}

export function RecipeSuggestionCard({ ranked, highlighted, onOpen }: RecipeSuggestionCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { recipe, match } = ranked;

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={[styles.cover, { backgroundColor: c.surfaceHigh }]}>
        <AppText style={styles.coverEmoji}>{recipe.emoji}</AppText>
        <View style={styles.coverTopLeft}>
          <Tag label={`%${match.percent} Eşleşme`} bg="secondaryContainer" fg="onSecondaryContainer" />
        </View>
        <View style={styles.coverBottomRight}>
          <Tag label={`⏱ ${recipe.minutes} dk`} bg="card" />
        </View>
      </View>

      <View style={styles.body}>
        <AppText variant="headlineMd">{recipe.title}</AppText>
        <AppText variant="bodySm" color="textMuted">
          {recipe.description}
        </AppText>
        <View style={styles.meta}>
          <View style={styles.metaLeft}>
            <MaterialIcons name="check-circle-outline" size={16} color={c.tertiary} />
            <AppText variant="labelMd" color="tertiary">
              {match.have.length} malzeme hazır
            </AppText>
          </View>
          <AppText variant="labelSm" color="textMuted">
            {missingText(match.missing)}
          </AppText>
        </View>
        <GameButton
          label={highlighted ? 'Tarife Başla' : 'Tarife Göz At'}
          icon={highlighted ? 'play-arrow' : 'chevron-right'}
          variant={highlighted ? 'sunny' : 'soft'}
          onPress={onOpen}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, overflow: 'hidden', boxShadow: '0 4px 16px rgba(48, 60, 108, 0.08)' },
  cover: { height: 120, alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 56, lineHeight: 68 },
  coverTopLeft: { position: 'absolute', top: SPACING.sm, left: SPACING.sm },
  coverBottomRight: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm },
  body: { padding: SPACING.md, gap: SPACING.sm },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.sm },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

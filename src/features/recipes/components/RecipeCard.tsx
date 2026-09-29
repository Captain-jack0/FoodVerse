import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { Tag } from '@/components/ui/Tag';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { RECIPE_TAGS } from '../recipeTags';
import type { Difficulty, Recipe, RecipeSource } from '../types';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: 'Kolay', 2: 'Orta', 3: 'Usta' };

const SOURCE_INFO: Record<RecipeSource['type'], { label: string; icon: IconName }> = {
  instagram: { label: "Instagram'dan aktarıldı", icon: 'photo-camera' },
  tiktok: { label: "TikTok'tan aktarıldı", icon: 'music-note' },
  family: { label: 'Aile Defteri', icon: 'family-restroom' },
  manual: { label: 'Kendi Tarifim', icon: 'edit-note' },
};

type RecipeCardProps = {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onCook: (id: string) => void;
};

export function RecipeCard({ recipe, onToggleFavorite, onCook }: RecipeCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const firstTag = recipe.tags[0];
  const source = SOURCE_INFO[recipe.source.type];

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={[styles.cover, { backgroundColor: c.surfaceHigh }]}>
        <AppText style={styles.coverEmoji}>{recipe.emoji}</AppText>
        {firstTag && (
          <View style={styles.topLeft}>
            <Tag label={`${RECIPE_TAGS[firstTag].emoji} ${RECIPE_TAGS[firstTag].label}`} bg="card" />
          </View>
        )}
        <View style={styles.bottomRight}>
          <Tag label={`🔁 ${recipe.cookedCount} kez pişirildi`} bg="card" />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="headlineMd" style={styles.flex}>
            {recipe.title}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={recipe.favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            accessibilityState={{ selected: recipe.favorite }}
            onPress={() => onToggleFavorite(recipe.id)}
            hitSlop={8}>
            <MaterialIcons
              name={recipe.favorite ? 'favorite' : 'favorite-border'}
              size={26}
              color={recipe.favorite ? c.primary : c.outline}
            />
          </Pressable>
        </View>

        <View style={styles.meta}>
          <MaterialIcons name="schedule" size={16} color={c.textMuted} />
          <AppText variant="bodySm" color="textMuted">
            {recipe.minutes} dk
          </AppText>
          <View style={styles.stars} accessibilityLabel={`Zorluk: ${DIFFICULTY_LABEL[recipe.difficulty]}`}>
            {[1, 2, 3].map((n) => (
              <MaterialIcons
                key={n}
                name={n <= recipe.difficulty ? 'star' : 'star-border'}
                size={16}
                color={n <= recipe.difficulty ? c.onSecondaryContainer : c.outline}
              />
            ))}
          </View>
          <AppText variant="bodySm" color="textMuted">
            ({DIFFICULTY_LABEL[recipe.difficulty]})
          </AppText>
        </View>

        {recipe.tip && (
          <View style={[styles.tip, { backgroundColor: c.surfaceLow }]}>
            <MaterialIcons name="tips-and-updates" size={18} color={c.primary} />
            <AppText variant="bodySm" color="textMuted" style={[styles.flex, styles.italic]}>
              “{recipe.tip}”
            </AppText>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.source}>
            <MaterialIcons name={source.icon} size={16} color={c.tertiary} />
            <AppText variant="labelMd" color="tertiary">
              {source.label}
            </AppText>
          </View>
          <GameButton label="Pişirmeye Başla" icon="play-circle" variant="soft" onPress={() => onCook(recipe.id)} style={styles.cookButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    height: '100%',
    boxShadow: '0 4px 0 rgba(48, 60, 108, 0.08)',
  },
  cover: { height: 150, alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 72, lineHeight: 86 },
  topLeft: { position: 'absolute', top: SPACING.sm, left: SPACING.sm },
  bottomRight: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm },
  body: { padding: SPACING.md, gap: SPACING.sm, flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  flex: { flex: 1 },
  italic: { fontStyle: 'italic' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { flexDirection: 'row', marginLeft: SPACING.sm },
  tip: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginTop: 'auto',
    paddingTop: SPACING.xs,
  },
  source: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  cookButton: { minHeight: 40, paddingHorizontal: SPACING.md },
});

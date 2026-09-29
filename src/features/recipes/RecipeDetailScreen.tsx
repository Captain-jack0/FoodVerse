import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { Tag } from '@/components/ui/Tag';
import { useAuth } from '@/features/auth/AuthProvider';
import { matchRecipe } from '@/features/pantry/pantryUtils';
import { usePantry } from '@/features/pantry/usePantry';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { deleteRecipe, setFavorite } from './recipesApi';
import { DIFFICULTY_LABEL, RECIPE_TAGS, SOURCE_INFO } from './recipeTags';
import { useRecipe } from './useRecipe';

export function RecipeDetailScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { detail, status, reload, setDetail } = useRecipe(id);
  const pantry = usePantry();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (status !== 'ready' || !detail) {
    return (
      <>
        <StackHeader title="Tarif" />
        <Screen>
          {status === 'missing' ? (
            <HintCard emoji="🕵️" title="Tarif bulunamadı" text="Bu tarif silinmiş ya da artık paylaşılmıyor olabilir." />
          ) : (
            <LoadState status={status === 'error' ? 'error' : 'loading'} onRetry={reload} />
          )}
        </Screen>
      </>
    );
  }

  const { recipe, authorId } = detail;
  const isMine = authorId === session?.user.id;
  const match = matchRecipe(recipe, pantry.items);
  const source = SOURCE_INFO[recipe.source.type];

  const toggleFavorite = async () => {
    const next = !recipe.favorite;
    setDetail({ ...detail, recipe: { ...recipe, favorite: next } });
    try {
      await setFavorite(recipe.id, next);
    } catch (error) {
      console.warn('Favori güncellenemedi', error);
      setDetail({ ...detail, recipe: { ...recipe, favorite: !next } });
      setActionError('Favori güncellenemedi, tekrar dene.');
    }
  };

  const remove = async () => {
    try {
      await deleteRecipe(recipe.id);
      router.back();
    } catch (error) {
      console.warn('Tarif silinemedi', error);
      setActionError('Tarif silinemedi, tekrar dene.');
      setConfirmDelete(false);
    }
  };

  const ingredientsCard = (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={styles.rowBetween}>
        <AppText variant="headlineMd">Malzemeler</AppText>
        {pantry.status === 'ready' && (
          <Tag label={`Kilerde %${match.percent}`} bg="secondaryContainer" fg="onSecondaryContainer" />
        )}
      </View>
      {recipe.ingredients.map((ing, i) => {
        const have = match.have.includes(ing.name);
        return (
          <View key={`${ing.name}-${i}`} style={styles.ingredient}>
            <MaterialIcons
              name={have ? 'check-circle' : 'radio-button-unchecked'}
              size={20}
              color={have ? c.tertiary : c.outline}
              accessibilityLabel={have ? 'Kilerde var' : 'Kilerde yok'}
            />
            <AppText variant="bodyMd" style={styles.flex}>
              {ing.name}
            </AppText>
            <AppText variant="bodySm" color="textMuted">
              {ing.amount}
            </AppText>
          </View>
        );
      })}
      {match.missing.length > 0 && (
        <AppText variant="bodySm" color="textMuted">
          🛒 Eksik: {match.missing.join(', ')}
        </AppText>
      )}
    </View>
  );

  const stepsCard = (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <AppText variant="headlineMd">Hazırlanışı</AppText>
      {recipe.steps.map((step, i) => (
        <View key={i} style={styles.step}>
          <View style={[styles.stepNo, { backgroundColor: c.primaryContainer }]}>
            <AppText variant="labelMd" color="onPrimary">
              {i + 1}
            </AppText>
          </View>
          <AppText variant="bodyMd" style={styles.flex}>
            {step}
          </AppText>
        </View>
      ))}
    </View>
  );

  return (
    <>
      <StackHeader title={recipe.title} />
      <Screen>
        <View style={[styles.hero, { backgroundColor: c.surfaceLow }, isWide && styles.heroWide]}>
          <View style={[styles.cover, { backgroundColor: c.surfaceHigh }]}>
            <AppText style={styles.coverEmoji}>{recipe.emoji}</AppText>
          </View>
          <View style={[styles.heroText, isWide && styles.flex]}>
            <View style={styles.rowBetween}>
              <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'} style={styles.flex}>
                {recipe.title}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={recipe.favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                onPress={toggleFavorite}
                hitSlop={8}>
                <MaterialIcons name={recipe.favorite ? 'favorite' : 'favorite-border'} size={30} color={c.primary} />
              </Pressable>
            </View>
            {recipe.description ? (
              <AppText variant="bodyMd" color="textMuted">
                {recipe.description}
              </AppText>
            ) : null}
            <View style={styles.tags}>
              <Tag label={`⏱ ${recipe.minutes} dk`} bg="card" />
              <Tag label={`⭐ ${DIFFICULTY_LABEL[recipe.difficulty]}`} bg="card" />
              <Tag label={`🔁 ${recipe.cookedCount} kez pişirildi`} bg="card" />
              {recipe.tags.map((t) => (
                <Tag key={t} label={`${RECIPE_TAGS[t].emoji} ${RECIPE_TAGS[t].label}`} bg="card" />
              ))}
            </View>
            <View style={styles.source}>
              <MaterialIcons name={source.icon} size={16} color={c.tertiary} />
              <AppText variant="labelMd" color="tertiary">
                {source.label}
              </AppText>
            </View>
            <GameButton
              label="Pişirmeye Başla"
              icon="play-circle"
              variant="accent"
              onPress={() => router.push({ pathname: '/pisir/[id]', params: { id: recipe.id } })}
            />
          </View>
        </View>

        {recipe.tip && (
          <View style={[styles.tip, { backgroundColor: c.secondaryContainer }]}>
            <MaterialIcons name="tips-and-updates" size={22} color={c.onSecondaryContainer} />
            <AppText variant="bodyMd" color="onSecondaryContainer" style={styles.flex}>
              {recipe.tip}
            </AppText>
          </View>
        )}

        {actionError && <FormError text={actionError} />}

        {isWide ? (
          <View style={styles.columns}>
            <View style={styles.sideCol}>{ingredientsCard}</View>
            <View style={styles.flex}>{stepsCard}</View>
          </View>
        ) : (
          <>
            {ingredientsCard}
            {stepsCard}
          </>
        )}

        {isMine &&
          (confirmDelete ? (
            <View style={[styles.card, { backgroundColor: c.card }]}>
              <AppText variant="labelLg">Bu tarifi kalıcı olarak silmek istediğine emin misin?</AppText>
              <View style={styles.confirmRow}>
                <GameButton label="Vazgeç" variant="soft" onPress={() => setConfirmDelete(false)} style={styles.flex} />
                <GameButton label="Evet, sil" icon="delete" onPress={remove} style={styles.flex} />
              </View>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={styles.deleteLink}>
              <MaterialIcons name="delete-outline" size={18} color={c.error} />
              <AppText variant="labelLg" color="error">
                Tarifi sil
              </AppText>
            </Pressable>
          ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  heroWide: { flexDirection: 'row', alignItems: 'center' },
  cover: { height: 160, minWidth: 200, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 88, lineHeight: 104 },
  heroText: { gap: SPACING.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tip: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.lg },
  sideCol: { width: 360 },
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.06)' },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 4 },
  step: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: 4 },
  stepNo: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  confirmRow: { flexDirection: 'row', gap: SPACING.sm },
  deleteLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4, padding: SPACING.sm },
});

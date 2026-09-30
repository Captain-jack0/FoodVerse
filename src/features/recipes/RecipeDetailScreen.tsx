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
import { RecipeCover } from '@/components/ui/RecipeCover';
import { Tag } from '@/components/ui/Tag';
import { useAuth } from '@/features/auth/AuthProvider';
import { matchRecipe } from '@/features/pantry/pantryUtils';
import { CommentsSection } from '@/features/comments/CommentsSection';
import { CommunityCard } from '@/features/discover/components/CommunityCard';
import { AddToCollectionModal } from '@/features/collections/components/AddToCollectionModal';
import { CollectionEditorModal } from '@/features/collections/components/CollectionEditorModal';
import { useCollections } from '@/features/collections/useCollections';
import { usePantry } from '@/features/pantry/usePantry';
import { itemsToAdd } from '@/features/shopping/shoppingUtils';
import { useShoppingList } from '@/features/shopping/useShoppingList';
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
  const shopping = useShoppingList();
  const collections = useCollections();
  const [collectionModal, setCollectionModal] = useState<'pick' | 'new' | null>(null);
  const [shoppingNotice, setShoppingNotice] = useState<string | null>(null);

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

  const addMissingToList = async () => {
    const missing = recipe.ingredients.filter((ing) => match.missing.includes(ing.name));
    const toAdd = itemsToAdd(shopping.items, missing);
    if (toAdd.length === 0) {
      setShoppingNotice('Eksiklerin hepsi zaten alışveriş listende 👍');
      return;
    }
    const ok = await shopping.add(toAdd.map((ing) => ({ ...ing, recipeId: recipe.id })));
    if (ok) setShoppingNotice(`🛒 ${toAdd.length} malzeme alışveriş listene eklendi.`);
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
      {match.missing.length > 0 && pantry.status === 'ready' && (
        <>
          <AppText variant="bodySm" color="textMuted">
            Eksik: {match.missing.join(', ')}
          </AppText>
          <GameButton
            label="Eksikleri Alışveriş Listesine Ekle"
            icon="add-shopping-cart"
            variant="soft"
            onPress={addMissingToList}
            disabled={shopping.status !== 'ready'}
          />
        </>
      )}
      {shopping.actionError && <FormError text={shopping.actionError} />}
      {shoppingNotice && (
        <AppText variant="bodySm" color="tertiary" accessibilityLiveRegion="polite">
          {shoppingNotice}
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
          <RecipeCover photoUrl={recipe.photoUrl} emoji={recipe.emoji} height={160} emojiSize={88} style={styles.cover}>
          </RecipeCover>
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

        <GameButton
          label={(() => {
            const count = collections.collections.filter((col) => col.recipeIds.includes(recipe.id)).length;
            return count > 0 ? `📚 ${count} koleksiyonda` : '📚 Koleksiyona Ekle';
          })()}
          variant="soft"
          onPress={() => setCollectionModal('pick')}
          disabled={collections.status !== 'ready'}
        />

        {detail.isHidden && (
          <HintCard
            emoji="🙈"
            title="Bu tarif incelemede"
            text="Birkaç kişi şikayet ettiği için tarif Keşfet'ten geçici olarak kaldırıldı. Yönetici inceleyince tekrar yayına alınabilir. Sen görmeye ve pişirmeye devam edebilirsin."
          />
        )}

        <CommunityCard recipeId={recipe.id} isMine={isMine} isPublic={detail.isPublic} author={detail.author} />

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

        {detail.isPublic && (
          <CommentsSection recipeId={recipe.id} currentUserId={session?.user.id} isRecipeOwner={isMine} />
        )}

        {isMine && (
          <GameButton
            label="Tarifi Düzenle"
            icon="edit"
            variant="soft"
            onPress={() => router.push({ pathname: '/duzenle/[id]', params: { id: recipe.id } })}
          />
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
        {collectionModal === 'pick' && (
          <AddToCollectionModal
            recipeId={recipe.id}
            recipeTitle={recipe.title}
            collections={collections.collections}
            error={collections.actionError}
            onToggle={(collectionId) => collections.toggleRecipe(collectionId, recipe.id)}
            onCreateNew={() => setCollectionModal('new')}
            onClose={() => setCollectionModal(null)}
          />
        )}
        {collectionModal === 'new' && (
          <CollectionEditorModal
            existing={collections.collections}
            onSave={collections.create}
            // Oluşturduktan sonra seçim listesine dön
            onClose={() => setCollectionModal('pick')}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  heroWide: { flexDirection: 'row', alignItems: 'center' },
  cover: { minWidth: 200, borderRadius: RADIUS.lg },
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

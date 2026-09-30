import { useLocalSearchParams } from 'expo-router';

import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { useAuth } from '@/features/auth/AuthProvider';

import { draftFromRecipe } from './recipeDraft';
import { RecipeForm } from './RecipeForm';
import { updateRecipe } from './recipesApi';
import { useRecipe } from './useRecipe';

export function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { detail, status, reload } = useRecipe(id);

  if (status !== 'ready' || !detail || detail.authorId !== session?.user.id) {
    return (
      <>
        <StackHeader title="Tarifi Düzenle" />
        <Screen>
          {status === 'loading' || status === 'error' ? (
            <LoadState status={status} onRetry={reload} />
          ) : (
            <HintCard emoji="🔒" title="Bu tarifi düzenleyemezsin" text="Sadece kendi eklediğin tarifleri düzenleyebilirsin." />
          )}
        </Screen>
      </>
    );
  }

  return (
    <RecipeForm
      // Tarif değişince formu baştan kur
      key={detail.recipe.id}
      headerTitle="Tarifi Düzenle"
      heading={`${detail.recipe.title} tarifini güncelle`}
      submitLabel="Değişiklikleri Kaydet"
      initialDraft={draftFromRecipe(detail.recipe, detail.isPublic)}
      onSubmit={(payload) => updateRecipe(detail.recipe.id, payload)}
    />
  );
}

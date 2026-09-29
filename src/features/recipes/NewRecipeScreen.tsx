import { useLocalSearchParams } from 'expo-router';

import { emptyDraft } from './recipeDraft';
import { RecipeForm } from './RecipeForm';
import { insertRecipe } from './recipesApi';

export function NewRecipeScreen() {
  // Sosyal medya kartından gelindiyse link kaynağa önceden yazılır
  const { url } = useLocalSearchParams<{ url?: string }>();
  return (
    <RecipeForm
      headerTitle="Yeni Tarif"
      heading="Kendi tarifini yaz"
      submitLabel="Tarifi Kaydet"
      initialDraft={emptyDraft(typeof url === 'string' ? url : '')}
      onSubmit={async (payload) => {
        await insertRecipe(payload);
      }}
    />
  );
}

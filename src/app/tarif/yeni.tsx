import { StackHeader } from '@/components/navigation/StackHeader';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function NewRecipeScreen() {
  return (
    <>
      <StackHeader title="Yeni Tarif" />
      <PlaceholderScreen
        icon="edit-note"
        eyebrow="Manuel Tarif Defteri"
        title="Kendi Tarifini Yaz"
        description="Malzemeler, adımlar ve püf noktalarıyla kendi tarifini defterine ekle."
      />
    </>
  );
}

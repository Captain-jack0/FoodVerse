import type { RecipeTag } from './types';

export const RECIPE_TAGS: Record<RecipeTag, { label: string; emoji: string }> = {
  hizli: { label: 'Hızlı Pratik (15 dk)', emoji: '⚡' },
  firin: { label: 'Fırın & Hamur İşi', emoji: '🥐' },
  hafif: { label: 'Hafif & Sağlıklı', emoji: '🥗' },
  tatli: { label: 'Tatlı Krizleri', emoji: '🧁' },
  anne: { label: 'Anne Lezzeti', emoji: '👵' },
};

/** Etiket filtresi olarak gösterilecekler (anne lezzeti kaynakla zaten görünüyor) */
export const FILTER_TAGS: RecipeTag[] = ['hizli', 'firin', 'hafif', 'tatli'];

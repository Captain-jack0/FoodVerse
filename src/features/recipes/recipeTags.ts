import type { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Difficulty, RecipeSource, RecipeTag } from './types';

export const RECIPE_TAGS: Record<RecipeTag, { label: string; emoji: string }> = {
  hizli: { label: 'Hızlı Pratik (15 dk)', emoji: '⚡' },
  firin: { label: 'Fırın & Hamur İşi', emoji: '🥐' },
  hafif: { label: 'Hafif & Sağlıklı', emoji: '🥗' },
  tatli: { label: 'Tatlı Krizleri', emoji: '🧁' },
  anne: { label: 'Anne Lezzeti', emoji: '👵' },
};

/** Etiket filtresi olarak gösterilecekler (anne lezzeti kaynakla zaten görünüyor) */
export const FILTER_TAGS: RecipeTag[] = ['hizli', 'firin', 'hafif', 'tatli'];

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: 'Kolay', 2: 'Orta', 3: 'Usta' };

export const SOURCE_INFO: Record<RecipeSource['type'], { label: string; icon: IconName }> = {
  instagram: { label: "Instagram'dan aktarıldı", icon: 'photo-camera' },
  tiktok: { label: "TikTok'tan aktarıldı", icon: 'music-note' },
  family: { label: 'Aile Defteri', icon: 'family-restroom' },
  manual: { label: 'Kendi Tarifim', icon: 'edit-note' },
};

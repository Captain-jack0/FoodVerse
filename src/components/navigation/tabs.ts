import type { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type TabConfig = {
  /** src/app/(tabs) altındaki dosya adı */
  name: string;
  /** Mobil alt sekmedeki kısa ad */
  label: string;
  /** Web üst menüsündeki uzun ad */
  webLabel: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

export const TABS: TabConfig[] = [
  { name: 'index', label: 'Kiler', webLabel: 'Sanal Kiler', icon: 'kitchen' },
  { name: 'tarifler', label: 'Tarifler', webLabel: 'Tarif Defteri', icon: 'menu-book' },
  { name: 'asistan', label: 'Asistan', webLabel: 'Sesli Asistan', icon: 'mic' },
  { name: 'kesfet', label: 'Keşfet', webLabel: 'Keşfet', icon: 'explore' },
  { name: 'planlayici', label: 'Planlayıcı', webLabel: 'Planlayıcı', icon: 'calendar-month' },
];

/** Mobilde ortada büyük, yükseltilmiş buton olarak gösterilen sekme */
export const CENTER_TAB = 'asistan';

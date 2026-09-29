import { useWindowDimensions } from 'react-native';

import { WIDE_BREAKPOINT } from '@/theme/tokens';

/** Web/tablet düzeni mi (üst menü), telefon düzeni mi (alt sekmeler) */
export function useIsWide() {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}

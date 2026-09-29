// Stitch tasarımındaki (stitch_sanal_mutfak_asistan) renk, yazı ve ölçü değerleri.
// Tüm ekranlar renklerini buradan alır; yeni tema eklemek için THEMES'e bir kayıt eklemek yeterli.

export type ThemeColors = {
  background: string;
  surfaceLow: string;
  surfaceHigh: string;
  card: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  text: string;
  textMuted: string;
  outline: string;
  error: string;
  navBackground: string;
  /** Oyunsu "basılabilir" butonların altındaki sert gölge */
  pressShadow: string;
};

export type ThemeId = 'cozy' | 'akdeniz' | 'geceSefi';

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  dark: boolean;
  colors: ThemeColors;
};

export const THEMES: Record<ThemeId, Theme> = {
  cozy: {
    id: 'cozy',
    name: 'Cozy Pastel',
    description: 'Somon, vanilya & pudra mavi (Klasik)',
    dark: false,
    colors: {
      background: '#fbf8ff',
      surfaceLow: '#f3f2ff',
      surfaceHigh: '#e4e7ff',
      card: '#ffffff',
      primary: '#9c4143',
      onPrimary: '#ffffff',
      primaryContainer: '#f78888',
      onPrimaryContainer: '#712025',
      secondaryContainer: '#fcdb58',
      onSecondaryContainer: '#735f00',
      tertiary: '#076493',
      text: '#091747',
      textMuted: '#554242',
      outline: '#dbc0bf',
      error: '#ba1a1a',
      navBackground: 'rgba(251, 248, 255, 0.92)',
      pressShadow: 'rgba(113, 32, 37, 0.28)',
    },
  },
  akdeniz: {
    id: 'akdeniz',
    name: 'Akdeniz',
    description: 'Taze turkuaz, lacivert & mercan',
    dark: false,
    colors: {
      background: '#f0fbfb',
      surfaceLow: '#e1f5f7',
      surfaceHigh: '#d2fdff',
      card: '#ffffff',
      primary: '#303c6c',
      onPrimary: '#ffffff',
      primaryContainer: '#b4dfe5',
      onPrimaryContainer: '#1d2547',
      secondaryContainer: '#f4976c',
      onSecondaryContainer: '#541d06',
      tertiary: '#028090',
      text: '#1f2744',
      textMuted: '#495475',
      outline: '#b4d3d8',
      error: '#ba1a1a',
      navBackground: 'rgba(240, 251, 251, 0.92)',
      pressShadow: 'rgba(29, 37, 71, 0.28)',
    },
  },
  geceSefi: {
    id: 'geceSefi',
    name: 'Gece Şefi',
    description: 'Gece mavisi & karamel (Koyu)',
    dark: true,
    colors: {
      background: '#0d1b2a',
      surfaceLow: '#132238',
      surfaceHigh: '#1b263b',
      card: '#16253d',
      primary: '#e0a96d',
      onPrimary: '#0d1b2a',
      primaryContainer: '#415a77',
      onPrimaryContainer: '#ebebeb',
      secondaryContainer: '#2a3c53',
      onSecondaryContainer: '#ffd89b',
      tertiary: '#778da9',
      text: '#f1f5f9',
      textMuted: '#a0aec0',
      outline: '#2a3c53',
      error: '#ffb4ab',
      navBackground: 'rgba(13, 27, 42, 0.94)',
      pressShadow: 'rgba(0, 0, 0, 0.45)',
    },
  },
};

export const FONT = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const TYPOGRAPHY = {
  headlineXl: { fontFamily: FONT.extrabold, fontSize: 40, lineHeight: 48, letterSpacing: -0.8 },
  headlineXlMobile: { fontFamily: FONT.extrabold, fontSize: 30, lineHeight: 38, letterSpacing: -0.3 },
  headlineLg: { fontFamily: FONT.bold, fontSize: 28, lineHeight: 36, letterSpacing: -0.28 },
  headlineLgMobile: { fontFamily: FONT.bold, fontSize: 24, lineHeight: 32 },
  headlineMd: { fontFamily: FONT.bold, fontSize: 20, lineHeight: 28 },
  bodyLg: { fontFamily: FONT.medium, fontSize: 18, lineHeight: 28 },
  bodyMd: { fontFamily: FONT.medium, fontSize: 15, lineHeight: 24 },
  bodySm: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 20 },
  labelLg: { fontFamily: FONT.bold, fontSize: 14, lineHeight: 20, letterSpacing: 0.28 },
  labelMd: { fontFamily: FONT.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.36 },
  labelSm: { fontFamily: FONT.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;

export const RADIUS = { sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, full: 9999 } as const;

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, gutter: 20, gutterMobile: 12 } as const;

/** Bu genişlikten itibaren web/tablet düzeni (üst menü) kullanılır */
export const WIDE_BREAKPOINT = 900;
export const MAX_CONTENT_WIDTH = 1280;

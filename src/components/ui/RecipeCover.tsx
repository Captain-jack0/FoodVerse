import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/tokens';

type RecipeCoverProps = {
  photoUrl: string | null | undefined;
  emoji: string;
  height: number;
  emojiSize: number;
  bg?: keyof ThemeColors;
  style?: StyleProp<ViewStyle>;
  /** Kapak üstündeki etiketler (absolute konumlu) */
  children?: ReactNode;
};

/** Tarif kapağı: fotoğraf varsa fotoğraf, yoksa büyük emoji */
export function RecipeCover({ photoUrl, emoji, height, emojiSize, bg = 'surfaceHigh', style, children }: RecipeCoverProps) {
  const { theme } = useKukkiTheme();
  return (
    <View style={[styles.cover, { height, backgroundColor: theme.colors[bg] }, style]}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : (
        <AppText style={{ fontSize: emojiSize, lineHeight: emojiSize * 1.2 }}>{emoji}</AppText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});

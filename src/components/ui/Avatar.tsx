import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT } from '@/theme/tokens';

type AvatarProps = {
  url: string | null | undefined;
  name: string;
  size: number;
};

/** Profil fotoğrafı; yoksa adın baş harfi */
export function Avatar({ url, name, size }: AvatarProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const initial = name.trim().charAt(0).toLocaleUpperCase('tr-TR') || '🍳';
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (url) {
    return <Image source={{ uri: url }} style={round} contentFit="cover" accessibilityLabel={`${name} profil fotoğrafı`} />;
  }
  return (
    <View style={[styles.fallback, round, { backgroundColor: c.primary }]} accessibilityLabel={`${name} profil fotoğrafı yok`}>
      <AppText style={{ color: c.onPrimary, fontFamily: FONT.bold, fontSize: size * 0.45, lineHeight: size * 0.6 }}>
        {initial}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});

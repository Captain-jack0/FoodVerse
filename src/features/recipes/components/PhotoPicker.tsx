import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { pickImage, type PickedImage } from '@/lib/imageUpload';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

export const RECIPE_PHOTO_MAX_BYTES = 3 * 1024 * 1024;

type PhotoPickerProps = {
  /** Kayıtlı fotoğraf (düzenlemede) */
  savedUrl: string | null;
  /** Yeni seçilen, henüz yüklenmemiş fotoğraf */
  pending: PickedImage | null;
  onPick: (image: PickedImage) => void;
  onRemove: () => void;
};

export function PhotoPicker({ savedUrl, pending, onPick, onRemove }: PhotoPickerProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [error, setError] = useState<string | null>(null);
  const preview = pending?.uri ?? savedUrl;

  const choose = async () => {
    setError(null);
    try {
      const result = await pickImage([4, 3], RECIPE_PHOTO_MAX_BYTES);
      if (result.ok) onPick(result.image);
      else if (result.message) setError(result.message);
    } catch (e) {
      console.warn('Fotoğraf seçilemedi', e);
      setError('Fotoğraf seçilemedi, tekrar dene.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="labelLg">Fotoğraf</AppText>
      {preview ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: preview }} style={styles.preview} contentFit="cover" accessibilityLabel="Tarif fotoğrafı" />
          <View style={styles.row}>
            <GameButton label="Değiştir" icon="photo-camera" variant="soft" onPress={choose} style={styles.flex} />
            <GameButton label="Kaldır" icon="delete-outline" variant="soft" onPress={onRemove} style={styles.flex} />
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tarif fotoğrafı ekle"
          onPress={choose}
          style={[styles.empty, { borderColor: c.outline, backgroundColor: c.surfaceLow }]}>
          <AppText style={styles.emptyEmoji}>📷</AppText>
          <AppText variant="labelLg" color="primary">
            Fotoğraf ekle
          </AppText>
          <AppText variant="bodySm" color="textMuted">
            İsteğe bağlı · en fazla 3 MB · yoksa seçtiğin simge görünür
          </AppText>
        </Pressable>
      )}
      {error && <FormError text={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SPACING.sm },
  previewWrap: { gap: SPACING.sm },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: RADIUS.lg },
  row: { flexDirection: 'row', gap: SPACING.sm },
  flex: { flex: 1 },
  empty: {
    alignItems: 'center',
    gap: 4,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyEmoji: { fontSize: 32, lineHeight: 40 },
});

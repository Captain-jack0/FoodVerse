import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

const BUCKET = 'avatars';
const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export type AvatarResult = { ok: true } | { ok: false; cancelled: boolean; message?: string };

/** Galeriden kare fotoğraf seçtirir, avatars/{uid}/ altına yükler ve profile yazar */
export async function pickAndUploadAvatar(userId: string, previousUrl: string | null): Promise<AvatarResult> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
  });
  if (picked.canceled || picked.assets.length === 0) return { ok: false, cancelled: true };

  const asset = picked.assets[0];
  const mime = asset.mimeType ?? 'image/jpeg';
  const ext = EXTENSIONS[mime];
  if (!ext) return { ok: false, cancelled: false, message: 'Sadece JPG, PNG ya da WEBP fotoğraf yükleyebilirsin.' };

  const body = await (await fetch(asset.uri)).arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return { ok: false, cancelled: false, message: 'Fotoğraf 2 MB’tan büyük; daha küçük bir fotoğraf seç.' };
  }

  // Her yüklemede yeni ad: tarayıcı/uygulama önbelleği eski fotoğrafı göstermesin
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const upload = await supabase.storage.from(BUCKET).upload(path, body, { contentType: mime });
  if (upload.error) throw upload.error;

  const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path).data;
  const update = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  if (update.error) throw update.error;

  // Eski fotoğrafı sil (başarısız olursa sorun değil, sadece yer kaplar)
  const oldPath = previousUrl?.split(`/object/public/${BUCKET}/`)[1];
  if (oldPath) {
    supabase.storage
      .from(BUCKET)
      .remove([oldPath])
      .then(({ error }) => error && console.warn('Eski avatar silinemedi', error));
  }
  return { ok: true };
}

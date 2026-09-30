import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export type PickedImage = { uri: string; mime: string; body: ArrayBuffer };

export type PickResult = { ok: true; image: PickedImage } | { ok: false; cancelled: boolean; message?: string };

/** Galeriden kırpılmış fotoğraf seçtirir; tür ve boyut depo sınırlarıyla aynı kontrol edilir */
export async function pickImage(aspect: [number, number], maxBytes: number): Promise<PickResult> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.6,
  });
  if (picked.canceled || picked.assets.length === 0) return { ok: false, cancelled: true };

  const asset = picked.assets[0];
  const mime = asset.mimeType ?? 'image/jpeg';
  if (!EXTENSIONS[mime]) return { ok: false, cancelled: false, message: 'Sadece JPG, PNG ya da WEBP fotoğraf yükleyebilirsin.' };

  const body = await (await fetch(asset.uri)).arrayBuffer();
  if (body.byteLength > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, cancelled: false, message: `Fotoğraf ${mb} MB’tan büyük; daha küçük bir fotoğraf seç.` };
  }
  return { ok: true, image: { uri: asset.uri, mime, body } };
}

/** {userId}/{önek}-{zaman}.{uzantı} yoluna yükler, herkese açık adresi döner */
export async function uploadImage(bucket: string, userId: string, prefix: string, image: PickedImage): Promise<string> {
  // Her yüklemede yeni ad: önbellek eski fotoğrafı göstermesin
  const path = `${userId}/${prefix}-${Date.now()}.${EXTENSIONS[image.mime]}`;
  const { error } = await supabase.storage.from(bucket).upload(path, image.body, { contentType: image.mime });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Eski dosyayı siler (başarısız olursa sadece yer kaplar, kullanıcıyı etkilemez) */
export function removeImageByUrl(bucket: string, publicUrl: string | null | undefined): void {
  const path = publicUrl?.split(`/object/public/${bucket}/`)[1];
  if (!path) return;
  supabase.storage
    .from(bucket)
    .remove([path])
    .then(({ error }) => error && console.warn('Eski fotoğraf silinemedi', error));
}

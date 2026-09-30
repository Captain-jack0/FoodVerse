import { pickImage, removeImageByUrl, uploadImage } from '@/lib/imageUpload';
import { supabase } from '@/lib/supabase';

const BUCKET = 'avatars';
const MAX_BYTES = 2 * 1024 * 1024;

export type AvatarResult = { ok: true } | { ok: false; cancelled: boolean; message?: string };

/** Galeriden kare fotoğraf seçtirir, avatars/{uid}/ altına yükler ve profile yazar */
export async function pickAndUploadAvatar(userId: string, previousUrl: string | null): Promise<AvatarResult> {
  const picked = await pickImage([1, 1], MAX_BYTES);
  if (!picked.ok) return picked;

  const publicUrl = await uploadImage(BUCKET, userId, 'avatar', picked.image);
  const update = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  if (update.error) throw update.error;

  removeImageByUrl(BUCKET, previousUrl);
  return { ok: true };
}

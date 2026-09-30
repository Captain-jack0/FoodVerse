import { Platform, Share } from 'react-native';

import { supabase } from '@/lib/supabase';

const PHOTO_BUCKETS = ['avatars', 'recipe-photos'];

/** Kullanıcının kendi klasöründeki tüm fotoğrafları siler */
async function removeMyPhotos(userId: string) {
  for (const bucket of PHOTO_BUCKETS) {
    const { data, error } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
    if (error) throw error;
    const paths = data.map((f) => `${userId}/${f.name}`);
    if (paths.length > 0) {
      const removed = await supabase.storage.from(bucket).remove(paths);
      if (removed.error) throw removed.error;
    }
  }
}

/** Fotoğraflar + hesap + (zincirleme) tüm veriler silinir, sonra oturum kapanır */
export async function deleteMyAccount(userId: string): Promise<void> {
  await removeMyPhotos(userId);
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  // Hesap artık yok; yerel oturumu da temizle (hata olsa bile giriş ekranına dönülür)
  await supabase.auth.signOut({ scope: 'local' });
}

// KVKK erişim hakkı: kişinin kendi verileri (RLS zaten sadece kendi satırlarını döndürür)
const OWN_TABLES: { key: string; table: string; column: string }[] = [
  { key: 'profil', table: 'profiles', column: 'id' },
  { key: 'ayarlar', table: 'profile_settings', column: 'id' },
  { key: 'kiler', table: 'pantry_items', column: 'user_id' },
  { key: 'tarifler', table: 'recipes', column: 'author_id' },
  { key: 'favoriler', table: 'favorites', column: 'user_id' },
  { key: 'pisirme_gecmisi', table: 'cook_logs', column: 'user_id' },
  { key: 'alisveris_listesi', table: 'shopping_items', column: 'user_id' },
  { key: 'yemek_plani', table: 'meal_plans', column: 'user_id' },
  { key: 'koleksiyonlar', table: 'collections', column: 'owner_id' },
  { key: 'yorumlar', table: 'comments', column: 'user_id' },
  { key: 'puanlar', table: 'ratings', column: 'user_id' },
  { key: 'sikayetlerim', table: 'reports', column: 'reporter_id' },
  { key: 'cezalar', table: 'user_penalties', column: 'user_id' },
];

export async function exportMyData(userId: string, email: string | undefined): Promise<Record<string, unknown>> {
  const results = await Promise.all(
    OWN_TABLES.map(async ({ key, table, column }) => {
      const { data, error } = await supabase.from(table).select('*').eq(column, userId);
      if (error) throw error;
      return [key, data] as const;
    }),
  );
  return { uygulama: 'Kukki Kitchen', olusturulma: new Date().toISOString(), eposta: email, ...Object.fromEntries(results) };
}

/** Web'de .json dosyası indirir; mobilde paylaş menüsünü açar */
export async function saveJson(filename: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: filename, message: json });
}

import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

type Preferences = Record<string, unknown>;

/**
 * Tanıtım turu hesap başına bir kez gösterilir.
 * Durum profile_settings.preferences.tour_done içinde saklanır (tüm cihazlarda geçerli).
 */
export function useWelcomeTour() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profile_settings')
      .select('preferences')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          // Okunamazsa turu gösterme; kullanıcıyı her açılışta rahatsız etmeyelim
          console.warn('Tur durumu okunamadı', error);
          return;
        }
        setPreferences((data.preferences as Preferences | null) ?? {});
      });
  }, [userId]);

  const visible = !dismissed && preferences !== null && preferences.tour_done !== true;

  const finish = () => {
    setDismissed(true);
    if (!userId || !preferences) return;
    supabase
      .from('profile_settings')
      .update({ preferences: { ...preferences, tour_done: true } })
      .eq('id', userId)
      .then(({ error }) => {
        if (error) console.warn('Tur durumu kaydedilemedi', error);
      });
  };

  return { visible, finish };
}

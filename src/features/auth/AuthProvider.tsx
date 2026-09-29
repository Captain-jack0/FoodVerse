import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak_days: number;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  /** İlk oturum kontrolü bitti mi (bitmeden yönlendirme yapılmaz) */
  initialized: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<Profile | null>(null);
  const [initialized, setInitialized] = useState(false);
  const userId = session?.user.id;
  // Çıkış yapınca ya da hesap değişince eski profil gösterilmesin
  const profile = loadedProfile?.id === userId ? loadedProfile : null;

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.warn('Oturum okunamadı', error);
        setSession(data.session);
      })
      .finally(() => setInitialized(true));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level, xp, streak_days')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) console.warn('Profil okunamadı', error);
        if (!cancelled) setLoadedProfile(data);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return <AuthContext.Provider value={{ session, profile, initialized }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return value;
}

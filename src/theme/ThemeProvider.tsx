import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { THEMES, type Theme, type ThemeId } from './tokens';

const STORAGE_KEY = 'kukki.themeId';

type ThemeContextValue = {
  theme: Theme;
  setThemeId: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeId(value: string | null): value is ThemeId {
  return value !== null && value in THEMES;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  // Kullanıcı seçim yapana kadar sistem temasını takip et
  const [chosenId, setChosenId] = useState<ThemeId | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isThemeId(stored)) setChosenId(stored);
      })
      .catch((error) => console.warn('Tema tercihi okunamadı', error));
  }, []);

  const setThemeId = (id: ThemeId) => {
    setChosenId(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch((error) =>
      console.warn('Tema tercihi kaydedilemedi', error),
    );
  };

  const themeId = chosenId ?? (scheme === 'dark' ? 'geceSefi' : 'cozy');

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useKukkiTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useKukkiTheme, ThemeProvider içinde kullanılmalı');
  return value;
}

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { ThemeProvider, useKukkiTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme } = useKukkiTheme();
  const { session, initialized } = useAuth();
  const signedIn = session !== null;

  useEffect(() => {
    if (initialized) SplashScreen.hideAsync();
  }, [initialized]);

  // Oturum kontrolü bitmeden ekran çizme (yanlış sayfaya sıçramasın)
  if (!initialized) return null;

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="tarif/yeni" />
          <Stack.Screen name="tarif/[id]" />
          <Stack.Screen name="pisir/[id]" />
          <Stack.Screen name="duzenle/[id]" />
          <Stack.Screen name="profil" />
          <Stack.Screen name="yonetim" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="giris" />
          <Stack.Screen name="kayit" />
          <Stack.Screen name="sifre-sifirla" />
        </Stack.Protected>
        {/* Sıfırlama bağlantısı oturum kurar; oturum varken de yokken de açılabilmeli */}
        <Stack.Screen name="yeni-sifre" />
        {/* Yasal metinler ve Hakkımızda herkese açık (mağaza incelemesi ve giriş öncesi okuma için) */}
        <Stack.Screen name="yasal/[doc]" />
        <Stack.Screen name="hakkimizda" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontError) console.warn('Fontlar yüklenemedi, sistem fontu kullanılıyor', fontError);
  }, [fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

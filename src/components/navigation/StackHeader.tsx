import { Stack } from 'expo-router';

import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT } from '@/theme/tokens';

/** Sekme dışı sayfalar için geri butonlu, temaya uygun başlık */
export function StackHeader({ title }: { title: string }) {
  const { theme } = useKukkiTheme();
  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontFamily: FONT.bold, color: theme.colors.text },
      }}
    />
  );
}

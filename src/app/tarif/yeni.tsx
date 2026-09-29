import { Stack } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT } from '@/theme/tokens';

export default function NewRecipeScreen() {
  const { theme } = useKukkiTheme();
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Yeni Tarif',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontFamily: FONT.bold, color: theme.colors.text },
        }}
      />
      <PlaceholderScreen
        icon="edit-note"
        eyebrow="Manuel Tarif Defteri"
        title="Kendi Tarifini Yaz"
        description="Malzemeler, adımlar ve püf noktalarıyla kendi tarifini defterine ekle."
      />
    </>
  );
}

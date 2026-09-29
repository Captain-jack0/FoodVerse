import { Tabs } from 'expo-router/js-tabs';

import { KukkiTabBar } from '@/components/navigation/KukkiTabBar';
import { MobileHeader } from '@/components/navigation/MobileHeader';
import { TABS } from '@/components/navigation/tabs';
import { useIsWide } from '@/hooks/useIsWide';

export default function TabsLayout() {
  const isWide = useIsWide();

  return (
    <Tabs
      tabBar={(props) => <KukkiTabBar {...props} />}
      screenOptions={{
        tabBarPosition: isWide ? 'top' : 'bottom',
        headerShown: !isWide,
        header: () => <MobileHeader />,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.webLabel }} />
      ))}
    </Tabs>
  );
}

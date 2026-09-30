import { Screen } from '@/components/Screen';
import { ShoppingListSection } from '@/features/shopping/ShoppingListSection';
import { useShoppingList } from '@/features/shopping/useShoppingList';

import { WeeklyPlanner } from './WeeklyPlanner';

/** Planlayıcı sekmesi: haftalık menü + aynı listeyi paylaşan alışveriş listesi */
export function PlannerScreen() {
  const shopping = useShoppingList();
  return (
    <Screen>
      <WeeklyPlanner shopping={shopping} />
      <ShoppingListSection list={shopping} />
    </Screen>
  );
}

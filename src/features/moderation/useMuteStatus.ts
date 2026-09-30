import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';

import { fetchActivePenalty, type ActivePenalty } from './moderationApi';

/** Oturumdaki kullanıcının topluluk cezası (varsa) */
export function useMuteStatus() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [penalty, setPenalty] = useState<ActivePenalty | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      fetchActivePenalty(userId).then(setPenalty, (e: unknown) => console.warn('Ceza durumu okunamadı', e));
    }, [userId]),
  );

  return { muted: penalty !== null, penalty };
}

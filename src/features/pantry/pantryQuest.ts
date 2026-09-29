import type { Quest } from './components/DailyQuestCard';
import { daysLeft } from './pantryUtils';
import type { PantryItem } from './types';

export const STARTER_QUEST_TARGET = 3;
const QUEST_XP = 50;

/**
 * Yeni kullanıcıya önce "kilerini doldur" görevi, sonra günlük "kurtarma" görevi.
 * ponytail: XP henüz hesaba yazılmıyor; sunucu fonksiyonu gelince ödül verilecek
 */
export function pantryQuest(items: PantryItem[], selectedIds: string[], today: Date = new Date()): Quest {
  if (items.length < STARTER_QUEST_TARGET) {
    return {
      label: 'İlk Görevin',
      title: 'Kilerini Doldur!',
      description: `Dolabındaki ${STARTER_QUEST_TARGET} malzemeyi ekle; tazelik takibi ve tarif önerileri açılsın.`,
      doneTitle: 'Kiler hazır! 🎉',
      doneDescription: 'Harika başlangıç!',
      current: items.length,
      target: STARTER_QUEST_TARGET,
      unit: 'Malzeme',
      xp: QUEST_XP,
    };
  }

  const expiring = items.filter((item) => daysLeft(item.expiresOn, today) <= 1);
  const rescued = expiring.filter((item) => selectedIds.includes(item.id)).length;
  return {
    label: 'Günlük Mutfak Görevi',
    title: expiring.length === 0 ? 'Her Şey Taze! 🌿' : 'Kurtarma Operasyonu!',
    description:
      expiring.length === 0
        ? 'Bugün bozulmak üzere olan malzeme yok, harika gidiyorsun!'
        : `Son kullanma tarihi yaklaşan ${expiring.length} malzemeyi tencereye at, israfı önle.`,
    doneTitle: 'Görev Tamam! 🎉',
    doneDescription: `${expiring.length} malzemeyi israftan kurtardın. Şimdi pişirme zamanı!`,
    current: rescued,
    target: expiring.length,
    unit: 'Malzeme',
    xp: QUEST_XP,
  };
}

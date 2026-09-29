/// <reference types="jest" />

import { pantryQuest, STARTER_QUEST_TARGET } from './pantryQuest';
import type { PantryItem } from './types';

const TODAY = new Date(2026, 8, 29);
const item = (id: string, expiresOn: string): PantryItem => ({
  id,
  name: id,
  emoji: '🥫',
  category: 'diger',
  quantity: '1',
  expiresOn,
});

describe('pantryQuest', () => {
  it('boş kilerde başlangıç görevini verir', () => {
    const quest = pantryQuest([], [], TODAY);
    expect(quest.title).toBe('Kilerini Doldur!');
    expect(quest).toMatchObject({ current: 0, target: STARTER_QUEST_TARGET });
  });

  it('yeterli malzeme varsa kurtarma görevine geçer ve seçilenleri sayar', () => {
    const items = [item('a', '2026-09-30'), item('b', '2026-09-29'), item('c', '2026-10-20')];
    const quest = pantryQuest(items, ['a', 'c'], TODAY);
    expect(quest.title).toBe('Kurtarma Operasyonu!');
    expect(quest).toMatchObject({ current: 1, target: 2 });
  });

  it('bozulacak malzeme yoksa her şey taze der', () => {
    const items = [item('a', '2026-10-10'), item('b', '2026-10-11'), item('c', '2026-10-20')];
    expect(pantryQuest(items, [], TODAY).title).toBe('Her Şey Taze! 🌿');
  });
});

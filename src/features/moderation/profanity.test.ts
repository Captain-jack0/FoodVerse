/// <reference types="jest" />

import { containsProfanity } from './profanity';

describe('containsProfanity', () => {
  it.each(['Bu tarif berbat amk', 'siktir git', 's1ktir', 'tam bir PEZEVENK', 'orospuluk yapma'])(
    'yakalar: %s',
    (text) => {
      expect(containsProfanity(text)).toBe(true);
    },
  );

  // Kelime içinde geçen masum köklere takılmamalı
  it.each([
    'Mercimek çorbası harika oldu',
    'Tencereyi ocağa götür',
    'Sikke gibi yuvarlak kes',
    'Ameliyat sonrası hafif yemek',
    'Kısık ateşte 10 dakika pişir',
    'Mükemmel bir akşam yemeği',
    '',
  ])('temiz: %s', (text) => {
    expect(containsProfanity(text)).toBe(false);
  });
});

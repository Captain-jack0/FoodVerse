/// <reference types="jest" />

import { parseCommand, parseMinutes, stepDurationMinutes } from './commands';

describe('parseMinutes', () => {
  it.each([
    ['10 dakika', 10],
    ['on beş dakika', 15],
    ['yirmi dk', 20],
    ['yarım saat', 30],
    ['1 saat', 60],
    ['bir buçuk saat', 90],
    ['iki saat', 120],
    ['5 dk', 5],
  ])('%s → %i', (text, minutes) => {
    expect(parseMinutes(text)).toBe(minutes);
  });

  it('süre yoksa null', () => {
    expect(parseMinutes('soğanları doğra')).toBeNull();
  });
});

describe('stepDurationMinutes', () => {
  it('adım metnindeki süreyi bulur', () => {
    expect(stepDurationMinutes('Kısık ateşte 10-12 dakika pişir.')).toBe(12);
    expect(stepDurationMinutes('Fırında yarım saat kızart.')).toBe(30);
    expect(stepDurationMinutes('Karıştır.')).toBeNull();
  });
});

describe('parseCommand', () => {
  it.each([
    ['sonraki', { type: 'next' }],
    ['Sonraki adım lütfen', { type: 'next' }],
    ['devam et', { type: 'next' }],
    ['geç', { type: 'next' }],
    ['önceki adım', { type: 'prev' }],
    ['geri dön', { type: 'prev' }],
    ['tekrar et', { type: 'repeat' }],
    ['bir daha oku', { type: 'repeat' }],
    ['malzemeleri oku', { type: 'ingredients' }],
    ['10 dakika zamanlayıcı kur', { type: 'timer', minutes: 10 }],
    ['zamanlayıcı başlat on beş dakika', { type: 'timer', minutes: 15 }],
    ['zamanlayıcıyı başlat', { type: 'timer', minutes: null }],
    ['zamanlayıcıyı iptal et', { type: 'cancelTimer' }],
    ['zamanlayıcıyı durdur', { type: 'cancelTimer' }],
    ['kaç dakika kaldı', { type: 'timeLeft' }],
    ['sus', { type: 'stopSpeaking' }],
    ['pişirdim', { type: 'finish' }],
    ['yemek bitti', { type: 'finish' }],
  ])('"%s"', (text, expected) => {
    expect(parseCommand(text)).toEqual(expected);
  });

  it('anlaşılmayan konuşmada null', () => {
    expect(parseCommand('bugün hava çok güzel')).toBeNull();
    expect(parseCommand('')).toBeNull();
  });
});

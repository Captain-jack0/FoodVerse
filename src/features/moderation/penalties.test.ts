/// <reference types="jest" />

import { isPermissionError, isProfanityError, nextPenaltyLabel, penaltyUntilText } from './penalties';

describe('nextPenaltyLabel', () => {
  it.each([
    [0, '1 saat'],
    [1, '1 gün'],
    [2, '1 hafta'],
    [3, '1 ay'],
    [4, '1 yıl'],
    [5, 'kalıcı'],
    [9, 'kalıcı'],
  ])('%i önceki ceza → %s', (count, label) => {
    expect(nextPenaltyLabel(count)).toBe(label);
  });
});

describe('penaltyUntilText', () => {
  it('kalıcı ve süreli cezayı yazar', () => {
    expect(penaltyUntilText(null)).toBe('kalıcı olarak');
    expect(penaltyUntilText('2026-10-01T15:30:00')).toBe('1 Eki 15:30 tarihine kadar');
  });
});

describe('hata ayırt etme', () => {
  it('küfür ve yetki hatalarını tanır', () => {
    expect(isProfanityError({ message: 'KUFUR_ENGELI' })).toBe(true);
    expect(isProfanityError(new Error('başka'))).toBe(false);
    expect(isPermissionError({ code: '42501' })).toBe(true);
    expect(isPermissionError({ code: '23505' })).toBe(false);
  });
});

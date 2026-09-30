/// <reference types="jest" />

import { timeAgo, validateComment } from './commentUtils';

const NOW = new Date('2026-09-30T12:00:00Z');

describe('timeAgo', () => {
  it.each([
    ['2026-09-30T11:59:40Z', 'az önce'],
    ['2026-09-30T11:55:00Z', '5 dakika önce'],
    ['2026-09-30T09:00:00Z', '3 saat önce'],
    ['2026-09-29T12:00:00Z', 'dün'],
    ['2026-09-26T12:00:00Z', '4 gün önce'],
    ['2026-09-09T12:00:00Z', '3 hafta önce'],
    ['2026-06-30T12:00:00Z', '3 ay önce'],
    ['2024-09-30T12:00:00Z', '2 yıl önce'],
  ])('%s → %s', (iso, text) => {
    expect(timeAgo(iso, NOW)).toBe(text);
  });
});

describe('validateComment', () => {
  it('boş ve çok uzun yorumu reddeder', () => {
    expect(validateComment('   ')).toBe('Bir şeyler yaz.');
    expect(validateComment('a'.repeat(1001))).toBe('Yorum en fazla 1000 karakter olabilir.');
    expect(validateComment('Harika tarif!')).toBeNull();
  });
});

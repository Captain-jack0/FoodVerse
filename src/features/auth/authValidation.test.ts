/// <reference types="jest" />

import { authErrorMessage, passwordStrength, validateSignIn, validateSignUp } from './authValidation';

describe('passwordStrength', () => {
  it.each([
    ['', 0],
    ['abc', 0],
    ['abcdefgh', 1],
    ['abcdefg1', 2],
    ['Abcdefg1', 2],
    ['Abcdefg1!xyz', 3],
  ])('%s → %i', (pw, score) => {
    expect(passwordStrength(pw)).toBe(score);
  });
});

describe('validateSignIn', () => {
  it('geçerli girdide hata yok', () => {
    expect(validateSignIn({ email: 'sef@kukki.com', password: 'x' })).toEqual({});
  });

  it('boş ve hatalı e-posta', () => {
    expect(validateSignIn({ email: '', password: '' })).toEqual({
      email: 'E-posta adresini yaz.',
      password: 'Şifreni yaz.',
    });
    expect(validateSignIn({ email: 'sef@', password: 'x' }).email).toBe('Geçerli bir e-posta adresi yaz.');
  });
});

describe('validateSignUp', () => {
  const valid = { displayName: 'Şef Deniz', email: ' deniz@kukki.com ', password: 'lezzetli1', acceptedTerms: true };

  it('geçerli girdide hata yok', () => {
    expect(validateSignUp(valid)).toEqual({});
  });

  it('kısa ad, kısa şifre ve onaysız koşullar', () => {
    expect(validateSignUp({ ...valid, displayName: ' a ', password: 'kisa', acceptedTerms: false })).toEqual({
      displayName: 'Adın en az 2 karakter olmalı.',
      password: 'Şifren en az 8 karakter olmalı.',
      acceptedTerms: 'Devam etmek için koşulları kabul etmelisin.',
    });
  });

  it('çok uzun ad', () => {
    expect(validateSignUp({ ...valid, displayName: 'a'.repeat(41) }).displayName).toBe('Adın en fazla 40 karakter olabilir.');
  });
});

describe('authErrorMessage', () => {
  it.each([
    ['invalid_credentials', 'E-posta veya şifre hatalı.'],
    ['user_already_exists', 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.'],
    ['email_not_confirmed', 'E-postanı henüz onaylamadın. Gelen kutunu kontrol et.'],
  ])('%s', (code, message) => {
    expect(authErrorMessage({ code })).toBe(message);
  });

  it('bilinmeyen hatada genel mesaj', () => {
    expect(authErrorMessage(new Error('boom'))).toBe('Bir şeyler ters gitti. Lütfen tekrar dene.');
    expect(authErrorMessage(null)).toBe('Bir şeyler ters gitti. Lütfen tekrar dene.');
  });
});

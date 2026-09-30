/// <reference types="jest" />

import {
  authErrorMessage,
  linkErrorMessage,
  parseAuthTokens,
  passwordStrength,
  validateNewPassword,
  validateSignIn,
  validateSignUp,
} from './authValidation';

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

describe('validateNewPassword', () => {
  it('kısa şifreyi ve eşleşmeyen tekrarı reddeder', () => {
    expect(validateNewPassword('kisa', 'kisa')).toEqual({ password: 'Şifren en az 8 karakter olmalı.' });
    expect(validateNewPassword('lezzetli1', 'lezzetli2')).toEqual({ confirm: 'Şifreler aynı değil.' });
    expect(validateNewPassword('lezzetli1', 'lezzetli1')).toEqual({});
  });
});

describe('parseAuthTokens', () => {
  it('bağlantının # kısmından oturum bilgisini çıkarır', () => {
    expect(
      parseAuthTokens('kukkikitchen://yeni-sifre#access_token=AAA&expires_in=3600&refresh_token=RRR&type=recovery'),
    ).toEqual({ accessToken: 'AAA', refreshToken: 'RRR', type: 'recovery' });
  });

  it('hata ya da eksik bilgi varsa null', () => {
    expect(parseAuthTokens('kukkikitchen://yeni-sifre#error=access_denied&error_code=otp_expired')).toBeNull();
    expect(parseAuthTokens('kukkikitchen://yeni-sifre')).toBeNull();
  });

  it('süresi dolmuş bağlantı hatasını tanır', () => {
    expect(linkErrorMessage('https://x/yeni-sifre#error=access_denied&error_code=otp_expired')).toBe(
      'Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir sıfırlama e-postası iste.',
    );
    expect(linkErrorMessage('https://x/yeni-sifre')).toBeNull();
  });
});

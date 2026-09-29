export const PASSWORD_MIN = 8;
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 40;

// Kaba biçim kontrolü; asıl doğrulama Supabase'de
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 0: zayıf, 1: kolay, 2: lezzetli, 3: kırılmaz */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length < PASSWORD_MIN) return 0;
  const kinds = [/[a-zçğıöşü]/i, /\d/, /[^a-z0-9çğıöşü]/i].filter((re) => re.test(password)).length;
  if (kinds >= 3 && password.length >= 10) return 3;
  if (kinds >= 2) return 2;
  return 1;
}

type Errors<K extends string> = Partial<Record<K, string>>;

function emailError(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'E-posta adresini yaz.';
  if (!EMAIL.test(value)) return 'Geçerli bir e-posta adresi yaz.';
  return undefined;
}

function compact<K extends string>(errors: Record<K, string | undefined>): Errors<K> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v !== undefined)) as Errors<K>;
}

export type SignInInput = { email: string; password: string };

export function validateSignIn({ email, password }: SignInInput): Errors<keyof SignInInput> {
  return compact({
    email: emailError(email),
    password: password ? undefined : 'Şifreni yaz.',
  });
}

export type SignUpInput = { displayName: string; email: string; password: string; acceptedTerms: boolean };

export function validateSignUp(input: SignUpInput): Errors<keyof SignUpInput> {
  const name = input.displayName.trim();
  return compact({
    displayName:
      name.length < DISPLAY_NAME_MIN
        ? `Adın en az ${DISPLAY_NAME_MIN} karakter olmalı.`
        : name.length > DISPLAY_NAME_MAX
          ? `Adın en fazla ${DISPLAY_NAME_MAX} karakter olabilir.`
          : undefined,
    email: emailError(input.email),
    password: input.password.length < PASSWORD_MIN ? `Şifren en az ${PASSWORD_MIN} karakter olmalı.` : undefined,
    acceptedTerms: input.acceptedTerms ? undefined : 'Devam etmek için koşulları kabul etmelisin.',
  });
}

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'E-posta veya şifre hatalı.',
  user_already_exists: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.',
  email_exists: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.',
  email_not_confirmed: 'E-postanı henüz onaylamadın. Gelen kutunu kontrol et.',
  weak_password: 'Bu şifre çok zayıf, biraz daha baharat ekle.',
  email_address_invalid: 'Bu e-posta adresi kabul edilmedi.',
  over_email_send_rate_limit: 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.',
  over_request_rate_limit: 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.',
};

/** Supabase hata kodunu kullanıcıya gösterilecek Türkçe mesaja çevirir */
export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return AUTH_ERRORS[code] ?? 'Bir şeyler ters gitti. Lütfen tekrar dene.';
}

import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { SPACING } from '@/theme/tokens';

import { authErrorMessage, validateSignIn, type SignInInput } from './authValidation';
import { AuthShell } from './components/AuthShell';
import { FeatureRow } from './components/FeatureRow';
import { FormError } from '@/components/ui/FormError';

function SignInHero() {
  return (
    <>
      <AppText style={styles.heroEmoji}>🧑‍🍳✨</AppText>
      <AppText variant="headlineXl">Tekrar Hoş Geldin, Şef!</AppText>
      <AppText variant="bodyLg" color="textMuted">
        Kilerinde seni bekleyen taze malzemeler ve yarım kalan tarif defterin burada.
      </AppText>
      <FeatureRow
        icon="card-giftcard"
        iconBg="secondaryContainer"
        title="Günlük Giriş Bonusu"
        text="Her gün mutfağa uğra, serini büyüt!"
      />
    </>
  );
}

export function SignInScreen() {
  const [form, setForm] = useState<SignInInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SignInInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof SignInInput) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  };

  const submit = async () => {
    const found = validateSignIn(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    // Başarılıysa AuthProvider oturumu yakalar ve yönlendirme otomatik olur
    if (error) setFormError(authErrorMessage(error));
  };

  return (
    <AuthShell hero={<SignInHero />}>
      <View style={styles.header}>
        <AppText variant="labelMd" color="primary">
          MUTFAK KAPISI
        </AppText>
        <AppText variant="headlineXlMobile">Giriş Yap</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Mutfak serüvenine kaldığın yerden lezzetle devam et.
        </AppText>
      </View>

      <TextField
        label="E-posta Adresi"
        icon="mail-outline"
        value={form.email}
        onChangeText={update('email')}
        error={errors.email}
        placeholder="sef@ornek.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={254}
      />
      <TextField
        label="Şifre"
        icon="lock-outline"
        secret
        value={form.password}
        onChangeText={update('password')}
        onSubmitEditing={submit}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="current-password"
        maxLength={72}
      />

      {formError && <FormError text={formError} />}

      <GameButton label={loading ? 'Kapı açılıyor...' : 'Mutfağa Giriş Yap 🚀'} variant="accent" onPress={submit} disabled={loading} />

      <View style={styles.footer}>
        <AppText variant="bodyMd" color="textMuted">
          Hesabın yok mu?
        </AppText>
        <Link href="/kayit">
          <AppText variant="labelLg" color="primary">
            Kayıt Ol
          </AppText>
        </Link>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heroEmoji: { fontSize: 56, lineHeight: 68 },
  header: { gap: 4, marginBottom: SPACING.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: SPACING.sm },
});

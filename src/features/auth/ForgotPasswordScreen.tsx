import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { SPACING } from '@/theme/tokens';

import { authErrorMessage, validateSignIn } from './authValidation';
import { AuthShell } from './components/AuthShell';

/** E-postadaki bağlantının açacağı adres (web: aynı site, mobil: kukkikitchen://) */
function resetRedirectUrl() {
  return Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/yeni-sifre`
    : Linking.createURL('/yeni-sifre');
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const problem = validateSignIn({ email, password: 'x' }).email;
    if (problem) {
      setError(problem);
      return;
    }
    setSending(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: resetRedirectUrl(),
    });
    setSending(false);
    // Hesap var mı yok mu belli etmemek için başarılı gibi davran; sadece hız sınırı vb. hataları göster
    if (resetError && resetError.status !== 400 && resetError.status !== 404) {
      setError(authErrorMessage(resetError));
      return;
    }
    setSent(true);
  };

  const hero = (
    <>
      <AppText style={styles.heroEmoji}>🔑</AppText>
      <AppText variant="headlineXl">Şifreni mi unuttun?</AppText>
      <AppText variant="bodyLg" color="textMuted">
        Olur öyle şeyler, şef! E-postana bir sıfırlama bağlantısı gönderelim.
      </AppText>
    </>
  );

  if (sent) {
    return (
      <AuthShell hero={hero}>
        <AppText style={styles.heroEmoji}>📬</AppText>
        <AppText variant="headlineLg">E-postanı kontrol et</AppText>
        <AppText variant="bodyMd" color="textMuted">
          {email.trim()} adresiyle bir hesap varsa, birkaç dakika içinde şifre sıfırlama bağlantısı gelecek.
          Gelmezse spam klasörüne de bak.
        </AppText>
        <Link href="/giris">
          <AppText variant="labelLg" color="primary">
            Giriş sayfasına dön
          </AppText>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell hero={hero}>
      <View style={styles.header}>
        <AppText variant="headlineXlMobile">Şifre Sıfırlama</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Hesabının e-posta adresini yaz, sana yeni şifre belirleme bağlantısı gönderelim.
        </AppText>
      </View>
      <TextField
        label="E-posta Adresi"
        icon="mail-outline"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setError(null);
        }}
        onSubmitEditing={submit}
        placeholder="sef@ornek.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={254}
      />
      {error && <FormError text={error} />}
      <GameButton label={sending ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'} icon="send" onPress={submit} disabled={sending} />
      <Link href="/giris" style={styles.back}>
        <AppText variant="labelLg" color="primary">
          ← Giriş sayfasına dön
        </AppText>
      </Link>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heroEmoji: { fontSize: 56, lineHeight: 68 },
  header: { gap: 4, marginBottom: SPACING.sm },
  back: { alignSelf: 'center' },
});

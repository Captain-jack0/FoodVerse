import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { SPACING } from '@/theme/tokens';

import { useAuth } from './AuthProvider';
import { authErrorMessage, linkErrorMessage, parseAuthTokens, validateNewPassword } from './authValidation';
import { AuthShell } from './components/AuthShell';
import { PasswordMeter } from './components/PasswordMeter';

const INVALID_LINK = 'Bu bağlantı geçersiz ya da süresi dolmuş. Yeni bir sıfırlama e-postası iste.';

/** E-postadaki sıfırlama bağlantısının açtığı ekran */
export function NewPasswordScreen() {
  const { session } = useAuth();
  const url = Linking.useLinkingURL();
  const [sessionError, setSessionError] = useState<string | null>(null);
  // Mobilde bağlantı Supabase'den hata ile döndüyse (örn. süresi dolmuş)
  const linkError = sessionError ?? (Platform.OS !== 'web' && url ? linkErrorMessage(url) : null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'password' | 'confirm', string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Web'de oturumu supabase-js adresten kendisi kurar; mobilde bağlantıdaki bilgiyle elle kurulur
  useEffect(() => {
    if (Platform.OS === 'web' || !url || session) return;
    const tokens = parseAuthTokens(url);
    if (!tokens) return;
    supabase.auth
      .setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken })
      .then(({ error }) => error && setSessionError(INVALID_LINK));
  }, [url, session]);

  const save = async () => {
    const found = validateNewPassword(password, confirm);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    setDone(true);
  };

  const hero = (
    <>
      <AppText style={styles.heroEmoji}>🔐</AppText>
      <AppText variant="headlineXl">Yeni şifre, yeni sayfa!</AppText>
      <AppText variant="bodyLg" color="textMuted">
        Güçlü bir şifre seç; mutfağın güvende kalsın.
      </AppText>
    </>
  );

  if (done) {
    return (
      <AuthShell hero={hero}>
        <AppText style={styles.heroEmoji}>✅</AppText>
        <AppText variant="headlineLg">Şifren güncellendi</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Artık yeni şifrenle giriş yapabilirsin.
        </AppText>
        <GameButton label="Mutfağa Dön" icon="kitchen" onPress={() => router.replace('/')} />
      </AuthShell>
    );
  }

  if (!session) {
    return (
      <AuthShell hero={hero}>
        <AppText variant="headlineLg">Bağlantı kontrol ediliyor…</AppText>
        <AppText variant="bodyMd" color="textMuted">
          {linkError ?? 'Sayfa uzun süre böyle kalırsa bağlantının süresi dolmuş olabilir.'}
        </AppText>
        <GameButton label="Yeni Bağlantı İste" variant="soft" onPress={() => router.replace('/sifre-sifirla')} />
      </AuthShell>
    );
  }

  return (
    <AuthShell hero={hero}>
      <View style={styles.header}>
        <AppText variant="headlineXlMobile">Yeni Şifre Belirle</AppText>
        <AppText variant="bodyMd" color="textMuted">
          {session.user.email} hesabı için yeni şifreni yaz.
        </AppText>
      </View>
      <TextField
        label="Yeni Şifre"
        icon="key"
        secret
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setErrors({});
        }}
        error={errors.password}
        placeholder="En az 8 karakter"
        autoComplete="new-password"
        maxLength={72}
      />
      <PasswordMeter password={password} />
      <TextField
        label="Yeni Şifre (Tekrar)"
        icon="key"
        secret
        value={confirm}
        onChangeText={(v) => {
          setConfirm(v);
          setErrors({});
        }}
        onSubmitEditing={save}
        error={errors.confirm}
        autoComplete="new-password"
        maxLength={72}
      />
      {formError && <FormError text={formError} />}
      <GameButton label={saving ? 'Kaydediliyor...' : 'Şifremi Güncelle'} icon="lock-reset" onPress={save} disabled={saving} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heroEmoji: { fontSize: 56, lineHeight: 68 },
  header: { gap: 4, marginBottom: SPACING.sm },
});

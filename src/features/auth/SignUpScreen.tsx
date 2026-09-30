import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { PREFERENCES, type PreferenceId } from '@/features/recommend/preferences';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { authErrorMessage, DISPLAY_NAME_MAX, validateSignUp, type SignUpInput } from './authValidation';
import { AuthShell } from './components/AuthShell';
import { FeatureRow } from './components/FeatureRow';
import { FormError } from '@/components/ui/FormError';
import { PasswordMeter } from './components/PasswordMeter';

function SignUpHero() {
  return (
    <>
      <AppText variant="headlineXl">Kendi Sanal Mutfağını Kur, İsrafı Önle, Eğlenerek Pişir!</AppText>
      <AppText variant="bodyLg" color="textMuted">
        Kukki Kitchen ile yemek pişirmek bir angarya değil; lezzetli, sakinleştirici ve ödüllendirici bir oyun
        yolculuğu.
      </AppText>
      <FeatureRow icon="link" iconBg="surfaceHigh" title="Tek Tıkla Tarif İçe Aktar" text="Reels/TikTok tariflerini defterine aktar." />
      <FeatureRow icon="kitchen" iconBg="secondaryContainer" title="Akıllı Kiler & Sıfır İsraf" text="Dolabındakilerle sana özel menü önerileri al." />
      <FeatureRow icon="mic" iconBg="primaryContainer" title="Eller Serbest Sesli Asistan" text="Ellerini kirletmeden adım adım tarif takip et." />
    </>
  );
}

export function SignUpScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [form, setForm] = useState<SignUpInput>({ displayName: '', email: '', password: '', acceptedTerms: false });
  const [preferences, setPreferences] = useState<PreferenceId[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const update = <K extends keyof SignUpInput>(key: K, value: SignUpInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  };

  const togglePreference = (id: PreferenceId) =>
    setPreferences((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const submit = async () => {
    const found = validateSignUp(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { display_name: form.displayName.trim(), preferences } },
    });

    if (error) {
      setLoading(false);
      setFormError(authErrorMessage(error));
      return;
    }

    if (data.session && preferences.length > 0) {
      const { error: prefError } = await supabase
        .from('profile_settings')
        .update({ preferences: { tags: preferences } })
        .eq('id', data.session.user.id);
      // Tercihler isteğe bağlı; kayıt başarılı olduğu için akışı durdurmuyoruz
      if (prefError) console.warn('Tercihler kaydedilemedi', prefError);
    }
    setLoading(false);
    // Oturum varsa AuthProvider yönlendirir; yoksa e-posta onayı bekleniyor
    if (!data.session) setNeedsConfirmation(true);
  };

  if (needsConfirmation) {
    return (
      <AuthShell hero={<SignUpHero />}>
        <AppText style={styles.bigEmoji}>📬</AppText>
        <AppText variant="headlineLg">E-postanı kontrol et!</AppText>
        <AppText variant="bodyMd" color="textMuted">
          {form.email.trim()} adresine bir onay linki gönderdik. Linke tıkladıktan sonra giriş yapabilirsin.
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
    <AuthShell hero={<SignUpHero />}>
      <View style={styles.header}>
        <View style={[styles.gift, { backgroundColor: c.secondaryContainer }]}>
          <AppText variant="labelSm" color="onSecondaryContainer">
            🎁 1. Seviye Çırak Şef olarak başla
          </AppText>
        </View>
        <AppText variant="headlineXlMobile">Mutfak Ailesine Katıl 🍲</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Ücretsiz hesabını oluştur ve ilk tarifini pişirmeye hemen başla.
        </AppText>
      </View>

      <TextField
        label="Adın / Şef Takma Adın"
        icon="soup-kitchen"
        required
        value={form.displayName}
        onChangeText={(v) => update('displayName', v)}
        error={errors.displayName}
        placeholder="örn. Şef Deniz"
        autoComplete="name"
        maxLength={DISPLAY_NAME_MAX}
      />
      <TextField
        label="E-posta Adresi"
        icon="mail-outline"
        required
        value={form.email}
        onChangeText={(v) => update('email', v)}
        error={errors.email}
        placeholder="deniz@ornek.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={254}
      />
      <TextField
        label="Şifre"
        icon="key"
        required
        secret
        value={form.password}
        onChangeText={(v) => update('password', v)}
        error={errors.password}
        placeholder="En az 8 karakter"
        autoComplete="new-password"
        maxLength={72}
      />
      <PasswordMeter password={form.password} />

      <View style={styles.prefs}>
        <View style={styles.prefsHeader}>
          <AppText variant="labelLg">Mutfak Tercihleri (İsteğe Bağlı)</AppText>
          <AppText variant="bodySm" color="textMuted">
            Birden fazla seçilebilir
          </AppText>
        </View>
        <View style={styles.chips}>
          {PREFERENCES.map((p) => (
            <Chip key={p.id} label={p.label} selected={preferences.includes(p.id)} onPress={() => togglePreference(p.id)} />
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.acceptedTerms }}
        onPress={() => update('acceptedTerms', !form.acceptedTerms)}
        style={styles.terms}>
        <View
          style={[
            styles.checkbox,
            { borderColor: errors.acceptedTerms ? c.error : c.primary },
            form.acceptedTerms && { backgroundColor: c.primary },
          ]}>
          {form.acceptedTerms && <MaterialIcons name="check" size={16} color={c.onPrimary} />}
        </View>
        {/* ponytail: Kullanım Koşulları ve KVKK metni yazılınca linklenecek */}
        <AppText variant="bodySm" color="textMuted" style={styles.flex}>
          Kukki Kitchen Kullanım Koşullarını ve Gizlilik Politikasını kabul ediyorum.
        </AppText>
      </Pressable>
      {errors.acceptedTerms && (
        <AppText variant="bodySm" color="error">
          {errors.acceptedTerms}
        </AppText>
      )}

      {formError && <FormError text={formError} />}

      <GameButton label={loading ? 'Mutfak hazırlanıyor...' : 'Mutfağımı Oluştur ve Başla'} onPress={submit} disabled={loading} />

      <View style={styles.footer}>
        <AppText variant="bodyMd" color="textMuted">
          Zaten bir hesabın var mı?
        </AppText>
        <Link href="/giris">
          <AppText variant="labelLg" color="primary">
            Giriş Yap
          </AppText>
        </Link>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginBottom: SPACING.xs },
  gift: { alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  prefs: { gap: SPACING.sm },
  prefsHeader: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  terms: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  bigEmoji: { fontSize: 56, lineHeight: 68 },
});

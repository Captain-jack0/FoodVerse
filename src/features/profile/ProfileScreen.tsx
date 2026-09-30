import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { GameButton } from '@/components/ui/GameButton';
import { FormError } from '@/components/ui/FormError';
import { useAuth } from '@/features/auth/AuthProvider';
import { levelTitle } from '@/features/gamification/levels';
import { LegalLinks } from '@/features/legal/LegalLinks';
import { AccountSection } from '@/features/profile/AccountSection';
import { pickAndUploadAvatar } from '@/features/profile/avatarApi';
import { PreferencesEditor } from '@/features/recommend/components/PreferencesEditor';
import { supabase } from '@/lib/supabase';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, THEMES, type ThemeId } from '@/theme/tokens';

export function ProfileScreen() {
  const { theme, setThemeId } = useKukkiTheme();
  const c = theme.colors;
  const { session, profile, refreshProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePhoto = async () => {
    if (!session) return;
    setUploading(true);
    setError(null);
    try {
      const result = await pickAndUploadAvatar(session.user.id, profile?.avatar_url ?? null);
      if (result.ok) refreshProfile();
      else if (result.message) setError(result.message);
    } catch (e) {
      console.warn('Profil fotoğrafı yüklenemedi', e);
      setError('Fotoğraf yüklenemedi, internet bağlantını kontrol edip tekrar dene.');
    } finally {
      setUploading(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    // Başarılıysa AuthProvider giriş ekranına yönlendirir
    if (signOutError) {
      console.warn('Çıkış yapılamadı', signOutError);
      setError('Çıkış yapılamadı, internet bağlantını kontrol edip tekrar dene.');
      setSigningOut(false);
    }
  };

  return (
    <>
      <StackHeader title="Profil & Ayarlar" />
      <Screen>
        <View style={[styles.card, { backgroundColor: c.surfaceLow }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profil fotoğrafını değiştir"
            onPress={changePhoto}
            disabled={uploading}
            style={styles.avatarWrap}>
            <Avatar url={profile?.avatar_url} name={profile?.display_name ?? 'Şef'} size={72} />
            <View style={[styles.cameraBadge, { backgroundColor: c.secondaryContainer }]}>
              <MaterialIcons name={uploading ? 'hourglass-top' : 'photo-camera'} size={16} color={c.onSecondaryContainer} />
            </View>
          </Pressable>
          <View style={styles.flex}>
            <AppText variant="headlineLgMobile">{profile?.display_name ?? 'Şef'}</AppText>
            <AppText variant="bodySm" color="textMuted">
              {session?.user.email}
            </AppText>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat label="Seviye" value={`${profile?.level ?? 1} · ${levelTitle(profile?.level ?? 1)}`} />
          <Stat label="Şef Puanı" value={`${profile?.xp ?? 0} XP`} />
          <Stat label="Seri" value={`🔥 ${profile?.streak_days ?? 0} gün`} />
        </View>

        {session && <PreferencesEditor userId={session.user.id} />}

        <AppText variant="headlineMd">Mutfak Teması</AppText>
        <View style={styles.themes}>
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const selected = theme.id === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setThemeId(id)}
                style={[
                  styles.themeCard,
                  { backgroundColor: c.card, borderColor: selected ? c.primary : c.outline },
                ]}>
                <View style={styles.swatches}>
                  {[t.colors.primary, t.colors.primaryContainer, t.colors.secondaryContainer, t.colors.background].map(
                    (color) => (
                      <View key={color} style={[styles.swatch, { backgroundColor: color, borderColor: c.outline }]} />
                    ),
                  )}
                </View>
                <View style={styles.flex}>
                  <AppText variant="labelLg">{t.name}</AppText>
                  <AppText variant="bodySm" color="textMuted">
                    {t.description}
                  </AppText>
                </View>
                {selected && <MaterialIcons name="check-circle" size={22} color={c.primary} />}
              </Pressable>
            );
          })}
        </View>

        {profile?.is_admin && (
          <GameButton label="🛡️ Yönetici Paneli" variant="sunny" onPress={() => router.push('/yonetim')} />
        )}

        {error && <FormError text={error} />}
        <GameButton label={signingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'} icon="logout" variant="soft" onPress={signOut} disabled={signingOut} />

        {session && <AccountSection userId={session.user.id} email={session.user.email} />}
        <LegalLinks />
      </Screen>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useKukkiTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.colors.card }]}>
      <AppText variant="labelSm" color="textMuted">
        {label}
      </AppText>
      <AppText variant="labelLg">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.xl },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  stat: { flexGrow: 1, flexBasis: 140, padding: SPACING.md, borderRadius: RADIUS.lg, gap: 2 },
  themes: { gap: SPACING.sm },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
  },
  swatches: { flexDirection: 'row' },
  swatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, marginLeft: -6 },
});

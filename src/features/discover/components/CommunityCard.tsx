import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { FormError } from '@/components/ui/FormError';
import { levelTitle } from '@/features/gamification/levels';
import type { RecipeAuthor } from '@/features/recipes/recipesApi';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { fetchPublicStats, rateRecipe, type PublicStats } from '../discoverApi';
import { StarPicker, StarRating } from './Stars';

type CommunityCardProps = {
  recipeId: string;
  isMine: boolean;
  isPublic: boolean;
  author: RecipeAuthor | null;
};

/** Tarif detayında: yazar, topluluk puanı, kayıt/pişirme sayıları ve puan verme */
export function CommunityCard({ recipeId, isMine, isPublic, author }: CommunityCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [version, setVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPublic) return;
    let cancelled = false;
    fetchPublicStats(recipeId).then(
      (data) => {
        if (!cancelled) setStats(data);
      },
      (e: unknown) => console.warn('Topluluk istatistikleri okunamadı', e),
    );
    return () => {
      cancelled = true;
    };
  }, [recipeId, isPublic, version]);

  if (!isPublic) {
    return isMine ? (
      <View style={[styles.card, { backgroundColor: c.surfaceLow }]}>
        <AppText variant="bodySm" color="textMuted">
          🔒 Bu tarifi sadece sen görüyorsun. Düzenle ekranında &quot;Toplulukla paylaş&quot;ı açarsan Keşfet&apos;te
          yayınlanır.
        </AppText>
      </View>
    ) : null;
  }

  const rate = async (stars: number) => {
    setSaving(true);
    setError(null);
    setStats((prev) => (prev ? { ...prev, myRating: stars } : prev));
    try {
      await rateRecipe(recipeId, stars);
      setVersion((v) => v + 1);
    } catch (e) {
      console.warn('Puan kaydedilemedi', e);
      setError('Puanın kaydedilemedi, tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      {!isMine && author && (
        <View style={styles.author}>
          <Avatar url={author.avatarUrl} name={author.name} size={44} />
          <View style={styles.flex}>
            <AppText variant="labelLg">{author.name}</AppText>
            <AppText variant="bodySm" color="textMuted">
              Sv. {author.level} · {levelTitle(author.level)}
            </AppText>
          </View>
        </View>
      )}

      {stats && (
        <>
          <View style={styles.statsRow}>
            <StarRating value={stats.avgRating} count={stats.ratingCount} size={20} />
            <AppText variant="labelSm" color="textMuted">
              📚 {stats.saveCount} kayıt · 🔁 {stats.cookCount} kez pişirildi
            </AppText>
          </View>
          {isMine ? (
            <AppText variant="bodySm" color="textMuted">
              🌍 Bu tarifin Keşfet&apos;te yayında.
            </AppText>
          ) : (
            <View style={styles.rate}>
              <AppText variant="labelLg">{stats.myRating ? 'Puanın (değiştirebilirsin):' : 'Bu tarife puan ver:'}</AppText>
              <StarPicker value={stats.myRating} onChange={rate} disabled={saving} />
            </View>
          )}
        </>
      )}
      {error && <FormError text={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.06)' },
  author: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  flex: { flex: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING.sm },
  rate: { gap: 4 },
});

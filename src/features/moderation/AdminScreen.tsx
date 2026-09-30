import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { useAuth } from '@/features/auth/AuthProvider';
import { timeAgo } from '@/features/comments/commentUtils';
import type { LoadStatus } from '@/lib/loadStatus';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { ReportCard } from './components/ReportCard';
import {
  fetchOpenReports,
  fetchProfanityUsers,
  liftPenalty,
  penalizeUser,
  resolveReports,
  type OpenReport,
  type ProfanityUser,
  type ReportAction,
} from './moderationApi';
import { nextPenaltyLabel } from './penalties';

type Tab = 'reports' | 'profanity';

const DONE_TEXT: Record<ReportAction, string> = {
  penalize: 'Ceza verildi ve içerik gizlendi.',
  hide: 'İçerik gizlendi.',
  reject: 'Şikayet reddedildi, içerik yayına geri alındı.',
};

export function AdminScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('reports');
  const [reports, setReports] = useState<OpenReport[]>([]);
  const [profanity, setProfanity] = useState<ProfanityUser[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([fetchOpenReports(), fetchProfanityUsers()]).then(
      ([r, p]) => {
        setReports(r);
        setProfanity(p);
        setStatus('ready');
      },
      (e: unknown) => {
        console.warn('Yönetici verisi yüklenemedi', e);
        setStatus('error');
      },
    );
  }, []);

  useFocusEffect(load);

  const run = async (action: () => Promise<void>, done: string) => {
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(done);
      load();
    } catch (e) {
      console.warn('Yönetici işlemi başarısız', e);
      setError('İşlem yapılamadı, tekrar dene.');
    }
  };

  const onReportAction = (report: OpenReport, action: ReportAction) =>
    run(() => resolveReports(report.targetType, report.targetId, action, 'Şikayet üzerine'), DONE_TEXT[action]);

  if (!profile?.is_admin) {
    return (
      <>
        <StackHeader title="Yönetici Paneli" />
        <Screen>
          <HintCard emoji="🔒" title="Bu sayfa sadece yöneticiler için" text="Yönetici yetkin yok." />
        </Screen>
      </>
    );
  }

  return (
    <>
      <StackHeader title="🛡️ Yönetici Paneli" />
      <Screen>
        <View style={styles.tabs}>
          <Chip label={`🚩 Şikayetler (${reports.length})`} selected={tab === 'reports'} onPress={() => setTab('reports')} />
          <Chip
            label={`🤬 Küfür denemeleri (${profanity.length})`}
            selected={tab === 'profanity'}
            onPress={() => setTab('profanity')}
          />
        </View>
        <AppText variant="bodySm" color="textMuted">
          Ceza basamakları: 1 saat → 1 gün → 1 hafta → 1 ay → 1 yıl → kalıcı. Ceza sadece toplulukta susturur; kişinin
          kendi mutfağı çalışmaya devam eder.
        </AppText>

        {message && (
          <View style={[styles.notice, { backgroundColor: c.secondaryContainer }]}>
            <AppText variant="bodySm" color="onSecondaryContainer">
              ✅ {message}
            </AppText>
          </View>
        )}
        {error && <FormError text={error} />}

        {status !== 'ready' ? (
          <LoadState status={status} onRetry={load} />
        ) : tab === 'reports' ? (
          reports.length === 0 ? (
            <HintCard emoji="🕊️" title="Açık şikayet yok" text="Topluluk huzurlu. Yeni şikayetler burada görünecek." />
          ) : (
            reports.map((r) => <ReportCard key={`${r.targetType}-${r.targetId}`} report={r} onAction={onReportAction} />)
          )
        ) : profanity.length === 0 ? (
          <HintCard emoji="😇" title="Son 30 günde küfür denemesi yok" text="Filtreye takılanlar burada listelenir." />
        ) : (
          profanity.map((u) => (
            <View key={u.userId} style={[styles.userCard, { backgroundColor: c.card }]}>
              <AppText variant="labelLg">{u.userName}</AppText>
              <AppText variant="bodySm" color="textMuted">
                {u.attempts} deneme · son: {timeAgo(u.lastAt)} · önceki ceza: {u.penaltyCount}
                {u.isMuted ? ' · 🔇 şu an cezalı' : ''}
              </AppText>
              <View style={styles.actions}>
                {u.isMuted ? (
                  <GameButton
                    label="Cezayı kaldır"
                    variant="soft"
                    onPress={() => run(() => liftPenalty(u.userId), 'Ceza kaldırıldı.')}
                    style={styles.flex}
                  />
                ) : (
                  <GameButton
                    label={`Ceza ver (${nextPenaltyLabel(u.penaltyCount)})`}
                    icon="gavel"
                    onPress={() => run(() => penalizeUser(u.userId, 'Tekrarlanan küfür denemesi'), 'Ceza verildi.')}
                    style={styles.flex}
                  />
                )}
              </View>
            </View>
          ))
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  notice: { borderRadius: RADIUS.md, padding: SPACING.md },
  userCard: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.xs },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  flex: { flex: 1 },
});

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GameButton } from '@/components/ui/GameButton';
import { Tag } from '@/components/ui/Tag';
import { timeAgo } from '@/features/comments/commentUtils';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { REPORT_REASONS, type OpenReport, type ReportAction } from '../moderationApi';
import { nextPenaltyLabel } from '../penalties';

type ReportCardProps = {
  report: OpenReport;
  onAction: (report: OpenReport, action: ReportAction) => Promise<void>;
};

const reasonLabel = (id: string) => REPORT_REASONS.find((r) => r.id === id)?.label ?? id;

export function ReportCard({ report, onAction }: ReportCardProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [busy, setBusy] = useState(false);

  const act = async (action: ReportAction) => {
    setBusy(true);
    await onAction(report, action);
    setBusy(false);
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <View style={styles.row}>
        <Tag label={report.targetType === 'recipe' ? '📖 Tarif' : '💬 Yorum'} />
        <Tag label={`🚩 ${report.reportCount} şikayet`} bg="secondaryContainer" fg="onSecondaryContainer" />
        {report.isHidden && <Tag label="🙈 Gizlendi" bg="surfaceHigh" fg="error" />}
        <AppText variant="labelSm" color="textMuted" style={styles.push}>
          {timeAgo(report.firstReportedAt)}
        </AppText>
      </View>

      <AppText variant="labelLg">
        {report.targetUserName}
        <AppText variant="bodySm" color="textMuted">
          {'  '}· önceki ceza: {report.penaltyCount} · son 30 günde küfür denemesi: {report.profanityAttempts}
        </AppText>
      </AppText>

      <View style={[styles.preview, { backgroundColor: c.surfaceLow }]}>
        <AppText variant="bodyMd" numberOfLines={4}>
          {report.preview || '(içerik silinmiş)'}
        </AppText>
      </View>

      <AppText variant="bodySm" color="textMuted">
        Sebepler: {report.reasons.map(reasonLabel).join(', ')}
      </AppText>
      {report.notes.map((n, i) => (
        <AppText key={i} variant="bodySm" color="textMuted">
          📝 “{n}”
        </AppText>
      ))}

      {report.targetType === 'recipe' && (
        <GameButton
          label="Tarifi aç"
          icon="open-in-new"
          variant="soft"
          onPress={() => router.push({ pathname: '/tarif/[id]', params: { id: report.targetId } })}
        />
      )}
      <View style={styles.actions}>
        <GameButton
          label={`Ceza ver (${nextPenaltyLabel(report.penaltyCount)})`}
          icon="gavel"
          onPress={() => act('penalize')}
          disabled={busy}
          style={styles.flex}
        />
        <GameButton label="Sadece gizle" variant="sunny" onPress={() => act('hide')} disabled={busy} style={styles.flex} />
      </View>
      <GameButton label="Haksız şikayet — yayına geri al" variant="soft" onPress={() => act('reject')} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.06)' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  push: { marginLeft: 'auto' },
  preview: { borderRadius: RADIUS.md, padding: SPACING.md },
  actions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 150 },
});

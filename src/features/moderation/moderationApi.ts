import { supabase } from '@/lib/supabase';

export type ReportTarget = 'recipe' | 'comment';
export type ReportReason = 'kufur' | 'spam' | 'uygunsuz' | 'yanlis' | 'diger';

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'kufur', label: '🤬 Küfür / hakaret' },
  { id: 'spam', label: '📢 Spam / reklam' },
  { id: 'uygunsuz', label: '🚫 Uygunsuz içerik' },
  { id: 'yanlis', label: '⚠️ Tehlikeli / yanlış bilgi' },
  { id: 'diger', label: '💬 Diğer' },
];

export async function reportContent(
  targetType: ReportTarget,
  targetId: string,
  reason: ReportReason,
  note: string,
): Promise<'ok' | 'duplicate'> {
  const { error } = await supabase
    .from('reports')
    .insert({ target_type: targetType, target_id: targetId, reason, note: note.trim().slice(0, 300) });
  // Aynı içeriği ikinci kez şikayet (unique ihlali) kullanıcı için hata değil
  if (error?.code === '23505') return 'duplicate';
  if (error) throw error;
  return 'ok';
}

/** Küfür filtresine takılan denemeyi yöneticiye bildirir (sessizce; hata kullanıcıyı etkilemez) */
export function logProfanityAttempt(context: string): void {
  supabase
    .rpc('log_profanity_attempt', { p_context: context })
    .then(({ error }) => error && console.warn('Küfür denemesi kaydedilemedi', error));
}

export type ActivePenalty = { level: number; endsAt: string | null };

export async function fetchActivePenalty(userId: string): Promise<ActivePenalty | null> {
  const { data, error } = await supabase
    .from('user_penalties')
    .select('level, ends_at, lifted_at')
    .eq('user_id', userId)
    .is('lifted_at', null)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  const now = Date.now();
  const active = data.find((p) => p.ends_at === null || new Date(p.ends_at as string).getTime() > now);
  return active ? { level: active.level as number, endsAt: active.ends_at as string | null } : null;
}

// ── Yönetici ─────────────────────────────────────────────────

export type OpenReport = {
  targetType: ReportTarget;
  targetId: string;
  targetUserId: string;
  targetUserName: string;
  preview: string;
  reportCount: number;
  reasons: ReportReason[];
  notes: string[];
  isHidden: boolean;
  penaltyCount: number;
  profanityAttempts: number;
  firstReportedAt: string;
};

export async function fetchOpenReports(): Promise<OpenReport[]> {
  const { data, error } = await supabase.rpc('admin_open_reports');
  if (error) throw error;
  return (data as Record<string, unknown>[]).map((r) => ({
    targetType: r.target_type as ReportTarget,
    targetId: r.target_id as string,
    targetUserId: r.target_user_id as string,
    targetUserName: (r.target_user_name as string | null) ?? 'Şef',
    preview: (r.preview as string | null) ?? '',
    reportCount: Number(r.report_count),
    reasons: (r.reasons as ReportReason[] | null) ?? [],
    notes: (r.notes as string[] | null) ?? [],
    isHidden: Boolean(r.is_hidden),
    penaltyCount: Number(r.penalty_count),
    profanityAttempts: Number(r.profanity_attempts),
    firstReportedAt: r.first_reported_at as string,
  }));
}

export type ProfanityUser = {
  userId: string;
  userName: string;
  attempts: number;
  lastAt: string;
  penaltyCount: number;
  isMuted: boolean;
};

export async function fetchProfanityUsers(): Promise<ProfanityUser[]> {
  const { data, error } = await supabase.rpc('admin_profanity_users');
  if (error) throw error;
  return (data as Record<string, unknown>[]).map((r) => ({
    userId: r.user_id as string,
    userName: (r.user_name as string | null) ?? 'Şef',
    attempts: Number(r.attempts),
    lastAt: r.last_at as string,
    penaltyCount: Number(r.penalty_count),
    isMuted: Boolean(r.is_muted),
  }));
}

export type ReportAction = 'penalize' | 'hide' | 'reject';

export async function resolveReports(target: ReportTarget, targetId: string, action: ReportAction, reason: string) {
  const { error } = await supabase.rpc('admin_resolve_reports', {
    p_target_type: target,
    p_target_id: targetId,
    p_action: action,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function penalizeUser(userId: string, reason: string) {
  const { error } = await supabase.rpc('admin_penalize_user', { p_user_id: userId, p_reason: reason });
  if (error) throw error;
}

export async function liftPenalty(userId: string) {
  const { error } = await supabase.rpc('admin_lift_penalty', { p_user_id: userId });
  if (error) throw error;
}

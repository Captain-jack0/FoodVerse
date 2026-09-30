import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { LoadState } from '@/components/ui/HintCard';
import { MuteBanner } from '@/features/moderation/components/MuteBanner';
import { useMuteStatus } from '@/features/moderation/useMuteStatus';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { CommentComposer } from './components/CommentComposer';
import { CommentItem } from './components/CommentItem';
import { PublishVersionModal } from './components/PublishVersionModal';
import { VersionHistory } from './components/VersionHistory';
import { useComments } from './useComments';

type CommentsSectionProps = {
  recipeId: string;
  currentUserId: string | undefined;
  isRecipeOwner: boolean;
};

/** Paylaşılan tarifin altında: sürüm geçmişi + öneriler + yorumlar */
export function CommentsSection({ recipeId, currentUserId, isRecipeOwner }: CommentsSectionProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const data = useComments(recipeId);
  const mute = useMuteStatus();
  const [publishing, setPublishing] = useState(false);

  const openSuggestions = data.comments.filter((cm) => cm.suggestionStatus === 'open');
  const nextVersion = (data.versions[0]?.version ?? 0) + 1;

  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      {(data.versions.length > 0 || isRecipeOwner) && (
        <View style={styles.block}>
          <AppText variant="headlineMd">📜 Sürüm Geçmişi</AppText>
          {data.versions.length === 0 && (
            <AppText variant="bodySm" color="textMuted">
              Tarifi güncelledikçe sürüm yayınla; takipçilerin neyin değiştiğini görsün.
            </AppText>
          )}
          <VersionHistory versions={data.versions} comments={data.comments} />
          {isRecipeOwner && (
            <GameButton
              label={openSuggestions.length > 0 ? `Yeni Sürüm Yayınla (${openSuggestions.length} açık öneri)` : 'Yeni Sürüm Yayınla'}
              icon="rocket-launch"
              variant="soft"
              onPress={() => setPublishing(true)}
              disabled={data.status !== 'ready'}
            />
          )}
        </View>
      )}

      <View style={styles.block}>
        <AppText variant="headlineMd">💬 Yorumlar ({data.comments.length})</AppText>
        {mute.penalty ? <MuteBanner penalty={mute.penalty} /> : <CommentComposer canSuggest={!isRecipeOwner} onSend={data.add} />}
        {data.actionError && <FormError text={data.actionError} />}
        {data.status !== 'ready' ? (
          <LoadState status={data.status} onRetry={data.reload} />
        ) : data.comments.length === 0 ? (
          <AppText variant="bodySm" color="textMuted">
            İlk yorumu sen yaz! Denediysen nasıl olduğunu anlat ya da bir öneri bırak.
          </AppText>
        ) : (
          data.comments.map((cm) => (
            <CommentItem
              key={cm.id}
              comment={cm}
              isOwnComment={cm.author.id === currentUserId}
              isRecipeOwner={isRecipeOwner}
              onDelete={data.remove}
              onResolve={data.resolve}
            />
          ))
        )}
      </View>

      {publishing && (
        <PublishVersionModal
          nextVersion={nextVersion}
          openSuggestions={openSuggestions}
          onPublish={data.publish}
          onClose={() => setPublishing(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.lg, boxShadow: '0 4px 16px rgba(48, 60, 108, 0.06)' },
  block: { gap: SPACING.sm },
});

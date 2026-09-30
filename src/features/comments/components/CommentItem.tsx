import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Tag } from '@/components/ui/Tag';
import { ReportButton } from '@/features/moderation/components/ReportButton';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, type ThemeColors } from '@/theme/tokens';

import type { Comment, SuggestionStatus } from '../commentsApi';
import { timeAgo } from '../commentUtils';

type CommentItemProps = {
  comment: Comment;
  isOwnComment: boolean;
  isRecipeOwner: boolean;
  onDelete: (id: string) => void;
  onResolve: (id: string, status: SuggestionStatus) => void;
};

function suggestionTag(comment: Comment): { label: string; bg: keyof ThemeColors; fg: keyof ThemeColors } {
  switch (comment.suggestionStatus) {
    case 'applied':
      return {
        label: comment.resolvedVersion ? `✅ Sürüm ${comment.resolvedVersion}'de uygulandı` : '✅ Uygulandı',
        bg: 'tertiary',
        fg: 'onPrimary',
      };
    case 'dismissed':
      return { label: '🙈 Yoksayıldı', bg: 'surfaceHigh', fg: 'textMuted' };
    default:
      return { label: '💡 Öneri', bg: 'secondaryContainer', fg: 'onSecondaryContainer' };
  }
}

export function CommentItem({ comment, isOwnComment, isRecipeOwner, onDelete, onResolve }: CommentItemProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const tag = comment.isSuggestion ? suggestionTag(comment) : null;

  return (
    <View style={[styles.item, { backgroundColor: c.surfaceLow }]}>
      <View style={styles.header}>
        <Avatar url={comment.author.avatarUrl} name={comment.author.name} size={32} />
        <View style={styles.flex}>
          <AppText variant="labelLg" numberOfLines={1}>
            {comment.author.name}
          </AppText>
          <AppText variant="labelSm" color="textMuted">
            Sv. {comment.author.level} · {timeAgo(comment.createdAt)}
          </AppText>
        </View>
        {tag && <Tag label={tag.label} bg={tag.bg} fg={tag.fg} />}
      </View>
      {comment.hidden && (
        <Tag label="🙈 Şikayetler nedeniyle incelemede — sadece sen görüyorsun" bg="surfaceHigh" fg="error" />
      )}

      <AppText variant="bodyMd">{comment.body}</AppText>

      <View style={styles.actions}>
        {!isOwnComment && <ReportButton targetType="comment" targetId={comment.id} />}
        {isRecipeOwner && comment.suggestionStatus === 'open' && (
          <Pressable accessibilityRole="button" onPress={() => onResolve(comment.id, 'dismissed')} hitSlop={6}>
            <AppText variant="labelMd" color="textMuted">
              Yoksay
            </AppText>
          </Pressable>
        )}
        {isRecipeOwner && comment.suggestionStatus === 'dismissed' && (
          <Pressable accessibilityRole="button" onPress={() => onResolve(comment.id, 'open')} hitSlop={6}>
            <AppText variant="labelMd" color="primary">
              Tekrar aç
            </AppText>
          </Pressable>
        )}
        {isOwnComment && (
          <Pressable accessibilityRole="button" accessibilityLabel="Yorumu sil" onPress={() => onDelete(comment.id)} hitSlop={6}>
            <AppText variant="labelMd" color="error">
              Sil
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md },
});

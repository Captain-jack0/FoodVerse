import { useEffect, useState } from 'react';

import type { LoadStatus } from '@/lib/loadStatus';

import {
  addComment,
  deleteComment,
  fetchComments,
  resolveSuggestion,
  type Comment,
  type SuggestionStatus,
} from './commentsApi';
import { fetchVersions, publishVersion, type RecipeVersion } from './versionsApi';

/** Tarif detayındaki yorumlar + sürüm geçmişi */
export function useComments(recipeId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchComments(recipeId), fetchVersions(recipeId)]).then(
      ([c, v]) => {
        if (cancelled) return;
        setComments(c);
        setVersions(v);
        setStatus('ready');
      },
      (error: unknown) => {
        if (cancelled) return;
        console.warn('Yorumlar yüklenemedi', error);
        setStatus('error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [recipeId, attempt]);

  const reload = () => {
    setStatus('loading');
    setAttempt((a) => a + 1);
  };

  const run = async (action: () => Promise<void>, failMessage: string) => {
    setActionError(null);
    try {
      await action();
      return true;
    } catch (error) {
      console.warn(failMessage, error);
      setActionError(failMessage);
      return false;
    }
  };

  const add = (body: string, isSuggestion: boolean) =>
    run(async () => {
      const created = await addComment(recipeId, body, isSuggestion);
      setComments((prev) => [created, ...prev]);
    }, 'Yorumun gönderilemedi, tekrar dene.');

  const remove = (id: string) =>
    run(async () => {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    }, 'Yorum silinemedi, tekrar dene.');

  const resolve = (id: string, next: SuggestionStatus) =>
    run(async () => {
      await resolveSuggestion(id, next);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, suggestionStatus: next } : c)));
    }, 'Öneri güncellenemedi, tekrar dene.');

  const publish = (note: string, appliedIds: string[]) =>
    run(async () => {
      const version = await publishVersion(recipeId, note, appliedIds);
      setComments((prev) =>
        prev.map((c) => (appliedIds.includes(c.id) ? { ...c, suggestionStatus: 'applied', resolvedVersion: version } : c)),
      );
      setVersions(await fetchVersions(recipeId));
    }, 'Sürüm yayınlanamadı, tekrar dene.');

  return { comments, versions, status, actionError, reload, add, remove, resolve, publish };
}

import type { Author } from '@/features/discover/discoverMapper';
import { supabase } from '@/lib/supabase';

export type SuggestionStatus = 'open' | 'applied' | 'dismissed';

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  isSuggestion: boolean;
  suggestionStatus: SuggestionStatus | null;
  resolvedVersion: number | null;
  /** Şikayetler nedeniyle gizlendi (sadece yazarı ve yönetici görür) */
  hidden: boolean;
};

type AuthorRow = { id: string; display_name: string; avatar_url: string | null; level: number };
type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  is_suggestion: boolean;
  suggestion_status: SuggestionStatus | null;
  resolved_version: number | null;
  hidden_at: string | null;
  // supabase-js tipsiz sorguda dizi sanar; çalışma anında tek nesne gelir
  author: AuthorRow | AuthorRow[] | null;
};

const COLUMNS =
  'id, body, created_at, is_suggestion, suggestion_status, resolved_version, hidden_at, author:profiles(id, display_name, avatar_url, level)';

function toComment(row: CommentRow): Comment {
  const a = Array.isArray(row.author) ? row.author[0] : row.author;
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: a
      ? { id: a.id, name: a.display_name, avatarUrl: a.avatar_url, level: a.level }
      : { id: '', name: 'Şef', avatarUrl: null, level: 1 },
    isSuggestion: row.is_suggestion,
    suggestionStatus: row.suggestion_status,
    resolvedVersion: row.resolved_version,
    hidden: row.hidden_at !== null,
  };
}

// ponytail: tek seferde en fazla 100 yorum; çoğalınca sayfalama eklenecek
const MAX_COMMENTS = 100;

export async function fetchComments(recipeId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COLUMNS)
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
    .limit(MAX_COMMENTS);
  if (error) throw error;
  return (data as unknown as CommentRow[]).map(toComment);
}

export async function addComment(recipeId: string, body: string, isSuggestion: boolean): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ recipe_id: recipeId, body: body.trim(), is_suggestion: isSuggestion })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toComment(data as unknown as CommentRow);
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}

/** Sadece tarif sahibi (veritabanı kontrol eder) */
export async function resolveSuggestion(id: string, status: SuggestionStatus): Promise<void> {
  const { error } = await supabase.rpc('resolve_suggestion', { p_comment_id: id, p_status: status });
  if (error) throw error;
}

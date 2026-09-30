import { useEffect, useState } from 'react';

import type { LoadStatus } from '@/lib/loadStatus';

import { fetchDiscover, PAGE_SIZE, type DiscoverSort } from './discoverApi';
import type { DiscoverItem } from './discoverMapper';

const SEARCH_DELAY_MS = 350;

export function useDiscover(sort: DiscoverSort, query: string) {
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Sıralama/arama değişince baştan yükle (aramada yazmayı bitirmesini bekle)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchDiscover(sort, query, 0).then(
        (data) => {
          if (cancelled) return;
          setItems(data);
          setHasMore(data.length === PAGE_SIZE);
          setStatus('ready');
        },
        (error: unknown) => {
          if (cancelled) return;
          console.warn('Keşfet yüklenemedi', error);
          setStatus('error');
        },
      );
    }, query ? SEARCH_DELAY_MS : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sort, query, attempt]);

  const retry = () => {
    setStatus('loading');
    setAttempt((a) => a + 1);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await fetchDiscover(sort, query, items.length);
      setItems((prev) => [...prev, ...data.filter((d) => !prev.some((p) => p.id === d.id))]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.warn('Daha fazla tarif yüklenemedi', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return { items, status, hasMore, loadingMore, retry, loadMore };
}

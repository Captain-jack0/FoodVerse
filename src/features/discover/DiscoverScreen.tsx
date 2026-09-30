import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { DiscoverCard } from './components/DiscoverCard';
import type { DiscoverSort } from './discoverApi';
import { useDiscover } from './useDiscover';

const SORTS: { id: DiscoverSort; label: string }[] = [
  { id: 'trend', label: '🔥 Trend' },
  { id: 'top', label: '⭐ En Beğenilen' },
  { id: 'new', label: '🆕 En Yeni' },
];

function gridColumns(width: number) {
  if (width >= 1200) return 3;
  if (width >= 700) return 2;
  return 1;
}

export function DiscoverScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const { width } = useWindowDimensions();
  const [sort, setSort] = useState<DiscoverSort>('trend');
  const [query, setQuery] = useState('');
  const feed = useDiscover(sort, query);
  const columns = gridColumns(width);

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
        <AppText variant="labelMd" color="primary">
          TOPLULUK & KEŞFET
        </AppText>
        <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Neler Pişiyor?</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Diğer şeflerin paylaştığı tarifleri keşfet, puan ver, beğendiklerini kendi koleksiyonuna kaydet.
        </AppText>
        <View style={[styles.search, { backgroundColor: c.card }]}>
          <MaterialIcons name="search" size={20} color={c.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Toplulukta tarif ara..."
            placeholderTextColor={c.textMuted}
            accessibilityLabel="Toplulukta tarif ara"
            maxLength={60}
            style={[styles.searchInput, { color: c.text }]}
          />
        </View>
      </View>

      <View style={styles.sorts}>
        {SORTS.map((s) => (
          <Chip key={s.id} label={s.label} selected={sort === s.id} onPress={() => setSort(s.id)} />
        ))}
      </View>

      {feed.status !== 'ready' ? (
        <LoadState status={feed.status} onRetry={feed.retry} />
      ) : feed.items.length === 0 ? (
        query ? (
          <HintCard emoji="🔍" title="Sonuç yok" text={`"${query}" ile eşleşen paylaşılmış tarif bulunamadı.`} />
        ) : (
          <HintCard
            emoji="🌱"
            title="Topluluk yeni filizleniyor"
            text="Henüz paylaşılan tarif yok. İlk sen paylaş: tarif formundaki 'Toplulukla paylaş' anahtarını aç!">
            <GameButton label="Tarif Paylaş" icon="public" variant="sunny" onPress={() => router.push('/tarif/yeni')} />
          </HintCard>
        )
      ) : (
        <>
          <View style={styles.grid}>
            {feed.items.map((item) => (
              <View key={item.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
                <DiscoverCard item={item} />
              </View>
            ))}
          </View>
          {feed.hasMore && (
            <GameButton
              label={feed.loadingMore ? 'Yükleniyor...' : 'Daha Fazla Göster'}
              variant="soft"
              onPress={feed.loadMore}
              disabled={feed.loadingMore}
            />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.xs },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  searchInput: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: 12, minWidth: 0 },
  sorts: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  cell: { padding: 8 },
});

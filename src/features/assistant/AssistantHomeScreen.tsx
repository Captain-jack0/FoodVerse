import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { Tag } from '@/components/ui/Tag';
import { inDays } from '@/features/pantry/categories';
import { rankRecipes } from '@/features/pantry/pantryUtils';
import { usePantry } from '@/features/pantry/usePantry';
import { useWeekPlans } from '@/features/planner/useWeekPlans';
import { SLOTS } from '@/features/planner/types';
import { fetchRecentlyCookedIds } from '@/features/recipes/recipesApi';
import type { Recipe } from '@/features/recipes/types';
import { useMyRecipes } from '@/features/recipes/useMyRecipes';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

const COMMANDS = [
  ['"Sonraki" / "Devam"', 'bir sonraki adıma geçer'],
  ['"Önceki" / "Geri"', 'bir önceki adıma döner'],
  ['"Tekrar et"', 'adımı yeniden okur'],
  ['"Malzemeleri oku"', 'malzeme listesini söyler'],
  ['"10 dakika zamanlayıcı kur"', 'zamanlayıcı başlatır'],
  ['"Kaç dakika kaldı?"', 'kalan süreyi söyler'],
  ['"Sus"', 'konuşmayı keser'],
  ['"Pişirdim"', 'son adımda tarifi tamamlar'],
];

function CookRow({ recipe, badge }: { recipe: Recipe; badge?: string }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  return (
    <View style={[styles.row, { backgroundColor: c.card }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${recipe.title} tarifini aç`}
        onPress={() => router.push({ pathname: '/tarif/[id]', params: { id: recipe.id } })}
        style={styles.rowMain}>
        <AppText style={styles.emoji}>{recipe.emoji}</AppText>
        <View style={styles.flex}>
          <AppText variant="labelLg" numberOfLines={1}>
            {recipe.title}
          </AppText>
          <AppText variant="bodySm" color="textMuted">
            ⏱ {recipe.minutes} dk · {recipe.steps.length} adım
          </AppText>
        </View>
        {badge && <Tag label={badge} bg="secondaryContainer" fg="onSecondaryContainer" />}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${recipe.title} pişirmeye başla`}
        onPress={() => router.push({ pathname: '/pisir/[id]', params: { id: recipe.id } })}
        style={[styles.play, { backgroundColor: c.primaryContainer }]}>
        <MaterialIcons name="play-arrow" size={24} color={c.onPrimary} />
      </Pressable>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="headlineMd">{title}</AppText>
      {children}
    </View>
  );
}

export function AssistantHomeScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const [today] = useState(() => inDays(0));
  const todayPlans = useWeekPlans(today, today);
  const { recipes, status, reload } = useMyRecipes();
  const pantry = usePantry();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchRecentlyCookedIds().then(setRecentIds, (e: unknown) => console.warn('Son pişirilenler okunamadı', e));
    }, []),
  );

  const byId = new Map(recipes.map((r) => [r.id, r]));
  const planned = SLOTS.flatMap((slot) => {
    const plan = todayPlans.plans.find((p) => p.slot === slot.id);
    const recipe = plan ? byId.get(plan.recipeId) : undefined;
    return recipe ? [{ slot, recipe }] : [];
  });
  const suggestions = rankRecipes(recipes, pantry.items, [])
    .filter((r) => r.match.percent > 0)
    .slice(0, 3);
  const recent = recentIds.flatMap((rid) => byId.get(rid) ?? []);

  const content =
    status !== 'ready' ? (
      <LoadState status={status} onRetry={reload} />
    ) : recipes.length === 0 ? (
      <HintCard emoji="📖" title="Önce bir tarif ekle" text="Asistan, Tarif Defteri'ndeki tariflerle adım adım pişirmene yardım eder.">
        <GameButton label="İlk Tarifimi Yaz" icon="edit-note" variant="sunny" onPress={() => router.push('/tarif/yeni')} />
      </HintCard>
    ) : (
      <>
        <Section title="📅 Bugünün planı">
          {planned.length === 0 ? (
            <AppText variant="bodySm" color="textMuted">
              Bugün için plan yok. Planlayıcı sekmesinden öğünlere tarif atayabilirsin.
            </AppText>
          ) : (
            planned.map(({ slot, recipe }) => (
              <CookRow key={slot.id} recipe={recipe} badge={`${slot.emoji} ${slot.label}`} />
            ))
          )}
        </Section>

        {suggestions.length > 0 && (
          <Section title="🧺 Kilerindekilerle yapabileceklerin">
            {suggestions.map(({ recipe, match }) => (
              <CookRow key={recipe.id} recipe={recipe} badge={`%${match.percent}`} />
            ))}
          </Section>
        )}

        {recent.length > 0 && (
          <Section title="🔁 Son pişirdiklerin">
            {recent.map((recipe) => (
              <CookRow key={recipe.id} recipe={recipe} />
            ))}
          </Section>
        )}
      </>
    );

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
        <View style={[styles.micBadge, { backgroundColor: c.primaryContainer }]}>
          <MaterialIcons name="mic" size={32} color={c.onPrimary} />
        </View>
        <AppText variant="labelMd" color="primary">
          SESLİ PİŞİRME ASİSTANI
        </AppText>
        <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Ne pişiriyoruz?</AppText>
        <AppText variant="bodyMd" color="textMuted">
          Bir tarif seç, ▶ ile başla. Pişirirken seni dinlerim; elin hamurluyken bile sesle yönetebilirsin.
        </AppText>
      </View>

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={[styles.main, isWide && styles.flex]}>{content}</View>

        <View style={[styles.help, { backgroundColor: c.card }, isWide && styles.helpWide]}>
          <AppText variant="headlineMd">🗣️ Neler diyebilirsin?</AppText>
          {COMMANDS.map(([say, does]) => (
            <View key={say} style={styles.commandRow}>
              <AppText variant="labelLg" style={styles.commandSay}>
                {say}
              </AppText>
              <AppText variant="bodySm" color="textMuted" style={styles.flex}>
                {does}
              </AppText>
            </View>
          ))}
          <AppText variant="bodySm" color="textMuted">
            💡 İlk seferde tarayıcı mikrofon izni ister; &quot;İzin ver&quot;e dokun. Adımda süre geçiyorsa zamanlayıcı
            önerilir.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.xs },
  micBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  columns: { gap: SPACING.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { gap: SPACING.lg },
  section: { gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.lg },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  emoji: { fontSize: 30, lineHeight: 36 },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  help: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  helpWide: { width: 380 },
  commandRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'baseline' },
  commandSay: { width: 170 },
});

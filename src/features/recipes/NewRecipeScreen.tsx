import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { Chip } from '@/components/ui/Chip';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { IngredientListEditor, StepListEditor } from './components/ListEditors';
import { emptyDraft, LIMITS, toRecipeInsert, validateDraft, type DraftErrors, type RecipeDraft } from './recipeDraft';
import { insertRecipe } from './recipesApi';
import { RECIPE_TAGS } from './recipeTags';
import type { Difficulty, RecipeTag } from './types';

const EMOJIS = ['🍲', '🍝', '🥘', '🍛', '🥗', '🍳', '🧆', '🥞', '🍰', '🍪', '🥐', '🍜', '🌮', '🍕', '🥧', '🍮'];
const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 1, label: '⭐ Kolay' },
  { value: 2, label: '⭐⭐ Orta' },
  { value: 3, label: '⭐⭐⭐ Usta' },
];

function Section({ title, hint, error, children }: { title: string; hint?: string; error?: string; children: ReactNode }) {
  const { theme } = useKukkiTheme();
  return (
    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
      <AppText variant="headlineMd">{title}</AppText>
      {hint && (
        <AppText variant="bodySm" color="textMuted">
          {hint}
        </AppText>
      )}
      {children}
      {error && (
        <AppText variant="bodySm" color="error">
          {error}
        </AppText>
      )}
    </View>
  );
}

export function NewRecipeScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const params = useLocalSearchParams<{ url?: string }>();
  const [draft, setDraft] = useState<RecipeDraft>(() => emptyDraft(typeof params.url === 'string' ? params.url : ''));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleTag = (tag: RecipeTag) =>
    set('tags', draft.tags.includes(tag) ? draft.tags.filter((t) => t !== tag) : [...draft.tags, tag]);

  const save = async () => {
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSaveError('Kaydetmeden önce kırmızı işaretli alanları düzelt.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await insertRecipe(toRecipeInsert(draft));
      router.back();
    } catch (error) {
      console.warn('Tarif kaydedilemedi', error);
      setSaveError('Tarif kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.');
      setSaving(false);
    }
  };

  const multilineStyle = [styles.multiline, { backgroundColor: c.surfaceLow, color: c.text }];

  return (
    <>
      <StackHeader title="Yeni Tarif" />
      <Screen>
        <View style={[styles.intro, { backgroundColor: c.surfaceLow }]}>
          <AppText style={styles.introEmoji}>{draft.emoji}</AppText>
          <View style={styles.flex}>
            <AppText variant="headlineMd">Kendi tarifini yaz</AppText>
            <AppText variant="bodySm" color="textMuted">
              {'💡 Malzeme adlarını kısa yaz (örn. "mantar", "krema"); böylece kilerindekilerle eşleşir ve öneri olarak karşına çıkar.'}
            </AppText>
          </View>
        </View>

        <Section title="Temel Bilgiler">
          <TextField
            label="Tarif Adı"
            icon="restaurant-menu"
            required
            value={draft.title}
            onChangeText={(v) => set('title', v)}
            error={errors.title}
            placeholder="örn: Annemin Mercimek Çorbası"
            maxLength={LIMITS.title}
          />
          <AppText variant="labelLg">Simge</AppText>
          <View style={styles.wrap}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                accessibilityRole="radio"
                accessibilityState={{ checked: draft.emoji === e }}
                accessibilityLabel={`Simge ${e}`}
                onPress={() => set('emoji', e)}
                style={[
                  styles.emojiOption,
                  { backgroundColor: c.surfaceLow, borderColor: draft.emoji === e ? c.primary : 'transparent' },
                ]}>
                <AppText style={styles.emojiText}>{e}</AppText>
              </Pressable>
            ))}
          </View>
          <AppText variant="labelLg">Kısa Açıklama</AppText>
          <TextInput
            value={draft.description}
            onChangeText={(v) => set('description', v)}
            placeholder="Bu tarifi özel yapan ne?"
            placeholderTextColor={c.textMuted}
            maxLength={LIMITS.description}
            multiline
            accessibilityLabel="Kısa açıklama"
            style={multilineStyle}
          />
          <TextField
            label="Süre (dakika)"
            icon="schedule"
            required
            value={draft.minutes}
            onChangeText={(v) => set('minutes', v.replace(/\D/g, ''))}
            error={errors.minutes}
            placeholder="örn: 30"
            keyboardType="number-pad"
            maxLength={4}
          />
          <AppText variant="labelLg">Zorluk</AppText>
          <View style={styles.wrap}>
            {DIFFICULTIES.map((d) => (
              <Chip key={d.value} label={d.label} selected={draft.difficulty === d.value} onPress={() => set('difficulty', d.value)} />
            ))}
          </View>
          <AppText variant="labelLg">Etiketler</AppText>
          <View style={styles.wrap}>
            {(Object.keys(RECIPE_TAGS) as RecipeTag[]).map((tag) => (
              <Chip
                key={tag}
                label={`${RECIPE_TAGS[tag].emoji} ${RECIPE_TAGS[tag].label}`}
                selected={draft.tags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </Section>

        <Section title="Malzemeler" hint="Her satıra bir malzeme ve miktarı." error={errors.ingredients}>
          <IngredientListEditor value={draft.ingredients} onChange={(v) => set('ingredients', v)} />
        </Section>

        <Section title="Hazırlanışı" hint="Adımları sırayla yaz; pişirme modunda tek tek göstereceğiz." error={errors.steps}>
          <StepListEditor value={draft.steps} onChange={(v) => set('steps', v)} />
        </Section>

        <Section title="Ekstralar">
          <AppText variant="labelLg">Püf Noktası</AppText>
          <TextInput
            value={draft.tip}
            onChangeText={(v) => set('tip', v)}
            placeholder="örn: Servis ederken üstüne pul biberli tereyağı gezdir."
            placeholderTextColor={c.textMuted}
            maxLength={LIMITS.tip}
            multiline
            accessibilityLabel="Püf noktası"
            style={multilineStyle}
          />
          <AppText variant="labelLg">Kaynak</AppText>
          <View style={styles.wrap}>
            <Chip label="✍️ Kendi Tarifim" selected={draft.sourceType === 'manual'} onPress={() => set('sourceType', 'manual')} />
            <Chip label="👵 Aile Defteri" selected={draft.sourceType === 'family'} onPress={() => set('sourceType', 'family')} />
          </View>
          <TextField
            label="Instagram / TikTok linki (isteğe bağlı)"
            icon="link"
            value={draft.sourceUrl}
            onChangeText={(v) => set('sourceUrl', v)}
            error={errors.sourceUrl}
            placeholder="https://instagram.com/reel/..."
            autoCapitalize="none"
            keyboardType="url"
            maxLength={500}
          />
          <View style={styles.switchRow}>
            <MaterialIcons name="public" size={22} color={c.tertiary} />
            <View style={styles.flex}>
              <AppText variant="labelLg">Toplulukla paylaş</AppText>
              <AppText variant="bodySm" color="textMuted">
                {"Açarsan diğer şefler Keşfet'te görebilir, yorum ve oy verebilir."}
              </AppText>
            </View>
            <Switch
              value={draft.isPublic}
              onValueChange={(v) => set('isPublic', v)}
              accessibilityLabel="Toplulukla paylaş"
              trackColor={{ true: c.primaryContainer, false: c.surfaceHigh }}
              thumbColor={draft.isPublic ? c.primary : c.card}
            />
          </View>
        </Section>

        {saveError && <FormError text={saveError} />}
        <GameButton label={saving ? 'Deftere yazılıyor...' : 'Tarifi Kaydet'} icon="save" onPress={save} disabled={saving} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.xl },
  introEmoji: { fontSize: 44, lineHeight: 54 },
  flex: { flex: 1 },
  section: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
    boxShadow: '0 4px 16px rgba(48, 60, 108, 0.06)',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 24, lineHeight: 30 },
  multiline: {
    fontFamily: FONT.medium,
    fontSize: 15,
    minHeight: 72,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    textAlignVertical: 'top',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
});

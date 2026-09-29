import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

type PantryHeroProps = {
  itemCount: number;
  freshness: number;
  isWide: boolean;
  onAdd: (name: string) => void;
};

const MAX_NAME_LENGTH = 60;

function freshnessWord(score: number) {
  if (score >= 90) return 'Mükemmel';
  if (score >= 70) return 'İyi';
  return 'Dikkat';
}

export function PantryHero({ itemCount, freshness, isWide, onAdd }: PantryHeroProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [name, setName] = useState('');
  const trimmed = name.trim();

  const submit = () => {
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
      <View style={[styles.top, !isWide && styles.topStacked]}>
        <View style={styles.titles}>
          <View style={styles.eyebrow}>
            <View style={[styles.dot, { backgroundColor: c.primary }]} />
            <AppText variant="labelMd" color="primary">
              KİLER ÖZETİ & STOK DURUMU
            </AppText>
          </View>
          <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Mutfakta Ne Var Ne Yok?</AppText>
          <AppText variant="bodyMd" color="textMuted">
            Dolabındaki {itemCount} leziz malzemeyi canlı takip et, israfı önle!
          </AppText>
        </View>

        <View style={[styles.scorePill, { backgroundColor: c.card }]}>
          <MaterialIcons name="eco" size={22} color={c.onSecondaryContainer} />
          <View>
            <AppText variant="labelSm" color="textMuted">
              Tazelik Skoru
            </AppText>
            <AppText variant="headlineMd">
              %{freshness} {freshnessWord(freshness)}
            </AppText>
          </View>
        </View>
      </View>

      <View style={[styles.inputRow, { backgroundColor: c.card }]}>
        <MaterialIcons name="search" size={22} color={c.textMuted} />
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          maxLength={MAX_NAME_LENGTH}
          placeholder={isWide ? 'Yeni malzeme adı yaz (örn: Çedar Peyniri, Fesleğen)...' : 'Yeni malzeme ekle...'}
          placeholderTextColor={c.textMuted}
          accessibilityLabel="Yeni malzeme adı"
          returnKeyType="done"
          style={[styles.input, { color: c.text }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Malzemeyi ekle"
          disabled={!trimmed}
          onPress={submit}
          style={[styles.addButton, { backgroundColor: c.surfaceHigh, opacity: trimmed ? 1 : 0.5 }]}>
          <MaterialIcons name="add" size={18} color={c.text} />
          <AppText variant="labelLg">Ekle</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.lg, overflow: 'hidden' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.md },
  topStacked: { flexDirection: 'column' },
  titles: { flex: 1, gap: SPACING.xs },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingLeft: SPACING.md,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  input: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: SPACING.sm, minWidth: 0 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
});

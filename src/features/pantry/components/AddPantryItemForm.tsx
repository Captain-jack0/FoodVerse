import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/ui/Chip';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { CATEGORIES, guessCategory, inDays } from '../categories';
import type { NewPantryItem } from '../pantryApi';
import type { PantryCategory } from '../types';

const MAX_NAME = 60;
const MAX_QUANTITY = 40;

// CATEGORIES[*].shelfDays değerlerinin hepsi burada olmalı (tahmin seçili görünsün)
const SHELF_LIFE = [
  { label: '3 gün', days: 3 },
  { label: '5 gün', days: 5 },
  { label: '1 hafta', days: 7 },
  { label: '2 hafta', days: 14 },
  { label: '1 ay', days: 30 },
  { label: '3 ay', days: 90 },
  { label: '6 ay', days: 180 },
];

type AddPantryItemFormProps = {
  isWide: boolean;
  onAdd: (item: NewPantryItem) => Promise<boolean>;
};

export function AddPantryItemForm({ isWide, onAdd }: AddPantryItemFormProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<PantryCategory>('diger');
  const [shelfDays, setShelfDays] = useState(CATEGORIES.diger.shelfDays);
  // Kullanıcı elle seçene kadar kategori ve süre addan tahmin edilir
  const [pickedByUser, setPickedByUser] = useState(false);

  const changeName = (value: string) => {
    setName(value);
    if (pickedByUser) return;
    const guess = guessCategory(value);
    setCategory(guess);
    setShelfDays(CATEGORIES[guess].shelfDays);
  };

  const pickCategory = (value: PantryCategory) => {
    setPickedByUser(true);
    setCategory(value);
  };
  const [saving, setSaving] = useState(false);
  const trimmed = name.trim();

  const submit = async () => {
    if (!trimmed || saving) return;
    setSaving(true);
    const ok = await onAdd({
      name: trimmed,
      emoji: CATEGORIES[category].emoji,
      category,
      quantity: quantity.trim() || '1 adet',
      expiresOn: inDays(shelfDays),
    });
    setSaving(false);
    if (ok) {
      setName('');
      setQuantity('');
      setPickedByUser(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inputRow, { backgroundColor: c.card }]}>
        <MaterialIcons name="add-shopping-cart" size={22} color={c.textMuted} />
        <TextInput
          value={name}
          onChangeText={changeName}
          onSubmitEditing={submit}
          maxLength={MAX_NAME}
          placeholder={isWide ? 'Yeni malzeme adı yaz (örn: Çedar Peyniri, Fesleğen)...' : 'Yeni malzeme ekle...'}
          placeholderTextColor={c.textMuted}
          accessibilityLabel="Yeni malzeme adı"
          returnKeyType="done"
          style={[styles.input, { color: c.text }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Malzemeyi ekle"
          disabled={!trimmed || saving}
          onPress={submit}
          style={[styles.addButton, { backgroundColor: c.primary, opacity: trimmed && !saving ? 1 : 0.5 }]}>
          <MaterialIcons name="add" size={18} color={c.onPrimary} />
          <AppText variant="labelLg" color="onPrimary">
            {saving ? '...' : 'Ekle'}
          </AppText>
        </Pressable>
      </View>

      {trimmed.length > 0 && (
        <View style={[styles.details, { backgroundColor: c.card }]}>
          <AppText variant="labelMd" color="textMuted">
            KATEGORİ
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {(Object.keys(CATEGORIES) as PantryCategory[]).map((cat) => (
              <Chip
                key={cat}
                label={`${CATEGORIES[cat].emoji} ${CATEGORIES[cat].label}`}
                selected={category === cat}
                onPress={() => pickCategory(cat)}
              />
            ))}
          </ScrollView>

          <AppText variant="labelMd" color="textMuted">
            NE KADAR DAYANIR?
          </AppText>
          <View style={styles.chipsWrap}>
            {SHELF_LIFE.map((opt) => (
              <Chip
                key={opt.days}
                label={opt.label}
                selected={shelfDays === opt.days}
                onPress={() => {
                  setPickedByUser(true);
                  setShelfDays(opt.days);
                }}
              />
            ))}
          </View>

          <View style={[styles.quantityRow, { backgroundColor: c.surfaceLow }]}>
            <MaterialIcons name="scale" size={18} color={c.textMuted} />
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              onSubmitEditing={submit}
              maxLength={MAX_QUANTITY}
              placeholder="Miktar (örn: 500 gr, 3 adet) — isteğe bağlı"
              placeholderTextColor={c.textMuted}
              accessibilityLabel="Miktar"
              style={[styles.input, { color: c.text }]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SPACING.sm },
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
  details: { borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  chips: { gap: SPACING.sm, paddingVertical: 2, paddingHorizontal: 2 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
});

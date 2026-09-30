import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { TextField } from '@/components/ui/TextField';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { CATEGORIES, inDays, SHELF_LIFE } from '../categories';
import type { NewPantryItem } from '../pantryApi';
import { daysLeft, expiryLabel } from '../pantryUtils';
import type { PantryCategory, PantryItem } from '../types';

type EditPantryItemModalProps = {
  item: PantryItem;
  onSave: (id: string, item: NewPantryItem) => Promise<boolean>;
  onClose: () => void;
};

export function EditPantryItemModal({ item, onSave, onClose }: EditPantryItemModalProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [category, setCategory] = useState<PantryCategory>(item.category);
  // null = son kullanma tarihine dokunma
  const [shelfDays, setShelfDays] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string>();

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Malzemenin adı boş olamaz.');
      return;
    }
    setSaving(true);
    const ok = await onSave(item.id, {
      name: trimmed,
      // Kategori değiştiyse simge de yeni kategoriye uysun
      emoji: category === item.category ? item.emoji : CATEGORIES[category].emoji,
      category,
      quantity: quantity.trim() || '1 adet',
      expiresOn: shelfDays === null ? item.expiresOn : inDays(shelfDays),
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
        {/* Kartın içine dokununca kapanmasın */}
        <Pressable style={[styles.card, { backgroundColor: c.card }]} onPress={() => undefined} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <AppText variant="headlineMd">
              {item.emoji} Malzemeyi Düzenle
            </AppText>
            <TextField
              label="Ad"
              icon="edit"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setNameError(undefined);
              }}
              error={nameError}
              maxLength={60}
            />
            <TextField label="Miktar" icon="scale" value={quantity} onChangeText={setQuantity} maxLength={40} />

            <AppText variant="labelMd" color="textMuted">
              KATEGORİ
            </AppText>
            <View style={styles.wrap}>
              {(Object.keys(CATEGORIES) as PantryCategory[]).map((cat) => (
                <Chip
                  key={cat}
                  label={`${CATEGORIES[cat].emoji} ${CATEGORIES[cat].label}`}
                  selected={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </View>

            <AppText variant="labelMd" color="textMuted">
              SON KULLANMA (şu an: {expiryLabel(daysLeft(item.expiresOn))})
            </AppText>
            <View style={styles.wrap}>
              <Chip label="Değiştirme" selected={shelfDays === null} onPress={() => setShelfDays(null)} />
              {SHELF_LIFE.map((opt) => (
                <Chip
                  key={opt.days}
                  label={`Bugünden ${opt.label}`}
                  selected={shelfDays === opt.days}
                  onPress={() => setShelfDays(opt.days)}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <GameButton label="Vazgeç" variant="soft" onPress={onClose} style={styles.flex} />
              <GameButton label={saving ? 'Kaydediliyor...' : 'Kaydet'} icon="save" onPress={save} disabled={saving} style={styles.flex} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 23, 71, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  card: { width: '100%', maxWidth: 520, maxHeight: '90%', borderRadius: RADIUS.xl, overflow: 'hidden' },
  content: { padding: SPACING.lg, gap: SPACING.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  flex: { flex: 1 },
});

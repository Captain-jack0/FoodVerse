import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormError } from '@/components/ui/FormError';
import { GameButton } from '@/components/ui/GameButton';
import { HintCard, LoadState } from '@/components/ui/HintCard';
import { Tag } from '@/components/ui/Tag';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { ShoppingItemRow } from './components/ShoppingItemRow';
import type { useShoppingList } from './useShoppingList';

const MAX_NAME = 60;
const MAX_AMOUNT = 40;

type ShoppingListSectionProps = { list: ReturnType<typeof useShoppingList> };

export function ShoppingListSection({ list }: ShoppingListSectionProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [moving, setMoving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const toBuy = list.items.filter((i) => !i.checked);
  const inCart = list.items.filter((i) => i.checked);
  const trimmed = name.trim();

  const addManual = async () => {
    if (!trimmed) return;
    const ok = await list.add([{ name: trimmed, amount: amount.trim() }]);
    if (ok) {
      setName('');
      setAmount('');
    }
  };

  const moveToPantry = async () => {
    setMoving(true);
    setNotice(null);
    const count = await list.moveCheckedToPantry();
    setMoving(false);
    if (count > 0) setNotice(`🧺 ${count} malzeme kilerine yerleşti! Kategorisini ve tarihini Kiler'den kontrol edebilirsin.`);
  };

  const inputStyle = [styles.input, { backgroundColor: c.card, color: c.text }];

  return (
    <View style={styles.section}>
      <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
        <View style={styles.heroTop}>
          <View style={styles.flex}>
            <AppText variant="labelMd" color="primary">
              ALIŞVERİŞ LİSTESİ
            </AppText>
            <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Markete Ne Lazım?</AppText>
          </View>
          {list.items.length > 0 && <Tag label={`${toBuy.length} alınacak · ${inCart.length} sepette`} bg="card" />}
        </View>
        <View style={styles.addRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={addManual}
            placeholder="Ne alınacak? (örn: süt)"
            placeholderTextColor={c.textMuted}
            maxLength={MAX_NAME}
            accessibilityLabel="Alınacak malzeme"
            style={[...inputStyle, styles.flex2]}
          />
          <TextInput
            value={amount}
            onChangeText={setAmount}
            onSubmitEditing={addManual}
            placeholder="Miktar"
            placeholderTextColor={c.textMuted}
            maxLength={MAX_AMOUNT}
            accessibilityLabel="Miktar"
            style={[...inputStyle, styles.flex1]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Listeye ekle"
            disabled={!trimmed}
            onPress={addManual}
            style={[styles.addButton, { backgroundColor: c.primary, opacity: trimmed ? 1 : 0.5 }]}>
            <MaterialIcons name="add" size={24} color={c.onPrimary} />
          </Pressable>
        </View>
        <AppText variant="bodySm" color="textMuted">
          {'💡 Tarif sayfasındaki "Eksikleri Alışveriş Listesine Ekle" butonuyla eksikler tek dokunuşla buraya gelir.'}
        </AppText>
      </View>

      {list.actionError && <FormError text={list.actionError} />}
      {notice && (
        <View style={[styles.notice, { backgroundColor: c.secondaryContainer }]}>
          <AppText variant="bodySm" color="onSecondaryContainer">
            {notice}
          </AppText>
        </View>
      )}

      {list.status !== 'ready' ? (
        <LoadState status={list.status} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <HintCard
          emoji="🛒"
          title="Listen tertemiz!"
          text="Yukarıdan elle ekleyebilir ya da bir tarifin eksiklerini tek dokunuşla buraya gönderebilirsin. Marketten aldıklarını işaretle, sonra tek tuşla kilerine aktar."
        />
      ) : (
        <View style={[styles.columns, isWide && styles.columnsWide]}>
          <View style={[styles.section, isWide && styles.flex]}>
            <AppText variant="headlineMd">🛒 Alınacaklar ({toBuy.length})</AppText>
            {toBuy.length === 0 ? (
              <AppText variant="bodySm" color="textMuted">
                Hepsi sepette, harikasın! 🎉
              </AppText>
            ) : (
              toBuy.map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={list.toggle} onRemove={(id) => list.remove([id])} />
              ))
            )}
          </View>

          {inCart.length > 0 && (
            <View style={[styles.section, isWide && styles.flex]}>
              <AppText variant="headlineMd">✅ Sepette ({inCart.length})</AppText>
              {inCart.map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={list.toggle} onRemove={(id) => list.remove([id])} />
              ))}
              <GameButton
                label={moving ? 'Kilere taşınıyor...' : 'Alınanları Kilere Aktar'}
                icon="kitchen"
                variant="sunny"
                disabled={moving}
                onPress={moveToPantry}
              />
              <GameButton
                label="Sepettekileri Listeden Sil"
                icon="delete-sweep"
                variant="soft"
                disabled={moving}
                onPress={() => list.remove(inCart.map((i) => i.id))}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: SPACING.sm, flexWrap: 'wrap' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  input: {
    fontFamily: FONT.medium,
    fontSize: 15,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    minWidth: 0,
  },
  addButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notice: { borderRadius: RADIUS.md, padding: SPACING.md },
  columns: { gap: SPACING.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  section: { gap: SPACING.sm },
});

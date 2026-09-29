import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

import { LIMITS } from '../recipeDraft';
import type { Ingredient } from '../types';

// Değiştirilmiş kopya döner (immutable)
const replaceAt = <T,>(list: T[], index: number, value: T) => list.map((item, i) => (i === index ? value : item));
const removeAt = <T,>(list: T[], index: number) => list.filter((_, i) => i !== index);

function RemoveButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useKukkiTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8}>
      <MaterialIcons name="remove-circle-outline" size={22} color={theme.colors.textMuted} />
    </Pressable>
  );
}

function AddRowButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const { theme } = useKukkiTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.addRow, { borderColor: theme.colors.outline, opacity: disabled ? 0.5 : 1 }]}>
      <MaterialIcons name="add" size={18} color={theme.colors.primary} />
      <AppText variant="labelLg" color="primary">
        {label}
      </AppText>
    </Pressable>
  );
}

export function IngredientListEditor({ value, onChange }: { value: Ingredient[]; onChange: (next: Ingredient[]) => void }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const inputStyle = [styles.input, { backgroundColor: c.surfaceLow, color: c.text }];

  return (
    <View style={styles.list}>
      {value.map((ing, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={ing.name}
            onChangeText={(name) => onChange(replaceAt(value, i, { ...ing, name }))}
            placeholder="Malzeme (örn: mantar)"
            placeholderTextColor={c.textMuted}
            maxLength={LIMITS.ingredientName}
            accessibilityLabel={`${i + 1}. malzeme adı`}
            style={[...inputStyle, styles.flex2]}
          />
          <TextInput
            value={ing.amount}
            onChangeText={(amount) => onChange(replaceAt(value, i, { ...ing, amount }))}
            placeholder="Miktar"
            placeholderTextColor={c.textMuted}
            maxLength={LIMITS.ingredientAmount}
            accessibilityLabel={`${i + 1}. malzeme miktarı`}
            style={[...inputStyle, styles.flex1]}
          />
          {value.length > 1 && <RemoveButton label={`${i + 1}. malzemeyi sil`} onPress={() => onChange(removeAt(value, i))} />}
        </View>
      ))}
      <AddRowButton
        label="Malzeme ekle"
        disabled={value.length >= LIMITS.maxIngredients}
        onPress={() => onChange([...value, { name: '', amount: '' }])}
      />
    </View>
  );
}

export function StepListEditor({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;

  return (
    <View style={styles.list}>
      {value.map((step, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.stepNo, { backgroundColor: c.primaryContainer }]}>
            <AppText variant="labelMd" color="onPrimary">
              {i + 1}
            </AppText>
          </View>
          <TextInput
            value={step}
            onChangeText={(text) => onChange(replaceAt(value, i, text))}
            placeholder={i === 0 ? 'örn: Soğanları yemeklik doğra ve kavur.' : 'Sonraki adım...'}
            placeholderTextColor={c.textMuted}
            maxLength={LIMITS.step}
            multiline
            accessibilityLabel={`${i + 1}. adım`}
            style={[styles.input, styles.multiline, styles.flex2, { backgroundColor: c.surfaceLow, color: c.text }]}
          />
          {value.length > 1 && <RemoveButton label={`${i + 1}. adımı sil`} onPress={() => onChange(removeAt(value, i))} />}
        </View>
      ))}
      <AddRowButton label="Adım ekle" disabled={value.length >= LIMITS.maxSteps} onPress={() => onChange([...value, ''])} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  input: {
    fontFamily: FONT.medium,
    fontSize: 15,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    minWidth: 0,
  },
  multiline: { minHeight: 48, textAlignVertical: 'top' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  stepNo: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { FONT, RADIUS, SPACING } from '@/theme/tokens';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  error?: string;
  required?: boolean;
  /** Şifre alanı: göster/gizle düğmesi ekler */
  secret?: boolean;
};

export function TextField({ label, icon, error, required, secret, ...inputProps }: TextFieldProps) {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrapper}>
      <AppText variant="labelLg">
        {label}
        {required && <AppText variant="labelLg" color="primary"> *</AppText>}
      </AppText>
      <View
        style={[
          styles.field,
          { backgroundColor: c.surfaceLow, borderColor: error ? c.error : 'transparent' },
        ]}>
        <MaterialIcons name={icon} size={20} color={c.textMuted} />
        <TextInput
          {...inputProps}
          secureTextEntry={secret && hidden}
          accessibilityLabel={label}
          placeholderTextColor={c.textMuted}
          style={[styles.input, { color: c.text }]}
        />
        {secret && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Şifreyi göster' : 'Şifreyi gizle'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}>
            <MaterialIcons name={hidden ? 'visibility' : 'visibility-off'} size={20} color={c.textMuted} />
          </Pressable>
        )}
      </View>
      {error && (
        <AppText variant="bodySm" color="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontFamily: FONT.medium, fontSize: 15, paddingVertical: 14, minWidth: 0 },
});

import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { HintCard } from '@/components/ui/HintCard';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING } from '@/theme/tokens';

import { isLegalDocId, LEGAL_DOCUMENTS } from './documents';
import { LegalLinks } from './LegalLinks';
import { LEGAL_INFO, LEGAL_INFO_INCOMPLETE } from './legalInfo';

export function LegalScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const { doc } = useLocalSearchParams<{ doc: string }>();

  if (!isLegalDocId(doc)) {
    return (
      <>
        <StackHeader title="Yasal" />
        <Screen>
          <HintCard emoji="🔍" title="Sayfa bulunamadı" text="Aradığın yasal metin burada değil." />
          <LegalLinks />
        </Screen>
      </>
    );
  }

  const document = LEGAL_DOCUMENTS[doc];

  return (
    <>
      <StackHeader title={document.title} />
      <Screen>
        <View style={styles.page}>
          {LEGAL_INFO_INCOMPLETE && (
            <View style={[styles.draft, { backgroundColor: c.secondaryContainer }]}>
              <AppText variant="labelMd" color="onSecondaryContainer">
                ⚠️ Taslak metin — yayından önce yer tutucular doldurulacak ve hukuki kontrolden geçirilecek.
              </AppText>
            </View>
          )}
          <AppText style={styles.emoji}>{document.emoji}</AppText>
          <AppText variant="headlineLg" accessibilityRole="header">
            {document.title}
          </AppText>
          <AppText variant="labelSm" color="textMuted">
            Son güncelleme: {LEGAL_INFO.updatedAt}
          </AppText>
          <AppText variant="bodyMd">{document.intro}</AppText>

          {document.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <AppText variant="headlineMd" accessibilityRole="header">
                {section.title}
              </AppText>
              {section.paragraphs.map((p, i) => (
                <AppText key={i} variant="bodyMd" color="textMuted">
                  {p}
                </AppText>
              ))}
            </View>
          ))}

          <LegalLinks />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  // Okunabilir satır uzunluğu
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: SPACING.sm },
  draft: { borderRadius: RADIUS.md, padding: SPACING.md },
  emoji: { fontSize: 40, lineHeight: 50 },
  section: { gap: SPACING.xs, marginTop: SPACING.md },
});

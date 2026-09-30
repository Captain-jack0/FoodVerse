import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { StackHeader } from '@/components/navigation/StackHeader';
import { Screen } from '@/components/Screen';
import { GameButton } from '@/components/ui/GameButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useIsWide } from '@/hooks/useIsWide';
import { useKukkiTheme } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, type ThemeColors } from '@/theme/tokens';

import { LegalLinks } from './LegalLinks';

type Icon = ComponentProps<typeof MaterialIcons>['name'];

const POWERS: { icon: Icon; bg: keyof ThemeColors; title: string; text: string }[] = [
  { icon: 'kitchen', bg: 'surfaceHigh', title: 'Sanal Kiler & Dolap', text: 'Dolabındakileri takip et; son kullanma tarihi yaklaşanları sana hatırlatalım, israf etme.' },
  { icon: 'menu-book', bg: 'secondaryContainer', title: 'Tarif Defteri & Koleksiyonlar', text: 'Kendi tariflerini yaz, sosyal medyadan kaydet, "Anne Defteri" gibi koleksiyonlarda topla.' },
  { icon: 'mic', bg: 'primaryContainer', title: 'Sesli Pişirme Yoldaşı', text: 'Ellerin hamurluyken "sonraki", "10 dakika zamanlayıcı" de; adımları sana okuyalım.' },
  { icon: 'groups', bg: 'surfaceHigh', title: 'Topluluk & Reçete İyileştirme', text: 'Tarifleri paylaş, puan ver, öneri bırak; önerin uygulanırsa yeni sürümde adın anılsın.' },
];

const PHILOSOPHY = [
  { title: '❤️ Yemek yapmak bir görev değil, bir yaratıcılık seansıdır', text: 'Hata yapmaktan korkmayan mutfaklar en lezzetli olanlardır. Kukki, mutfaktaki her adımı bir oyun gibi keyifli hale getirmek için var.' },
  { title: '🥕 Buzdolabında unutulan her sebze bir görevdir', text: 'Bozulmak üzere olan malzemeleri kurtarmak günlük görevlerimizin kalbinde. Daha az israf, daha çok lezzet.' },
  { title: '🤝 Samimi, yargısız ve destekleyici bir topluluk', text: 'Topluluk kurallarımız herkesin kendini güvende hissetmesi için var; küfür ve hakarete yer yok.' },
];

export function AboutScreen() {
  const { theme } = useKukkiTheme();
  const c = theme.colors;
  const isWide = useIsWide();
  const { session } = useAuth();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <StackHeader title="Hakkımızda" />
      <Screen>
        <View style={[styles.hero, { backgroundColor: c.surfaceLow }]}>
          <View style={[styles.badge, { backgroundColor: c.secondaryContainer }]}>
            <AppText variant="labelSm" color="onSecondaryContainer">
              🍳 KUKKİ DÜNYASINA HOŞ GELDİN
            </AppText>
          </View>
          <AppText variant={isWide ? 'headlineXl' : 'headlineXlMobile'}>Yemek Yapmayı Eğlenceli Bir Oyuna Dönüştürüyoruz ✨</AppText>
          <AppText variant="bodyLg" color="textMuted">
            Kukki Kitchen; sıradan akşam yemeği stresini, unutulan buzdolabı malzemelerini ve dağınık tarif notlarını
            sıcacık, oyunlaştırılmış bir mutfak serüvenine çeviriyor.
          </AppText>
          <GameButton
            label={session ? 'Mutfağıma Dön' : 'Şef Önlüğünü Giy'}
            icon={session ? 'kitchen' : 'restaurant'}
            variant="accent"
            onPress={() => router.replace(session ? '/' : '/kayit')}
          />
        </View>

        <View style={[styles.story, { backgroundColor: c.card }]}>
          <AppText variant="labelMd" color="primary">
            BİZİM HİKAYEMİZ
          </AppText>
          <AppText variant="headlineMd">🏠 Buzdolabı karşısındaki o sessiz bakışma</AppText>
          <AppText variant="bodyMd" color="textMuted">
            Hepimiz o anı yaşadık: akşam saat 7, yorgun argın eve gelmişiz, buzdolabının kapağı açık ve rafta boş boş
            bakışan malzemeler. Unutulmuş yarım paket krema, dünden kalan haşlanmış mercimek… &quot;Bugün yine ne
            pişirsem?&quot;
          </AppText>
          <AppText variant="bodyMd" color="textMuted">
            Kukki bu sorudan doğdu. Kilerini tanıyan, tariflerini düzenleyen, ellerin doluyken sana adım adım eşlik eden
            ve bunu yaparken seni gülümseten bir mutfak arkadaşı.
          </AppText>
        </View>

        <AppText variant="headlineLg">Mutfakta Sihirli Güçlerin Var</AppText>
        <View style={styles.powers}>
          {POWERS.map((p) => (
            <View key={p.title} style={[styles.power, { backgroundColor: c.card }, isWide && styles.powerWide]}>
              <View style={[styles.powerIcon, { backgroundColor: c[p.bg] }]}>
                <MaterialIcons name={p.icon} size={22} color={c.text} />
              </View>
              <AppText variant="labelLg">{p.title}</AppText>
              <AppText variant="bodySm" color="textMuted">
                {p.text}
              </AppText>
            </View>
          ))}
        </View>

        <View style={[styles.story, { backgroundColor: c.card }]}>
          <AppText variant="labelMd" color="primary">
            MUTFAK EKİBİ
          </AppText>
          {/* ⚠️ YAYINDAN ÖNCE DOLDUR: kendi hikayen / ekibin */}
          <AppText variant="bodyMd" color="textMuted">
            [KURUCU / EKİP HAKKINDA KISA BİR PARAGRAF — örn. &quot;Kukki, mutfakta vakit geçirmeyi seven bir geliştiricinin
            kendi mutfağı için başladığı bir projedir.&quot;]
          </AppText>
        </View>

        <AppText variant="headlineLg">Mutfak Felsefemiz</AppText>
        {PHILOSOPHY.map((item, i) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityState={{ expanded: open === i }}
            onPress={() => setOpen(open === i ? null : i)}
            style={[styles.faq, { backgroundColor: c.card }]}>
            <View style={styles.faqHeader}>
              <AppText variant="labelLg" style={styles.flex}>
                {item.title}
              </AppText>
              <MaterialIcons name={open === i ? 'expand-less' : 'expand-more'} size={22} color={c.textMuted} />
            </View>
            {open === i && (
              <AppText variant="bodySm" color="textMuted">
                {item.text}
              </AppText>
            )}
          </Pressable>
        ))}

        <LegalLinks />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  badge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  story: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  powers: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  power: { borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, width: '100%' },
  powerWide: { width: '48%' },
  powerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  faq: { borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});

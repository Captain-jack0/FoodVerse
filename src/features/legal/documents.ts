import { LEGAL_INFO as L } from './legalInfo';

export type LegalSection = { title: string; paragraphs: string[] };
export type LegalDocument = { id: LegalDocId; title: string; emoji: string; intro: string; sections: LegalSection[] };
export type LegalDocId = 'kvkk' | 'gizlilik' | 'kosullar';

// Taslak metinler — hukuki danışmanlık yerine geçmez; avukat kontrolünden geçirilmelidir.

const KVKK: LegalDocument = {
  id: 'kvkk',
  title: 'KVKK Aydınlatma Metni',
  emoji: '🛡️',
  intro: `${L.appName} olarak kişisel verilerinin güvenliğine önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi uyarınca seni bilgilendirmek için hazırlanmıştır.`,
  sections: [
    {
      title: '1. Veri Sorumlusu',
      paragraphs: [`Veri sorumlusu: ${L.controller}. Adres: ${L.address}. İletişim: ${L.email}.`],
    },
    {
      title: '2. İşlenen Kişisel Veriler',
      paragraphs: [
        'Kimlik ve iletişim: ad veya şef takma adı, e-posta adresi.',
        'Hesap güvenliği: şifren (yalnızca geri döndürülemez biçimde, şifrelenmiş olarak saklanır), oturum kayıtları.',
        'Görsel: yüklediğin profil ve tarif fotoğrafları.',
        'Uygulama kullanımı: kiler malzemelerin, tariflerin, koleksiyonların, yemek planın, alışveriş listen, favorilerin, pişirme geçmişin, puanların ve yorumların.',
        'Tercihler: vejetaryen, glutensiz, pratik, tatlı gibi mutfak tercihlerin. Bu tercihlerden bazıları (örneğin glutensiz beslenme) sağlık durumuna ilişkin bilgi içerebileceğinden özel nitelikli kişisel veri sayılabilir; bu tercihleri paylaşmak tamamen isteğe bağlıdır.',
        'Topluluk güvenliği: şikayet kayıtları, topluluk kurallarını ihlal denemeleri ve uygulanan yaptırımlar.',
      ],
    },
    {
      title: '3. İşleme Amaçları',
      paragraphs: [
        'Hesabını oluşturmak ve güvenle giriş yapmanı sağlamak; kiler, tarif defteri, planlayıcı, alışveriş listesi ve pişirme asistanı özelliklerini sunmak; kilerine ve tercihlerine göre tarif önermek; topluluk özelliklerini (paylaşım, yorum, puan) yürütmek ve topluluğu kötüye kullanıma karşı korumak; yasal yükümlülükleri yerine getirmek; talep ve başvurularını yanıtlamak.',
      ],
    },
    {
      title: '4. Hukuki Sebepler',
      paragraphs: [
        'Verilerin; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (KVKK m. 5/2-c), veri sorumlusunun hukuki yükümlülüğü (m. 5/2-ç), meşru menfaat (m. 5/2-f) ve gerektiğinde açık rızan (m. 5/1, özel nitelikli veriler için m. 6) hukuki sebeplerine dayanılarak işlenir.',
      ],
    },
    {
      title: '5. Verilerin Aktarılması',
      paragraphs: [
        'Uygulamayı çalıştırmak için hizmet sağlayıcılardan yararlanıyoruz: veritabanı, kimlik doğrulama ve dosya depolama için Supabase (sunucular Avrupa Birliği / Frankfurt), web sitesinin sunulması için Vercel. Bu aktarımlar KVKK m. 8 ve m. 9 kapsamındaki şartlara uygun şekilde yapılır.',
        'Sesli komut özelliğini kullandığında konuşman, cihazının veya tarayıcının ses tanıma hizmeti (ör. Apple veya Google) tarafından işlenir; Kukki ses kaydını kendi sunucularında saklamaz.',
        'Toplulukla paylaştığın tarifler, yorumlar, puanlar, şef adın, seviyen ve profil fotoğrafın diğer kullanıcılar tarafından görülebilir.',
        'Kanunen yetkili kamu kurum ve kuruluşlarına, talep halinde ve mevzuatın gerektirdiği ölçüde aktarım yapılabilir.',
      ],
    },
    {
      title: '6. Toplama Yöntemi',
      paragraphs: ['Kişisel veriler; uygulamaya ve web sitesine girdiğin bilgiler, yüklediğin dosyalar ve kullanım sırasında oluşan kayıtlar aracılığıyla elektronik ortamda toplanır.'],
    },
    {
      title: '7. Saklama Süresi',
      paragraphs: [
        'Verilerin hesabın açık olduğu sürece saklanır. Hesabını sildiğinde verilerin silinir; yalnızca mevzuatın saklamamızı zorunlu kıldığı kayıtlar yasal süre boyunca tutulur.',
      ],
    },
    {
      title: '8. Hakların (KVKK m. 11)',
      paragraphs: [
        'Kişisel verinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, KVKK m. 7 çerçevesinde silinmesini veya yok edilmesini isteme, bu işlemlerin aktarılan kişilere bildirilmesini isteme, otomatik sistemlerle analiz sonucu aleyhine bir sonuç çıkmasına itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğraman halinde zararın giderilmesini talep etme haklarına sahipsin.',
        `Uygulamadaki Profil → Hesap bölümünden verilerini indirebilir ve hesabını silebilirsin. Diğer talepler için ${L.email} adresine yazabilirsin; başvurun en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.`,
      ],
    },
  ],
};

const PRIVACY: LegalDocument = {
  id: 'gizlilik',
  title: 'Gizlilik Politikası',
  emoji: '🔒',
  intro: `Bu politika, ${L.appName} uygulaması ve ${L.website} web sitesinde verilerinin nasıl kullanıldığını sade bir dille anlatır. Ayrıntılı yasal bilgi için KVKK Aydınlatma Metni'ne bakabilirsin.`,
  sections: [
    {
      title: 'Neyi topluyoruz?',
      paragraphs: [
        'Kayıt olurken ad/takma ad, e-posta ve şifre; uygulamayı kullanırken eklediğin kiler malzemeleri, tarifler, fotoğraflar, planlar, listeler, yorumlar ve puanlar; isteğe bağlı mutfak tercihlerin.',
        'Reklam amaçlı takip çerezi kullanmıyoruz. Oturumunu açık tutmak ve tema tercihini hatırlamak için cihazında zorunlu yerel depolama kullanılır.',
      ],
    },
    {
      title: 'Neyi kim görür?',
      paragraphs: [
        'Kilerin, tarif defterin, planın, alışveriş listen, favorilerin ve tercihlerin yalnızca sana aittir; diğer kullanıcılar göremez.',
        '"Toplulukla paylaş" dediğin tarifler, yorumların ve puanların; şef adın, seviyen ve profil fotoğrafınla birlikte diğer kullanıcılara görünür.',
        'Topluluk güvenliği için yöneticiler, şikayet edilen içerikleri inceleyebilir. Yöneticiler kişisel (paylaşılmamış) tariflerini göremez.',
      ],
    },
    {
      title: 'Sesli asistan',
      paragraphs: [
        'Pişirme modunda mikrofonu açarsan, konuşman cihazının veya tarayıcının ses tanıma hizmetinde metne çevrilir. Kukki yalnızca komutu (örn. "sonraki") kullanır; ses kaydı saklamaz. Mikrofonu dilediğin an "Sustur" ile kapatabilirsin.',
      ],
    },
    {
      title: 'Verilerin nerede?',
      paragraphs: ['Verilerin Supabase altyapısında (Avrupa Birliği / Frankfurt) saklanır, bağlantılar şifrelidir (HTTPS). Web sitesi Vercel üzerinden sunulur.'],
    },
    {
      title: 'Kontrol sende',
      paragraphs: [
        'Profil → Hesap bölümünden verilerini tek dosya olarak indirebilir, hesabını ve tüm verilerini kalıcı olarak silebilirsin.',
        `Soruların için: ${L.email}`,
      ],
    },
    {
      title: 'Çocuklar',
      paragraphs: ['Uygulama 13 yaşından küçük çocuklara yönelik değildir. 18 yaşından küçüksen uygulamayı velinin bilgisi ve izniyle kullanmalısın.'],
    },
    {
      title: 'Değişiklikler',
      paragraphs: ['Bu politikayı güncelleyebiliriz; önemli değişiklikleri uygulama içinden duyururuz.'],
    },
  ],
};

const TERMS: LegalDocument = {
  id: 'kosullar',
  title: 'Kullanım Koşulları',
  emoji: '📜',
  intro: `${L.appName}'i kullanarak bu koşulları kabul etmiş olursun. Lütfen dikkatlice oku.`,
  sections: [
    {
      title: '1. Hizmet',
      paragraphs: [
        `${L.appName}; kiler takibi, tarif defteri, yemek planlama, alışveriş listesi, pişirme asistanı ve tarif paylaşım topluluğu sunan bir uygulamadır. Hizmet "olduğu gibi" sunulur ve zaman zaman değiştirilebilir veya geçici olarak kesintiye uğrayabilir.`,
      ],
    },
    {
      title: '2. Hesabın',
      paragraphs: [
        'Kayıt olurken doğru bilgi vermeli, şifreni gizli tutmalısın. Hesabınla yapılan işlemlerden sen sorumlusun. Hesabını dilediğin zaman Profil → Hesap bölümünden silebilirsin.',
      ],
    },
    {
      title: '3. Paylaştığın İçerik',
      paragraphs: [
        'Paylaştığın tariflerin, fotoğrafların ve yorumların sahibi sensin. Toplulukla paylaştığın içeriği diğer kullanıcıların görebilmesi, kaydedebilmesi ve uygulama içinde gösterilebilmesi için bize ücretsiz, münhasır olmayan bir kullanım izni vermiş olursun. İçeriği sildiğinde veya paylaşımı kapattığında bu izin sona erer.',
        'Başkasına ait tarif, fotoğraf veya metni izinsiz paylaşmamalı; sosyal medyadan aldığın tariflerde kaynağı belirtmelisin.',
      ],
    },
    {
      title: '4. Topluluk Kuralları',
      paragraphs: [
        'Küfür, hakaret, nefret söylemi, taciz, spam/reklam, yanıltıcı veya tehlikeli bilgi ve yasa dışı içerik yasaktır.',
        'Şikayet edilen içerikler incelenir; 3 farklı kullanıcının şikayet ettiği içerik inceleme süresince gizlenebilir. Kural ihlalinde topluluk özellikleri (paylaşım, yorum, puan) kademeli olarak kısıtlanır: 1 saat, 1 gün, 1 hafta, 1 ay, 1 yıl ve kalıcı. Kısıtlama süresince kilerin, defterin ve planın kullanılmaya devam eder.',
      ],
    },
    {
      title: '5. Sağlık ve Güvenlik Uyarısı',
      paragraphs: [
        'Tarifler ve öneriler bilgilendirme amaçlıdır. Alerji, gıda intoleransı veya özel beslenme ihtiyacın varsa malzemeleri kendin kontrol etmelisin. Son kullanma tarihleri senin girdiğin bilgilere dayanan tahminlerdir; gıdanın tüketime uygunluğunu kendin değerlendirmelisin. Pişirme sırasında ocak, fırın ve kesici aletleri kullanırken dikkatli ol.',
      ],
    },
    {
      title: '6. Sorumluluğun Sınırları',
      paragraphs: [
        'Kullanıcıların paylaştığı içeriklerin doğruluğunu garanti edemeyiz. Mevzuatın izin verdiği ölçüde, uygulamanın kullanımından doğan dolaylı zararlardan sorumlu değiliz.',
      ],
    },
    {
      title: '7. Değişiklikler ve Uygulanacak Hukuk',
      paragraphs: [
        'Bu koşulları güncelleyebiliriz; önemli değişiklikleri uygulama içinden duyururuz.',
        `Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda ${L.courtCity} mahkemeleri ve icra daireleri yetkilidir; tüketici olarak Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvuru hakkın saklıdır.`,
        `İletişim: ${L.controller} · ${L.email}`,
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = { kvkk: KVKK, gizlilik: PRIVACY, kosullar: TERMS };

export const isLegalDocId = (value: unknown): value is LegalDocId =>
  typeof value === 'string' && value in LEGAL_DOCUMENTS;

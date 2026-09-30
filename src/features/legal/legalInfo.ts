/**
 * ⚠️ YAYINDAN ÖNCE DOLDUR: Yasal metinlerdeki tüm yer tutucular buradan gelir.
 * Metinler bir başlangıç taslağıdır; herkese açmadan önce bir avukata kontrol ettir.
 */
export const LEGAL_INFO = {
  /** Gerçek kişiysen ad soyad, şirketsen tam unvan */
  controller: '[VERİ SORUMLUSU ADI / UNVANI]',
  /** KVKK başvuruları ve iletişim için e-posta */
  email: '[KVKK İLETİŞİM E-POSTASI]',
  /** Veri sorumlusunun adresi */
  address: '[VERİ SORUMLUSU ADRESİ]',
  /** Uyuşmazlıklarda yetkili mahkeme ili */
  courtCity: '[İL]',
  /** Metinlerin son güncellenme tarihi */
  updatedAt: '30 Eylül 2026',
  appName: 'Kukki Kitchen',
  website: 'https://kukki.captainmery.com',
};

/** Yer tutucular doldurulmadıysa sayfalarda uyarı gösterilir */
export const LEGAL_INFO_INCOMPLETE = Object.values(LEGAL_INFO).some((v) => v.startsWith('['));

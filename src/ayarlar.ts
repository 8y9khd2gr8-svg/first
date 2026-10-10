import { telefonYavas } from './hiz';
// Oyunun her yerinde kullanılan ortak ayarlar: boyutlar, renkler, yazı tipi.
export const GENISLIK = 720;
export const YUKSEKLIK = 1280;

export const YAZI_TIPI = "'Baloo 2', 'Arial Rounded MT Bold', Arial, sans-serif";

export const RENK = {
  uzay: 0x14213d,
  sari: 0xffc93c,
  turuncu: 0xff8a3d,
  yesil: 0x3fbf5f,
  mavi: 0x2f80ed,
  beyaz: 0xffffff,
};

// Telefonda "hareketi azalt" (erişilebilirlik) açıksa ya da telefon yavaşsa (hiz.ts) süs animasyonları
// çalışmaz; anlamlı hareketler (Zıpzıp'ın gösterimi, sıradaki durağın parlaması, kutlamalar) kalır.
const AZALT_ISTENDI = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const hareketiAzalt = () => AZALT_ISTENDI || telefonYavas();

// "Uzaktan oyna": telefon uzaktayken hareketler "Yaptım!" beklemeden kendiliğinden ilerler.
// Seçim sadece bu cihazda saklanır.
const UZAKTAN_ANAHTAR = 'zipzip-uzaktan-v1';
export function uzaktanAcikMi(): boolean {
  try {
    return localStorage.getItem(UZAKTAN_ANAHTAR) === '1';
  } catch {
    return false;
  }
}
export function uzaktanAyarla(acik: boolean) {
  try {
    if (acik) localStorage.setItem(UZAKTAN_ANAHTAR, '1');
    else localStorage.removeItem(UZAKTAN_ANAHTAR);
  } catch {
    // kayıt olmazsa bu açılışta geçerli değil; sorun değil
  }
}

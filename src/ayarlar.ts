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

// Telefonda "hareketi azalt" (erişilebilirlik) açıksa süs animasyonları çalışmaz;
// anlamlı hareketler (Zıpzıp'ın gösterimi, sıradaki durağın parlaması, kutlamalar) kalır.
export const HAREKETI_AZALT = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

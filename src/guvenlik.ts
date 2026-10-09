// Ebeveyn güvenlik notunun görülüp görülmediği ve "tüm verileri sil".
// Oyunun bu cihazda sakladığı her şeyin anahtarı "zipzip-" ile başlar.
const ONEK = 'zipzip-';
const NOT_ANAHTARI = 'zipzip-guvenlik-notu-v1';

export function guvenlikNotuGoruldu(): boolean {
  try {
    return localStorage.getItem(NOT_ANAHTARI) === '1';
  } catch {
    return false;
  }
}

export function guvenlikNotunuIsaretle() {
  try {
    localStorage.setItem(NOT_ANAHTARI, '1');
  } catch {
    // Kayıt yoksa not bir dahaki açılışta yine gösterilir; sorun değil.
  }
}

// Ad, fotoğraf, damgalar, hareket kayıtları ve ayarlar: hepsi silinir.
export function tumVerileriSil() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(ONEK))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // erişilemiyorsa silinecek bir şey de yoktur
  }
}

// Oyun ayarları (ebeveyn köşesi → ⚙️ Ayarlar): hareket temposu (yas 'kucuk' = Sakin: daha az tekrar, daha yavaş;
// 'buyuk' = Normal; 'hizli' = Hızlı: daha çok tekrar, daha hızlı; K6, kaybettirmeyen zorluk)
// ve oturarak oyna. Sadece bu cihazda saklanır; çocuğun yaşı tutulmaz.
export type OyunAyari = { yas: 'kucuk' | 'buyuk' | 'hizli'; oturarak: boolean };
const OYUN_AYARI_ANAHTAR = 'zipzip-oyun-ayar-v1';
export function oyunAyari(): OyunAyari {
  try {
    const a = JSON.parse(localStorage.getItem(OYUN_AYARI_ANAHTAR) ?? '{}');
    return { yas: a.yas === 'kucuk' || a.yas === 'hizli' ? a.yas : 'buyuk', oturarak: a.oturarak === true };
  } catch {
    return { yas: 'buyuk', oturarak: false };
  }
}
export function oyunAyariYaz(ayar: Partial<OyunAyari>) {
  try {
    localStorage.setItem(OYUN_AYARI_ANAHTAR, JSON.stringify({ ...oyunAyari(), ...ayar }));
  } catch {
    // kayıt olmazsa bu açılışta geçerli değil; sorun değil
  }
}

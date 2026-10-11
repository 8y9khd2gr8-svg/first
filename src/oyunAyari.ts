// Oyun ayarları (ebeveyn köşesi → ⚙️ Ayarlar): yaş grubu (küçüklerde daha az tekrar, daha yavaş) ve oturarak oyna.
// Sadece bu cihazda saklanır; çocuğun yaşı değil, ebeveynin seçtiği grup tutulur.
export type OyunAyari = { yas: 'kucuk' | 'buyuk'; oturarak: boolean };
const OYUN_AYARI_ANAHTAR = 'zipzip-oyun-ayar-v1';
export function oyunAyari(): OyunAyari {
  try {
    const a = JSON.parse(localStorage.getItem(OYUN_AYARI_ANAHTAR) ?? '{}');
    return { yas: a.yas === 'kucuk' ? 'kucuk' : 'buyuk', oturarak: a.oturarak === true };
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

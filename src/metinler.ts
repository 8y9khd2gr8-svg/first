import { DUNYA, TURKIYE } from './duraklar';
import { H, ISINMA, SOGUMA } from './hareketler';
import { AVATARLAR } from './pasaport';
import { ROZETLER } from './rozetler';

// Oyunda seslendirilen bütün cümleler. Doğal ses kayıtları bu listeden üretilir
// (npm run seslendir); listede olmayan bir cümle telefonun kendi sesiyle okunur.
// Kural: çocuğun adı sesli söylenmez (önceden kaydedilemez), sadece ekranda yazar.

export const SAYILAR = ['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'].map((s) => s[0].toLocaleUpperCase('tr') + s.slice(1) + '!');
export const GERI_SAYIM = ['Üç!', 'İki!', 'Bir!', 'Başla!'];

export const M = {
  yaptinMi: 'Süper! Yaptıysan, Yaptım düğmesine bas!',
  aferin: 'Aferin!',
  yolaCikiyoruz: 'Yola çıkıyoruz!',
  oncekiniBitir: 'Önce sıradaki durağı bitirelim!',
  turBitti: 'Tebrikler! Türkiye turunu bitirdin!',
  turaHosgeldin: 'Türkiye turuna hoş geldin! İlk durağımız İstanbul. Dokun ve başla!',
  siradaki: (yer: string) => `Sıradaki durağımız ${yer}!`,
  durakGiris: (yer: string, ad: string, bilgi: string) => `${yer}! ${ad}. Biliyor muydun? ${bilgi}`,
  damgaKazandin: (yer: string) => `Süpersin! ${yer} damgasını kazandın!`,
  karakterSec: 'Pasaportun için bir karakter seç!',
  karakterSecildi: (ad: string) => `${ad}! Harika seçim!`,
  pasaportIlk: 'Bu senin pasaportun! Önce kendine bir karakter seç. Adını da bir büyüğüne yazdırabilirsin.',
  pasaportHazir: 'Harika! Şimdi damga toplamaya başlayalım!',
  pasaportSifir: 'Merhaba gezgin! Hadi ilk damganı kazanalım!',
  pasaportDamga: (sayi: number) => `Harika gezgin! ${sayi} damga topladın!`,
  sertifika: 'Tebrikler gezgin! Türkiye Gezgini sertifikanı kazandın!',
  dunyaHosgeldin: 'Dünya Harikaları turuna hoş geldin! İlk durağımız Efes. Dokun ve başla!',
  dunyaBitti: 'İnanılmaz! Dünyanın bütün harikalarını gezdin!',
  dunyaKilitli: 'Dünya turu, Türkiye turunu bitirince açılacak!',
  yeniRozet: (ad: string) => `Yeni rozet kazandın: ${ad}!`,
  rozetAdi: (ad: string) => `${ad} rozeti!`,
  rozetNasil: (nasil: string) => `Bu rozeti kazanmak için: ${nasil}.`,
};

// Seslendirme aracı için: oyunda söylenebilecek her cümlenin tam listesi.
export function tumMetinler(): string[] {
  const liste = new Set<string>([
    ...SAYILAR,
    ...GERI_SAYIM,
    M.yaptinMi, M.aferin, M.yolaCikiyoruz, M.oncekiniBitir, M.turBitti, M.turaHosgeldin,
    M.karakterSec, M.pasaportIlk, M.pasaportHazir, M.pasaportSifir, M.sertifika, M.dunyaHosgeldin, M.dunyaBitti, M.dunyaKilitli,
    ...Object.values(H).map((h) => h.sesli),
    ISINMA.sesli,
    SOGUMA.sesli,
    ...AVATARLAR.map((a) => M.karakterSecildi(a.ad)),
    ...ROZETLER.flatMap((r) => [M.yeniRozet(r.ad), M.rozetAdi(r.ad), M.rozetNasil(r.nasil)]),
  ]);
  [TURKIYE, DUNYA].forEach((bolum) =>
    bolum.forEach((d, i) => {
      liste.add(M.durakGiris(d.yer, d.ad, d.bilgi));
      liste.add(M.damgaKazandin(d.yer));
      liste.add(d.ozel.sesli);
      if (i > 0) liste.add(M.siradaki(d.yer));
    }),
  );
  for (let i = 1; i <= TURKIYE.length + DUNYA.length; i++) liste.add(M.pasaportDamga(i));
  return [...liste];
}

import { AILE_OTURUMU } from './aile';
import { BOLUM_SIRASI, BOLUMLER, TUM_DURAKLAR } from './duraklar';
import { H, ISINMA, SOGUMA } from './hareketler';
import { AVATARLAR } from './pasaport';
import { ROZETLER } from './rozetler';
import { KOSTUMLER } from './kostumler';

// Oyunda seslendirilen bütün cümleler. Doğal ses kayıtları bu listeden üretilir
// (npm run seslendir); listede olmayan bir cümle telefonun kendi sesiyle okunur.
// Kural: çocuğun adı sesli söylenmez (önceden kaydedilemez), sadece ekranda yazar.

export const SAYILAR = ['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'].map((s) => s[0].toLocaleUpperCase('tr') + s.slice(1) + '!');
// Bölüm sertifikalarındaki unvanlar (SertifikaScene ile aynı sırada).
export const SERTIFIKA_UNVANLARI = ['Türkiye Gezgini', 'Dünya Kâşifi', 'Uzay Yolcusu', 'Spor Yıldızı', 'Dinozor Kâşifi', 'Ev Kahramanı'];
export const GERI_SAYIM = ['Üç!', 'İki!', 'Bir!', 'Başla!'];

export const M = {
  yaptinMi: 'Süper! Yaptıysan, Yaptım düğmesine bas!',
  aferin: 'Aferin!',
  kameraGordu: 'Kamera gördü, harikasın!',
  aileBitti: 'Ailece süpersiniz! Birlikte çok güzel hareket ettiniz!',
  yolaCikiyoruz: 'Yola çıkıyoruz!',
  oncekiniBitir: 'Önce sıradaki durağı bitirelim!',
  turBitti: 'Tebrikler! Türkiye turunu bitirdin!',
  turaHosgeldin: 'Türkiye turuna hoş geldin! İlk durağımız İstanbul. Dokun ve başla!',
  siradaki: (yer: string) => `Sıradaki durağımız ${yer}!`,
  // Yer ve ad aynıysa (ör. "Satürn", "Futbol") bir kez söylenir.
  durakGiris: (yer: string, ad: string, bilgi: string, baslik = 'Biliyor muydun?') => `${yer}! ${yer === ad ? '' : `${ad}. `}${baslik} ${bilgi}`,
  damgaKazandin: (yer: string) => `Süpersin! ${yer} damgasını kazandın!`,
  karakterSec: 'Pasaportun için bir karakter seç!',
  karakterSecildi: (ad: string) => `${ad}! Harika seçim!`,
  pasaportIlk: 'Bu senin pasaportun! Önce kendine bir karakter seç. Adını da bir büyüğüne yazdırabilirsin.',
  pasaportHazir: 'Harika! Şimdi damga toplamaya başlayalım!',
  pasaportSifir: 'Merhaba gezgin! Hadi ilk damganı kazanalım!',
  pasaportDamga: (sayi: number) => `Harika gezgin! ${sayi} damga topladın!`,
  sertifika: 'Tebrikler gezgin! Türkiye Gezgini sertifikanı kazandın!',
  sertifikaBolum: (unvan: string) => `Tebrikler gezgin! ${unvan} sertifikanı kazandın!`,
  dunyaHosgeldin: 'Dünya Harikaları turuna hoş geldin! İlk durağımız Efes. Dokun ve başla!',
  dunyaBitti: 'İnanılmaz! Dünyanın bütün harikalarını gezdin!',
  dunyaKilitli: 'Dünya turu, Türkiye turunu bitirince açılacak!',
  uzayHosgeldin: 'Uzay yolculuğuna hoş geldin! İlk durağımız, Güneş’e en yakın gezegen Merkür. Dokun ve başla!',
  uzayBitti: 'Muhteşem! Bütün gezegenleri gezdin, gerçek bir uzay yolcususun!',
  uzayKilitli: 'Uzay yolculuğu, dünya turunu bitirince açılacak!',
  sporHosgeldin: 'Spor Kampı’na hoş geldin! Hangi sporu seviyorsun? İstediğin spora dokun ve başla!',
  sporSec: 'İstediğin spora dokun!',
  sporBitti: 'Harikasın! Bütün sporları denedin, gerçek bir spor yıldızısın!',
  sporKilitli: 'Spor Kampı, uzay yolculuğunu bitirince açılacak!',
  dinozorHosgeldin: 'Dinozorlar Diyarı’na hoş geldin! İlk durağımız dinozor yumurtası. Dokun ve başla!',
  dinozorBitti: 'Muhteşem! Bütün dinozorlarla tanıştın!',
  dinozorKilitli: 'Dinozorlar Diyarı, Spor Kampı’nı bitirince açılacak!',
  evdeHosgeldin: 'Evde Macera’ya hoş geldin! En sevdiğin oyuncağı, bir yastığı ve çoraplarını hazırla. Dokun ve başla!',
  evdeBitti: 'Süpersin! Evde de çok güzel hareket ettin, her şeyi de topladın!',
  evdeKilitli: 'Evde Macera, Dinozorlar Diyarı’nı bitirince açılacak!',
  maceraHosgeldin: 'Büyük maceraya hoş geldin! Bir bölüm seç!',
  yakinda: 'Bu bölüm çok yakında geliyor!',
  kostumDolabi: 'Burası kostüm dolabın! Hareket ettikçe yıldız kazanırsın, yıldızlarla yeni kostümler açılır.',
  kostumSecildi: (ad: string) => `${ad} çok yakıştı!`,
  kostumKilitli: (kalan: number) => `Bu kostüm için ${kalan} yıldız daha lazım. Hareket ettikçe yıldız kazanırsın!`,
  yeniKostum: (ad: string) => `Yeni kostüm açıldı: ${ad}!`,
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
    M.karakterSec, M.pasaportIlk, M.pasaportHazir, M.pasaportSifir, M.sertifika, M.dunyaHosgeldin, M.dunyaBitti, M.dunyaKilitli, M.uzayHosgeldin, M.uzayBitti, M.uzayKilitli, M.maceraHosgeldin, M.yakinda,
    M.sporHosgeldin, M.sporSec, M.sporBitti, M.sporKilitli, M.dinozorHosgeldin, M.dinozorBitti, M.dinozorKilitli, M.evdeHosgeldin, M.evdeBitti, M.evdeKilitli,
    ...SERTIFIKA_UNVANLARI.map((u) => M.sertifikaBolum(u)),
    ...Object.values(H).map((h) => h.sesli),
    ISINMA.sesli,
    SOGUMA.sesli,
    ...AVATARLAR.map((a) => M.karakterSecildi(a.ad)),
    ...ROZETLER.flatMap((r) => [M.yeniRozet(r.ad), M.rozetAdi(r.ad), M.rozetNasil(r.nasil)]),
    M.kostumDolabi,
    M.aileBitti,
    M.kameraGordu,
    ...AILE_OTURUMU.map((h) => h.sesli),
    ...KOSTUMLER.flatMap((k) => [M.kostumSecildi(k.ad), M.yeniKostum(k.ad)]),
  ]);
  BOLUM_SIRASI.forEach((id) => {
    const { duraklar, serbest, kutuBaslik } = BOLUMLER[id];
    duraklar.forEach((d, i) => {
      liste.add(M.durakGiris(d.yer, d.ad, d.bilgi, kutuBaslik));
      liste.add(M.damgaKazandin(d.yer));
      liste.add(d.ozel.sesli);
      if (i > 0 && !serbest) liste.add(M.siradaki(d.yer));
    });
  });
  for (let i = 1; i <= TUM_DURAKLAR.length; i++) liste.add(M.pasaportDamga(i));
  return [...liste];
}

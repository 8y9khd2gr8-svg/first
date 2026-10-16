import { AILE_OTURUMU } from './aile';
import { BOLUM_SIRASI, BOLUMLER, TUM_DURAKLAR, oturum } from './duraklar';
import { AYNA, DONMA, ISINMALAR, SOGUMALAR } from './hareketler';
import { uyarlamaCumleleri } from './uyarla';
import { AVATARLAR } from './pasaport';
import { ROZETLER } from './rozetler';
import { KOSTUMLER, kostumNasil } from './kostumler';

// Oyunda seslendirilen bütün cümleler. Doğal ses kayıtları bu listeden üretilir
// (npm run seslendir); listede olmayan bir cümle telefonun kendi sesiyle okunur.
// Kural: çocuğun adı sesli söylenmez (önceden kaydedilemez), sadece ekranda yazar.

// 20'ye kadar: bir hareket bundan fazla tekrar sayarsa test uyarır (sayı söylenemezse oyun takılırdı).
export const SAYILAR = ['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'on bir', 'on iki', 'on üç', 'on dört', 'on beş', 'on altı', 'on yedi', 'on sekiz', 'on dokuz', 'yirmi'].map((s) => s[0].toLocaleUpperCase('tr') + s.slice(1) + '!');
// Bölüm sertifikalarındaki unvanlar (SertifikaScene ile aynı sırada).
export const SERTIFIKA_UNVANLARI = ['Türkiye Gezgini', 'Dünya Kâşifi', 'Uzay Yolcusu', 'Spor Yıldızı', 'Dinozor Kâşifi', 'Ev Kahramanı', 'Okyanus Kâşifi'];
export const GERI_SAYIM = ['Üç!', 'İki!', 'Bir!', 'Başla!'];

export const M = {
  yaptinMi: 'Süper! Yaptıysan, Yaptım düğmesine bas!',
  devamEdiyoruz: 'Süper! Devam ediyoruz!',
  dur: 'Dur!',
  devam: 'Devam!',
  uzaktanAcik: 'Uzaktan oyna açık! Hareketler kendiliğinden ilerleyecek.',
  bugunlukBitti: 'Bugün çok güzel hareket ettin! Yine bekleriz!',
  aferin: 'Aferin!',
  kameraGordu: 'Kamera gördü, harikasın!',
  // Büyük ayna (K40): kamerayla sayılan hareketten önce çocuk kendini ekranda görüp yerleşir.
  aynaBak: 'Ekranda kendine bak! Başından ayağına kadar görün.',
  hazirsin: 'Hazırsın! Seni görüyorum.',
  aileBitti: 'Ailece süpersiniz! Birlikte çok güzel hareket ettiniz!',
  yolaCikiyoruz: 'Yola çıkıyoruz!',
  oncekiniBitir: 'Önce sıradaki durağı bitirelim!',
  turBitti: 'Tebrikler! Türkiye turunu bitirdin! Sertifikanı almak için kupaya dokun!',
  turaHosgeldin: 'Türkiye turuna hoş geldin! İlk durağımız İstanbul. Dokun ve başla!',
  siradaki: (yer: string) => `Sıradaki durağımız ${yer}!`,
  // Yer ve ad aynıysa (ör. "Satürn", "Futbol") bir kez söylenir.
  // Sonda ne yapılacağı söylenir (okuma bilmeyen çocuk düğmeyi beklemesin).
  durakGiris: (yer: string, ad: string, bilgi: string, baslik = 'Biliyor muydun?') => `${yer}! ${yer === ad ? '' : `${ad}. `}${baslik} ${bilgi} Hazırsan Başla’ya dokun!`,
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
  dunyaBitti: 'İnanılmaz! Dünyanın bütün harikalarını gezdin! Sertifikanı almak için kupaya dokun!',
  dunyaKilitli: 'Dünya turu, Türkiye turunu bitirince açılacak!',
  uzayHosgeldin: 'Uzay yolculuğuna hoş geldin! İlk durağımız, Güneş’e en yakın gezegen Merkür. Dokun ve başla!',
  uzayBitti: 'Muhteşem! Bütün gezegenleri gezdin, gerçek bir uzay yolcususun! Sertifikanı almak için kupaya dokun!',
  uzayKilitli: 'Uzay yolculuğu, dünya turunu bitirince açılacak!',
  sporHosgeldin: 'Spor Kampı’na hoş geldin! Hangi sporu seviyorsun? İstediğin spora dokun ve başla!',
  sporSec: 'İstediğin spora dokun!',
  sporBitti: 'Harikasın! Bütün sporları denedin, gerçek bir spor yıldızısın! Sertifikanı almak için kupaya dokun!',
  sporKilitli: 'Spor Kampı, uzay yolculuğunu bitirince açılacak!',
  dinozorHosgeldin: 'Dinozorlar Diyarı’na hoş geldin! İlk durağımız dinozor yumurtası. Dokun ve başla!',
  dinozorBitti: 'Muhteşem! Bütün dinozorlarla tanıştın! Sertifikanı almak için kupaya dokun!',
  dinozorKilitli: 'Dinozorlar Diyarı, Spor Kampı’nı bitirince açılacak!',
  evdeHosgeldin: 'Evde Macera’ya hoş geldin! En sevdiğin oyuncağı, bir yastığı ve çoraplarını hazırla. Dokun ve başla!',
  evdeBitti: 'Süpersin! Evde de çok güzel hareket ettin, her şeyi de topladın! Sertifikanı almak için kupaya dokun!',
  evdeKilitli: 'Evde Macera, Dinozorlar Diyarı’nı bitirince açılacak!',
  okyanusHosgeldin: 'Okyanusa hoş geldin! İlk durağımız deniz kaplumbağaları. Dokun ve başla!',
  okyanusBitti: 'Harikasın! Okyanusun bütün dostlarıyla tanıştın! Sertifikanı almak için kupaya dokun!',
  okyanusKilitli: 'Okyanus, Evde Macera’yı bitirince açılacak!',
  tamSurumKilitli: 'Bu macerayı açmak için bir büyüğüne göster!',
  sertifikaKilitli: 'Sertifikanı kaydetmek için bir büyüğüne göster!',
  tamSurumAcildi: 'Yaşasın! Bütün maceralar açıldı!',
  maceraHosgeldin: 'Büyük maceraya hoş geldin! Bir bölüm seç!',
  yakinda: 'Bu bölüm çok yakında geliyor!',
  kostumDolabi: 'Burası kostüm dolabın! Gezdiğin her yerden bir hatıra kostüm açılır. Birine dokun ve giy!',
  kostumSecildi: (ad: string) => `${ad} çok yakıştı!`,
  kostumKilitli: (nasil: string) => `Bu kostümü açmak için ${nasil}!`,
  yeniKostum: (ad: string) => `Yeni kostüm açıldı: ${ad}!`,
  yeniRozet: (ad: string) => `Yeni rozet kazandın: ${ad}!`,
  rozetDolabi: 'Burası rozetlerin! Hareket ettikçe yeni rozetler kazanırsın. Bir rozete dokun, nasıl kazanılır söyleyeyim.',
  rozetAdi: (ad: string) => `${ad} rozeti!`,
  rozetNasil: (nasil: string) => `Bu rozeti kazanmak için: ${nasil}.`,
  ziplaRitim: 'Benimle birlikte zıpla! İstersen ekrana dokun, ben de zıplayayım!',
  ziplaKamera: 'Sen zıpla, ben de zıplayayım!',
  sesDeneme: 'Merhaba! Ben Zıpzıp. Beni duyuyorsan, hadi birlikte hareket edelim!',
};

// Seslendirme aracı için: oyunda söylenebilecek her cümlenin tam listesi.
export function tumMetinler(): string[] {
  const liste = new Set<string>([
    ...SAYILAR,
    ...GERI_SAYIM,
    M.yaptinMi, M.aferin, M.yolaCikiyoruz, M.oncekiniBitir, M.turBitti, M.turaHosgeldin,
    M.karakterSec, M.pasaportIlk, M.pasaportHazir, M.pasaportSifir, M.sertifika, M.dunyaHosgeldin, M.dunyaBitti, M.dunyaKilitli, M.uzayHosgeldin, M.uzayBitti, M.uzayKilitli, M.maceraHosgeldin, M.yakinda, M.tamSurumKilitli, M.sertifikaKilitli, M.tamSurumAcildi,
    M.sporHosgeldin, M.sporSec, M.sporBitti, M.sporKilitli, M.dinozorHosgeldin, M.dinozorBitti, M.dinozorKilitli, M.evdeHosgeldin, M.evdeBitti, M.evdeKilitli,
    M.okyanusHosgeldin, M.okyanusBitti, M.okyanusKilitli,
    ...SERTIFIKA_UNVANLARI.map((u) => M.sertifikaBolum(u)),
    ...ISINMALAR.map((h) => h.sesli),
    ...SOGUMALAR.map((h) => h.sesli),
    DONMA.sesli, AYNA.sesli, M.devamEdiyoruz, M.dur, M.devam, M.uzaktanAcik, M.bugunlukBitti,
    ...AVATARLAR.map((a) => M.karakterSecildi(a.ad)),
    ...ROZETLER.flatMap((r) => [M.yeniRozet(r.ad), M.rozetAdi(r.ad), M.rozetNasil(r.nasil)]),
    M.kostumDolabi,
    M.rozetDolabi,
    M.aileBitti,
    M.kameraGordu,
    M.aynaBak,
    M.hazirsin,
    M.sesDeneme,
    M.ziplaRitim,
    M.ziplaKamera,
    ...AILE_OTURUMU.map((h) => h.sesli),
    ...KOSTUMLER.flatMap((k) => [M.kostumSecildi(k.ad), M.yeniKostum(k.ad), M.kostumKilitli(kostumNasil(k))]),
  ]);
  BOLUM_SIRASI.forEach((id) => {
    const { duraklar, serbest, kutuBaslik } = BOLUMLER[id];
    duraklar.forEach((d, i) => {
      liste.add(M.durakGiris(d.yer, d.ad, d.bilgi, kutuBaslik));
      liste.add(M.damgaKazandin(d.yer));
      oturum(d).forEach((h) => liste.add(h.sesli));
      if (d.soru) liste.add(d.soru);
      if (i > 0 && !serbest) liste.add(M.siradaki(d.yer));
    });
  });
  for (let i = 1; i <= TUM_DURAKLAR.length; i++) liste.add(M.pasaportDamga(i));
  // Ebeveyn ayarlarıyla (oturarak, küçükler için daha az tekrar) değişen hareket cümleleri
  uyarlamaCumleleri([...TUM_DURAKLAR.flatMap(oturum), ...ISINMALAR, ...SOGUMALAR]).forEach((c) => liste.add(c));
  return [...liste];
}

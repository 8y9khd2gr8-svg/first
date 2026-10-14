import { oyunAyari, type OyunAyari } from './oyunAyari';
import { DONMA_OTURARAK, OTURARAK, SOGUMALAR, sayiYazi, type Animasyon, type Hareket } from './hareketler';

// Hareket listesini ebeveynin seçtiği ayarlara uyarlar (ebeveyn köşesi → ⚙️ Ayarlar):
//  - Oturarak oyna: ayakta yapılan hareketler oturarak yapılan kol/gövde hareketine döner (aynı durakta tekrar etmeden).
//  - Küçük (4-5 yaş): tekrarlar daha az, ritim daha yavaş, süreli hareketler daha kısa, çok adımlı komut kısa.
//  - Hızlı (K6, kaybettirmeyen zorluk): tekrarlar daha çok, ritim daha hızlı, süreli hareketler daha uzun.
// Cümleler değişince yeni hâlleri de seslendirme listesindedir (metinler.ts tumMetinler → uyarlamaCumleleri).

type OturarakId = keyof typeof OTURARAK;
const OTURARAK_IDLER = Object.keys(OTURARAK) as OturarakId[];

// Oturarak da yapılabilen hareketler aynen kalır.
const OTURARAK_UYGUN = new Set<Animasyon>(['kollar', 'kolSalla', 'kanat', 'voleybol', 'raket', 'kulac', 'yanaEgil', 'belDondur', 'sallan']);
// Ayakta yapılan hareketin oturarak karşılığı (anlamca en yakını; doluysa sıradaki boş olan).
const KARSILIK: Partial<Record<Animasyon, OturarakId>> = {
  zipla: 'kollar', kos: 'kulac', dizler: 'kolSalla', acKapa: 'kanat', engel: 'voleybol', tepin: 'raket', horon: 'kulac',
  basket: 'voleybol', parmakUcu: 'kanat', tekAyak: 'kanat', yanAdim: 'yanaEgil', tirman: 'kollar', trex: 'raket', sut: 'kolSalla',
  comel: 'belDondur', balon: 'kollar', yumurta: 'sallan', tasKaldir: 'voleybol', kazi: 'raket', uzan: 'kollar', donus: 'belDondur',
  kocaman: 'kanat', piramit: 'voleybol', sutun: 'kollar', tHarfi: 'kanat',
};
const OTURARAK_HIKAYE = 'Oturarak oynuyoruz!';

const oturarakMi = (h: Hareket) => (h.dizi ?? [h.animasyon]).every((a) => OTURARAK_UYGUN.has(a));

function oturarakYap(liste: Hareket[]): Hareket[] {
  const kullanilan = new Set<Animasyon>(liste.filter(oturarakMi).map((h) => h.animasyon));
  return liste.map((h) => {
    if (h.surpriz === 'donma') return DONMA_OTURARAK; // ayakla dans yerine kollarla dans
    if (h.surpriz) return h.dizi ? { ...h, dizi: oturarakDizi(h.dizi) } : h; // ayna: sadece kol/gövde hareketleri
    if (oturarakMi(h)) return h;
    const ilk = KARSILIK[h.animasyon] ?? 'kollar';
    const id = [ilk, ...OTURARAK_IDLER].find((i) => !kullanilan.has(OTURARAK[i].animasyon)) ?? ilk;
    kullanilan.add(OTURARAK[id].animasyon);
    return { ...OTURARAK[id], hikaye: OTURARAK_HIKAYE };
  });
}

function oturarakDizi(dizi: Animasyon[]): Animasyon[] {
  const uygun = dizi.filter((a) => OTURARAK_UYGUN.has(a));
  return uygun.length >= 3 ? uygun : (['kollar', 'kolSalla', 'kanat', 'yanaEgil'] as Animasyon[]);
}

// Son geçtiği yerdeki kelimeyi değiştirir (sayı cümlenin sonundaki komutta; hikâyede aynı kelime olabilir).
function sondakiniDegistir(metin: string, eski: string, yeni: string) {
  const i = metin.lastIndexOf(eski);
  return i < 0 ? metin : metin.slice(0, i) + yeni + metin.slice(i + eski.length);
}

// Sakin tempoda kısa komut (4-5 yaş, K5; tahmine dayanır, Yağız/4-5 yaş testinde bakılacak): çok adımlı komut
// tek ve net eyleme iner. Zıpzıp hareketin tamamını yine gösterir; hikâye aynen kalır. Anahtar: komutun ekrandaki yazısı.
// Listede olmayan komut (zaten kısa olan, eşyayla yapılan bazıları, oturarak komutları) değişmez.
export const KISA_KOMUT: Record<string, string> = {
  'Zıpla, ayaklarını aç, kapa!': 'Ayaklarını\naç, kapa!',
  'Çömel, sonra yavaşça yüksel, kollarını aç!': 'Çömel ve kalk!',
  'Yastığı başının üstünde tut, yerinde yürü!': 'Yastığı başının\nüstünde tut!',
  'Topu tut, çömel, zıpla, kollarını yukarı uzat!': 'Topla\nyukarı zıpla!',
  'Çömel, zıpla, kollarını yukarı uzat!': 'Yukarı zıpla!',
  'Ellerini beline koy, belini döndür!': 'Belini döndür!',
  'Ellerini beline koy, göbeğini çevir!': 'Belini döndür!',
  'Çömel, yastığı yere koy, sonra al ve kalk!': 'Yastığı yere koy,\ngeri al!',
  'Olduğun yerde dizlerini kaldırarak yürü!': 'Yerinde\ndizlerini kaldır!',
  'Kollarını aç, arkanı dön, geri dön!': 'Arkanı dön,\ngeri dön!',
  'Zıpla, dizlerini yukarı çek!': 'Yüksek zıpla!',
  'Kollarını yana aç, yukarı aşağı salla!': 'Kollarını\nyukarı aşağı salla!',
  'Çömel, ellerinle yeri sırayla kaz!': 'Ellerinle\nyeri kaz!',
  'Kollarını ve bacaklarını aç, kocaman ol!': 'Kollarını ve\nbacaklarını aç!',
  'Kollarını kaldır, sağa sola salla!': 'Kollarını\nsağa sola salla!',
  'Kollarını sırayla öne doğru çevir!': 'Kollarını çevir!',
  'Parmak uçlarında yerinde yürü!': 'Parmak ucunda\nyerinde yürü!',
  'Ayaklarını aç, ellerini başının üstünde birleştir!': 'Ellerini başının\nüstünde birleştir!',
  'Kolunu yukarıdan aşağı doğru salla!': 'Kolunu\naşağı salla!',
  'Kendine sarıl, sağa sola sallan!': 'Sağa sola sallan!',
  'Kendine sarıl, yavaşça sallan!': 'Yavaşça sallan!',
  'Oyuncağına sarıl, sağa sola sallan!': 'Oyuncağınla\nsallan!',
  'Dimdik dur, kollarını yukarı uzat!': 'Dimdik dur!',
  'Kollarını yana aç, dimdik dur!': 'Kollarını yana aç!',
  'Çömel, ellerini yere değdir, kollarını yukarı kaldır!': 'Eğil ve uzan!',
  'Çömel, oyuncağını al, yukarı kaldır!': 'Oyuncağını\nyukarı kaldır!',
  'Tek ayağını kaldır, kollarını yana aç!': 'Tek ayağını kaldır!',
  'Dizini kaldır, öbür kolunu uzat!': 'Dizlerini\nsırayla kaldır!',
  'Çömel, eşyayı al, yerine koy!': 'Eşyayı yerine koy!',
  'Dirseklerini bük, yerinde büyük adımlar at!': 'Yerinde\nbüyük adımlar at!',
  'Parmak ucunda yüksel, kollarını uzat!': 'Kollarını\nyukarı uzat!',
  'Yavaşça yüksel, kollarını uzat!': 'Kollarını\nyukarı uzat!',
  'Ellerini başının üstünde birleştir, yukarı it!': 'Ellerini yukarı it!',
  'Bir sağa, bir sola adım at!': 'Yana adım at!',
  'Kollarını kaldır, bir yana eğil, sonra öbür yana!': 'Bir yana,\nöbür yana eğil!',
  'Çömel, küçül, sonra kalk ve kollarını aç!': 'Çömel ve kalk!',
};

function kisalt(h: Hareket): Hareket {
  const kisa = KISA_KOMUT[h.baslik.replace(/\n/g, ' ')];
  if (!kisa || h.dizi || h.surpriz) return h;
  const duz = kisa.replace(/\n/g, ' ');
  // Eski cümle sayıyı söylüyorsa kısa cümle de söyler ("... Beş kere!"); hikâye sayıyı söylüyorsa söylemez.
  const sayi = h.tur === 'sayi' && h.sesli.includes(sayiYazi(h.adet)) && !(h.hikaye ?? '').includes(sayiYazi(h.adet)) ? ` ${sayiYazi(h.adet)} kere!` : '';
  const ritimSozu = h.ritim === 'yavas' ? 'Yavaş yavaş! ' : h.ritim === 'hizli' ? 'Hızlı hızlı! ' : '';
  return { ...h, baslik: kisa, sesli: `${h.hikaye ? `${h.hikaye} ` : ''}${ritimSozu}${duz}${sayi}` };
}

// Küçükler için: 5 ve üstü tekrar yaklaşık %60'a iner (en az 3), ritim %25 yavaşlar, süreli hareket %25 kısalır (en az 5 sn).
// Hikâye sayıyı söylüyorsa ("Yedi kuleyi say") tekrar sayısı değişmez, sadece yavaşlar.
export function kucukIcin(uzun: Hareket): Hareket {
  const h = kisalt(uzun);
  if (h.tur === 'sure') return { ...h, saniye: Math.max(5, Math.round(h.saniye * 0.75)) };
  const yavas = { ...h, tempoMs: Math.round(h.tempoMs * 1.25) };
  const eskiYazi = sayiYazi(h.adet);
  const hikayedeSayi = !!h.hikaye && h.hikaye.toLocaleLowerCase('tr').includes(eskiYazi.toLocaleLowerCase('tr'));
  if (h.adet < 5 || hikayedeSayi || !h.sesli.includes(eskiYazi)) return yavas;
  const adet = Math.max(3, Math.round(h.adet * 0.6));
  return {
    ...yavas,
    adet,
    sesli: sondakiniDegistir(h.sesli, eskiYazi, sayiYazi(adet)),
    baslik: sondakiniDegistir(h.baslik, String(h.adet), String(adet)),
  };
}

// Hızlı tempo: 4+ tekrar yaklaşık 1,5 katına çıkar (en çok 12), ritim %15 hızlanır (en hızlı 650 ms), süreli hareket
// %25 uzar. Isınma (yavaş ritimli), soğuma ve sürprizler aynen kalır; hikâye sayıyı söylüyorsa tekrar sayısı değişmez.
const SOGUMA_HIKAYE = new Set(SOGUMALAR.map((h) => h.hikaye));
export function hizliIcin(h: Hareket): Hareket {
  if (h.surpriz || h.ritim === 'yavas' || SOGUMA_HIKAYE.has(h.hikaye)) return h;
  if (h.tur === 'sure') return { ...h, saniye: Math.round(h.saniye * 1.25) };
  const hizli = { ...h, tempoMs: Math.max(Math.min(650, h.tempoMs), Math.round(h.tempoMs * 0.85)) };
  const eskiYazi = sayiYazi(h.adet);
  const hikayedeSayi = !!h.hikaye && h.hikaye.toLocaleLowerCase('tr').includes(eskiYazi.toLocaleLowerCase('tr'));
  const adet = Math.min(12, Math.round(h.adet * 1.5));
  if (h.adet < 4 || adet <= h.adet || hikayedeSayi || !h.sesli.includes(eskiYazi)) return hizli;
  return {
    ...hizli,
    adet,
    sesli: sondakiniDegistir(h.sesli, eskiYazi, sayiYazi(adet)),
    baslik: sondakiniDegistir(h.baslik, String(h.adet), String(adet)),
  };
}

export function uyarla(liste: Hareket[], ayar: OyunAyari = oyunAyari()): Hareket[] {
  let sonuc = ayar.oturarak ? oturarakYap(liste) : liste;
  if (ayar.yas === 'kucuk') sonuc = sonuc.map(kucukIcin);
  if (ayar.yas === 'hizli') sonuc = sonuc.map(hizliIcin);
  return sonuc;
}

// Ayarlarla ortaya çıkabilecek bütün yeni cümleler (seslendirme listesi için).
export function uyarlamaCumleleri(hareketler: Hareket[]): string[] {
  const oturarak = Object.values(OTURARAK).map((h) => ({ ...h, hikaye: OTURARAK_HIKAYE }));
  return [...hareketler, ...oturarak, DONMA_OTURARAK].flatMap((h) => [h.sesli, kucukIcin(h).sesli, hizliIcin(h).sesli]);
}

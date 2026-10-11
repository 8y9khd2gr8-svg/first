import { oyunAyari, type OyunAyari } from './oyunAyari';
import { OTURARAK, sayiYazi, type Animasyon, type Hareket } from './hareketler';

// Hareket listesini ebeveynin seçtiği ayarlara uyarlar (ebeveyn köşesi → ⚙️ Ayarlar):
//  - Oturarak oyna: ayakta yapılan hareketler oturarak yapılan kol/gövde hareketine döner (aynı durakta tekrar etmeden).
//  - Küçük (4-5 yaş): tekrarlar daha az, ritim daha yavaş, süreli hareketler daha kısa.
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
    if (h.surpriz) return h.dizi ? { ...h, dizi: oturarakDizi(h.dizi) } : h; // donma: oturarak dans; ayna: kol hareketleri
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

// Küçükler için: 5 ve üstü tekrar yaklaşık %60'a iner (en az 3), ritim %25 yavaşlar, süreli hareket %25 kısalır (en az 5 sn).
// Hikâye sayıyı söylüyorsa ("Yedi kuleyi say") tekrar sayısı değişmez, sadece yavaşlar.
export function kucukIcin(h: Hareket): Hareket {
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

export function uyarla(liste: Hareket[], ayar: OyunAyari = oyunAyari()): Hareket[] {
  let sonuc = ayar.oturarak ? oturarakYap(liste) : liste;
  if (ayar.yas === 'kucuk') sonuc = sonuc.map(kucukIcin);
  return sonuc;
}

// Ayarlarla ortaya çıkabilecek bütün yeni cümleler (seslendirme listesi için).
export function uyarlamaCumleleri(hareketler: Hareket[]): string[] {
  const oturarak = Object.values(OTURARAK).map((h) => ({ ...h, hikaye: OTURARAK_HIKAYE }));
  return [...hareketler, ...oturarak].flatMap((h) => [h.sesli, kucukIcin(h).sesli]);
}

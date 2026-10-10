import { AILE_ID, AILE_OTURUMU } from './aile';
import { BOLUMLER, Durak, durakBul, oturum } from './duraklar';
import { AYNA, AYNA_HAVUZU, DONMA, Hareket, ISINMALAR, SOGUMALAR } from './hareketler';
import { tamamlananlar } from './ilerleme';

// Bir durağın oyun sırası: [ısınma?] + durağın 4 hareketi (ortasına bir sürpriz) + [soğuma?].
//  - Isınma: oturumun ilk durağında ya da 15 dakikadan uzun aradan sonra (az önce ısınan tekrar ısınmaz).
//  - Sürpriz: donma ya da ayna oyunu; durağa göre değişir.
//  - Soğuma: bölümün son durağında, ya da "Bugünlük bitirelim" denince (SOGUMA_ID).
// Liste durak başında bir kez kurulur ve durak bitene kadar aynı kalır.

export const SOGUMA_ID = 'soguma';
const ARA_DK = 15;

let sonHareketZamani = 0; // sadece bellekte: uygulama kapanınca sıfırlanır
let aktif: { durakId: string; liste: Hareket[] } | null = null;

export const hareketYapildi = () => (sonHareketZamani = Date.now());

const rastgele = <T>(liste: T[]) => liste[Math.floor(Math.random() * liste.length)];

function karistir<T>(liste: T[]): T[] {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

export function isinmaGerekli(simdi = Date.now()) {
  return simdi - sonHareketZamani > ARA_DK * 60_000;
}

// Bölümün son durağı mı? (sıralı bölümde listenin sonu; serbest bölümde geriye tek durak kalmışsa)
function bolumSonu(durak: Durak) {
  const { duraklar, serbest } = BOLUMLER[durak.bolum];
  if (!serbest) return duraklar[duraklar.length - 1].id === durak.id;
  const biten = new Set(tamamlananlar());
  return duraklar.every((d) => d.id === durak.id || biten.has(d.id));
}

export function oturumKur(durak: Durak): Hareket[] {
  const kendi = oturum(durak);
  const animasyonlar = new Set(kendi.map((h) => h.animasyon));
  const sira = Math.max(0, durakSirasi(durak));
  const surpriz = sira % 2 === 0 ? DONMA : { ...AYNA, dizi: karistir(AYNA_HAVUZU.filter((a) => !animasyonlar.has(a))).slice(0, 4) };
  const liste = [...kendi];
  liste.splice(sira % 3 === 0 ? 2 : 3, 0, surpriz);
  if (isinmaGerekli()) liste.unshift(rastgele(ISINMALAR.filter((h) => !animasyonlar.has(h.animasyon))));
  if (bolumSonu(durak)) liste.push(rastgele(SOGUMALAR));
  return liste;
}

const durakSirasi = (durak: Durak) => BOLUMLER[durak.bolum].duraklar.indexOf(durak) + Object.keys(BOLUMLER).indexOf(durak.bolum);

// Durağın hareket listesi: ilk adımda kurulur, sonraki adımlarda aynısı kullanılır.
export function oturumListesi(durakId: string, adim: number): Hareket[] {
  if (adim > 0 && aktif?.durakId === durakId) return aktif.liste;
  const liste = durakId === AILE_ID ? AILE_OTURUMU : durakId === SOGUMA_ID ? [rastgele(SOGUMALAR)] : oturumKur(durakBul(durakId));
  aktif = { durakId, liste };
  return liste;
}

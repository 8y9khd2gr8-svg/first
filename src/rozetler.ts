import { AILE_OTURUMU } from './aile';
import { DINOZOR, DUNYA, EVDE, OKYANUS, SPOR, TUM_DURAKLAR, TURKIYE, UZAY, acikDuraklar, oturum } from './duraklar';
import { tamamlananlar } from './ilerleme';
import { AYNA, AYNA_HAVUZU, DONMA, H, ISINMALAR, SOGUMALAR, type Hareket } from './hareketler';
import { haftalikOzet } from './istatistik';
import { oyunAyari, type OyunAyari } from './oyunAyari';
import { uyarla } from './uyarla';

// Rozetler: kazanılıp kazanılmadığı her seferinde mevcut kayıtlardan hesaplanır.
// Cihazda sadece "kutlaması yapılanlar" listesi tutulur (yeni rozeti bir kez kutlamak için).
// Kural: "üst üste gün" gibi baskı yaratan rozet yok; farklı günler sayılır, ara vermek cezalandırılmaz.

export type Rozet = { id: string; simge: string; ad: string; nasil: string; bolum?: boolean };

type Durum = {
  biten: Set<string>;
  hareket: number;
  ziplama: number;
  dakika: number;
  gun: number;
  sayac: Record<string, number>;
  haftaSonu: boolean;
};

const toplam = (d: Durum, ...animasyonlar: string[]) => animasyonlar.reduce((t, a) => t + (d.sayac[a] ?? 0), 0);
// "Hareket Kâşifi" için oyundaki bütün hareket türleri.
// Yeni bölüm gelince liste uzar; daha önce kazanılmış rozet yine de kaybolmaz (kazanilanlar'a bakın).
const TUM_ANIMASYONLAR = [...new Set([...Object.values(H), ...ISINMALAR, ...SOGUMALAR, ...TUM_DURAKLAR.map((x) => x.ozel)].map((h) => h.animasyon))];
// Sadece açık bölümlerde (betada "Yakında" olmayanlar) ve ısınma/soğuma/Ailece'de gelebilen hareketler sayılır (K26, 15 Ekim):
// betada çocuk kapalı bölümlerin hareketlerini hiç göremez, rozet yoksa asla kazanılamazdı. Bütün bölümler açılınca liste hepsi olur.
export function kesfedilecekHareketler(ayar: OyunAyari = oyunAyari()): string[] {
  const gelen = new Set((ayar.oturarak ? oturarakGelenler() : [...acikDuraklar().flatMap(oturum), ...ISINMALAR, ...SOGUMALAR, ...AILE_OTURUMU]).map((h) => h.animasyon));
  return TUM_ANIMASYONLAR.filter((a) => gelen.has(a));
}

// Oturarak oyna açıkken (K37, 16 Ekim) ayakta yapılan hareketler hiç gelmez; sadece oturarak hâlde gelebilenler sayılır.
// oturum.ts'in kurabileceği her liste (ısınma var/yok, donma/ayna, soğuma var/yok, tek başına soğuma) uyarla'dan geçirilir.
// Ailece sayılmaz: orada hareketler ayakta kalır (bir büyükle oynanır, ayar uygulanmaz).
function oturarakGelenler(): Hareket[] {
  const ayar: OyunAyari = { yas: 'buyuk', oturarak: true };
  const sonuc: Hareket[] = SOGUMALAR.flatMap((s) => uyarla([s], ayar));
  for (const durak of acikDuraklar()) {
    const kendi = oturum(durak);
    const durakta = new Set(kendi.map((h) => h.animasyon));
    const ayna = AYNA_HAVUZU.filter((a) => !durakta.has(a));
    // Ayna oyununun dört hareketi de kol/gövde hareketi olabilir; o zaman liste farklı dönüşür, o hâli de denenir.
    const aynaOturarak = ayna.filter((a) => ['kollar', 'kanat', 'yanaEgil', 'belDondur'].includes(a));
    const surprizler = [DONMA, { ...AYNA, dizi: ayna }, ...(aynaOturarak.length >= 4 ? [{ ...AYNA, dizi: aynaOturarak }] : [])];
    for (const isinma of [undefined, ...ISINMALAR.filter((h) => !durakta.has(h.animasyon))])
      for (const surpriz of surprizler)
        for (const soguma of [undefined, ...SOGUMALAR])
          sonuc.push(...uyarla([...(isinma ? [isinma] : []), ...kendi, surpriz, ...(soguma ? [soguma] : [])], ayar));
  }
  return sonuc;
}

const KOSULLAR: (Rozet & { kazanildi: (d: Durum) => boolean })[] = [
  { id: 'ilkAdim', simge: '🌱', ad: 'İlk Adım', nasil: 'İlk hareketini tamamla', kazanildi: (d) => d.hareket >= 1 },
  { id: 'ilkDamga', simge: '🎫', ad: 'İlk Damga', nasil: 'İlk damganı kazan', kazanildi: (d) => d.biten.size >= 1 },
  { id: 'yuzZiplama', simge: '🐸', ad: '100 Zıplama', nasil: 'Toplam 100 kez zıpla', kazanildi: (d) => d.ziplama >= 100 },
  { id: 'besYuzZiplama', simge: '🦘', ad: '500 Zıplama', nasil: 'Toplam 500 kez zıpla', kazanildi: (d) => d.ziplama >= 500 },
  { id: 'binZiplama', simge: '🚀', ad: '1000 Zıplama', nasil: 'Toplam 1000 kez zıpla', kazanildi: (d) => d.ziplama >= 1000 },
  { id: 'elliHareket', simge: '💪', ad: '50 Hareket', nasil: '50 hareket tamamla', kazanildi: (d) => d.hareket >= 50 },
  { id: 'ikiYuzHareket', simge: '🦾', ad: '200 Hareket', nasil: '200 hareket tamamla', kazanildi: (d) => d.hareket >= 200 },
  { id: 'onDakika', simge: '⏱️', ad: '10 Dakika', nasil: 'Toplam 10 dakika hareket et', kazanildi: (d) => d.dakika >= 10 },
  { id: 'birSaat', simge: '🏅', ad: '1 Saat', nasil: 'Toplam 60 dakika hareket et', kazanildi: (d) => d.dakika >= 60 },
  { id: 'besSaat', simge: '🏆', ad: '5 Saat', nasil: 'Toplam 5 saat hareket et', kazanildi: (d) => d.dakika >= 300 },
  { id: 'ucGun', simge: '📅', ad: '3 Gün', nasil: '3 farklı günde oyna', kazanildi: (d) => d.gun >= 3 },
  { id: 'yediGun', simge: '🗓️', ad: '7 Gün', nasil: '7 farklı günde oyna', kazanildi: (d) => d.gun >= 7 },
  { id: 'otuzGun', simge: '🌟', ad: '30 Gün', nasil: '30 farklı günde oyna', kazanildi: (d) => d.gun >= 30 },
  { id: 'comelme', simge: '🏋️', ad: 'Çömelme Ustası', nasil: '100 kez çömel', kazanildi: (d) => toplam(d, 'comel', 'balon', 'tasKaldir', 'basket', 'yumurta', 'topla') >= 100 },
  { id: 'diz', simge: '🦵', ad: 'Diz Ustası', nasil: '100 kez dizini kaldır', kazanildi: (d) => toplam(d, 'dizler', 'tirman', 'basUstu', 'engel') >= 100 },
  { id: 'kol', simge: '🙌', ad: 'Kol Ustası', nasil: '100 kez kollarını kaldır', kazanildi: (d) => toplam(d, 'kollar', 'uzan', 'voleybol') >= 100 },
  { id: 'kasif', simge: '🎨', ad: 'Hareket Kâşifi', nasil: 'Her hareketi en az bir kez dene', kazanildi: (d) => kesfedilecekHareketler().every((a) => (d.sayac[a] ?? 0) > 0) },
  { id: 'haftaSonu', simge: '🎉', ad: 'Hafta Sonu Sporcusu', nasil: 'Bir hafta sonu oyna', kazanildi: (d) => d.haftaSonu },
  { id: 'onDamga', simge: '📚', ad: '10 Damga', nasil: '10 damga topla', kazanildi: (d) => d.biten.size >= 10 },
  { id: 'turkiyeGezgini', simge: '🇹🇷', ad: 'Türkiye Gezgini', nasil: 'Türkiye Turu’nu bitir', bolum: true, kazanildi: (d) => TURKIYE.every((x) => d.biten.has(x.id)) },
  { id: 'dunyaKasifi', simge: '🌍', ad: 'Dünya Kâşifi', nasil: 'Dünya Harikaları’nı bitir', bolum: true, kazanildi: (d) => DUNYA.every((x) => d.biten.has(x.id)) },
  { id: 'uzayYolcusu', simge: '🪐', ad: 'Uzay Yolcusu', nasil: 'Uzay Yolculuğu’nu bitir', bolum: true, kazanildi: (d) => UZAY.every((x) => d.biten.has(x.id)) },
  { id: 'sporYildizi', simge: '⚽', ad: 'Spor Yıldızı', nasil: 'Spor Kampı’ndaki bütün sporları dene', bolum: true, kazanildi: (d) => SPOR.every((x) => d.biten.has(x.id)) },
  { id: 'dinozorKasifi', simge: '🦕', ad: 'Dinozor Kâşifi', nasil: 'Dinozorlar Diyarı’nı bitir', bolum: true, kazanildi: (d) => DINOZOR.every((x) => d.biten.has(x.id)) },
  { id: 'evKahramani', simge: '🧸', ad: 'Ev Kahramanı', nasil: 'Evde Macera’yı bitir', bolum: true, kazanildi: (d) => EVDE.every((x) => d.biten.has(x.id)) },
  { id: 'okyanusKasifi', simge: '🐠', ad: 'Okyanus Kâşifi', nasil: 'Okyanus bölümünü bitir', bolum: true, kazanildi: (d) => OKYANUS.every((x) => d.biten.has(x.id)) },
];

export const ROZETLER: Rozet[] = KOSULLAR.map(({ kazanildi: _k, ...r }) => r);

export function kazanilanlar(): Set<string> {
  const o = haftalikOzet();
  const durum: Durum = {
    biten: new Set(tamamlananlar()),
    hareket: o.toplamHareket,
    ziplama: o.toplamZiplama,
    dakika: o.toplamSaniye / 60,
    gun: o.gunSayisi,
    sayac: o.animasyonSayac,
    haftaSonu: o.haftaSonuOynadi,
  };
  // Kutlaması yapılmış rozet kazanılmış sayılır: koşul sonradan zorlaşsa da (yeni hareketler) geri alınmaz.
  // Listede olmayan kimlik (eski sürüm, bozuk kayıt) sayılmaz; kayıtta durur, silinmez.
  const kutlanan = kutlananlar();
  return new Set(KOSULLAR.filter((k) => kutlanan.has(k.id) || k.kazanildi(durum)).map((k) => k.id));
}

const KUTLANAN_ANAHTAR = 'zipzip-rozetler-v1';

function kutlananlar(): Set<string> {
  try {
    const k = JSON.parse(localStorage.getItem(KUTLANAN_ANAHTAR) ?? '[]');
    return new Set(Array.isArray(k) ? k.filter((r): r is string => typeof r === 'string') : []);
  } catch {
    return new Set();
  }
}

// Henüz kutlaması yapılmamış yeni rozetler. Kutlama ekranda görününce rozetleriKutla() ile işaretlenir;
// çocuk kutlamadan önce ekrandan çıkarsa rozet bir sonraki durak sonunda kutlanır (kaybolmaz).
export function yeniRozetler(): Rozet[] {
  const once = kutlananlar();
  const kazanilan = kazanilanlar();
  return ROZETLER.filter((r) => kazanilan.has(r.id) && !once.has(r.id));
}

export function rozetleriKutla(rozetler: Rozet[]) {
  const once = kutlananlar();
  rozetler.forEach((r) => once.add(r.id));
  try {
    localStorage.setItem(KUTLANAN_ANAHTAR, JSON.stringify([...once]));
  } catch {
    // kayıt olmazsa rozet bir dahaki sefere yine kutlanır; sorun değil
  }
}

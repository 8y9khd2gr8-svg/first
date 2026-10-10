import { DINOZOR, DUNYA, EVDE, SPOR, TUM_DURAKLAR, TURKIYE, UZAY } from './duraklar';
import { tamamlananlar } from './ilerleme';
import { H, ISINMALAR, SOGUMALAR } from './hareketler';
import { haftalikOzet } from './istatistik';

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
  { id: 'kasif', simge: '🎨', ad: 'Hareket Kâşifi', nasil: 'Her hareketi en az bir kez dene', kazanildi: (d) => TUM_ANIMASYONLAR.every((a) => (d.sayac[a] ?? 0) > 0) },
  { id: 'haftaSonu', simge: '🎉', ad: 'Hafta Sonu Sporcusu', nasil: 'Bir hafta sonu oyna', kazanildi: (d) => d.haftaSonu },
  { id: 'onDamga', simge: '📚', ad: '10 Damga', nasil: '10 damga topla', kazanildi: (d) => d.biten.size >= 10 },
  { id: 'turkiyeGezgini', simge: '🇹🇷', ad: 'Türkiye Gezgini', nasil: 'Türkiye Turu’nu bitir', bolum: true, kazanildi: (d) => TURKIYE.every((x) => d.biten.has(x.id)) },
  { id: 'dunyaKasifi', simge: '🌍', ad: 'Dünya Kâşifi', nasil: 'Dünya Harikaları’nı bitir', bolum: true, kazanildi: (d) => DUNYA.every((x) => d.biten.has(x.id)) },
  { id: 'uzayYolcusu', simge: '🪐', ad: 'Uzay Yolcusu', nasil: 'Uzay Yolculuğu’nu bitir', bolum: true, kazanildi: (d) => UZAY.every((x) => d.biten.has(x.id)) },
  { id: 'sporYildizi', simge: '⚽', ad: 'Spor Yıldızı', nasil: 'Spor Kampı’ndaki bütün sporları dene', bolum: true, kazanildi: (d) => SPOR.every((x) => d.biten.has(x.id)) },
  { id: 'dinozorKasifi', simge: '🦕', ad: 'Dinozor Kâşifi', nasil: 'Dinozorlar Diyarı’nı bitir', bolum: true, kazanildi: (d) => DINOZOR.every((x) => d.biten.has(x.id)) },
  { id: 'evKahramani', simge: '🧸', ad: 'Ev Kahramanı', nasil: 'Evde Macera’yı bitir', bolum: true, kazanildi: (d) => EVDE.every((x) => d.biten.has(x.id)) },
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
  return new Set([...kutlananlar(), ...KOSULLAR.filter((k) => k.kazanildi(durum)).map((k) => k.id)]);
}

const KUTLANAN_ANAHTAR = 'zipzip-rozetler-v1';

function kutlananlar(): Set<string> {
  try {
    const k = JSON.parse(localStorage.getItem(KUTLANAN_ANAHTAR) ?? '[]');
    return new Set(Array.isArray(k) ? k : []);
  } catch {
    return new Set();
  }
}

// Henüz kutlaması yapılmamış yeni rozetleri döndürür ve kutlandı olarak işaretler.
export function yeniRozetleriAl(): Rozet[] {
  const once = kutlananlar();
  const kazanilan = kazanilanlar();
  const yeni = ROZETLER.filter((r) => kazanilan.has(r.id) && !once.has(r.id));
  if (yeni.length) {
    yeni.forEach((r) => once.add(r.id));
    try {
      localStorage.setItem(KUTLANAN_ANAHTAR, JSON.stringify([...once]));
    } catch {
      // kayıt olmazsa rozet bir dahaki sefere yine kutlanır; sorun değil
    }
  }
  return yeni;
}

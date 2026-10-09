import { haftalikOzet } from './istatistik';

// Kostümler: satın alınmaz, harcanmaz. Her "Yaptım!" 1 yıldız; yıldızlar biriktikçe kostümler
// kendiliğinden açılır, çocuk açılanlardan birini giyer. Seçim sadece cihazda saklanır.

export type Kostum = { id: string; simge: string; ad: string; yildiz: number };

export const KOSTUMLER: Kostum[] = [
  { id: 'kep', simge: '🧢', ad: 'Kep', yildiz: 10 },
  { id: 'gozluk', simge: '🕶️', ad: 'Güneş Gözlüğü', yildiz: 25 },
  { id: 'fiyonk', simge: '🎀', ad: 'Fiyonk', yildiz: 40 },
  { id: 'pelerin', simge: '🦸', ad: 'Pelerin', yildiz: 60 },
  { id: 'atki', simge: '🧣', ad: 'Atkı', yildiz: 80 },
  { id: 'tac', simge: '👑', ad: 'Taç', yildiz: 100 },
  { id: 'sihirbaz', simge: '🎩', ad: 'Sihirbaz Şapkası', yildiz: 150 },
  { id: 'kasif', simge: '🤠', ad: 'Kâşif Şapkası', yildiz: 200 },
  { id: 'astronot', simge: '🧑‍🚀', ad: 'Astronot Kaskı', yildiz: 300 },
];

export const yildizSayisi = () => haftalikOzet().toplamHareket;

export const acikKostumler = () => {
  const y = yildizSayisi();
  return KOSTUMLER.filter((k) => y >= k.yildiz);
};

const ANAHTAR = 'zipzip-kostum-v1';

type Kayit = { secili?: string; kutlanan?: string[] };

function oku(): Kayit {
  try {
    const k = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    return typeof k === 'object' && k ? k : {};
  } catch {
    return {};
  }
}

function yaz(k: Kayit) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(k));
  } catch {
    // kayıt olmazsa kostüm bu açılışta kalır; sorun değil
  }
}

export const seciliKostum = (): string | undefined => {
  const s = oku().secili;
  return acikKostumler().some((k) => k.id === s) ? s : undefined;
};

export const kostumSec = (id: string | undefined) => yaz({ ...oku(), secili: id });

// Henüz kutlanmamış yeni açılan kostümler (bir kez kutlanır).
export function yeniKostumleriAl(): Kostum[] {
  const kayit = oku();
  const once = new Set(kayit.kutlanan ?? []);
  const yeni = acikKostumler().filter((k) => !once.has(k.id));
  if (yeni.length) yaz({ ...kayit, kutlanan: [...once, ...yeni.map((k) => k.id)] });
  return yeni;
}

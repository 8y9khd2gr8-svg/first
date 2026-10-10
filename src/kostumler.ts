import { haftalikOzet } from './istatistik';

import { BOLUMLER, BolumId, durakBul } from './duraklar';
import { tamamlananlar } from './ilerleme';

// Kostümler: satın alınmaz, harcanmaz. Her biri bir durağın (ya da bölümün) hatırası:
// o yer bitince kendiliğinden açılır (ör. Kapadokya → pilot gözlüğü). Herkese uygun, cinsiyetsiz hediyeler.
// Yıldızlar (her "Yaptım!" 1 yıldız) sayılmaya devam eder; dolapta toplam olarak görünür.

export type Kostum = { id: string; simge: string; ad: string; durak?: string; bolum?: BolumId };

export const KOSTUMLER: Kostum[] = [
  { id: 'kaptan', simge: '⚓', ad: 'Kaptan Şapkası', durak: 'istanbul' },
  { id: 'pilot', simge: '🥽', ad: 'Pilot Gözlüğü', durak: 'kapadokya' },
  { id: 'atki', simge: '🧣', ad: 'Gezgin Atkısı', durak: 'karadeniz' },
  { id: 'kasif', simge: '🤠', ad: 'Kâşif Şapkası', durak: 'piramitler' },
  { id: 'gozluk', simge: '🕶️', ad: 'Dağcı Gözlüğü', durak: 'machupicchu' },
  { id: 'astronot', simge: '🧑‍🚀', ad: 'Astronot Kaskı', durak: 'ay' },
  { id: 'pelerin', simge: '🦸', ad: 'Uzay Pelerini', durak: 'neptun' },
  { id: 'terBandi', simge: '🎽', ad: 'Ter Bandı', durak: 'basketbol' },
  { id: 'madalya', simge: '🏅', ad: 'Altın Madalya', bolum: 'spor' },
  { id: 'kabuk', simge: '🥚', ad: 'Yumurta Kabuğu', durak: 'yumurta' },
  { id: 'dinoSapka', simge: '🦖', ad: 'Dinozor Şapkası', durak: 'fosil' },
  { id: 'uykuSapka', simge: '🌙', ad: 'Uyku Şapkası', durak: 'yastik' },
  { id: 'tac', simge: '👑', ad: 'Toplama Tacı', durak: 'toplama' },
];

// Kostüm nasıl açılır: "Kapadokya’yı bitir" gibi (dolapta yazar, sesli de söylenir).
export const kostumNasil = (k: Kostum) => (k.durak ? `${durakBul(k.durak).yer} durağını bitir` : `${BOLUMLER[k.bolum!].ad} bölümünü bitir`);

export const yildizSayisi = () => haftalikOzet().toplamHareket;

export const acikKostumler = () => {
  const biten = new Set(tamamlananlar());
  return KOSTUMLER.filter((k) => (k.durak ? biten.has(k.durak) : BOLUMLER[k.bolum!].duraklar.every((d) => biten.has(d.id))));
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

// Henüz kutlanmamış yeni açılan kostümler. Kutlama ekranda görününce kostumuKutla() ile işaretlenir
// (çocuk kutlamadan önce çıkarsa kostüm bir sonraki durak sonunda kutlanır).
export function yeniKostumler(): Kostum[] {
  const once = new Set(oku().kutlanan ?? []);
  return acikKostumler().filter((k) => !once.has(k.id));
}

export function kostumuKutla(k: Kostum) {
  const kayit = oku();
  const once = new Set(kayit.kutlanan ?? []);
  once.add(k.id);
  yaz({ ...kayit, kutlanan: [...once] });
}

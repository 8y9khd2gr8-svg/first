import type { OyunAyari } from './oyunAyari';
import type { Animasyon } from './hareketler';
import type { Poz } from './zipzip';

// Sürpriz donma oyunu (22 Ekim, seçenek A): her turda başka bir dans; her "Dur!"da Zıpzıp tek cümleyle bir poz söyler
// ve kendisi de o pozda donar. Sadece bugünkü çizimler (zipzip.ts duruşları). Elenme, ceza, kamera yok.
// Aynı oyunda aynı dans ya da poz iki kez gelmez. Oturarak oyna açıksa sadece oturarak yapılabilenler gelir,
// cümleler "Oturduğun yerde …" diye başlar. Sakin tempoda tek ayak yok, danslar yavaş, donma uzun.

// ad: ekranın altında yazan ve söylenen komut (benzetme yok, vücut parçasını söyler).
export type DonmaDansi = { animasyon: Animasyon; ad: string; oturarak: boolean };
export type DonmaPozu = { poz: Poz; ad: string; oturarak: boolean; sakin: boolean };

export const DONMA_DANSLARI: DonmaDansi[] = [
  { animasyon: 'horon', ad: 'Ayaklarını sırayla yere vur!', oturarak: false },
  { animasyon: 'kos', ad: 'Yerinde koş!', oturarak: false },
  { animasyon: 'dizler', ad: 'Dizlerini sırayla kaldır!', oturarak: false },
  { animasyon: 'kolSalla', ad: 'Kollarını sağa sola salla!', oturarak: true },
  { animasyon: 'kanat', ad: 'Kollarını yukarı aşağı salla!', oturarak: true },
  // Oturarak oyunda en çok 5 dans gerekir (Hızlı: 4 "Dur!"); tekrar olmasın diye bugünkü iki kol/gövde hareketi de var.
  { animasyon: 'kollar', ad: 'Kollarını kaldır, indir!', oturarak: true },
  { animasyon: 'yanaEgil', ad: 'Bir yana, öbür yana eğil!', oturarak: true },
];
// Oturarak oyunun kendi dansı: kollarını sırayla öne çevir (ayakta yüzme kulacı gelmez, oturarak kol dansı olarak gelir).
export const DONMA_OTURARAK_DANSLARI: DonmaDansi[] = [
  ...DONMA_DANSLARI.filter((d) => d.oturarak),
  { animasyon: 'kulac', ad: 'Kollarını sırayla öne çevir!', oturarak: true },
];

export const DONMA_POZLARI: DonmaPozu[] = [
  { poz: 'uzan', ad: 'Kollarını yukarı uzat!', oturarak: true, sakin: true },
  { poz: 'yanaAc', ad: 'Kollarını yana aç!', oturarak: true, sakin: true },
  { poz: 'basUstu', ad: 'Ellerini başının üstüne koy!', oturarak: true, sakin: true },
  { poz: 'saril', ad: 'Kendine sarıl!', oturarak: true, sakin: true },
  { poz: 'comel', ad: 'Çömel!', oturarak: false, sakin: true },
  { poz: 'acik', ad: 'Kollarını ve bacaklarını aç!', oturarak: false, sakin: true },
  // Sakin tempoda (4-5 yaş) yok: tek ayakta denge zor.
  { poz: 'tekAyak', ad: 'Tek ayağının üstünde dur!', oturarak: false, sakin: false },
];

// Tempoya göre: "Dur!" sayısı, donma süresi ve oyunun toplam süresi (saniye). Danslar aradaki eşit parçalara bölünür
// (Sakin ~2,7 sn, Normal ~1,9 sn, Hızlı 2 sn). Normal en çok 15 sn (süreli hareket sınırı, veri.test.ts); Hızlı'da 4 "Dur!"
// 16 sn'ye sığmıyordu (dans 1,2 sn kalırdı), 20 sn.
export const DONMA_TEMPO = {
  kucuk: { durSayisi: 2, donmaSn: 3, saniye: 14, dansHizi: 1.5 },
  buyuk: { durSayisi: 3, donmaSn: 2.5, saniye: 15, dansHizi: 1 },
  hizli: { durSayisi: 4, donmaSn: 2.5, saniye: 20, dansHizi: 1 },
} as const;

const oturarakSoz = (ad: string) => `Oturduğun yerde ${ad.charAt(0).toLocaleLowerCase('tr')}${ad.slice(1)}`;
// Söylenen cümleler: ilk dans adıyla, sonrakiler "Devam! …", pozlar "Dur! …".
export const dansCumlesi = (d: DonmaDansi, oturarak: boolean, ilk: boolean) => `${ilk ? '' : 'Devam! '}${oturarak ? oturarakSoz(d.ad) : d.ad}`;
export const pozCumlesi = (p: DonmaPozu, oturarak: boolean) => `Dur! ${oturarak ? oturarakSoz(p.ad) : p.ad}`;

export type DonmaPlani = {
  danslar: DonmaDansi[]; // durSayisi + 1 tane (ilk dans + her "Devam!")
  pozlar: DonmaPozu[]; // durSayisi tane
  anlar: number[]; // her "Dur!"un saniyesi (oyun başından)
  donmaSn: number;
  dansHizi: number; // Zıpzıp'ın dans temposunun katı (Sakin'de yavaş)
  oturarak: boolean;
};

function karistir<T>(liste: T[], rastgele: () => number): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function donmaPlani(ayar: OyunAyari, rastgele: () => number = Math.random): DonmaPlani {
  const t = DONMA_TEMPO[ayar.yas];
  const danslar = karistir(ayar.oturarak ? DONMA_OTURARAK_DANSLARI : DONMA_DANSLARI, rastgele).slice(0, t.durSayisi + 1);
  const pozlar = karistir(
    DONMA_POZLARI.filter((p) => (!ayar.oturarak || p.oturarak) && (ayar.yas !== 'kucuk' || p.sakin)),
    rastgele,
  ).slice(0, t.durSayisi);
  const dansSn = (t.saniye - t.durSayisi * t.donmaSn) / (t.durSayisi + 1);
  // "Dur!" anı biraz kayar (sürpriz olsun), ama dans en az 1,6 sn sürer ve donmalar üst üste binmez.
  const anlar = pozlar.map((_, i) => (i + 1) * dansSn + i * t.donmaSn + (rastgele() - 0.5) * Math.min(0.8, dansSn - 1.6));
  return { danslar, pozlar, anlar, donmaSn: t.donmaSn, dansHizi: t.dansHizi, oturarak: ayar.oturarak };
}

// Oyunda söylenebilecek bütün donma cümleleri (seslendirme listesi).
export function donmaCumleleri(): string[] {
  return [false, true].flatMap((oturarak) => [
    ...(oturarak ? DONMA_OTURARAK_DANSLARI : DONMA_DANSLARI).flatMap((d) => [dansCumlesi(d, oturarak, true), dansCumlesi(d, oturarak, false)]),
    ...DONMA_POZLARI.filter((p) => !oturarak || p.oturarak).map((p) => pozCumlesi(p, oturarak)),
  ]);
}

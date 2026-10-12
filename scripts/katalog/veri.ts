import { BOLUM_SIRASI, BOLUMLER } from '../../src/duraklar.ts';
import { ISINMALAR, SOGUMALAR, DONMA, AYNA } from '../../src/hareketler.ts';
import { AILE_OTURUMU } from '../../src/aile.ts';
import { TEPELER } from '../../src/tepeler.ts';
import { kucukIcin, uyarla } from '../../src/uyarla.ts';
import fs from 'fs';
type K = {
  baslik: string; sesli: string; hikaye?: string; animasyon: string; miktar: string; tempo: string; yerler: string[];
  sakin: string; oturarak?: { baslik: string; sesli: string; animasyon: string; miktar: string };
};
// Betada açık olan yerler (Türkiye + Dünya + Ailece; ısınma, sürpriz, soğuma her durakta): uzman önce bunlara baksın.
const BETADA = /^(Türkiye Turu|Dünya Harikaları|Ailece|Isınma|Soğuma|Sürpriz)/;
const miktarYaz = (h: any) => (h.tur === 'sayi' ? `${h.adet} tekrar · ${(h.tempoMs / 1000).toFixed(1)} sn/tekrar` : `${h.saniye} saniye`);
const harita = new Map<string, K>();
const ekle = (h: any, yer: string) => {
  const anahtar = h.baslik + '|' + h.animasyon + '|' + (h.adet ?? h.saniye);
  const miktar = h.tur === 'sayi' ? `${h.adet} tekrar` : `${h.saniye} saniye`;
  const tempo = h.tur === 'sayi' ? `${(h.tempoMs / 1000).toFixed(1)} sn/tekrar` : 'sürekli';
  // 🐢 Sakin tempo ve 🪑 oturarak oyna hâlleri (ebeveyn ayarı; Ailece uyarlanmaz).
  const aile = yer.startsWith('Ailece');
  const o = aile ? h : uyarla([h], { yas: 'buyuk', oturarak: true })[0];
  const oturarak = o.baslik !== h.baslik || o.animasyon !== h.animasyon ? { baslik: o.baslik.replace(/\n/g, ' '), sesli: o.sesli, animasyon: o.animasyon, miktar: miktarYaz(o) } : undefined;
  const sakin = aile ? 'Ailece ayarlardan etkilenmez' : miktarYaz(kucukIcin(h));
  const k = harita.get(anahtar) ?? { baslik: h.baslik.replace(/\n/g, ' '), sesli: h.sesli, hikaye: h.hikaye, animasyon: h.animasyon, miktar, tempo, yerler: [], sakin, oturarak };
  if (!k.yerler.includes(yer)) k.yerler.push(yer);
  harita.set(anahtar, k);
};
ISINMALAR.forEach((h) => ekle(h, 'Isınma (oturumun ilk durağında, havuzdan biri)'));
ekle(DONMA, 'Sürpriz an: donma oyunu');
ekle(AYNA, 'Sürpriz an: ayna oyunu (Zıpzıp 4 farklı hareket yapar)');
for (const id of BOLUM_SIRASI)
  for (const d of BOLUMLER[id].duraklar) { const bolum = BOLUMLER[id].ad; ekle(d.ozel, `${bolum}: ${d.ad} (özel)`); d.ekler.forEach((e) => ekle(e, `${bolum}: ${d.ad}`)); }
for (const d of TEPELER) { ekle(d.ozel, `İstanbul’un 7 Tepesi (hazırlık): ${d.ad} (özel)`); d.ekler.forEach((e) => ekle(e, `İstanbul’un 7 Tepesi (hazırlık): ${d.ad}`)); }
SOGUMALAR.forEach((h) => ekle(h, 'Soğuma (bölüm sonunda ya da bitirirken)'));
AILE_OTURUMU.forEach((h) => ekle(h, 'Ailece (bir büyükle)'));
const liste = [...harita.values()].map((k) => ({ ...k, beta: k.yerler.some((y) => BETADA.test(y)) }));
fs.writeFileSync(process.argv[2], JSON.stringify(liste, null, 1));
// Resmi çekilecek animasyonlar (oturarak hâlleri dahil).
console.log(liste.length, [...new Set(liste.flatMap((k) => [k.animasyon, k.oturarak?.animasyon].filter(Boolean)))].join(','));

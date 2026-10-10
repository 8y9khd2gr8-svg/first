import { TURKIYE, DUNYA, UZAY } from '../../src/duraklar.ts';
import { ISINMA, SOGUMA } from '../../src/hareketler.ts';
import { AILE_OTURUMU } from '../../src/aile.ts';
import fs from 'fs';
type K = { baslik: string; sesli: string; hikaye?: string; animasyon: string; miktar: string; tempo: string; yerler: string[] };
const harita = new Map<string, K>();
const ekle = (h: any, yer: string) => {
  const anahtar = h.baslik + '|' + h.animasyon + '|' + (h.adet ?? h.saniye);
  const miktar = h.tur === 'sayi' ? `${h.adet} tekrar` : `${h.saniye} saniye`;
  const tempo = h.tur === 'sayi' ? `${(h.tempoMs / 1000).toFixed(1)} sn/tekrar` : 'sürekli';
  const k = harita.get(anahtar) ?? { baslik: h.baslik.replace(/\n/g, ' '), sesli: h.sesli, hikaye: h.hikaye, animasyon: h.animasyon, miktar, tempo, yerler: [] };
  if (!k.yerler.includes(yer)) k.yerler.push(yer);
  harita.set(anahtar, k);
};
ekle(ISINMA, 'Her durağın başı (ısınma)');
for (const [bolum, liste] of [['Türkiye', TURKIYE], ['Dünya', DUNYA], ['Uzay', UZAY]] as const)
  for (const d of liste) { ekle(d.ozel, `${bolum}: ${d.ad} (özel)`); d.ekler.forEach((e) => ekle(e, `${bolum}: ${d.ad}`)); }
ekle(SOGUMA, 'Her durağın sonu (soğuma)');
AILE_OTURUMU.forEach((h) => ekle(h, 'Ailece (bir büyükle)'));
fs.writeFileSync(process.argv[2], JSON.stringify([...harita.values()], null, 1));
console.log(harita.size, [...new Set([...harita.values()].map((k) => k.animasyon))].join(','));

// Türkiye haritasını (public/harita-turkiye.svg) ve durakların harita üzerindeki
// piksel konumlarını (src/haritaKonumlar.ts) üretir. Çalıştırmak için: npm run harita
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import fs from 'fs';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const ulkeler = feature(topo, topo.objects.countries).features;
const turkiye = ulkeler.find((f) => f.id === '792');

// Harita çerçevesi (oyun pikseli): 720 genişlik, 560 yükseklik.
const G = 720, Y = 560;
const projeksiyon = geoMercator().fitExtent([[30, 40], [G - 30, Y - 40]], turkiye);
const yol = geoPath(projeksiyon).digits(1);

// Duraklar: [kimlik, boylam, enlem]
const DURAKLAR = [
  ['istanbul', 28.974, 41.026],
  ['truva', 26.239, 39.957],
  ['pamukkale', 29.12, 37.92],
  ['kapadokya', 34.83, 38.64],
  ['nemrut', 38.741, 37.981],
  ['gobeklitepe', 38.922, 37.223],
  ['karadeniz', 40.29, 40.62],
];

const komsular = ulkeler
  .filter((f) => f.id !== '792')
  // Sadece çerçeveye giren komşu ülkeler (dosya küçük kalsın).
  .filter((f) => {
    const [[x0, y0], [x1, y1]] = yol.bounds(f);
    return x1 > 0 && x0 < G && y1 > 0 && y0 < Y && x1 - x0 < G * 6;
  })
  .map((f) => yol(f))
  .filter((d) => d && d.length > 0)
  .map((d) => `<path d="${d}"/>`)
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${Y}" width="${G * 2}" height="${Y * 2}">
<defs>
<clipPath id="cerceve"><rect width="${G}" height="${Y}" rx="40"/></clipPath>
<linearGradient id="deniz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F8FE0"/><stop offset="1" stop-color="#1C5FB8"/></linearGradient>
</defs>
<g clip-path="url(#cerceve)">
<rect width="${G}" height="${Y}" fill="url(#deniz)"/>
<g fill="#4E9E62" stroke="#3B7F4E" stroke-width="1" opacity="0.55">${komsular}</g>
<path d="${yol(turkiye)}" fill="#5BC46A" stroke="#FFC93C" stroke-width="5" stroke-linejoin="round"/>
</g>
<rect width="${G}" height="${Y}" rx="40" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4"/>
</svg>`;
fs.writeFileSync('public/harita-turkiye.svg', svg);

const konumlar = Object.fromEntries(DURAKLAR.map(([k, lon, lat]) => [k, projeksiyon([lon, lat]).map((v) => Math.round(v))]));
fs.writeFileSync(
  'src/haritaKonumlar.ts',
  `// Bu dosya scripts/harita-uret.mjs tarafından üretilir; elle değiştirmeyin.\n` +
    `export const HARITA_BOYUTU = { genislik: ${G}, yukseklik: ${Y} };\n` +
    `export const DURAK_KONUMLARI: Record<string, [number, number]> = ${JSON.stringify(konumlar, null, 2)};\n`,
);
console.log(konumlar, (svg.length / 1024).toFixed(0) + ' KB');

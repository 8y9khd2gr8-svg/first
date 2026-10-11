// Zıpzıp'ın küresindeki Türkiye sınırını world-atlas'tan (countries-110m) çıkarıp küçük bir dosyaya yazar.
// Bütün ülkeler dosyası (~108 KB) sadece Türkiye için pakete girmesin diye. Kullanım: node scripts/turkiye-sinir-uret.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const t = JSON.parse(readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const turkiye = feature(t, t.objects.countries).features.find((f) => f.id === '792');
writeFileSync('src/turkiye-sinir.json', JSON.stringify({ type: 'Feature', id: '792', properties: {}, geometry: turkiye.geometry }) + '\n');
console.log('src/turkiye-sinir.json yazıldı');

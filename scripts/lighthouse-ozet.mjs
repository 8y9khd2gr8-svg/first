// Lighthouse CI sonucunu (lighthouse-sonuc/manifest.json) okunur bir tabloya çevirir; GitHub'da işin özet sayfasına yazılır.
// Puanlar 0-100; telefon taklidiyle (yavaş işlemci + yavaş ağ) ölçülür, gerçek telefon değildir.
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('lighthouse-sonuc/manifest.json', 'utf8'));
const ADLAR = { performance: 'Hız', accessibility: 'Erişilebilirlik', 'best-practices': 'İyi uygulamalar', seo: 'Arama motoru' };
const temsil = manifest.find((m) => m.isRepresentativeRun) ?? manifest[0];
const satirlar = Object.entries(temsil.summary).map(([k, v]) => `| ${ADLAR[k] ?? k} | ${Math.round(v * 100)} |`);
const rapor = JSON.parse(fs.readFileSync(temsil.jsonPath, 'utf8'));
const olcu = (id) => rapor.audits[id]?.displayValue ?? '-';
const metin = [
  `## Lighthouse (${manifest.length} ölçümün ortancası; telefon taklidi, gerçek telefon değil)`,
  '',
  '| Bölüm | Puan |',
  '|---|---|',
  ...satirlar,
  '',
  '| Ölçü | Değer |',
  '|---|---|',
  `| İlk görüntü (FCP) | ${olcu('first-contentful-paint')} |`,
  `| En büyük görüntü (LCP) | ${olcu('largest-contentful-paint')} |`,
  `| Takılma süresi (TBT) | ${olcu('total-blocking-time')} |`,
  `| Etkileşime hazır (TTI) | ${olcu('interactive')} |`,
  `| Toplam indirme | ${olcu('total-byte-weight')} |`,
  '',
].join('\n');
console.log(metin);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, metin);

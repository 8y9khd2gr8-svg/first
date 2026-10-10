// Her animasyonun bir tekrarından 3 kare (başlangıç, orta, en uç an) alır.
import { chromium } from 'playwright';
import fs from 'fs';
const [anims, out] = [process.argv[2].split(','), process.argv[3]];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// "Hareketi azalt": göz kırpma gibi süsler kapalı (resimde Zıpzıp gözü kapalı yakalanmasın).
const p = await b.newPage({ viewport: { width: 360, height: 640 }, reducedMotion: 'reduce' });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:5173/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('zipzip-guvenlik-notu-v1', '1'); });
await p.reload(); await p.waitForTimeout(2500);
await p.evaluate(async () => {
  const s = window.oyun.scene.getScenes(true)[0];
  s.scene.start('Kostum', {});
});
await p.waitForTimeout(800);
await p.evaluate(async () => {
  const s = window.oyun.scene.getScene('Kostum');
  s.children.list.forEach((c) => c.setVisible(false));
  s.input.enabled = false;
  const { Zipzip } = await import('/src/zipzip.ts');
  window.poz = new Zipzip(s, 360, 700, 1.6);
});
const sonuc = {};
for (const a of anims) {
  await p.evaluate((a) => { window.poz.durdur(); window.poz.birKez(a, 9000); }, a);
  const kareler = [];
  for (const t of [600, 3000, 3600]) { await p.waitForTimeout(t); kareler.push((await p.screenshot({ type: 'jpeg', quality: 70, clip: { x: 50, y: 100, width: 260, height: 400 } })).toString('base64')); }
  sonuc[a] = kareler;
}
fs.writeFileSync(out, JSON.stringify(sonuc)); console.log('errors', errs, Object.keys(sonuc).length); await b.close();

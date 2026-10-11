// Uygulama ikonları ve açılış (splash) resimleri: oyundaki Zıpzıp'tan (kollar yukarıda, gülen yüz) üretilir.
// Yazar: assets/ (kaynaklar), public/ikon/ (web), android/.../res/ (mipmap + splash), ios/.../Assets.xcassets/.
// Var olan her resim aynı boyutta yeniden yazılır (Capacitor'ın beklediği dosyalar değişmez).
// Kullanım: `npx vite --port 5173` açıkken `node scripts/ikon-uret.mjs`. Sonra mağaza görselleri: scripts/magaza-gorselleri.mjs.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const ADRES = 'http://localhost:5173/';
const tarayici = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? '/opt/pw-browsers/chromium' : undefined });

// 1) Zıpzıp'ı oyunun içinde büyük çizip saydam arka planlı resim olarak al.
const oyun = await tarayici.newPage({ viewport: { width: 360, height: 640 }, reducedMotion: 'reduce' });
await oyun.goto(ADRES);
await oyun.evaluate(() => localStorage.setItem('zipzip-kostum-v1', '{}'));
await oyun.reload();
await oyun.waitForFunction(() => window.oyun?.scene?.getScenes(true).length > 0);
await oyun.waitForTimeout(1200);
await oyun.evaluate(() => {
  const o = window.oyun;
  o.scene.getScenes(true).forEach((s) => s.scene.stop());
  o.scene.start('Kostum', {});
});
await oyun.waitForTimeout(800);
await oyun.evaluate(async () => {
  const sahne = window.oyun.scene.getScene('Kostum');
  sahne.children.list.forEach((c) => c.setVisible(false));
  const { Zipzip } = await import('/src/zipzip.ts');
  const z = new Zipzip(sahne, 600, 560, 3);
  z.kostumGiy(undefined);
  z.ifadeSec('mutlu');
  z.birKez('kollar', 4000);
  window.__ikonZipzip = z;
});
await oyun.waitForTimeout(1300);
const zipzipResmi = await oyun.evaluate(
  () =>
    new Promise((tamam) => {
      const sahne = window.oyun.scene.getScene('Kostum');
      const rt = sahne.add.renderTexture(0, 0, 1200, 1200).setVisible(false);
      rt.draw(window.__ikonZipzip.golgesi);
      rt.draw(window.__ikonZipzip);
      rt.snapshot((img) => tamam(img.src));
    }),
);
await oyun.close();

// 2) Tuvalde birleştirme: lacivert arka plan + ortada Zıpzıp. tur: tam (ikon), on (Android ön katman, saydam),
// arka (Android arka katman), maske (Android uyarlanabilir/PWA maskable: güvenli alan), acilis (splash), yuvarlak.
const tuval = await tarayici.newPage();
await tuval.setContent('<canvas></canvas>');
await tuval.evaluate(async (src) => {
  const resim = new Image();
  resim.src = src;
  await resim.decode();
  // Zıpzıp'ın dolu alanını bul (kenardaki boşluğu at).
  const c = document.createElement('canvas');
  c.width = resim.width;
  c.height = resim.height;
  const x = c.getContext('2d');
  x.drawImage(resim, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let [sol, ust, sag, alt] = [c.width, c.height, 0, 0];
  for (let y = 0; y < c.height; y++)
    for (let i = 0; i < c.width; i++)
      if (d[(y * c.width + i) * 4 + 3] > 8) {
        sol = Math.min(sol, i);
        sag = Math.max(sag, i);
        ust = Math.min(ust, y);
        alt = Math.max(alt, y);
      }
  window.kutu = { sol, ust, g: sag - sol, y: alt - ust };
  window.resim = resim;
  window.ciz = (g, y, tur, rgb) => {
    const t = document.createElement('canvas');
    t.width = g;
    t.height = y;
    const k = t.getContext('2d');
    if (tur !== 'on') {
      const r = Math.max(g, y);
      const grad = k.createRadialGradient(g / 2, y * 0.42, 0, g / 2, y * 0.42, r * 0.75);
      grad.addColorStop(0, '#2c4a8a');
      grad.addColorStop(1, '#14213d');
      k.fillStyle = grad;
      k.fillRect(0, 0, g, y);
    }
    if (tur !== 'arka') {
      // Zıpzıp'ın yüksekliği kısa kenarın oranı kadar: ikon dolu, ön katman/maske güvenli alanda, açılışta küçük.
      const oran = { tam: 0.86, yuvarlak: 0.74, on: 0.56, maske: 0.66, acilis: 0.26 }[tur];
      const boy = Math.min(g, y) * oran;
      const o = boy / window.kutu.y;
      const w = window.kutu.g * o;
      k.drawImage(window.resim, window.kutu.sol, window.kutu.ust, window.kutu.g, window.kutu.y, (g - w) / 2, (y - boy) / 2, w, boy);
    }
    if (tur === 'yuvarlak') {
      k.globalCompositeOperation = 'destination-in';
      k.beginPath();
      k.arc(g / 2, y / 2, Math.min(g, y) / 2, 0, Math.PI * 2);
      k.fill();
    }
    // Apple ikonu saydamlık kanalı istemez: onun pikselleri düz RGB olarak yazılır (aşağıda png()). Diğerleri tarayıcının PNG'si.
    if (rgb) return { piksel: Array.from(k.getImageData(0, 0, g, y).data) };
    return { url: t.toDataURL('image/png') };
  };
}, zipzipResmi);

// PNG başlığından boyut (genişlik, yükseklik).
const boyut = (dosya) => {
  const b = fs.readFileSync(dosya);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};
// Küçük PNG yazıcı (Apple ikonu için): RGB (renk türü 2) ya da RGBA (6).
function png(g, y, piksel, saydam) {
  const kanal = saydam ? 4 : 3;
  const satir = Buffer.alloc((g * kanal + 1) * y);
  for (let j = 0; j < y; j++)
    for (let i = 0; i < g; i++)
      for (let c = 0; c < kanal; c++) satir[j * (g * kanal + 1) + 1 + i * kanal + c] = piksel[(j * g + i) * 4 + c];
  const parca = (tip, veri) => {
    const u = Buffer.alloc(4);
    u.writeUInt32BE(veri.length);
    const tv = Buffer.concat([Buffer.from(tip), veri]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(tv));
    return Buffer.concat([u, tv, crc]);
  };
  const bas = Buffer.alloc(13);
  bas.writeUInt32BE(g, 0);
  bas.writeUInt32BE(y, 4);
  bas[8] = 8;
  bas[9] = saydam ? 6 : 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), parca('IHDR', bas), parca('IDAT', zlib.deflateSync(satir, { level: 9 })), parca('IEND', Buffer.alloc(0))]);
}
const yaz = async (dosya, tur, g, y, rgb = false) => {
  [g, y] = g ? [g, y] : boyut(dosya);
  const { piksel, url } = await tuval.evaluate(([g, y, tur, rgb]) => window.ciz(g, y, tur, rgb), [g, y, tur, rgb]);
  fs.mkdirSync(path.dirname(dosya), { recursive: true });
  fs.writeFileSync(dosya, rgb ? png(g, y, piksel, false) : Buffer.from(url.split(',')[1], 'base64'));
};
const bul = (klasor, ad) =>
  fs.readdirSync(klasor, { recursive: true }).map(String).filter((f) => path.basename(f) === ad).map((f) => path.join(klasor, f));

// Kaynaklar (Capacitor assets düzeni)
await yaz('assets/icon-only.png', 'tam', 1024, 1024, true);
await yaz('assets/icon-foreground.png', 'on', 1024, 1024);
await yaz('assets/icon-background.png', 'arka', 1024, 1024);
await yaz('assets/splash.png', 'acilis', 2732, 2732);
await yaz('assets/splash-dark.png', 'acilis', 2732, 2732);
// Web (PWA)
await yaz('public/ikon/ikon-512.png', 'tam', 512, 512);
await yaz('public/ikon/ikon-192.png', 'tam', 192, 192);
await yaz('public/ikon/apple-touch-icon.png', 'tam', 180, 180);
await yaz('public/ikon/favicon-64.png', 'yuvarlak', 64, 64);
await yaz('public/ikon/ikon-maskable-512.png', 'maske', 512, 512);
// Android
const RES = 'android/app/src/main/res';
for (const f of bul(RES, 'ic_launcher.png')) await yaz(f, 'tam');
for (const f of bul(RES, 'ic_launcher_round.png')) await yaz(f, 'yuvarlak');
for (const f of bul(RES, 'ic_launcher_foreground.png')) await yaz(f, 'on');
for (const f of bul(RES, 'ic_launcher_background.png')) await yaz(f, 'arka');
for (const f of bul(RES, 'splash.png')) await yaz(f, 'acilis');
// iPhone
const IOS = 'ios/App/App/Assets.xcassets';
for (const f of bul(`${IOS}/AppIcon.appiconset`, 'AppIcon-512@2x.png')) await yaz(f, 'tam', 0, 0, true);
for (const f of fs.readdirSync(`${IOS}/Splash.imageset`).filter((f) => f.endsWith('.png'))) await yaz(`${IOS}/Splash.imageset/${f}`, 'acilis');

await tarayici.close();
console.log('ikonlar yazıldı');

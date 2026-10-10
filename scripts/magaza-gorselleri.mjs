// Play Store / App Store görselleri: telefon ekran görüntüleri (1080×1920, üstte başlık), tanıtım görseli
// (1024×500) ve 512'lik ikon. Çıktı: docs/magaza-gorselleri/.
// Kullanım: `npx vite --port 5173` açıkken `node scripts/magaza-gorselleri.mjs`.
import { chromium } from 'playwright';
import fs from 'fs';

const ADRES = 'http://localhost:5173/';
const CIKTI = 'docs/magaza-gorselleri';
fs.mkdirSync(CIKTI, { recursive: true });

// Ekranlar ve başlıkları (Türkçe mağaza sayfası). Sıra mağazadaki sıradır.
const EKRANLAR = [
  { sahne: 'Harita', veri: {}, bekle: 2500, baslik: 'Hareket ederek\nTürkiye’yi gez!' },
  { sahne: 'Hareket', veri: { durakId: 'kapadokya', adim: 1 }, bekle: 1800, baslik: 'Zıpzıp gösterir,\nsen yaparsın!' },
  { sahne: 'Odul', veri: { durakId: 'pamukkale' }, bekle: 2800, baslik: 'Her durakta\npasaport damgası' },
  { sahne: 'Dunya', veri: {}, bekle: 2500, baslik: 'Dünyanın harikalarına\nyolculuk' },
  { sahne: 'Spor', veri: {}, bekle: 2500, baslik: 'Uzay, spor, dinozorlar\nve daha fazlası' },
  { sahne: 'Kostum', veri: {}, bekle: 2000, baslik: 'Hareket ettikçe\nkostümler açılır' },
  { sahne: 'EbeveynVeri', veri: {}, bekle: 1500, baslik: 'Reklam yok, hesap yok.\nHer şey telefonda kalır.' },
];

// Oyunun yazı tipi (Baloo 2), Türkçe harfler için latin + latin-ext birlikte.
const yaziTipi = (alt, agirlik) =>
  `data:font/woff2;base64,${fs.readFileSync(`node_modules/@fontsource/baloo-2/files/baloo-2-${alt}-${agirlik}-normal.woff2`).toString('base64')}`;
const YAZI_CSS = ['latin', 'latin-ext']
  .flatMap((alt) => [700, 800].map((a) => `@font-face{font-family:Baloo;font-weight:${a};src:url(${yaziTipi(alt, a)})}`))
  .join('');

const tarayici = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? '/opt/pw-browsers/chromium' : undefined });

// 1) Oyun ekranları: 360×640 görünüm, 3 kat çözünürlük = 1080×1920.
const oyun = await tarayici.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
await oyun.goto(ADRES);
await oyun.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
  localStorage.setItem('zipzip-beta-dunya', '1');
  localStorage.setItem('zipzip-ilerleme-v1', JSON.stringify(['istanbul', 'truva', 'pamukkale', 'kapadokya']));
  localStorage.setItem('zipzip-pasaport-v1', JSON.stringify({ ad: '', avatar: '🦁', soruldu: true }));
  localStorage.setItem('zipzip-kostum-v1', JSON.stringify({ secili: 'pilot', kutlanan: ['kaptan', 'pilot'] }));
  // Örnek hareket kaydı (yıldız sayısı ve özet boş görünmesin): son üç gün.
  const gunler = {};
  for (let i = 0; i < 3; i++) {
    const t = new Date();
    t.setDate(t.getDate() - i);
    const g = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    gunler[g] = { saniye: 600 + i * 120, hareket: 18 - i * 3, ziplama: 40 + i * 5 };
  }
  localStorage.setItem('zipzip-istatistik-v1', JSON.stringify({ gunler }));
});
await oyun.reload();
await oyun.waitForFunction(() => window.oyun?.scene?.getScenes(true).length > 0);
await oyun.waitForTimeout(1500);
const goruntuler = [];
for (const e of EKRANLAR) {
  await oyun.evaluate(([ad, veri]) => {
    const o = window.oyun;
    o.scene.getScenes(true).forEach((s) => s.scene.stop());
    setTimeout(() => o.scene.start(ad, veri), 50);
  }, [e.sahne, e.veri]);
  await oyun.waitForTimeout(e.bekle);
  goruntuler.push((await oyun.screenshot({ type: 'png' })).toString('base64'));
}

// Tanıtım görseli için Zıpzıp tek başına (kostümsüz, gülen yüz).
await oyun.evaluate(async () => {
  const o = window.oyun;
  o.scene.getScenes(true).forEach((s) => s.scene.stop());
  o.scene.start('Kostum', {});
});
await oyun.waitForTimeout(800);
await oyun.evaluate(async () => {
  localStorage.setItem('zipzip-kostum-v1', '{}');
  const s = window.oyun.scene.getScene('Kostum');
  s.children.list.forEach((c) => c.setVisible(false));
  const { Zipzip } = await import('/src/zipzip.ts');
  // Oyun koordinatları 720×1280 (ekranda yarısı).
  const z = new Zipzip(s, 360, 660, 1.5);
  z.ifadeSec('mutlu');
  z.birKez('kollar', 4000);
});
await oyun.waitForTimeout(1200);
const zipzip = (await oyun.screenshot({ type: 'png', clip: { x: 60, y: 170, width: 240, height: 300 } })).toString('base64');

// 2) Çerçeveli ekran görüntüleri: üstte büyük başlık, altta telefon ekranı.
const cerceve = await tarayici.newPage({ viewport: { width: 1080, height: 1920 } });
for (let i = 0; i < EKRANLAR.length; i++) {
  await cerceve.setContent(`<style>${YAZI_CSS}
    *{margin:0;box-sizing:border-box}
    body{width:1080px;height:1920px;background:radial-gradient(circle at 50% 0%,#24386a 0%,#14213d 60%);display:flex;flex-direction:column;align-items:center;font-family:Baloo,sans-serif;overflow:hidden}
    h1{color:#FFC93C;font-weight:800;font-size:96px;line-height:1.02;text-align:center;margin-top:90px;white-space:pre-line;text-shadow:0 6px 0 #0b1430}
    img{margin-top:70px;width:830px;border-radius:64px;border:14px solid #0b1430;box-shadow:0 30px 80px #0008}
  </style><h1>${EKRANLAR[i].baslik}</h1><img src="data:image/png;base64,${goruntuler[i]}">`);
  await cerceve.waitForTimeout(200);
  await cerceve.screenshot({ path: `${CIKTI}/ekran-${i + 1}.png` });
}

// 3) Tanıtım görseli (Play "Öne çıkan grafik"): 1024×500, saydamlık yok.
const tanitim = await tarayici.newPage({ viewport: { width: 1024, height: 500 } });
await tanitim.setContent(`<style>${YAZI_CSS}
  *{margin:0}
  body{width:1024px;height:500px;background:#14213d;display:flex;align-items:center;font-family:Baloo,sans-serif;overflow:hidden}
  .yazi{padding-left:70px;flex:1}
  h1{color:#FFC93C;font-weight:800;font-size:104px;line-height:.95;text-shadow:0 6px 0 #0b1430}
  h1 span{color:#fff}
  p{color:#cfe3ff;font-weight:700;font-size:38px;margin-top:22px}
  img{height:480px;margin-right:60px}
</style><div class="yazi"><h1>Zıp Zıp<br><span>Dünya</span></h1><p>Hareket et, dünyayı keşfet!</p></div><img src="data:image/png;base64,${zipzip}">`);
await tanitim.waitForTimeout(200);
await tanitim.screenshot({ path: `${CIKTI}/tanitim-1024x500.png`, omitBackground: false });

// 4) İkon: oyunun kendi 512'lik ikonu.
fs.copyFileSync('public/ikon/ikon-512.png', `${CIKTI}/ikon-512.png`);

await tarayici.close();
console.log('tamam:', fs.readdirSync(CIKTI).join(', '));

// Play Store / App Store görselleri: ekran görüntüleri (üstte başlık, altta oyun ekranı), tanıtım görseli
// (1024×500) ve 512'lik ikon. Çıktı: docs/magaza-gorselleri/ (Play), iphone/ ve ipad/ (App Store).
// Her cihazın görüntüsü o cihazın kendi ekran boyutunda çekilir (iPad'de oyun gerçekten nasıl görünüyorsa).
// Kullanım: `npx vite --port 5173` açıkken `node scripts/magaza-gorselleri.mjs`.
import { chromium } from 'playwright';
import fs from 'fs';

const ADRES = 'http://localhost:5173/';
const CIKTI = 'docs/magaza-gorselleri';

// Cihazlar: oyunun açıldığı ekran (nokta × kat) ve mağazanın istediği görsel boyutu.
// Apple: 6.9" iPhone 1320×2868 ve 13" iPad 2064×2752 zorunlu (uygulama iPad'i de destekliyor).
const CIHAZLAR = [
  { klasor: CIKTI, ekran: { width: 360, height: 640 }, kat: 3, boyut: [1080, 1920], kose: 64 },
  { klasor: `${CIKTI}/iphone`, ekran: { width: 440, height: 956 }, kat: 3, boyut: [1320, 2868], kose: 96 },
  { klasor: `${CIKTI}/ipad`, ekran: { width: 1032, height: 1376 }, kat: 2, boyut: [2064, 2752], kose: 56 },
];

// Ekranlar ve başlıkları (Türkçe mağaza sayfası). Sıra mağazadaki sıradır.
const EKRANLAR = [
  { sahne: 'Harita', veri: {}, bekle: 2500, baslik: 'Hareket ederek\nTürkiye’yi gez!' },
  { sahne: 'Hareket', veri: { durakId: 'kapadokya', adim: 1 }, bekle: 1800, baslik: 'Zıpzıp gösterir,\nsen yaparsın!' },
  { sahne: 'Odul', veri: { durakId: 'pamukkale' }, bekle: 2800, baslik: 'Her durakta\npasaport damgası' },
  { sahne: 'Dunya', veri: {}, bekle: 2500, baslik: 'Dünyanın harikalarına\nyolculuk' },
  { sahne: 'Macera', veri: {}, bekle: 2500, baslik: 'Uzay, spor, dinozorlar,\nokyanus ve fazlası' },
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

// 1) Oyun ekranları: cihazın ekranında açılır, kayıtlar örnek ilerlemeyle doldurulur.
const oyunAc = async (c) => {
  const oyun = await tarayici.newPage({ viewport: c.ekran, deviceScaleFactor: c.kat, reducedMotion: 'reduce' });
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
  return oyun;
};

const goruntule = async (oyun) => {
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
  return goruntuler;
};

// 2) Çerçeveli ekran görüntüleri: üstte büyük başlık, altta oyun ekranı. Ölçüler görselin genişliğine göre.
const cercevele = async (c, goruntuler) => {
  fs.mkdirSync(c.klasor, { recursive: true });
  const [g, y] = c.boyut;
  const o = g / 1080;
  const cerceve = await tarayici.newPage({ viewport: { width: g, height: y } });
  for (let i = 0; i < EKRANLAR.length; i++) {
    await cerceve.setContent(`<style>${YAZI_CSS}
      *{margin:0;box-sizing:border-box}
      body{width:${g}px;height:${y}px;background:radial-gradient(circle at 50% 0%,#24386a 0%,#14213d 60%);display:flex;flex-direction:column;align-items:center;font-family:Baloo,sans-serif;overflow:hidden}
      h1{color:#FFC93C;font-weight:800;font-size:${96 * o}px;line-height:1.02;text-align:center;margin-top:${90 * o}px;white-space:pre-line;text-shadow:0 ${6 * o}px 0 #0b1430}
      img{margin-top:${70 * o}px;max-width:${g - 250 * o}px;max-height:${y - 520 * o}px;border-radius:${c.kose}px;border:${14 * o}px solid #0b1430;box-shadow:0 30px 80px #0008}
    </style><h1>${EKRANLAR[i].baslik}</h1><img src="data:image/png;base64,${goruntuler[i]}">`);
    await cerceve.waitForTimeout(200);
    await cerceve.screenshot({ path: `${c.klasor}/ekran-${i + 1}.png` });
  }
  await cerceve.close();
};

let zipzip;
for (const c of CIHAZLAR) {
  const oyun = await oyunAc(c);
  await cercevele(c, await goruntule(oyun));
  // Tanıtım görseli için Zıpzıp bir kez, telefon ekranından alınır.
  if (!zipzip) {
    // Zıpzıp tek başına (kostümsüz, gülen yüz).
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
    zipzip = (await oyun.screenshot({ type: 'png', clip: { x: 60, y: 170, width: 240, height: 300 } })).toString('base64');
  }
  await oyun.close();
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

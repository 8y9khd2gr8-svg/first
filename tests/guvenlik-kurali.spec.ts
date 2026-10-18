import fs from 'node:fs';
import { expect, Page, test } from '@playwright/test';

// Tarayıcı güvenlik kuralı (CSP, K47): derlenmiş oyunda (test sitesi / mağaza paketi) tarayıcı, oyunun kendi adresi dışına
// hiçbir istek göndermez. Testler derlenmiş sürümde (vite preview, 5198) çalışır; geliştirme sunucusunda kural yoktur.
// Bulut testi Chromium'dur: iPhone (WKWebView) ve Android uygulama içi tarayıcısı ayrıca telefonda denenmeli (🔎).
const ADRES = 'http://localhost:5198/';

// Kural ihlallerini sayfanın içinden toplar (tarayıcı her engelde "securitypolicyviolation" olayı verir).
async function ihlalleriTopla(page: Page) {
  await page.addInitScript(() => {
    const w = window as any;
    w.ihlaller = [];
    document.addEventListener('securitypolicyviolation', (e) => w.ihlaller.push(`${e.effectiveDirective} ${e.blockedURI}`));
  });
}
const ihlaller = (page: Page) => page.evaluate(() => (window as any).ihlaller as string[]);

async function derlenmisOyunuAc(page: Page) {
  const hatalar: string[] = [];
  const disIstekler: string[] = [];
  const engellenen: string[] = [];
  page.on('pageerror', (e) => hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  page.on('request', (r) => {
    const a = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(a.hostname) && !['data:', 'blob:'].includes(a.protocol)) disIstekler.push(r.url());
  });
  page.on('requestfailed', (r) => !new URL(r.url()).hostname.startsWith('localhost') && engellenen.push(`${r.url()} ${r.failure()?.errorText}`));
  await ihlalleriTopla(page);
  await page.goto(ADRES);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
    localStorage.setItem('zipzip-pasaport-v1', JSON.stringify({ ad: '', soruldu: true }));
  });
  await page.reload();
  await expect(page.locator('#oyun canvas')).toBeVisible({ timeout: 15_000 });
  return { hatalar, disIstekler, engellenen };
}

// Tuvaldeki oyun noktasına (720×1280) gerçek fare dokunuşu.
async function dokun(page: Page, x: number, y: number) {
  const r = (await page.locator('#oyun canvas').boundingBox())!;
  await page.mouse.click(r.x + (r.width * x) / 720, r.y + (r.height * y) / 1280);
}

test('derlenmiş oyunda tarayıcı güvenlik kuralı var, geliştirme sunucusunda yok', async ({ page }) => {
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const kural = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1].replace(/&#39;/g, "'");
  expect(kural).toBeTruthy();
  for (const parca of ["default-src 'self'", "script-src 'self' 'wasm-unsafe-eval'", "connect-src 'self'", "object-src 'none'", "form-action 'none'"]) {
    expect(kural).toContain(parca);
  }
  // Betiğe satır içi ya da eval izni yok; dış adres yok.
  expect(kural).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
  expect(kural).not.toMatch(/https?:|\*/);
  // Kural, sayfanın betiklerinden önce gelir; karakter kümesi ilk 1024 baytta kalır.
  expect(html.indexOf('Content-Security-Policy')).toBeLessThan(html.indexOf('<script'));
  expect(Buffer.from(html).indexOf('charset="UTF-8"')).toBeLessThan(1024);
  // ZIPZIP_CSP=1 ile bütün testler kuralla koşturulurken geliştirme sunucusunda da kural vardır.
  await page.goto('http://localhost:5199/');
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').count()).toBe(process.env.ZIPZIP_CSP === '1' ? 1 : 0);
});

// Eski kodda kırmızı: kural yokken tarayıcı dış isteği engellemez (olay gelmez).
test('derlenmiş oyunda dış adrese istek, resim, betik ve bağlantı tarayıcı tarafından engellenir', async ({ page }) => {
  const k = await derlenmisOyunuAc(page);
  const sonuc = await page.evaluate(async () => {
    const w = window as any;
    const dis = 'https://dis-sunucu.invalid/';
    const fetchSonucu = await fetch(dis + 'veri').then(() => 'gitti', () => 'engellendi');
    new Image().src = dis + 'resim.png';
    const b = document.createElement('script');
    b.src = dis + 'betik.js';
    document.head.append(b);
    try {
      new WebSocket('wss://dis-sunucu.invalid/');
    } catch {
      // bazı tarayıcılar hemen hata fırlatır; olay yine gelir
    }
    navigator.sendBeacon?.(dis + 'iz', 'x');
    await new Promise((r) => setTimeout(r, 500));
    return { fetchSonucu, ihlaller: w.ihlaller as string[] };
  });
  expect(sonuc.fetchSonucu).toBe('engellendi');
  const tur = (d: string) => sonuc.ihlaller.some((i) => i.startsWith(d) && i.includes('dis-sunucu.invalid'));
  expect(tur('connect-src')).toBe(true);
  expect(tur('img-src')).toBe(true);
  expect(tur('script-src')).toBe(true);
  // Tarayıcı resim/betik isteğini kaydeder ama ağa çıkarmadan "kural engelledi" diye düşürür (fetch hiç başlamaz).
  await expect.poll(() => k.engellenen.length).toBe(k.disIstekler.length);
  expect(k.engellenen.every((h) => /ERR_BLOCKED_BY_CSP|csp/i.test(h))).toBe(true);
});

test('kural varken oyun açılır, yazı tipi yüklenir, Büyük Macera ve ebeveyn kilidi hatasız; hiçbir şey engellenmez', async ({ page }) => {
  const k = await derlenmisOyunuAc(page);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(async () => (await document.fonts.ready, document.fonts.check('700 30px "Baloo 2"')))).toBe(true);
  await dokun(page, 360, 1090); // Oyna ▶
  await page.waitForTimeout(2500);
  await dokun(page, 650, 1210); // 🔒 Ebeveyn (Büyük Macera'nın sağ altı)
  await page.waitForTimeout(1500);
  expect(await ihlaller(page)).toEqual([]);
  expect(k.hatalar).toEqual([]);
  expect(k.disIstekler).toEqual([]);
});

// Kamera tanıma modeli (MediaPipe: betik + WebAssembly + model dosyası) kural altında yüklenir ve çalışır.
// Model, oyunun derlenmiş paketindeki aynı modülden yüklenir; görüntü yerine boş bir tuval verilir (kamera gerekmez).
async function modeliDene(page: Page) {
  const modul = fs.readdirSync('dist/assets').find((d) => /^vision_bundle-.*\.js$/.test(d));
  expect(modul).toBeTruthy();
  return page.evaluate(async (modul) => {
    try {
      const { FilesetResolver, PoseLandmarker } = await import(`./assets/${modul}`);
      const kok = new URL('mediapipe/', document.baseURI).href;
      const dosyalar = await FilesetResolver.forVisionTasks(kok);
      const model = await PoseLandmarker.createFromOptions(dosyalar, {
        baseOptions: { modelAssetPath: kok + 'pose_landmarker_lite.task', delegate: 'CPU' },
        runningMode: 'IMAGE',
        numPoses: 1,
      });
      const tuval = document.createElement('canvas');
      tuval.width = tuval.height = 64;
      const sonuc = model.detect(tuval);
      model.close();
      return `çalıştı (${sonuc.landmarks.length} kişi)`;
    } catch (e) {
      return `hata: ${String((e as Error)?.message ?? e).slice(0, 120)}`;
    }
  }, modul!);
}

test('kural varken kamera tanıma modeli (WebAssembly) yüklenir ve çalışır', async ({ page }) => {
  test.setTimeout(120_000);
  const k = await derlenmisOyunuAc(page);
  expect(await modeliDene(page)).toBe('çalıştı (0 kişi)');
  expect(await ihlaller(page)).toEqual([]);
  expect(k.disIstekler).toEqual([]);
});

// Kontrol: 'wasm-unsafe-eval' kaldırılırsa model çalışmaz (kuralın bu parçası gerçekten gerekli; gereksiz izin yok).
// Hizmet çalışanı kapalı: sayfa onun önbelleğinden değil, değiştirilen cevaptan gelsin.
test.describe('kontrol', () => {
test.use({ serviceWorkers: 'block' });
test("kontrol: kuralda 'wasm-unsafe-eval' olmasa kamera modeli engellenirdi", async ({ page }) => {
  test.setTimeout(120_000);
  await page.route(ADRES, async (yol) => {
    const cevap = await yol.fetch();
    yol.fulfill({ response: cevap, body: (await cevap.text()).replace(' &#39;wasm-unsafe-eval&#39;', '') });
  });
  await derlenmisOyunuAc(page);
  expect(await modeliDene(page)).toMatch(/^hata/);
  expect((await ihlaller(page)).some((i) => i.startsWith('script-src'))).toBe(true);
});
});

import { expect, Page, test } from '@playwright/test';

// Oyunun ekranlarını gerçek tarayıcıda açar: hata çıkmamalı, oyun hiçbir dış sunucuya bağlanmamalı.
// Sahneler window.oyun üzerinden başlatılır (sadece geliştirme sürümünde vardır).

type Kayit = { hatalar: string[]; disIstekler: string[] };

async function oyunuAc(page: Page, depo: Record<string, string> = {}): Promise<Kayit> {
  const kayit: Kayit = { hatalar: [], disIstekler: [] };
  page.on('pageerror', (e) => kayit.hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && kayit.hatalar.push(m.text()));
  page.on('request', (r) => {
    const adres = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(adres.hostname) && !['data:', 'blob:'].includes(adres.protocol)) kayit.disIstekler.push(r.url());
  });
  await page.goto('/');
  await page.evaluate((depo) => {
    localStorage.clear();
    localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
    for (const [k, v] of Object.entries(depo)) localStorage.setItem(k, v);
  }, depo);
  await page.reload();
  await page.waitForFunction(() => (window as any).oyun?.scene?.getScenes(true).length > 0);
  return kayit;
}

async function sahneAc(page: Page, ad: string, veri: object = {}) {
  await page.evaluate(
    ([ad, veri]) => {
      const oyun = (window as any).oyun;
      oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
      oyun.scene.start(ad, veri);
    },
    [ad, veri] as const,
  );
  await page.waitForTimeout(700);
}

const BETA = { 'zipzip-beta-dunya': '1' };

test('bütün ekranlar hatasız açılır ve dış sunucuya bağlanılmaz', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  const sahneler: [string, object][] = [
    ['Acilis', {}], ['Macera', {}], ['Harita', { giris: 'uzay' }], ['Dunya', {}], ['Uzay', {}],
    ['Spor', { giris: 'uzay' }], ['Dinozor', { giris: 'uzay' }], ['Evde', { giris: 'uzay' }],
    ['Durak', { durakId: 'futbol' }], ['Durak', { durakId: 'oyuncak' }], ['Hareket', { durakId: 'trex', adim: 1 }],
    ['Odul', { durakId: 'fosil' }], ['Pasaport', { sayfa: 'evde' }], ['Rozet', {}], ['Kostum', {}],
    ['Sertifika', { bolum: 'spor' }], ['EbeveynMenu', {}], ['EbeveynOzet', {}],
  ];
  for (const [ad, veri] of sahneler) await sahneAc(page, ad, veri);
  expect(kayit.hatalar).toEqual([]);
  expect(kayit.disIstekler).toEqual([]);
});

test('yeni bölümler zincirle açılır', async ({ page }) => {
  await oyunuAc(page);
  const acik = () =>
    page.evaluate(async () => {
      const { bolumuAcikMi } = await import('/src/duraklar.ts');
      return ['spor', 'dinozor', 'evde'].map((b) => bolumuAcikMi(b as any));
    });
  expect(await acik()).toEqual([false, false, false]);
  await page.evaluate(async () => {
    const { UZAY, SPOR } = await import('/src/duraklar.ts');
    localStorage.setItem('zipzip-ilerleme-v1', JSON.stringify([...UZAY, ...SPOR].map((d) => d.id)));
  });
  expect(await acik()).toEqual([true, true, false]);
});

test('durak bitince harita kutlar (sıralı ve serbest bölüm)', async ({ page }) => {
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['yumurta', 'tenis']) });
  await sahneAc(page, 'Dinozor', { yolculukDen: 'yumurta' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'test-results/dinozor-yolculuk.png' });
  await sahneAc(page, 'Spor', { yolculukDen: 'tenis' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'test-results/spor-kutlama.png' });
  expect(kayit.hatalar).toEqual([]);
});

test('en uzun sayılı hareket sonuna kadar gider ("Yaptım!" çıkar)', async ({ page }) => {
  const kayit = await oyunuAc(page);
  // Çin Seddi: 12 tekrar (eskiden 11'de takılıyordu).
  await sahneAc(page, 'Hareket', { durakId: 'cinseddi', adim: 1 });
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('Hareket').children.list.some((c: any) => c.list?.some?.((t: any) => t.text === 'Yaptım!')), null, { timeout: 30_000 });
  expect(kayit.hatalar).toEqual([]);
});

test('Zıpzıp her hareketi hatasız yapar', async ({ page }) => {
  const kayit = await oyunuAc(page);
  await sahneAc(page, 'Kostum');
  const animasyonlar: string[] = await page.evaluate(async () => {
    const { TUM_DURAKLAR } = await import('/src/duraklar.ts');
    const { AILE_OTURUMU } = await import('/src/aile.ts');
    const { H } = await import('/src/hareketler.ts');
    return [...new Set([...Object.values(H), ...AILE_OTURUMU, ...TUM_DURAKLAR.flatMap((d) => [d.ozel, ...d.ekler])].map((h: any) => h.animasyon))];
  });
  for (const a of animasyonlar) {
    await page.evaluate(async (a) => {
      const s = (window as any).oyun.scene.getScene('Kostum');
      const { Zipzip } = await import('/src/zipzip.ts');
      const z = new Zipzip(s, 360, 700, 1);
      z.birKez(a, 600, 1);
      z.birKez(a, 600, 2);
      (window as any).sonZipzip = z;
    }, a);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(800);
  expect(kayit.hatalar).toEqual([]);
});

test('"Uzaktan oyna" açıkken bir durak baştan sona kendiliğinden oynanır (ısınma + sürpriz dahil)', async ({ page }) => {
  test.setTimeout(300_000);
  const kayit = await oyunuAc(page, { 'zipzip-uzaktan-v1': '1' });
  await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim: 0 });
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Odul'), null, { timeout: 280_000, polling: 1000 });
  expect(kayit.hatalar).toEqual([]);
});

test('yavaş telefonda oyun kendiliğinden sadeleşir (süs animasyonu yok, 30 kare)', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 8 });
  await sahneAc(page, 'Harita');
  await expect.poll(() => page.evaluate(async () => (await import('/src/hiz.ts')).telefonYavas()), { timeout: 40_000, intervals: [500] }).toBe(true);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  expect(await page.evaluate(() => (window as any).oyun.loop.fpsLimit)).toBe(30);
  for (const ad of ['Macera', 'Harita', 'Uzay', 'Durak']) await sahneAc(page, ad, ad === 'Durak' ? { durakId: 'istanbul' } : {});
  // Sürekli dönen süs animasyonu kalmamalı (sıradaki durağın parlaması gibi anlamlı olanlar hariç ekranlarda).
  await sahneAc(page, 'Pasaport');
  const sonsuz = await page.evaluate(() => (window as any).oyun.scene.getScene('Pasaport').tweens.getTweens().filter((t: any) => t.repeat === -1 && t.targets?.[0]?.type === 'Arc').length);
  expect(sonsuz).toBe(0);
  expect(kayit.hatalar).toEqual([]);
});

test('Zıpzıp konuşurken ağzı oynar, susunca kapanır', async ({ page }) => {
  const kayit = await oyunuAc(page);
  await sahneAc(page, 'Kostum');
  const sonuc = await page.evaluate(async () => {
    // Test tarayıcısında Türkçe ses yok; konuşma "hata" ile hemen biter. Telefondaki gibi sürsün diye susturulur.
    (speechSynthesis as any).speak = () => {};
    const { konus, sustur } = await import('/src/ses.ts');
    const { Zipzip } = await import('/src/zipzip.ts');
    const z: any = new Zipzip((window as any).oyun.scene.getScene('Kostum'), 360, 640, 1);
    konus('Merhaba gezgin!');
    let enCok = 0;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 60));
      enCok = Math.max(enCok, z.yuz.aciklik);
    }
    sustur();
    await new Promise((r) => setTimeout(r, 100));
    return { enCok, sonra: z.yuz.aciklik };
  });
  expect(sonuc.enCok).toBeGreaterThan(0.3);
  expect(sonuc.sonra).toBe(0);
// Beta öncesi deneme turundan: yazı ekrandan taşmasın, çocuk ekranlarında düğmeler parmağa yetecek kadar büyük olsun
// (88 oyun noktası ≈ telefonda 48 piksel). Ebeveyn köşesi kilitli olduğu için düğme ölçüsüne katılmaz.
test('yazılar ekrana sığar, çocuk düğmeleri yeterince büyük', async ({ page }) => {
  test.setTimeout(120_000);
  const hepsi: string[] = await (async () => {
    await oyunuAc(page);
    return page.evaluate(async () => (await import('/src/duraklar.ts')).TUM_DURAKLAR.map((d) => d.id));
  })();
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(hepsi.slice(0, 20)), 'zipzip-pasaport-v1': JSON.stringify({ ad: 'Muhammed Mustafa', avatar: '🐼', soruldu: true }) });
  const sahneler: [string, object, boolean][] = [
    ['Macera', {}, true], ['Harita', {}, true], ['Dunya', {}, true], ['Uzay', {}, true], ['Spor', {}, true], ['Dinozor', {}, true], ['Evde', {}, true],
    ['Durak', { durakId: 'efes' }, true], ['Durak', { durakId: 'nemrut' }, true], ['Hareket', { durakId: 'istanbul', adim: 1 }, true],
    ['Pasaport', {}, true], ['Rozet', { sayfa: 1 }, true], ['Kostum', {}, false], ['Avatar', {}, true],
    ['EbeveynMenu', {}, false], ['EbeveynOzet', {}, false], ['Sertifika', { bolum: 'turkiye' }, false],
  ];
  const sorunlar: string[] = [];
  for (const [ad, veri, dugmeOlc] of sahneler) {
    await sahneAc(page, ad, veri);
    await page.waitForTimeout(500);
    sorunlar.push(
      ...(await page.evaluate((dugmeOlc) => {
        const bulunan: string[] = [];
        for (const s of (window as any).oyun.scene.getScenes(true)) {
          const gez = (o: any) => {
            if (o.visible === false || o.alpha === 0) return;
            if (o.type === 'Container') return o.list.forEach(gez);
            if (o.type === 'Text' && o.text?.trim()) {
              const r = o.getBounds();
              if (r.left < -1 || r.right > 721 || r.top < -1 || r.bottom > 1281) bulunan.push(`[${s.scene.key}] taşan yazı: "${o.text.slice(0, 30)}"`);
            }
            const ha = o.input?.enabled && o.input.hitArea;
            if (dugmeOlc && ha && o.type === 'Text') {
              const boy = Math.min(ha.width * Math.abs(o.scaleX), ha.height * Math.abs(o.scaleY));
              if (boy < 72) bulunan.push(`[${s.scene.key}] küçük düğme: "${o.text.slice(0, 30)}" (${boy | 0})`);
            }
          };
          s.children.list.forEach(gez);
        }
        return bulunan;
      }, dugmeOlc)),
    );
  }
  expect(sorunlar).toEqual([]);
  expect(kayit.hatalar).toEqual([]);
});

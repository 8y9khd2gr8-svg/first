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
    ['Sertifika', { bolum: 'spor' }], ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynOzet', {}],
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
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('Hareket').children.list.some((c: any) => c.list?.some?.((t: any) => t.text === 'Yaptım!')), null, { timeout: 45_000 }); // bulut bilgisayarı yavaş: 12 tekrar ~30 sn sürebilir
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
  expect(kayit.hatalar).toEqual([]);
});

// Beta öncesi deneme turundan: yazı ekrandan taşmasın, çocuk ekranlarında düğmeler parmağa yetecek kadar büyük olsun
// (88 oyun noktası ≈ telefonda 48 piksel). Ebeveyn ekranları da ölçülür (veliler de telefonda dokunur);
// HTML düğmeleri ve bağlantıları (Paylaş, Gizlilik...) da en az 72 nokta olmalı.
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
    ['Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' }, true], ['EbeveynMenu', {}, true], ['EbeveynVeri', {}, true], ['EbeveynOzet', {}, true], ['PasaportAyar', {}, true],
    ['Kurulum', {}, true], ['Sertifika', { bolum: 'turkiye' }, false],
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
        if (dugmeOlc) {
          // HTML düğmeleri: ekrandaki boyları oyun noktasına çevrilir (oyun 720 nokta genişliğinde).
          const tuval = document.querySelector('canvas')!.getBoundingClientRect();
          const olcek = 720 / tuval.width;
          for (const el of document.querySelectorAll<HTMLElement>('button, a, input')) {
            const r = el.getBoundingClientRect();
            if (!r.width || (el as HTMLInputElement).type === 'file') continue;
            if (r.height * olcek < 72) bulunan.push(`[HTML] küçük düğme: "${(el.textContent || el.tagName).trim().slice(0, 30)}" (${(r.height * olcek) | 0})`);
          }
        }
        return bulunan;
      }, dugmeOlc)),
    );
  }
  expect(sorunlar).toEqual([]);
  expect(kayit.hatalar).toEqual([]);
});

// Erişilebilirlik: yazı ile arkasındaki zemin arasındaki renk zıtlığı (WCAG). Küçük yazı en az 4.5:1,
// büyük yazı (telefonda ~24 piksel ve üstü) en az 3:1. Zemin, yazılar gizlenip ekran çizilerek ölçülür.
test('yazılar okunur (renk zıtlığı)', async ({ page }) => {
  test.setTimeout(120_000);
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva']), 'zipzip-pasaport-v1': JSON.stringify({ ad: '', avatar: '🐼', soruldu: true }) });
  const sahneler: [string, object][] = [
    ['Acilis', {}], ['Macera', {}], ['Harita', {}], ['Dunya', {}], ['Uzay', {}], ['Spor', {}], ['Durak', { durakId: 'efes' }], ['Hareket', { durakId: 'istanbul', adim: 1 }],
    ['Pasaport', {}], ['Rozet', { sayfa: 1 }], ['Kostum', {}], ['Avatar', {}], ['Guvenlik', {}], ['Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' }],
    ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynOzet', {}], ['PasaportAyar', {}], ['Sertifika', { bolum: 'turkiye' }],
  ];
  const sorunlar: string[] = [];
  for (const [ad, veri] of sahneler) {
    await sahneAc(page, ad, veri);
    await page.waitForTimeout(1500);
    sorunlar.push(
      ...(await page.evaluate(async () => {
        const oyun = (window as any).oyun;
        const parlaklik = ([r, g, b]: number[]) => {
          const d = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * d(r) + 0.7152 * d(g) + 0.0722 * d(b);
        };
        const zitlik = (a: number[], b: number[]) => {
          const [x, y] = [parlaklik(a), parlaklik(b)].sort((m, n) => m - n);
          return (y + 0.05) / (x + 0.05);
        };
        const renk = (s: string): number[] | null => {
          const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s ?? '');
          if (!m) return null;
          const n = parseInt(m[1], 16);
          return [n >> 16, (n >> 8) & 255, n & 255, m[2] ? parseInt(m[2], 16) / 255 : 1];
        };
        const karis = (ust: number[], alt: number[], a: number) => [0, 1, 2].map((i) => ust[i] * a + alt[i] * (1 - a));
        // Görünen yazıları topla (kabın saydamlığıyla birlikte), sonra gizle.
        const yazilar: { o: any; alfa: number }[] = [];
        for (const s of oyun.scene.getScenes(true)) {
          const gez = (o: any, alfa: number) => {
            if (o.visible === false || o.alpha === 0) return;
            if (o.type === 'Container') return o.list.forEach((c: any) => gez(c, alfa * o.alpha));
            if (o.type === 'Text' && /\p{L}/u.test(o.text) && !o.style.strokeThickness) yazilar.push({ o, alfa: alfa * o.alpha });
          };
          s.children.list.forEach((o: any) => gez(o, 1));
        }
        yazilar.forEach(({ o }) => o.setVisible(false));
        const resim: HTMLImageElement = await new Promise((r) => oyun.renderer.snapshot(r));
        yazilar.forEach(({ o }) => o.setVisible(true));
        const tuval = document.createElement('canvas');
        [tuval.width, tuval.height] = [resim.width, resim.height];
        const ctx = tuval.getContext('2d')!;
        ctx.drawImage(resim, 0, 0);
        const olcek = resim.width / 720;
        const bulunan: string[] = [];
        for (const { o, alfa } of yazilar) {
          const r = o.getBounds();
          const x0 = Math.max(0, r.left * olcek), y0 = Math.max(0, r.top * olcek);
          const w = Math.min(resim.width - x0, r.width * olcek), h = Math.min(resim.height - y0, r.height * olcek);
          if (w < 2 || h < 2) continue;
          const v = ctx.getImageData(x0, y0, w, h).data;
          // Zemin: yazı alanındaki piksellerin ortanca parlaklıktaki rengi (yıldız gibi tek tük noktalar sonucu bozmaz).
          const pikseller: number[][] = [];
          for (let i = 0; i < v.length; i += 4 * 7) pikseller.push([v[i], v[i + 1], v[i + 2]]);
          pikseller.sort((a, b) => parlaklik(a) - parlaklik(b));
          let zemin = pikseller[pikseller.length >> 1];
          const arka = renk(o.style.backgroundColor);
          if (arka) zemin = karis(arka, zemin, arka[3]);
          const yazi = renk(o.style.color);
          if (!yazi) continue;
          const z = zitlik(karis(yazi, zemin, alfa * yazi[3]), zemin);
          const boy = parseInt(o.style.fontSize) * Math.abs(o.scaleY) * (o.parentContainer?.scaleY ?? 1);
          const buyuk = boy >= 48 || (boy >= 37 && /bold/.test(o.style.fontStyle));
          if (z < (buyuk ? 3 : 4.5)) bulunan.push(`"${o.text.replace(/\n/g, ' ').slice(0, 30)}" ${o.style.color} zıtlık ${z.toFixed(2)}`);
        }
        return bulunan.map((b) => `[${oyun.scene.getScenes(true).map((s: any) => s.scene.key).join('+')}] ${b}`);
      })),
    );
  }
  expect(sorunlar).toEqual([]);
  expect(kayit.hatalar).toEqual([]);
});

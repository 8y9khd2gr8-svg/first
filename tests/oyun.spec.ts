import { expect, Page, test } from '@playwright/test';

// Oyunun ekranlarını gerçek tarayıcıda açar: hata çıkmamalı, oyun hiçbir dış sunucuya bağlanmamalı.
// Sahneler window.oyun üzerinden başlatılır (sadece geliştirme sürümünde vardır).

type Kayit = { hatalar: string[]; disIstekler: string[] };

// adres: '/?odeme=deneme&bolumler=hepsi' sahte mağazayla açar (tam sürüm ekranı ve bölüm ödeme kilidi denenir).
// Betada sadece Türkiye + Dünya açık; testler bütün bölümleri ?bolumler=hepsi ile açar.
async function oyunuAc(page: Page, depo: Record<string, string> = {}, adres = '/?bolumler=hepsi'): Promise<Kayit> {
  const kayit: Kayit = { hatalar: [], disIstekler: [] };
  page.on('pageerror', (e) => kayit.hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && kayit.hatalar.push(m.text()));
  page.on('request', (r) => {
    const adres = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(adres.hostname) && !['data:', 'blob:'].includes(adres.protocol)) kayit.disIstekler.push(r.url());
  });
  await page.goto(adres);
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

// Giriş animasyonları bitene kadar bekler (sonsuz dönen süsler sayılmaz); en çok `enCok` ms.
// Sonsuz animasyonlar beklenmez: Phaser 3.90'da tekrar sayısı tween'in değil her özelliğin (t.data[i].repeat) üstünde.
// Not: Zıpzıp'ın sürekli yeniden kurulan kısa animasyonları olan ekranlarda (Uzay, Spor, Okyanus, Kostüm) yine en çok süre beklenir.
async function sakinlesmesiniBekle(page: Page, enCok = 1500) {
  await page
    .waitForFunction(
      () =>
        (window as any).oyun.scene
          .getScenes(true)
          .every((s: any) =>
            s.tweens.getTweens().every((t: any) => t.loop === -1 || (t.data ?? []).some((d: any) => d.repeat === -1) || !t.isPlaying()),
          ),
      null,
      { timeout: enCok, polling: 100 },
    )
    .catch(() => {});
}

// Oyunun saatini hızlandırır: her sahnenin zamanlayıcıları ve animasyonları kat kat hızlı akar.
// Akış (hangi ekran, hangi sırayla) aynı kalır; sadece bekleme kısalır.
async function saatiHizlandir(page: Page, kat: number) {
  await page.evaluate((kat) => {
    const oyun = (window as any).oyun;
    oyun.events.on('prestep', () =>
      oyun.scene.getScenes(true).forEach((s: any) => {
        s.time.timeScale = kat;
        s.tweens.timeScale = kat;
      }),
    );
  }, kat);
}

test('bütün ekranlar hatasız açılır ve dış sunucuya bağlanılmaz', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  const sahneler: [string, object][] = [
    ['Acilis', {}], ['Macera', {}], ['Harita', { giris: 'uzay' }], ['Dunya', {}], ['Uzay', {}],
    ['Spor', { giris: 'uzay' }], ['Dinozor', { giris: 'uzay' }], ['Evde', { giris: 'uzay' }], ['Okyanus', { giris: 'uzay' }],
    ['Durak', { durakId: 'futbol' }], ['Durak', { durakId: 'oyuncak' }], ['Durak', { durakId: 'yengec' }], ['Hareket', { durakId: 'trex', adim: 1 }],
    ['Odul', { durakId: 'fosil' }], ['Pasaport', { sayfa: 'evde' }], ['Pasaport', { sayfa: 'okyanus' }], ['Rozet', {}], ['Kostum', {}],
    ['Sertifika', { bolum: 'spor' }], ['Sertifika', { bolum: 'okyanus' }], ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynRehber', {}], ['EbeveynAyar', {}], ['EbeveynSes', {}], ['EbeveynKamera', {}], ['ZiplaDeneme', {}], ['EbeveynOzet', {}],
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
      return ['spor', 'dinozor', 'evde', 'okyanus'].map((b) => bolumuAcikMi(b as any));
    });
  expect(await acik()).toEqual([false, false, false, false]);
  await page.evaluate(async () => {
    const { UZAY, SPOR } = await import('/src/duraklar.ts');
    localStorage.setItem('zipzip-ilerleme-v1', JSON.stringify([...UZAY, ...SPOR].map((d) => d.id)));
  });
  expect(await acik()).toEqual([true, true, false, false]);
  await page.evaluate(async () => {
    const { BOLUM_SIRASI, BOLUMLER } = await import('/src/duraklar.ts');
    const evdeyeKadar = BOLUM_SIRASI.slice(0, BOLUM_SIRASI.indexOf('okyanus')).flatMap((b) => BOLUMLER[b].duraklar.map((d) => d.id));
    localStorage.setItem('zipzip-ilerleme-v1', JSON.stringify(evdeyeKadar));
  });
  expect(await acik()).toEqual([true, true, true, true]);
});

test('beta kapsamı: Türkiye + Dünya açık, diğer bölümler Yakında; ?bolumler=hepsi hepsini açar', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA, '/');
  const kilitler = () => page.evaluate(async () => {
    const { BOLUM_SIRASI, bolumKilidi } = await import('/src/duraklar.ts');
    return Object.fromEntries(BOLUM_SIRASI.map((id: string) => [id, bolumKilidi(id as never)]));
  });
  expect(await kilitler()).toEqual({ turkiye: null, dunya: null, uzay: 'yakinda', spor: 'yakinda', dinozor: 'yakinda', evde: 'yakinda', okyanus: 'yakinda' });
  await sahneAc(page, 'Macera');
  const yakindaSayisi = await page.evaluate(() => {
    const yazilar: string[] = [];
    const gez = (o: any) => (o.type === 'Text' ? yazilar.push(o.text) : (o.list ?? []).forEach(gez));
    (window as any).oyun.scene.getScene('Macera').children.list.forEach(gez);
    return yazilar.filter((y) => y === 'Yakında').length;
  });
  expect(yakindaSayisi).toBeGreaterThanOrEqual(5);
  await oyunuAc(page, BETA);
  expect(Object.values(await kilitler()).every((k) => k === null)).toBe(true);
  expect(kayit.hatalar).toEqual([]);
});

test('Büyük Macera\'daki küçük Ebeveyn düğmesi önce ebeveyn kilidine gider; ebeveyn köşesinden Macera\'ya dönülür', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'Macera');
  const r = (await page.locator('canvas').boundingBox())!;
  const tikla = (gx: number, gy: number) => page.mouse.click(r.x + (r.width * gx) / 720, r.y + (r.height * gy) / 1280);
  const etkin = () => page.evaluate(() => (window as any).oyun.scene.getScenes(true).map((s: any) => s.scene.key));
  await tikla(640, 1180);
  await expect.poll(etkin).toEqual(['Ebeveyn']);
  // Kilit geçilince (testte doğrudan) ebeveyn köşesi açılır; ev düğmesi Büyük Macera'ya döner.
  await page.evaluate(() => { const o = (window as any).oyun; o.scene.getScene('Ebeveyn').scene.start('EbeveynMenu', { geri: 'Macera' }); });
  await page.waitForTimeout(500);
  await tikla(80, 80);
  await expect.poll(etkin).toEqual(['Macera']);
  expect(kayit.hatalar).toEqual([]);
});

test('⌂ ile açılışa dönülünce "Oyna" yine çalışır (ikinci kez de Büyük Macera açılır)', async ({ page }) => {
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-pasaport-v1': JSON.stringify({ ad: '', avatar: '🐼', soruldu: true }) });
  const r = (await page.locator('canvas').boundingBox())!;
  const tikla = (gx: number, gy: number) => page.mouse.click(r.x + (r.width * gx) / 720, r.y + (r.height * gy) / 1280);
  const etkin = () => page.evaluate(() => (window as any).oyun.scene.getScenes(true).map((s: any) => s.scene.key));
  await expect.poll(etkin).toEqual(['Acilis']);
  for (let i = 0; i < 2; i++) {
    await page.waitForTimeout(500);
    await tikla(360, 1090);
    await expect.poll(etkin).toEqual(['Macera']);
    await page.waitForTimeout(500);
    await tikla(80, 80);
    await expect.poll(etkin).toEqual(['Acilis']);
  }
  expect(kayit.hatalar).toEqual([]);
});

test('tam sürüm: ödeme kilidi ebeveyn kilidine götürür, satın alınca bölümler açılır', async ({ page }) => {
  await oyunuAc(page, {}, '/?odeme=deneme&bolumler=hepsi');
  const kilit = () =>
    page.evaluate(async () => {
      const { bolumKilidi } = await import('/src/duraklar.ts');
      return [bolumKilidi('turkiye'), bolumKilidi('dunya'), bolumKilidi('uzay')];
    });
  expect(await kilit()).toEqual([null, 'onceki', 'onceki']);
  const turkiye = await page.evaluate(async () => (await import('/src/duraklar.ts')).TURKIYE.map((d) => d.id));
  const kayit = await oyunuAc(page, { 'zipzip-ilerleme-v1': JSON.stringify(turkiye) }, '/?odeme=deneme&bolumler=hepsi');
  expect(await kilit()).toEqual([null, 'odeme', 'onceki']);
  // Çocuk kapalı bölüme dokununca ödeme ekranı değil, ebeveyn kilidi açılır.
  await sahneAc(page, 'Harita', {});
  const acikSahne = await page.evaluate(async () => {
    const { kilitliBolumeDokun } = await import('/src/scenes/BolumScene.ts');
    const oyun = (window as any).oyun;
    kilitliBolumeDokun(oyun.scene.getScene('Harita'), 'dunya');
    await new Promise((r) => setTimeout(r, 300));
    return oyun.scene.getScenes(true).map((s: any) => s.scene.key);
  });
  expect(acikSahne).toEqual(['Ebeveyn']);
  await sahneAc(page, 'TamSurum', { geri: 'Harita' });
  await page.screenshot({ path: 'test-results/tam-surum.png' });
  expect(await page.evaluate(async () => (await import('/src/satinAlma.ts')).satinAl())).toBe('tamam');
  expect(await kilit()).toEqual([null, null, 'onceki']);
  expect(await page.evaluate(() => localStorage.getItem('zipzip-tam-surum-v1'))).toBe('1');
  expect(kayit.hatalar).toEqual([]);
  expect(kayit.disIstekler).toEqual([]);
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
  await saatiHizlandir(page, 4);
  // Çin Seddi: 12 tekrar (eskiden 11'de takılıyordu).
  await sahneAc(page, 'Hareket', { durakId: 'cinseddi', adim: 1 });
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('Hareket').children.list.some((c: any) => c.list?.some?.((t: any) => t.text === 'Yaptım!')), null, { timeout: 45_000 }); // bulut bilgisayarı yavaş: 12 tekrar ~30 sn sürebilir
  expect(kayit.hatalar).toEqual([]);
});

test('Zıpzıp her hareketi hatasız yapar', async ({ page }) => {
  test.setTimeout(120_000); // 38 hareket tek tek
  const kayit = await oyunuAc(page);
  await sahneAc(page, 'Kostum');
  const animasyonlar: string[] = await page.evaluate(async () => {
    const { TUM_DURAKLAR } = await import('/src/duraklar.ts');
    const { AILE_OTURUMU } = await import('/src/aile.ts');
    const { H } = await import('/src/hareketler.ts');
    return [...new Set([...Object.values(H), ...AILE_OTURUMU, ...TUM_DURAKLAR.flatMap((d) => [d.ozel, ...d.ekler])].map((h: any) => h.animasyon))];
  });
  // Zıpzıp kurmak yavaş (küre çizimi): 8 Zıpzıp sırayla kullanılır; her biri iki tekrarı (1,2 sn) bitirmeden yeni hareket almaz.
  await page.evaluate(async () => {
    const s = (window as any).oyun.scene.getScene('Kostum');
    const { Zipzip } = await import('/src/zipzip.ts');
    (window as any).zipzipler = Array.from({ length: 8 }, (_, i) => new Zipzip(s, 120 + (i % 4) * 160, 500 + Math.floor(i / 4) * 400, 0.6));
  });
  for (const [i, a] of animasyonlar.entries()) {
    await page.evaluate(
      ([a, i]) => {
        const z = (window as any).zipzipler[i % 8];
        z.birKez(a, 600, 1);
        z.birKez(a, 600, 2);
      },
      [a, i] as const,
    );
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(1400);
  expect(kayit.hatalar).toEqual([]);
});

test('Ailece kendiliğinden ilerler (Uzaktan oyna kapalıyken de) ve kamera açılmaz', async ({ page }) => {
  test.setTimeout(240_000);
  const kayit = await oyunuAc(page, { 'zipzip-kamera-v1': '1' });
  await saatiHizlandir(page, 5);
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    (window as any).__video = false;
    oyun.events.on('poststep', () => document.querySelector('video') && ((window as any).__video = true));
  });
  await sahneAc(page, 'Hareket', { durakId: 'aile', adim: 0 });
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Odul'), null, { timeout: 220_000, polling: 500 });
  expect(await page.evaluate(() => (window as any).__video)).toBe(false);
  expect(kayit.hatalar).toEqual([]);
});

test('"Uzaktan oyna" açıkken bir durak baştan sona kendiliğinden oynanır (ısınma + sürpriz dahil)', async ({ page }) => {
  test.setTimeout(300_000);
  const kayit = await oyunuAc(page, { 'zipzip-uzaktan-v1': '1' });
  await saatiHizlandir(page, 5); // gerçek sürede ~2 dk
  // Her hareket adımı (ısınma, özel, sürpriz...) sırayla görülür ve kaydedilir.
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    const adimlar: number[] = ((window as any).__adimlar = []);
    const gorulen: string[] = ((window as any).__gorulen = []);
    oyun.events.on('poststep', () => {
      const h = oyun.scene.getScene('Hareket');
      if (!oyun.scene.isActive('Hareket') || adimlar[adimlar.length - 1] === h.adim) return;
      adimlar.push(h.adim);
      gorulen.push(h.liste()[h.adim].sesli);
      // Durak başında kurulan liste: sonraki adımlar bu listeden, kaymadan gelmeli.
      if (h.adim === 0) (window as any).__ilkListe = h.liste().map((x: any) => x.sesli);
    });
  });
  await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim: 0 });
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Odul'), null, { timeout: 280_000, polling: 500 });
  // Isınma, özel hareket, hikâyeliler ve sürpriz: adımlar 0'dan sırayla, atlamadan, sonuna kadar.
  // (Eskiden ısınmadan sonra liste yeniden kurulup ısınma düşüyor, özel hareket atlanıyordu.)
  const [adimlar, gorulen, ilkListe] = await page.evaluate(() => [(window as any).__adimlar, (window as any).__gorulen, (window as any).__ilkListe]);
  expect(ilkListe.length).toBeGreaterThanOrEqual(6);
  expect(ilkListe[0]).toContain('Isınma');
  expect(adimlar).toEqual([...Array(ilkListe.length).keys()]);
  expect(gorulen).toEqual(ilkListe);
  expect(gorulen.some((g: string) => g.includes('Galata'))).toBe(true);
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
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(hepsi.slice(0, 20)), 'zipzip-pasaport-v1': JSON.stringify({ ad: 'Muhammed Mustafa', avatar: '🐼', soruldu: true }) }, '/?odeme=deneme&bolumler=hepsi');
  const sahneler: [string, object, boolean][] = [
    ['Macera', {}, true], ['Harita', {}, true], ['Dunya', {}, true], ['Uzay', {}, true], ['Spor', {}, true], ['Dinozor', {}, true], ['Evde', {}, true], ['Okyanus', {}, true],
    ['Durak', { durakId: 'efes' }, true], ['Durak', { durakId: 'nemrut' }, true], ['Hareket', { durakId: 'istanbul', adim: 1 }, true],
    ['Pasaport', {}, true], ['Rozet', { sayfa: 1 }, true], ['Kostum', {}, false], ['Avatar', {}, true],
    ['Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' }, true], ['EbeveynMenu', {}, true], ['EbeveynVeri', {}, true], ['EbeveynRehber', {}, true], ['EbeveynAyar', {}, true], ['EbeveynSes', {}, true], ['EbeveynKamera', {}, true], ['ZiplaDeneme', {}, true], ['EbeveynOzet', {}, true], ['PasaportAyar', {}, true],
    ['Kurulum', {}, true], ['TamSurum', {}, true], ['Sertifika', { bolum: 'turkiye' }, false],
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

test('her hareketin yazısı (oturarak ve Sakin hâlleri dahil) okunur boyutta kalır', async ({ page }) => {
  await oyunuAc(page);
  // Hareket ekranı uzun yazıyı sığdırmak için küçültür (HareketScene); çok küçülürse çocuk okuyamaz.
  const sorunlar: string[] = await page.evaluate(async () => {
    const { TUM_DURAKLAR, oturum } = await import('/src/duraklar.ts');
    const { ISINMALAR, SOGUMALAR, DONMA, AYNA } = await import('/src/hareketler.ts');
    const { uyarla } = await import('/src/uyarla.ts');
    const { AILE_OTURUMU } = await import('/src/aile.ts');
    const { YAZI_TIPI } = await import('/src/ayarlar.ts');
    const s = (window as any).oyun.scene.getScenes(true)[0];
    const genislik = (metin: string, boy: number, ek = {}) => {
      const t = s.add.text(0, 0, metin, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: `${boy}px`, ...ek });
      const w = t.width;
      t.destroy();
      return w;
    };
    const temel = [...TUM_DURAKLAR.flatMap(oturum), ...ISINMALAR, ...SOGUMALAR, DONMA, AYNA, ...AILE_OTURUMU];
    const ayarlar = [{ yas: 'buyuk', oturarak: false }, { yas: 'kucuk', oturarak: false }, { yas: 'buyuk', oturarak: true }, { yas: 'kucuk', oturarak: true }, { yas: 'hizli', oturarak: false }] as const;
    const bulunan = new Set<string>();
    for (const a of ayarlar)
      for (const h of uyarla(temel, a)) {
        const komut = 660 / genislik(h.baslik, 72, { align: 'center', stroke: '#000', strokeThickness: 14, lineSpacing: -16 });
        if (komut < 0.7) bulunan.add(`komut çok uzun (%${Math.round(komut * 100)}): ${h.baslik}`);
        if (h.baslik.split('\n').length > 2) bulunan.add(`komut 2 satırdan uzun: ${h.baslik}`);
        if (h.hikaye && 670 / genislik(h.hikaye, 44) < 0.6) bulunan.add(`hikâye çok uzun: ${h.hikaye}`);
      }
    return [...bulunan];
  });
  expect(sorunlar).toEqual([]);
});

// Erişilebilirlik: yazı ile arkasındaki zemin arasındaki renk zıtlığı (WCAG). Küçük yazı en az 4.5:1,
// büyük yazı (telefonda ~24 piksel ve üstü) en az 3:1. Zemin, yazılar gizlenip ekran çizilerek ölçülür.
test('yazılar okunur (renk zıtlığı)', async ({ page }) => {
  test.setTimeout(120_000);
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva']), 'zipzip-pasaport-v1': JSON.stringify({ ad: '', avatar: '🐼', soruldu: true }) }, '/?odeme=deneme&bolumler=hepsi');
  const sahneler: [string, object][] = [
    ['Acilis', {}], ['Macera', {}], ['Harita', {}], ['Dunya', {}], ['Uzay', {}], ['Spor', {}], ['Okyanus', {}], ['Durak', { durakId: 'efes' }], ['Hareket', { durakId: 'istanbul', adim: 1 }],
    ['Pasaport', {}], ['Rozet', { sayfa: 1 }], ['Kostum', {}], ['Avatar', {}], ['Guvenlik', {}], ['Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' }],
    ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynRehber', {}], ['EbeveynAyar', {}], ['EbeveynSes', {}], ['EbeveynKamera', {}], ['ZiplaDeneme', {}], ['EbeveynOzet', {}], ['PasaportAyar', {}], ['TamSurum', {}], ['Sertifika', { bolum: 'turkiye' }],
  ];
  const sorunlar: string[] = [];
  for (const [ad, veri] of sahneler) {
    await sahneAc(page, ad, veri);
    await sakinlesmesiniBekle(page);
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

// Durak sonunda çocuk kutlamadan önce "Haritaya dön"e basarsa yeni kostüm/rozet kaybolmaz; sonraki seferde kutlanır.
test('kutlama görülmeden çıkılırsa yeni kostüm sonra yine kutlanır', async ({ page }) => {
  const kayit = await oyunuAc(page, { 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva', 'pamukkale']) });
  // Oyun saati 3 kat: testler iki işçide aynı anda koşarken yavaş makinede de süre yetsin (çıkış yine kutlamadan önce).
  await saatiHizlandir(page, 3);
  // İlk kutlama rozet ya da kostüm olabilir; ikisinin kutlanan kayıtları birlikte sayılır.
  const kutlanan = () =>
    page.evaluate(() => [...(JSON.parse(localStorage.getItem('zipzip-kostum-v1') ?? '{}').kutlanan ?? []), ...JSON.parse(localStorage.getItem('zipzip-rozetler-v1') ?? '[]')]);
  await sahneAc(page, 'Odul', { durakId: 'kapadokya' });
  await sahneAc(page, 'Harita', {}); // kutlamadan önce çıktı
  expect(await kutlanan()).toEqual([]);
  await sahneAc(page, 'Odul', { durakId: 'kapadokya' });
  // Kutlama damgadan ve merak sorusundan sonra gelir (~7 sn; yavaş bilgisayarda daha uzun).
  await expect.poll(async () => (await kutlanan()).length, { timeout: 30_000 }).toBeGreaterThan(0);
  expect(kayit.hatalar).toEqual([]);
});

// Okuma bilmeyen çocuk için: her çocuk ekranı açılınca Zıpzıp bir şey söyler (ne yapılacağını sesle anlatır).
// Telefonun konuşma motoru taklit edilir; söylenen cümleler kaydedilir.
test('her çocuk ekranında Zıpzıp konuşur (sesli yönlendirme)', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const soylenen: string[] = ((window as any).__soylenen = []);
    const sahte = { speak: (s: SpeechSynthesisUtterance) => soylenen.push(s.text), cancel: () => {}, getVoices: () => [], addEventListener: () => {}, onvoiceschanged: null };
    Object.defineProperty(window, 'speechSynthesis', { value: sahte, configurable: true });
  });
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva']), 'zipzip-pasaport-v1': JSON.stringify({ ad: '', avatar: '🐼', soruldu: true }) }, '/?odeme=deneme&bolumler=hepsi');
  const sahneler: [string, object][] = [
    ['Macera', {}], ['Harita', {}], ['Dunya', {}], ['Uzay', {}], ['Spor', {}], ['Dinozor', {}], ['Evde', {}], ['Okyanus', {}],
    ['Durak', { durakId: 'pamukkale' }], ['Hareket', { durakId: 'pamukkale', adim: 1 }], ['Odul', { durakId: 'truva' }],
    ['Pasaport', {}], ['Rozet', {}], ['Kostum', {}], ['Avatar', {}], ['Sertifika', { bolum: 'turkiye' }],
  ];
  const sessiz: string[] = [];
  for (const [ad, veri] of sahneler) {
    await page.evaluate(() => ((window as any).__soylenen.length = 0));
    await sahneAc(page, ad, veri);
    // Konuşma başlayınca hemen sıradakine geçilir; 3,5 sn içinde hiç konuşmazsa sessiz sayılır.
    const konustu = await page
      .waitForFunction(() => (window as any).__soylenen.length > 0, null, { timeout: 2800, polling: 100 })
      .then(() => true, () => false);
    if (!konustu) sessiz.push(ad);
  }
  expect(sessiz).toEqual([]);
  expect(kayit.hatalar).toEqual([]);
});

test('ödül ekranları dolu hâlde de taşmaz: pasaport kâğıdı, uzun ad, damga yazısı', async ({ page }) => {
  await oyunuAc(page);
  const hepsi: string[] = await page.evaluate(async () => (await import('/src/duraklar.ts')).TUM_DURAKLAR.map((d) => d.id));
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(hepsi), 'zipzip-pasaport-v1': JSON.stringify({ ad: 'ŞÜKRÜCANBERKAY', avatar: '🦁', soruldu: true }) });
  // Bütün damgalar ve bütün bölüm rozetleriyle her sayfa: yazı ve simgeler pasaport kâğıdının (x 36..684) içinde kalır.
  for (const sayfa of ['turkiye', 'okyanus', 'uzay']) {
    // Aynı sahne art arda açılırken Phaser bazen hiçbirini açmıyor; araya başka ekran girer.
    await sahneAc(page, 'Rozet');
    await sahneAc(page, 'Pasaport', { sayfa });
    await page.waitForTimeout(1500);
    const tasan = await page.evaluate(() => {
      const sahne = (window as any).oyun.scene.getScene('Pasaport');
      const kagit = sahne.children.list.find((n: any) => n.type === 'Container' && n.list.length > 20);
      return kagit.list
        .filter((n: any) => n.getBounds && n.type !== 'Zone')
        .map((n: any) => ({ ad: n.text ?? n.type, b: n.getBounds() }))
        .filter(({ b }: any) => b.left < 34 || b.right > 686)
        .map(({ ad, b }: any) => `${ad} ${Math.round(b.left)}..${Math.round(b.right)}`);
    });
    expect(tasan, `Pasaport ${sayfa}`).toEqual([]);
  }
  // Uzun yer adı damganın iç çemberine sığar.
  await sahneAc(page, 'Odul', { durakId: 'kaplumbaga' });
  const genislik = await page.evaluate(() => {
    const sahne = (window as any).oyun.scene.getScene('Odul');
    const ara = (liste: any[]): any => liste.map((n) => (n.text === 'DENİZ KAPLUMBAĞASI' ? n : n.list && ara(n.list))).find(Boolean);
    return ara(sahne.children.list).displayWidth;
  });
  expect(genislik).toBeLessThanOrEqual(252);
  expect(kayit.hatalar).toEqual([]);
});

test('durumlar sadece renkle anlatılmaz: biten durakta yıldız, kapalı durakta kilit var (renk körlüğü)', async ({ page }) => {
  const biten = ['istanbul', 'truva', 'efes', 'merkur'];
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(biten) });
  // Sahnedeki (kutuların içi dahil) yıldız şekilleri ve kilit yazıları sayılır.
  const say = () =>
    page.evaluate(() => {
      const sahne = (window as any).oyun.scene.getScenes(true)[0];
      const sayim = { yildiz: 0, kilit: 0 };
      const gez = (liste: any[]) =>
        liste.forEach((n) => {
          if (n.type === 'Star') sayim.yildiz++;
          if (n.type === 'Text' && n.text === '🔒') sayim.kilit++;
          if (n.list) gez(n.list);
        });
      gez(sahne.children.list);
      return sayim;
    });
  // [sahne, biten durak sayısı (Dünya'da alt sırada bir kez daha), kapalı durak sayısı (Dünya'da iki kez)]
  const beklenen: [string, number, number][] = [['Harita', 2, 4], ['Dunya', 2, 8], ['Uzay', 1, 6]];
  for (const [ad, yildiz, kilit] of beklenen) {
    await sahneAc(page, ad);
    const sayim = await say();
    expect(sayim.yildiz, `${ad}: biten durak yıldızı`).toBeGreaterThanOrEqual(yildiz);
    expect(sayim.kilit, `${ad}: kapalı durak kilidi`).toBeGreaterThanOrEqual(kilit);
  }
  // Kamera denemesinde seçili sayma yolu renkle birlikte ✓ ile de belli olur.
  await sahneAc(page, 'EbeveynKamera');
  const secili = await page.evaluate(() => {
    const ara = (liste: any[]): string[] => liste.flatMap((n) => (n.type === 'Text' && n.text.startsWith('✓') ? [n.text] : n.list ? ara(n.list) : []));
    return ara((window as any).oyun.scene.getScene('EbeveynKamera').children.list);
  });
  expect(secili).toEqual(['✓ Zıpla']);
  expect(kayit.hatalar).toEqual([]);
});

test('bozuk cihaz kaydıyla da bütün ekranlar hatasız açılır', async ({ page }) => {
  const anahtarlar = ['zipzip-ilerleme-v1', 'zipzip-pasaport-v1', 'zipzip-oyun-ayar-v1', 'zipzip-istatistik-v1', 'zipzip-rozetler-v1', 'zipzip-kostum-v1', 'zipzip-tam-surum-v1', 'zipzip-uzaktan-v1', 'zipzip-kamera-v1'];
  const bozuklar = ['{bozuk', 'null', '{"gunler":{"2026-10-12":{"saniye":"x","sayac":5}},"ad":5,"foto":"javascript:x","avatar":"x","secili":7,"kutlanan":"a","yas":3}'];
  const sahneler: [string, object][] = [
    ['Acilis', {}], ['Macera', {}], ['Harita', { giris: 'uzay' }], ['Dunya', {}], ['Durak', { durakId: 'istanbul' }], ['Odul', { durakId: 'istanbul' }],
    ['Pasaport', {}], ['Rozet', {}], ['Kostum', {}], ['Sertifika', { bolum: 'turkiye' }], ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynAyar', {}], ['EbeveynOzet', {}],
  ];
  for (const deger of bozuklar) {
    const kayit = await oyunuAc(page, { ...BETA, ...Object.fromEntries(anahtarlar.map((a) => [a, deger])) });
    for (const [ad, veri] of sahneler) await sahneAc(page, ad, veri);
    expect(kayit.hatalar, deger).toEqual([]);
    page.removeAllListeners();
  }
});

test('iPad ve yatay ekran: oyun ekranı doldurur, dokunuş doğru yere gider; yatay telefonda "dik çevir" görünür', async ({ page }) => {
  for (const [w, h] of [[820, 1180], [1032, 1376], [1376, 1032]]) {
    await page.setViewportSize({ width: w, height: h });
    const kayit = await oyunuAc(page);
    await expect(page.locator('#dondur')).toBeHidden();
    // Oyun 720×1280'lik tuvali ekrana sığdırır: ekranın yüksekliği (ya da genişliği) tam kullanılır.
    const kutu = (await page.locator('#oyun canvas').boundingBox())!;
    expect(Math.max(kutu.height / h, kutu.width / w)).toBeGreaterThan(0.99);
    // "Oyna" düğmesine (tuvalde 360, 1090) ekrandaki yerinden dokununca açılış ekranından çıkılır.
    await page.mouse.click(kutu.x + (360 / 720) * kutu.width, kutu.y + (1090 / 1280) * kutu.height);
    await page.waitForFunction(() => !(window as any).oyun.scene.isActive('Acilis'));
    expect(kayit.hatalar).toEqual([]);
    page.removeAllListeners();
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('#dondur')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#dondur')).toBeHidden();
});

test('Zıpzıp da zıplasın (kamerasız): ritimle ve dokununca zıplar, kütüğü geçer, 10 yıldızda Aferin', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'ZiplaDeneme');
  const durum = () => page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('ZiplaDeneme');
    return { toplam: s.ziplamaSayisi as number, yanan: s.yanan as number, kamera: s.kameraZiplamasi as number, aferin: s.children.list.some((c: any) => c.text === 'Aferin!') };
  });
  // Ritim: kendiliğinden zıplar.
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('ZiplaDeneme').ziplamaSayisi >= 1, null, { timeout: 15_000 });
  // Dokunma: Zıpzıp'a dokununca hemen bir zıplama daha (ritimden önce).
  const once = await durum();
  const r = await page.locator('canvas').boundingBox();
  await page.mouse.click(r!.x + r!.width / 2, r!.y + (r!.height * 490) / 1280);
  const sonra = await durum();
  expect(sonra.toplam).toBe(once.toplam + 1);
  expect(sonra.yanan).toBe(once.yanan + 1);
  expect(sonra.kamera).toBe(0);
  // Bekleyen engel: her zıplamada bir kütük geçilir, sıradaki kütük gelip bekler.
  expect(await page.evaluate(() => (window as any).oyun.scene.getScene('ZiplaDeneme').gecilenEngel)).toBe(sonra.toplam);
  // 10 yıldız dolunca Aferin, sonra yıldızlar söner ve oyun sürer (kaybetmek yok).
  await saatiHizlandir(page, 8);
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('ZiplaDeneme').children.list.some((c: any) => c.text === 'Aferin!'), null, { timeout: 20_000 });
  // Aferin anında kameranın gördüğü zıplama da "Kamera gördü"ye eklenir (fazla sayım gizlenmesin), yıldız yanmaz.
  const kutlamada = await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('ZiplaDeneme');
    const once = { kamera: s.kameraZiplamasi, yanan: s.yanan };
    s.zipla(true);
    return { once, kamera: s.kameraZiplamasi, yanan: s.yanan };
  });
  expect(kutlamada.kamera).toBe(kutlamada.once.kamera + 1);
  expect(kutlamada.yanan).toBe(kutlamada.once.yanan);
  await page.waitForFunction(() => { const s = (window as any).oyun.scene.getScene('ZiplaDeneme'); return s.ziplamaSayisi > 10 && !s.children.list.some((c: any) => c.text === 'Aferin!'); }, null, { timeout: 20_000 });
  expect(kayit.hatalar).toEqual([]);
});

test('sayfa öğeleri (kamera kutusu, bağlantılar) oyunun düğmelerini örtmez', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  const ortulen: string[] = [];
  for (const ad of ['EbeveynKamera', 'EbeveynMenu', 'PasaportAyar', 'EbeveynOzet', 'Sertifika']) {
    await sahneAc(page, ad, ad === 'Sertifika' ? { bolum: 'turkiye' } : {});
    await sakinlesmesiniBekle(page);
    ortulen.push(
      ...(await page.evaluate((ad) => {
        const oyun = (window as any).oyun;
        const tuval: HTMLCanvasElement = oyun.canvas;
        const r = tuval.getBoundingClientRect();
        const k = r.width / 720;
        const bulunan: string[] = [];
        const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
        const gez = (o: any) => {
          if (o.visible === false) return;
          if (o.input?.enabled && o.type !== 'DOMElement') {
            const m = o.getWorldTransformMatrix();
            const ust = document.elementFromPoint(r.left + m.tx * k, r.top + m.ty * k);
            if (ust && ust !== tuval) bulunan.push(`[${ad}] "${yazi(o).trim().slice(0, 30)}" üstünde ${ust.tagName}`);
          }
          (o.list ?? []).forEach(gez);
        };
        oyun.scene.getScene(ad).children.list.forEach(gez);
        return bulunan;
      }, ad)),
    );
  }
  expect(ortulen).toEqual([]);
  expect(kayit.hatalar).toEqual([]);
});

test('sertifika: kaydet/paylaş sadece ebeveyn kilidinden sonra; vazgeçince aynı bölümün sertifikasına dönülür', async ({ page }) => {
  await page.addInitScript(() => {
    const soylenen: string[] = ((window as any).__soylenen = []);
    const sahte = { speak: (s: SpeechSynthesisUtterance) => soylenen.push(s.text), cancel: () => {}, getVoices: () => [], addEventListener: () => {}, onvoiceschanged: null };
    Object.defineProperty(window, 'speechSynthesis', { value: sahte, configurable: true });
  });
  const kayit = await oyunuAc(page, BETA);
  // Sahnedeki etkin düğmelerden yazısı uyana dokunur (Phaser düğmeleri pointerdown dinler).
  const dokun = (sahne: string, yazi: RegExp) =>
    page.evaluate(
      ([sahne, kaynak]) => {
        const re = new RegExp(kaynak);
        const s = (window as any).oyun.scene.getScene(sahne);
        const metin = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(metin).join(' '));
        const bul = (o: any): any => (o.input?.enabled && re.test(metin(o)) ? o : (o.list ?? []).map(bul).find(Boolean));
        const d = s.children.list.map(bul).find(Boolean);
        d.emit('pointerdown', { x: 0, y: 0 });
      },
      [sahne, yazi.source] as const,
    );
  const htmlDugme = () => page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Paylaş')));

  // Çocuk ekranı: paylaşım düğmesi yok, kilitli düğme var.
  await sahneAc(page, 'Sertifika', { bolum: 'uzay' });
  expect(await htmlDugme()).toBe(false);
  await page.evaluate(() => ((window as any).__soylenen.length = 0));
  await dokun('Sertifika', /🔒 Kaydet/);
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Ebeveyn'));
  expect(await page.evaluate(() => (window as any).__soylenen)).toContain('Sertifikanı kaydetmek için bir büyüğüne göster!');

  // Yanlış cevap: aynı bölümün (Uzay) sertifikasına, kilitli hâliyle dönülür.
  const [yanlis, dogru] = await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('Ebeveyn');
    const [a, b] = s.children.list.find((o: any) => o.type === 'Text' && /×/.test(o.text)).text.match(/\d+/g).map(Number);
    const sayilar = s.children.list.filter((o: any) => o.input?.enabled && o.list).map((o: any) => Number(o.list.find((t: any) => t.type === 'Text')?.text));
    return [sayilar.find((n: number) => Number.isFinite(n) && n !== a * b), a * b];
  });
  await dokun('Ebeveyn', new RegExp(`^\\s*${yanlis}\\s*$`));
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Sertifika'));
  expect(await page.evaluate(() => (window as any).oyun.scene.getScene('Sertifika').bolum)).toBe('uzay');
  expect(await htmlDugme()).toBe(false);

  // Doğru cevap: aynı sertifika, kaydet/paylaş düğmesiyle.
  await dokun('Sertifika', /🔒 Kaydet/);
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Ebeveyn'));
  const dogru2 = await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('Ebeveyn');
    const [a, b] = s.children.list.find((o: any) => o.type === 'Text' && /×/.test(o.text)).text.match(/\d+/g).map(Number);
    return a * b;
  });
  expect(dogru).toBeGreaterThan(0);
  await dokun('Ebeveyn', new RegExp(`^\\s*${dogru2}\\s*$`));
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Sertifika'));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as any).oyun.scene.getScene('Sertifika').bolum)).toBe('uzay');
  expect(await htmlDugme()).toBe(true);
  expect(kayit.hatalar).toEqual([]);
});

// Kamera denemesi: kamera yok / izin yok ayrı yazılır; açıldıktan sonra görüntü kesilirse "Görüyorum"da kalmaz.
// Gerçek kamera yerine sahte getUserMedia (hata ya da boyanan bir tuvalin görüntüsü).
async function sahteKamera(page: Page, hata?: string) {
  await page.addInitScript((hata) => {
    (navigator.mediaDevices as any).getUserMedia = async () => {
      if (hata) throw new DOMException('deneme', hata);
      const t = document.createElement('canvas');
      t.width = 160;
      t.height = 120;
      const c = t.getContext('2d')!;
      let i = 0;
      setInterval(() => { c.fillStyle = `hsl(${(i += 20) % 360},60%,50%)`; c.fillRect(0, 0, 160, 120); }, 50);
      const akis = t.captureStream(20);
      (window as any).sahteAkis = akis;
      (window as any).kameraAcilma = ((window as any).kameraAcilma ?? 0) + 1;
      return akis;
    };
  }, hata);
}

async function kameraYazisi(page: Page, sahne: string, icerir: string) {
  await page.waitForFunction(
    ([sahne, icerir]) => (window as any).oyun.scene.getScene(sahne).children.list.some((c: any) => c.type === 'Text' && c.text.includes(icerir)),
    [sahne, icerir] as const,
    { timeout: 30_000 },
  );
}

for (const [hata, yazi] of [['NotFoundError', 'kamera bulunamadı'], ['NotAllowedError', 'Kameraya izin verilmedi']]) {
  test(`kamera denemesi: ${hata} kendi yazısıyla gösterilir`, async ({ page }) => {
    await sahteKamera(page, hata);
    const kayit = await oyunuAc(page, BETA);
    await sahneAc(page, 'EbeveynKamera');
    const r = (await page.locator('canvas').boundingBox())!;
    await page.mouse.click(r.x + r.width / 2, r.y + (r.height * 635) / 1280); // 📷 Kamerayı aç
    await kameraYazisi(page, 'EbeveynKamera', yazi);
    expect(kayit.hatalar).toEqual([]);
  });
}

test('kamera denemesi: görüntü kesilince "Kamera durdu" yazar', async ({ page }) => {
  await sahteKamera(page);
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'EbeveynKamera');
  const r = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + (r.height * 635) / 1280);
  await kameraYazisi(page, 'EbeveynKamera', 'Baştan ayağa görünmeli');
  await page.evaluate(() => (window as any).sahteAkis.getTracks().forEach((t: MediaStreamTrack) => t.stop()));
  await kameraYazisi(page, 'EbeveynKamera', 'Kamera durdu');
  expect(kayit.hatalar).toEqual([]);
});

test('Zıpzıp da zıplasın: kamera durunca yazı söyler ve ritim yolu geri gelir', async ({ page }) => {
  await sahteKamera(page);
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'ZiplaDeneme');
  const r = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + (r.height * 925) / 1280); // 📷 Kamerayla zıpla
  await kameraYazisi(page, 'ZiplaDeneme', 'Baştan ayağa görünmeli');
  expect(await page.evaluate(() => !!(window as any).oyun.scene.getScene('ZiplaDeneme').ritim)).toBe(false);
  await page.evaluate(() => (window as any).sahteAkis.getTracks().forEach((t: MediaStreamTrack) => t.stop()));
  await kameraYazisi(page, 'ZiplaDeneme', 'Kamera durdu');
  expect(await page.evaluate(() => !!(window as any).oyun.scene.getScene('ZiplaDeneme').ritim)).toBe(true);
  expect(kayit.hatalar).toEqual([]);
});

test('hareket ekranı: kamera durunca küçük kutu son sayıyı değil "Durdu" yazar, "Yaptım!" yine çıkar (K27)', async ({ page }) => {
  test.setTimeout(120_000);
  await sahteKamera(page);
  const kayit = await oyunuAc(page, { 'zipzip-kamera-v1': '1' });
  await saatiHizlandir(page, 5);
  // Kameranın sayabildiği ilk adımı bul (ısınma/süreli hareketlerde kamera açılmaz).
  let bulundu = false;
  for (let adim = 0; adim < 8 && !bulundu; adim++) {
    await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim });
    bulundu = await page.evaluate(() => !!(window as any).oyun.scene.getScene('Hareket').kamera);
  }
  expect(bulundu).toBe(true);
  const kutuYazisi = () => page.evaluate(() => [...document.querySelectorAll('div')].map((d) => d.textContent ?? '').filter((t) => t.startsWith('📷')).pop() ?? '');
  await expect.poll(kutuYazisi, { timeout: 30_000 }).toBe('📷 Geri git');
  await page.evaluate(() => (window as any).sahteAkis.getTracks().forEach((t: MediaStreamTrack) => t.stop()));
  await expect.poll(kutuYazisi, { timeout: 30_000 }).toBe('📷 Durdu');
  // Kaybetmek yok: kamera dursa da süre/sayım bitince "Yaptım!" düğmesi gelir.
  await page.waitForFunction(() => {
    const s = (window as any).oyun.scene.getScene('Hareket');
    const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
    return s.children.list.some((o: any) => /Yaptım!/.test(yazi(o)));
  }, null, { timeout: 90_000, polling: 250 });
  expect(kayit.hatalar).toEqual([]);
});

test('Pasaporttaki ada dokunup kilitten geçince ⌂ pasaporta döner (önce Büyük Macera\'dan ebeveyn köşesine girilmiş olsa da)', async ({ page }) => {
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'EbeveynMenu', { geri: 'Macera' }); // önceki giriş: Büyük Macera'dan
  await sahneAc(page, 'Pasaport');
  const dokun = (sahne: string, bul: string) =>
    page.evaluate(([sahne, bul]) => {
      const s = (window as any).oyun.scene.getScene(sahne);
      const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
      const hepsi: any[] = [];
      const gez = (o: any) => { hepsi.push(o); (o.list ?? []).forEach(gez); };
      s.children.list.forEach(gez);
      let hedef: any;
      if (bul === 'ad') hedef = hepsi.find((o) => o.type === 'Zone' && o.input?.enabled && o.width === 330);
      else if (bul === 'cevap') {
        const soru = hepsi.find((o) => o.type === 'Text' && / × /.test(o.text));
        const [a, b] = soru.text.match(/\d+/g).map(Number);
        hedef = hepsi.find((o) => o.input?.enabled && yazi(o).trim() === String(a * b));
      } else hedef = hepsi.find((o) => o.input?.enabled && yazi(o).includes(bul));
      hedef.emit('pointerdown');
    }, [sahne, bul] as const);
  await dokun('Pasaport', 'ad');
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Ebeveyn'));
  await dokun('Ebeveyn', 'cevap');
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('PasaportAyar'), null, { timeout: 5000 });
  await dokun('PasaportAyar', '🏠');
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('Pasaport'), null, { timeout: 5000 });
  // Ebeveyn köşesinden açılan pasaport düzenlemesi köşeye döner.
  await sahneAc(page, 'EbeveynMenu', {});
  await dokun('EbeveynMenu', '✏️ Pasaport');
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('PasaportAyar'), null, { timeout: 5000 });
  await dokun('PasaportAyar', '🏠');
  await page.waitForFunction(() => (window as any).oyun.scene.isActive('EbeveynMenu'), null, { timeout: 5000 });
  expect(kayit.hatalar).toEqual([]);
});

test('"Bu telefonda neler var?": uygulamadaki en uzun hâlde de yazılar "Tamam"ın altında kalmaz, her kayıt listede', async ({ page }) => {
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-guvenlik-notu-v1': '1' }, '/?odeme=deneme');
  await sahneAc(page, 'EbeveynVeri');
  const sonuc = await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('EbeveynVeri');
    const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
    const tamam = s.children.list.find((o: any) => o.type === 'Container' && yazi(o).includes('Tamam'));
    const tb = tamam.getBounds();
    const yazilar = s.children.list.filter((o: any) => o.type === 'Text');
    return {
      ortulen: yazilar.filter((t: any) => {
        const b = t.getBounds();
        return b.bottom > tb.top && b.top < tb.bottom && b.right > tb.left && b.left < tb.right;
      }).map((t: any) => t.text),
      metin: yazilar.map((t: any) => t.text).join('|'),
    };
  });
  expect(sonuc.ortulen).toEqual([]);
  for (const satir of ['Tam sürüm', 'Güvenlik notu · beta', 'okundu · bölümler açık', 'Uzaktan oyna', 'Kamerayla sayma']) expect(sonuc.metin).toContain(satir);
  expect(kayit.hatalar).toEqual([]);
});

// Kod denetimi (2. tur): bölüm haritasında yolculukla açılan durak tek nabızla parlar (iki nabız üst üste binmez).
test('bölüm haritası: yolculukla açılan durakta tek nabız animasyonu', async ({ page }) => {
  const kayit = await oyunuAc(page, { 'zipzip-ilerleme-v1': JSON.stringify(['yumurta']) });
  await saatiHizlandir(page, 4);
  await sahneAc(page, 'Dinozor', { yolculukDen: 'yumurta' });
  // Yolculuk bitince ikinci durak (430, 980) açılır ve büyüme animasyonu biter.
  await page.waitForFunction(() => {
    const s = (window as any).oyun.scene.getScene('Dinozor');
    const d = s.children.list.find((o: any) => o.type === 'Container' && o.x === 430 && o.y === 980);
    return !!d && d.scale >= 1 && s.tweens.getTweensOf(d).length > 0 && s.tweens.getTweensOf(d).every((t: any) => (t.data ?? []).some((v: any) => v.repeat === -1));
  }, null, { timeout: 20_000, polling: 100 });
  const nabizSayisi = await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('Dinozor');
    const d = s.children.list.find((o: any) => o.type === 'Container' && o.x === 430 && o.y === 980);
    return s.tweens.getTweensOf(d).filter((t: any) => (t.data ?? []).some((v: any) => v.key === 'scaleX' && v.repeat === -1)).length;
  });
  expect(nabizSayisi).toBe(1);
  expect(kayit.hatalar).toEqual([]);
});

// Dünya küresi: alttaki düğmelere art arda dokununca aynı anda tek dönüş olur; yolculuk sürerken düğme küreyi çevirmez.
test('Dünya küresi: art arda dokunuşta tek dönüş, yolculukta dönüş bozulmaz', async ({ page }) => {
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['efes']) });
  const donusSayisi = () =>
    page.evaluate(() => {
      const s = (window as any).oyun.scene.getScene('Dunya');
      return s.tweens.getTweens().filter((t: any) => t.isPlaying() && t.targets.length === 1 && Object.keys(t.targets[0]).join() === 't').length;
    });
  await sahneAc(page, 'Dunya', {});
  const once = await donusSayisi(); // Zıpzıp'ın kendi dönüşü sayılmasın
  await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('Dunya');
    s.don([12, 41], 900);
    s.don([30, 30], 900);
    s.don([12, 41], 900);
  });
  expect(await donusSayisi()).toBe(once + 1);
  // Yolculuk: düğmeye dokunmak yolculuğu bozmaz, sonunda varılan durak açılır.
  await sahneAc(page, 'Macera'); // aynı sahneyi bu yardımcıyla doğrudan yeniden başlatmak onu durdurur
  await sahneAc(page, 'Dunya', { yolculukDen: 'efes' });
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('Dunya').yolculukta, null, { timeout: 10_000 });
  const yolculukDonusu = await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('Dunya');
    const once = s.donus;
    s.don([0, 0], 900);
    return s.donus === once && once.isPlaying();
  });
  expect(yolculukDonusu).toBe(true);
  await page.waitForFunction(() => !(window as any).oyun.scene.getScene('Dunya').yolculukta, null, { timeout: 15_000 });
  expect(await page.evaluate(() => (window as any).oyun.scene.getScene('Dunya').merkez[0])).toBeGreaterThan(5); // Kolezyum'a döndü (0'a değil)
  expect(kayit.hatalar).toEqual([]);
});

// Yağız testi (15 Ekim): iPhone her harekette kamera izni soruyordu. Kamera aynı duraktaki hareketler arasında bir kez açılır,
// hareket ekranından çıkınca kapanır.
test('hareket ekranı: kamera hareketler arasında yeniden açılmaz (izin bir kez), hareket ekranından çıkınca kapanır', async ({ page }) => {
  await sahteKamera(page);
  const kayit = await oyunuAc(page, { 'zipzip-kamera-v1': '1' });
  const kameraliAdimlar: number[] = [];
  await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim: 0 });
  const uzunluk = await page.evaluate(() => (window as any).oyun.scene.getScene('Hareket').liste().length);
  for (let adim = 0; adim < uzunluk && kameraliAdimlar.length < 2; adim++) {
    // Oyundaki gibi sıradaki harekete geçiş (sahneAc aynı sahneyi yeniden başlatamaz).
    if (adim > 0) {
      await page.evaluate((adim) => (window as any).oyun.scene.getScene('Hareket').scene.restart({ durakId: 'istanbul', adim }), adim);
      await page.waitForTimeout(700);
    }
    if (await page.evaluate(() => !!(window as any).oyun.scene.getScene('Hareket').kamera)) {
      kameraliAdimlar.push(adim);
      await expect.poll(() => page.evaluate(() => (window as any).sahteAkis?.getVideoTracks()[0]?.readyState), { timeout: 30_000 }).toBe('live');
    }
  }
  expect(kameraliAdimlar.length).toBe(2);
  expect(await page.evaluate(() => (window as any).kameraAcilma)).toBe(1);
  await sahneAc(page, 'Macera');
  await expect.poll(() => page.evaluate(() => (window as any).sahteAkis.getVideoTracks()[0].readyState), { timeout: 5_000 }).toBe('ended');
  expect(kayit.hatalar).toEqual([]);
});

// Yağız testi (15 Ekim): 3-2-1 ile kendiliğinden geçmeyi beklerken ekran kararıyordu. Hareket ekranında "ekranı açık tut" istenir,
// haritaya dönünce bırakılır.
test('hareket ekranında ekran açık tutulur, çıkınca bırakılır', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.ekranKilidi = { istek: 0, birakma: 0, acik: false };
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          w.ekranKilidi.istek++;
          w.ekranKilidi.acik = true;
          return { release: async () => { w.ekranKilidi.birakma++; w.ekranKilidi.acik = false; }, addEventListener: () => {} };
        },
      },
    });
  });
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'Macera');
  expect(await page.evaluate(() => (window as any).ekranKilidi.acik)).toBe(false);
  await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim: 0 });
  await expect.poll(() => page.evaluate(() => (window as any).ekranKilidi.acik), { timeout: 5_000 }).toBe(true);
  // Sıradaki hareket (oyundaki gibi sahne yeniden başlar): kilit bırakılmaz.
  await page.evaluate(() => (window as any).oyun.scene.getScene('Hareket').scene.restart({ durakId: 'istanbul', adim: 1 }));
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as any).ekranKilidi)).toMatchObject({ istek: 1, birakma: 0, acik: true });
  await sahneAc(page, 'Macera');
  await expect.poll(() => page.evaluate(() => (window as any).ekranKilidi.acik), { timeout: 5_000 }).toBe(false);
  expect(kayit.hatalar).toEqual([]);
});

// Gerçek aile testi (15 Ekim): telefona hiç dokunmadan (Uzaktan oyna / Ailece) oynanırken ekran kararıyor, kamera izni tekrar
// tekrar soruluyordu. Bir durak ve Ailece baştan sona dokunmadan oynanır; her yarım saniyede bakılır: hareket ekranı açıkken
// "ekranı açık tut" hep istenmiş olmalı, kamera (açıksa) durak boyunca bir kez açılmalı.
async function ekranKilidiSahte(page: Page) {
  await page.addInitScript(() => {
    const w = window as any;
    w.ekranKilidi = { istek: 0, acik: false, kapaliIkenHareket: 0 };
    // Gerçek tarayıcı gibi: sayfa gizlenince (ekran kilidi, başka uygulama) kilit kendiliğinden düşer ve "release" olayı gelir.
    let dinleyiciler: (() => void)[] = [];
    const birak = () => {
      w.ekranKilidi.acik = false;
      const d = dinleyiciler;
      dinleyiciler = [];
      d.forEach((f) => f());
    };
    w.sayfaGizli = false;
    Object.defineProperty(document, 'hidden', { get: () => w.sayfaGizli });
    document.addEventListener('visibilitychange', () => w.sayfaGizli && birak(), true);
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          w.ekranKilidi.istek++;
          w.ekranKilidi.acik = true;
          return { release: async () => birak(), addEventListener: (_: string, f: () => void) => dinleyiciler.push(f) };
        },
      },
    });
  });
}

for (const [ad, durakId, depo] of [
  ['Uzaktan oyna + kamera, İstanbul', 'istanbul', { 'zipzip-uzaktan-v1': '1', 'zipzip-kamera-v1': '1' }],
  ['Ailece', 'aile', {}],
] as const) {
  test(`dokunmadan bütün durak (${ad}): ekran hep açık tutulur, kamera bir kez açılır`, async ({ page }) => {
    test.setTimeout(300_000);
    await sahteKamera(page);
    await ekranKilidiSahte(page);
    const kayit = await oyunuAc(page, depo);
    await saatiHizlandir(page, 5);
    await sahneAc(page, 'Hareket', { durakId, adim: 0 });
    await page.evaluate(() => {
      const w = window as any;
      // İlk yarım saniye (kilit isteği yolda) sayılmaz; sonra hareket ekranı açıkken kilit kapalıysa sayılır.
      setTimeout(() => setInterval(() => {
        if (w.oyun.scene.isActive('Hareket') && !w.ekranKilidi.acik) w.ekranKilidi.kapaliIkenHareket++;
      }, 500), 1000);
    });
    await page.waitForFunction(() => (window as any).oyun.scene.isActive('Odul'), null, { timeout: 280_000, polling: 500 });
    // Durak bitti: çocuk hâlâ uzakta, ödül ekranında da ekran kararmamalı.
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => (window as any).ekranKilidi.acik)).toBe(true);
    const sonuc = await page.evaluate(() => ({ ...(window as any).ekranKilidi, kamera: (window as any).kameraAcilma ?? 0 }));
    expect(sonuc.kapaliIkenHareket).toBe(0);
    expect(sonuc.istek).toBeGreaterThanOrEqual(1);
    expect(sonuc.kamera).toBeLessThanOrEqual(1);
    if (durakId === 'aile') expect(sonuc.kamera).toBe(0); // Ailece'de kamera açılmaz
    else expect(sonuc.kamera).toBe(1);
    expect(kayit.hatalar).toEqual([]);
  });
}

// Telefon kilitlenip açılınca (ya da başka uygulamadan dönünce) ekran kilidi yeniden istenir; kamera kapanmışsa
// sıradaki harekette yeniden açılır (kontrol listesi T3).
test('kilitten dönüş: ekran açık tutma ve kamera yeniden gelir', async ({ page }) => {
  await sahteKamera(page);
  await ekranKilidiSahte(page);
  const kayit = await oyunuAc(page, { 'zipzip-kamera-v1': '1' });
  await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim: 0 });
  const uzunluk = await page.evaluate(() => (window as any).oyun.scene.getScene('Hareket').liste().length);
  let adim = 0;
  const sonraki = async () => {
    adim++;
    await page.evaluate((adim) => (window as any).oyun.scene.getScene('Hareket').scene.restart({ durakId: 'istanbul', adim }), adim);
    await page.waitForTimeout(700);
  };
  while (adim < uzunluk - 1 && !(await page.evaluate(() => !!(window as any).oyun.scene.getScene('Hareket').kamera))) await sonraki();
  await expect.poll(() => page.evaluate(() => (window as any).sahteAkis?.getVideoTracks()[0]?.readyState), { timeout: 30_000 }).toBe('live');
  await expect.poll(() => page.evaluate(() => (window as any).ekranKilidi.acik), { timeout: 5_000 }).toBe(true);
  // Kilit: sayfa gizlenir, telefon kamerayı kapatır.
  await page.evaluate(() => {
    const w = window as any;
    w.sayfaGizli = true;
    document.dispatchEvent(new Event('visibilitychange'));
    w.sahteAkis.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  });
  expect(await page.evaluate(() => (window as any).ekranKilidi.acik)).toBe(false);
  // Açılış: sayfa görünür olur; ekran kilidi yeniden istenir.
  await page.evaluate(() => {
    (window as any).sayfaGizli = false;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.evaluate(() => (window as any).ekranKilidi.acik), { timeout: 5_000 }).toBe(true);
  expect(await page.evaluate(() => (window as any).ekranKilidi.istek)).toBe(2);
  // Kameralı bir sonraki harekette kamera yeniden açılır.
  const once = await page.evaluate(() => (window as any).kameraAcilma);
  do await sonraki();
  while (adim < uzunluk - 1 && !(await page.evaluate(() => !!(window as any).oyun.scene.getScene('Hareket').kamera)));
  if (await page.evaluate(() => !!(window as any).oyun.scene.getScene('Hareket').kamera)) {
    await expect.poll(() => page.evaluate(() => (window as any).kameraAcilma), { timeout: 30_000 }).toBe(once + 1);
    await expect.poll(() => page.evaluate(() => (window as any).sahteAkis.getVideoTracks()[0].readyState), { timeout: 30_000 }).toBe('live');
  }
  expect(kayit.hatalar).toEqual([]);
});

// Bildirim/arama, ekran kilidi ya da başka uygulama (kontrol listesi T3, T4, T10): sayfa gizlenir, sonra geri gelir.
// Sahte konuşma: söylenenler ve susturmalar sayılır; iPhone gibi gizlenince konuşma "duraklatılmış" kalır.
async function kesintiSahte(page: Page) {
  await page.addInitScript(() => {
    const w = window as any;
    w.sayfaGizli = false;
    w.konusma = { soylenen: [] as string[], susturma: 0, surdurme: 0, duraklatildi: false };
    Object.defineProperty(document, 'hidden', { get: () => w.sayfaGizli });
    Object.defineProperty(document, 'visibilityState', { get: () => (w.sayfaGizli ? 'hidden' : 'visible') });
    const ss = window.speechSynthesis as any;
    ss.speak = (u: SpeechSynthesisUtterance) => w.konusma.soylenen.push(u.text); // telefondaki gibi hemen bitmez
    ss.cancel = () => w.konusma.susturma++;
    Object.defineProperty(ss, 'paused', { get: () => w.konusma.duraklatildi });
    ss.resume = () => {
      w.konusma.surdurme++;
      w.konusma.duraklatildi = false;
    };
    // Telefon gibi: sayfa gizliyken tarayıcı kare çizmez (oyunun saati bununla durur; Phaser kendisi durdurmaz).
    const kare = window.requestAnimationFrame.bind(window);
    let bekleyen: FrameRequestCallback[] = [];
    // Gizlenmeden önce istenmiş kare de gizliyken çizilmez.
    window.requestAnimationFrame = (f) => kare((t) => (w.sayfaGizli ? bekleyen.push(f) : f(t)));
    w.sayfayiGizle = (gizli: boolean) => {
      w.sayfaGizli = gizli;
      if (gizli) w.konusma.duraklatildi = true;
      document.dispatchEvent(new Event('visibilitychange'));
      if (!gizli) {
        bekleyen.forEach((f) => kare(f));
        bekleyen = [];
      }
    };
  });
}

test('kesinti (bildirim/arama): ses susar, sayaç ve "Uzaktan oyna" durur; dönünce kaldığı yerden bir kez devam eder', async ({ page }) => {
  test.setTimeout(90_000);
  await kesintiSahte(page);
  const kayit = await oyunuAc(page, { 'zipzip-uzaktan-v1': '1' });
  await saatiHizlandir(page, 3);
  await sahneAc(page, 'Hareket', { durakId: 'istanbul', adim: 0 });
  const durum = () =>
    page.evaluate(() => {
      const s = (window as any).oyun.scene.getScene('Hareket');
      return { aktif: s.scene.isActive(), adim: s.adim, sayac: s.sayac?.text, bilgi: s.bilgi?.text, agiz: s.zipzip?.yuz?.aciklik ?? 0 };
    });
  // Sayma başlayınca (ilk sayılar söylendi) bildirim gelir.
  // Ölçüm ve gizleme aynı karede, sadece arkasından aynı harekette bir sayı daha gelecekse (son sayıda gizlenirse dönüşte
  // değişen ilk sayı sıradaki hareketin geri sayımı olurdu).
  const gizleme = await page.waitForFunction(
    () => {
      const w = window as any;
      const s = w.oyun.scene.getScene('Hareket');
      const h = s.liste?.()[s.adim];
      const n = Number(s.sayac?.text);
      if (!h || s.bilgi?.text !== 'Sen de yap!' || !(n > 1) || (h.tur === 'sayi' && n >= h.adet)) return false;
      const o = { susturma: w.konusma.susturma, soylenen: w.konusma.soylenen.length };
      w.sayfayiGizle(true);
      return o;
    },
    null,
    { timeout: 30_000, polling: 'raf' },
  );
  const once = (await gizleme.jsonValue()) as { susturma: number; soylenen: number };
  const gizliyken = await durum();
  expect(await page.evaluate(() => (window as any).konusma.susturma)).toBeGreaterThan(once.susturma); // yarım cümle susturuldu
  await page.waitForTimeout(4000);
  // Gizliyken oyun ilerlemez, yeni cümle söylenmez, "Uzaktan oyna" kendiliğinden geçmez.
  expect(await durum()).toEqual(gizliyken);
  expect(await page.evaluate((n) => (window as any).konusma.soylenen.slice(n), once.soylenen)).toEqual([]);
  // Dönüş: duraklatılmış konuşma sürdürülür, sayma kaldığı yerden sürer, hareket bir kez kaydedilip sıradakine geçilir.
  await page.evaluate(() => (window as any).sayfayiGizle(false));
  expect(await page.evaluate(() => (window as any).konusma.surdurme)).toBe(1);
  // Sayma kaldığı yerden: sıradaki sayı bir eksik/fazla (süreli hareket geri, sayılı hareket ileri sayar), atlama yok.
  const ilkDegisen = await page.waitForFunction(
    (eski) => {
      const s = (window as any).oyun.scene.getScene('Hareket');
      return s.sayac.text !== eski && s.sayac.text;
    },
    gizliyken.sayac,
    { timeout: 10_000, polling: 'raf' },
  );
  expect(Math.abs(Number(await ilkDegisen.jsonValue()) - Number(gizliyken.sayac))).toBe(1);
  // İkinci kesinti "Uzaktan oyna" geri sayımı (📱 3… 2… 1…) sırasında: gizliyken kendiliğinden geçmez, kayıt yapılmaz.
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('Hareket').children.list.some((o: any) => o.type === 'Text' && o.text.startsWith('📱')), null, { timeout: 60_000, polling: 'raf' });
  const adimGizlenince = await page.evaluate(() => {
    const w = window as any;
    w.sayfayiGizle(true);
    return w.oyun.scene.getScene('Hareket').adim;
  });
  await page.waitForTimeout(5000);
  expect(await page.evaluate(() => [(window as any).oyun.scene.getScene('Hareket').adim, localStorage.getItem('zipzip-istatistik-v1')])).toEqual([adimGizlenince, null]);
  await page.evaluate(() => (window as any).sayfayiGizle(false));
  await expect.poll(async () => (await durum()).adim, { timeout: 30_000 }).toBe(1);
  await page.waitForTimeout(1500);
  const sonra = await page.evaluate(() => ({
    adim: (window as any).oyun.scene.getScene('Hareket').adim,
    hareket: Object.values<any>(JSON.parse(localStorage.getItem('zipzip-istatistik-v1')!).gunler)[0].hareket,
  }));
  expect(sonra).toEqual({ adim: 1, hareket: 1 });
  expect(kayit.hatalar).toEqual([]);
});

test('kesinti: arama sonrası iPhone ses bağlamı "interrupted" kalırsa sıradaki seste yeniden açılır', async ({ page }) => {
  const kayit = await oyunuAc(page);
  const sonuc = await page.evaluate(async () => {
    const { bip } = await import('/src/ses.ts');
    const p = AudioContext.prototype as any;
    let durum = 'running';
    let acma = 0;
    Object.defineProperty(p, 'state', { configurable: true, get: () => durum });
    p.resume = async () => {
      acma++;
      durum = 'running';
    };
    bip();
    const once = acma;
    durum = 'interrupted'; // arama geldi
    bip();
    return { once, sonra: acma, durum };
  });
  expect(sonuc).toEqual({ once: 0, sonra: 1, durum: 'running' });
  expect(kayit.hatalar).toEqual([]);
});

// K36: özetteki "toplam durak" açık bölümlerin durakları üzerinden: betada 14, ?bolumler=hepsi ile 50.
test('ebeveyn özeti: toplam durak betada 14, bütün bölümler açıkken 50 üzerinden', async ({ page }) => {
  const ilerleme = { 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva']) };
  const yazilar = () => page.evaluate(() => (window as any).oyun.scene.getScene('EbeveynOzet').children.list.filter((o: any) => o.type === 'Text').map((o: any) => o.text));
  for (const [adres, toplam] of [['/', 14], ['/?bolumler=hepsi', 50]] as const) {
    const kayit = await oyunuAc(page, ilerleme, adres);
    await sahneAc(page, 'EbeveynOzet');
    expect(await yazilar()).toContain(`2 / ${toplam}`);
    expect(kayit.hatalar).toEqual([]);
  }
});

// Kod denetimi 4. tur: kamera açıldı ama vücut tanıma modeli yüklenemedi (eski/zayıf telefon). Kamera kapanmalı
// (ışığı yanık kalmamalı) ve ebeveyn "Kamera açılamadı" görmeli.
test('kamera denemesi: model yüklenemezse kamera kapanır, "Kamera açılamadı" yazar', async ({ page }) => {
  await sahteKamera(page);
  await page.route('**/mediapipe/**', (r) => r.abort());
  const kayit = await oyunuAc(page, BETA);
  await sahneAc(page, 'EbeveynKamera');
  const r = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + (r.height * 635) / 1280); // 📷 Kamerayı aç
  await kameraYazisi(page, 'EbeveynKamera', 'Kamera açılamadı');
  await expect.poll(() => page.evaluate(() => (window as any).sahteAkis?.getVideoTracks()[0]?.readyState), { timeout: 5_000 }).toBe('ended');
  expect(kayit.hatalar.filter((h) => !h.startsWith('Failed to load resource'))).toEqual([]); // engellenen model dosyaları
});

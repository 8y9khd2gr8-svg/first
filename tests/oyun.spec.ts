import { expect, Page, test } from '@playwright/test';

// Oyunun ekranlarını gerçek tarayıcıda açar: hata çıkmamalı, oyun hiçbir dış sunucuya bağlanmamalı.
// Sahneler window.oyun üzerinden başlatılır (sadece geliştirme sürümünde vardır).

type Kayit = { hatalar: string[]; disIstekler: string[] };

// adres: '/?odeme=deneme' sahte mağazayla açar (tam sürüm ekranı ve bölüm ödeme kilidi denenir).
async function oyunuAc(page: Page, depo: Record<string, string> = {}, adres = '/'): Promise<Kayit> {
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
async function sakinlesmesiniBekle(page: Page, enCok = 1500) {
  await page
    .waitForFunction(
      () =>
        (window as any).oyun.scene
          .getScenes(true)
          .every((s: any) => s.tweens.getTweens().every((t: any) => t.repeat === -1 || t.loop === -1 || !t.isPlaying())),
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
    ['Sertifika', { bolum: 'spor' }], ['Sertifika', { bolum: 'okyanus' }], ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynRehber', {}], ['EbeveynAyar', {}], ['EbeveynSes', {}], ['EbeveynKamera', {}], ['EbeveynOzet', {}],
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

test('tam sürüm: ödeme kilidi ebeveyn kilidine götürür, satın alınca bölümler açılır', async ({ page }) => {
  await oyunuAc(page, {}, '/?odeme=deneme');
  const kilit = () =>
    page.evaluate(async () => {
      const { bolumKilidi } = await import('/src/duraklar.ts');
      return [bolumKilidi('turkiye'), bolumKilidi('dunya'), bolumKilidi('uzay')];
    });
  expect(await kilit()).toEqual([null, 'onceki', 'onceki']);
  const turkiye = await page.evaluate(async () => (await import('/src/duraklar.ts')).TURKIYE.map((d) => d.id));
  const kayit = await oyunuAc(page, { 'zipzip-ilerleme-v1': JSON.stringify(turkiye) }, '/?odeme=deneme');
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
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(hepsi.slice(0, 20)), 'zipzip-pasaport-v1': JSON.stringify({ ad: 'Muhammed Mustafa', avatar: '🐼', soruldu: true }) }, '/?odeme=deneme');
  const sahneler: [string, object, boolean][] = [
    ['Macera', {}, true], ['Harita', {}, true], ['Dunya', {}, true], ['Uzay', {}, true], ['Spor', {}, true], ['Dinozor', {}, true], ['Evde', {}, true], ['Okyanus', {}, true],
    ['Durak', { durakId: 'efes' }, true], ['Durak', { durakId: 'nemrut' }, true], ['Hareket', { durakId: 'istanbul', adim: 1 }, true],
    ['Pasaport', {}, true], ['Rozet', { sayfa: 1 }, true], ['Kostum', {}, false], ['Avatar', {}, true],
    ['Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' }, true], ['EbeveynMenu', {}, true], ['EbeveynVeri', {}, true], ['EbeveynRehber', {}, true], ['EbeveynAyar', {}, true], ['EbeveynSes', {}, true], ['EbeveynKamera', {}, true], ['EbeveynOzet', {}, true], ['PasaportAyar', {}, true],
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
    const ayarlar = [{ yas: 'buyuk', oturarak: false }, { yas: 'kucuk', oturarak: false }, { yas: 'buyuk', oturarak: true }, { yas: 'kucuk', oturarak: true }] as const;
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
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva']), 'zipzip-pasaport-v1': JSON.stringify({ ad: '', avatar: '🐼', soruldu: true }) }, '/?odeme=deneme');
  const sahneler: [string, object][] = [
    ['Acilis', {}], ['Macera', {}], ['Harita', {}], ['Dunya', {}], ['Uzay', {}], ['Spor', {}], ['Okyanus', {}], ['Durak', { durakId: 'efes' }], ['Hareket', { durakId: 'istanbul', adim: 1 }],
    ['Pasaport', {}], ['Rozet', { sayfa: 1 }], ['Kostum', {}], ['Avatar', {}], ['Guvenlik', {}], ['Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' }],
    ['EbeveynMenu', {}], ['EbeveynVeri', {}], ['EbeveynRehber', {}], ['EbeveynAyar', {}], ['EbeveynSes', {}], ['EbeveynKamera', {}], ['EbeveynOzet', {}], ['PasaportAyar', {}], ['TamSurum', {}], ['Sertifika', { bolum: 'turkiye' }],
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
  const kayit = await oyunuAc(page, { ...BETA, 'zipzip-ilerleme-v1': JSON.stringify(['istanbul', 'truva']), 'zipzip-pasaport-v1': JSON.stringify({ ad: '', avatar: '🐼', soruldu: true }) }, '/?odeme=deneme');
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

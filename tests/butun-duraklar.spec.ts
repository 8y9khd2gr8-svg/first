import { expect, Page, test } from '@playwright/test';

// Bütün bölümlerin bütün durakları (Ailece ve "Bitirelim" soğuması dahil) baştan sona kendiliğinden oynanır:
// "Uzaktan oyna" açık ("Yaptım!" beklemeden geçer), oyun saati çok hızlı. Her durakta, durak başında kurulan
// listedeki her hareket sırayla ve atlamadan gelmeli, sonunda Ödül ekranı açılmalı, hiç hata çıkmamalı.
// Uzun sürdüğü için bölümlere ayrılmış ayrı testlerdir.

const HIZ = 100;

async function hazirla(page: Page, depo: Record<string, string>) {
  const hatalar: string[] = [];
  page.on('pageerror', (e) => hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  await page.goto('/');
  await page.evaluate((depo) => {
    localStorage.clear();
    localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
    localStorage.setItem('zipzip-uzaktan-v1', '1');
    localStorage.setItem('zipzip-beta-dunya', '1');
    for (const [k, v] of Object.entries(depo)) localStorage.setItem(k, v);
  }, depo);
  await page.reload();
  await page.waitForFunction(() => (window as any).oyun?.scene?.getScenes(true).length > 0);
  await page.evaluate((kat) => {
    const w = window as any;
    const oyun = w.oyun;
    oyun.events.on('prestep', () =>
      oyun.scene.getScenes(true).forEach((s: any) => {
        s.time.timeScale = kat;
        s.tweens.timeScale = kat;
      }),
    );
    // Her hareket adımı kaydedilir: kaçıncı adım, ne söylendi; durak başında kurulan liste.
    w.__adimlar = [];
    oyun.events.on('poststep', () => {
      const h = oyun.scene.getScene('Hareket');
      if (!oyun.scene.isActive('Hareket')) return;
      const son = w.__adimlar[w.__adimlar.length - 1];
      if (son && son.durak === h.durakId && son.adim === h.adim && son.sahne === h.sys.settings.data) return;
      const liste = h.liste().map((x: any) => x.sesli);
      w.__adimlar.push({ durak: h.durakId, adim: h.adim, sesli: liste[h.adim], liste, sahne: h.sys.settings.data });
    });
  }, HIZ);
  return hatalar;
}

// Bir durağı oynar; Ödül (ya da soğumadan sonra Büyük Macera) ekranı açılana kadar bekler.
async function oyna(page: Page, durakId: string, bitis = 'Odul') {
  await page.evaluate((durakId) => {
    const w = window as any;
    w.__adimlar = [];
    w.oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
    w.oyun.scene.start('Hareket', { durakId, adim: 0 });
  }, durakId);
  await page.waitForFunction((bitis) => (window as any).oyun.scene.isActive(bitis) && !(window as any).oyun.scene.isActive('Hareket'), bitis, { timeout: 60_000, polling: 100 });
  const adimlar: { durak: string; adim: number; sesli: string; liste: string[] }[] = await page.evaluate(() => (window as any).__adimlar.map(({ sahne, ...a }: any) => a));
  const ilk = adimlar[0];
  expect(ilk.durak, durakId).toBe(durakId);
  expect(adimlar.map((a) => a.adim), durakId).toEqual([...ilk.liste.keys()]);
  expect(adimlar.map((a) => a.sesli), durakId).toEqual(ilk.liste);
  for (const a of adimlar) expect(a.liste, durakId).toEqual(ilk.liste);
  return ilk.liste;
}

const BOLUMLER = ['turkiye', 'dunya', 'uzay', 'spor', 'dinozor', 'evde', 'okyanus'] as const;

for (const bolum of BOLUMLER) {
  test(`${bolum}: her durak baştan sona oynanır, hiçbir hareket atlanmaz`, async ({ page }) => {
    test.setTimeout(240_000);
    const hatalar = await hazirla(page, { 'zipzip-tam-surum-v1': '1' });
    const { duraklar, onceki, isinmalar, sogumalar } = await page.evaluate(async (bolum) => {
      const { BOLUMLER, BOLUM_SIRASI } = await import('/src/duraklar.ts');
      const { ISINMALAR, SOGUMALAR } = await import('/src/hareketler.ts');
      // Bölüm açık olsun: önceki bölümlerin hepsi bitmiş sayılır.
      const onceki = BOLUM_SIRASI.slice(0, BOLUM_SIRASI.indexOf(bolum)).flatMap((b: string) => (BOLUMLER as any)[b].duraklar.map((d: any) => d.id));
      return {
        duraklar: (BOLUMLER as any)[bolum].duraklar.map((d: any) => d.id),
        onceki,
        isinmalar: ISINMALAR.map((h: any) => h.sesli),
        sogumalar: SOGUMALAR.map((h: any) => h.sesli),
      };
    }, bolum);
    await page.evaluate((onceki) => localStorage.setItem('zipzip-ilerleme-v1', JSON.stringify(onceki)), onceki);
    for (const [i, id] of duraklar.entries()) {
      const liste = await oyna(page, id);
      // Isınma sadece oturumun ilk durağında; soğuma sadece bölümün son durağında.
      expect(isinmalar.includes(liste[0]), id).toBe(i === 0);
      expect(sogumalar.includes(liste[liste.length - 1]), id).toBe(i === duraklar.length - 1);
    }
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('zipzip-ilerleme-v1')!).length)).toBe(onceki.length + duraklar.length);
    expect(hatalar).toEqual([]);
  });
}

test('Ailece ve "Bitirelim" soğuması baştan sona oynanır', async ({ page }) => {
  test.setTimeout(120_000);
  const hatalar = await hazirla(page, {});
  const aile = await oyna(page, 'aile');
  expect(aile.length).toBeGreaterThanOrEqual(5);
  // Soğuma bitince Zıpzıp uyur ve Büyük Macera'ya dönülür.
  const soguma = await oyna(page, 'soguma', 'Macera');
  expect(soguma.length).toBe(1);
  expect(hatalar).toEqual([]);
});

import fs from 'node:fs';
import { expect, Page, test } from '@playwright/test';
import { saymaYolu } from '../src/kamera';
import { aynaDonmaHatalari } from './aynaDonmaKurali';

// Kamera benzetimi (K41): gerçek kamera ve gerçek vücut tanıma modeli YOK. Kamera, renk değiştiren bir tuvalin görüntüsü;
// model, testin verdiği yapay vücut noktalarını döndüren sahte bir model (kamera.ts'deki zipzipBenzetim, sadece geliştirme
// sunucusunda). Oyunun kendi kodu (kadraj şartı, sayma, büyük ayna, kutu yazıları, "Kamera gördü") aynen çalışır.
// Bu testler kuralları ve yazıları dener; gerçek telefon kamerasında ve gerçek çocukta doğrulama yerine geçmez.

const SOL_OMUZ = 11, SAG_OMUZ = 12, SOL_TOPUK = 27, SAG_TOPUK = 28;

// modelElle: model, test window.benzetim.modelHazir() deyince hazır olur (gecikmiş tanıma).
type Ayar = { modelElle?: boolean; modelHatasi?: boolean; kameraGecikmeMs?: number; kameraHatasi?: string };

// Benzetim: window.benzetim.durum ile testin istediği an değiştirilir:
// hareket: 'dur' (kıpırdamadan) ya da sayma yolu; gizli: görünmeyen noktalar; bosKareHer: her N. karede kimse bulunmaz.
async function benzetimKur(page: Page, ayar: Ayar = {}) {
  await page.addInitScript((ayar: Ayar) => {
    const w = window as any;
    const bekle = (ms = 0) => new Promise((r) => setTimeout(r, ms));
    w.kameraAcilma = 0;
    (navigator.mediaDevices as any).getUserMedia = async () => {
      await bekle(ayar.kameraGecikmeMs);
      if (ayar.kameraHatasi) throw new DOMException('deneme', ayar.kameraHatasi);
      const t = document.createElement('canvas');
      t.width = 160;
      t.height = 120;
      const c = t.getContext('2d')!;
      let i = 0;
      setInterval(() => { c.fillStyle = `hsl(${(i += 20) % 360},60%,50%)`; c.fillRect(0, 0, 160, 120); }, 50);
      w.sahteAkis = t.captureStream(20);
      (w.akislar ??= []).push(w.sahteAkis);
      w.kameraAcilma++;
      return w.sahteAkis;
    };
    // Yapay vücut (0-1 arası, y aşağı doğru büyür). tests/kamera.test.ts'deki duruşlarla aynı.
    const nokta = (d: any) => {
      const x = d.x ?? 0.5, omuz = d.omuzY ?? 0.3, kalca = d.kalcaY ?? 0.55, topuk = d.topukY ?? 0.9, ayak = (d.ayakAciklik ?? 0.1) / 2;
      const n = Array.from({ length: 33 }, () => ({ x, y: 0.5, z: 0, visibility: 0.95 }));
      const koy = (i: number, px: number, py: number) => (n[i] = { x: px, y: py, z: 0, visibility: 0.95 });
      koy(0, x, omuz - 0.08);
      koy(11, x - 0.08, omuz); koy(12, x + 0.08, omuz);
      koy(15, x - 0.1, d.bilekY ?? kalca); koy(16, x + 0.1, d.bilekY ?? kalca);
      koy(23, x - 0.05, kalca); koy(24, x + 0.05, kalca);
      koy(25, x - 0.05, d.solDizY ?? (kalca + topuk) / 2); koy(26, x + 0.05, d.sagDizY ?? (kalca + topuk) / 2);
      koy(27, x - ayak, topuk); koy(28, x + ayak, topuk);
      return n;
    };
    // Her yolun "hareketin içi" duruşu (yarım periyotta bir ayakta duruşla yer değiştirir).
    const ICI: Record<string, (tek: boolean) => any> = {
      kollar: () => ({ bilekY: 0.1 }),
      comel: () => ({ omuzY: 0.55, kalcaY: 0.8 }),
      zipla: () => ({ omuzY: 0.22, kalcaY: 0.47, topukY: 0.82 }),
      dizler: (tek) => (tek ? { sagDizY: 0.56 } : { solDizY: 0.56 }),
      acKapa: () => ({ ayakAciklik: 0.35 }),
      yanAdim: (tek) => ({ x: tek ? 0.42 : 0.58 }),
    };
    let modelHazir = () => {};
    const modelBekle = new Promise<void>((r) => (modelHazir = r));
    const b = (w.benzetim = { durum: { hareket: 'dur', gizli: [] as number[], bosKareHer: 0, periyotMs: 1200 }, tanima: 0, modelHazir });
    w.zipzipBenzetim = {
      model: async () => {
        if (ayar.modelElle) await modelBekle;
        if (ayar.modelHatasi) throw new Error('benzetim: model yüklenemedi');
        return {
          detectForVideo: () => {
            const d = b.durum;
            b.tanima++;
            if (d.bosKareHer && b.tanima % d.bosKareHer === 0) return { landmarks: [] };
            const faz = Math.floor(performance.now() / (d.periyotMs / 2));
            const ici = d.hareket !== 'dur' && (faz % 2 === 0 || d.hareket === 'yanAdim');
            const n = nokta(ici ? ICI[d.hareket](faz % 4 < 2) : {});
            for (const i of d.gizli) n[i] = { ...n[i], visibility: 0.1 };
            return { landmarks: [n] };
          },
        };
      },
    };
    // Her karede sayfanın içinden kayıt (yüklü makinede dışarıdan bakan test kısa anları kaçırabiliyor).
    const kayit: any = (w.kayit = { olaylar: [], aynaBas: null, aynaSon: null });
    const ekle = (tur: string, deger: string) => {
      const son = kayit.olaylar.filter((o: any) => o.tur === tur).pop();
      if (son?.deger !== deger) kayit.olaylar.push({ tur, deger, t: performance.now() });
    };
    const bagla = () => {
      if (!w.oyun?.events) return setTimeout(bagla, 50);
      w.oyun.events.on('postrender', () => {
        const s = w.oyun.scene.getScene('Hareket');
        if (!s?.sys.isActive()) return;
        // Oyunun saati: her karenin oyun süresi (Phaser zamanlayıcıları bununla ilerler; yavaş makinede gerçek saatten geri kalır).
        kayit.oyunSaati = (kayit.oyunSaati ?? 0) + w.oyun.loop.delta;
        ekle('bilgi', s.bilgi?.text ?? '');
        const kutu = document.querySelector('.kamera-kutusu') as HTMLElement | null;
        if (kutu) {
          const cerceve = kutu.children[1] as HTMLElement;
          const yazi = kutu.lastElementChild as HTMLElement;
          ekle('kutu', yazi.textContent ?? '');
          // Yazı kutuya sığıyor mu (yana taşmaz, kutudan uzun değil)? Kutu büyüyüp küçülürken de her karede bakılır.
          if (yazi.scrollWidth > yazi.clientWidth + 1 || yazi.offsetHeight > kutu.clientHeight) ekle('tasma', `${yazi.textContent} ${yazi.offsetHeight}/${kutu.clientHeight}`);
          ekle('renk', `${kutu.style.borderColor} ${cerceve.style.display} ${cerceve.style.borderStyle}`);
        }
        const ayna = s.bilgi?.text === 'Ekranda kendine bak!' || s.bilgi?.text === 'Hazırsın!';
        if (ayna) kayit.aynaBas ??= performance.now();
        if (ayna) kayit.aynaOyunBas ??= kayit.oyunSaati;
        if (kayit.aynaBas && !kayit.aynaSon && !ayna) {
          kayit.aynaSon = performance.now();
          kayit.aynaOyunSon = kayit.oyunSaati;
        }
      });
    };
    bagla();
  }, ayar);
}

async function oyunuAc(page: Page, depo: Record<string, string> = {}) {
  const hatalar: string[] = [];
  const disIstekler: string[] = [];
  page.on('pageerror', (e) => hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  page.on('request', (r) => {
    const a = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(a.hostname) && !['data:', 'blob:'].includes(a.protocol)) disIstekler.push(r.url());
  });
  // Sesler kaydedilir (Zıpzıp ne söyledi?).
  await page.addInitScript(() => {
    const soylenen: string[] = ((window as any).__soylenen = []);
    const sahte = { speak: (s: SpeechSynthesisUtterance) => soylenen.push(s.text), cancel: () => {}, pause: () => {}, resume: () => {}, getVoices: () => [], addEventListener: () => {}, onvoiceschanged: null, speaking: false, paused: false };
    Object.defineProperty(window, 'speechSynthesis', { value: sahte, configurable: true });
  });
  await page.goto('/?bolumler=hepsi');
  await page.evaluate((depo) => {
    localStorage.clear();
    localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
    localStorage.setItem('zipzip-kamera-v1', '1');
    for (const [k, v] of Object.entries(depo)) localStorage.setItem(k, v);
  }, depo);
  await page.reload();
  await page.waitForFunction(() => (window as any).oyun?.scene?.getScenes(true).length > 0);
  return { hatalar, disIstekler };
}

// Kameranın saydığı ilk hareketin adımını açar; hareketin sayma yolunu ve hedef sayısını döndürür.
async function kameraliHareket(page: Page, durakId = 'istanbul') {
  for (let adim = 0; adim < 8; adim++) {
    // İlk adım sahneyi açar, sonrakiler oyundaki gibi yeniden başlatır (aynı sahne durdurulup başlatılırsa iki kez kurulabiliyor).
    await page.evaluate(([durakId, adim]) => {
      const oyun = (window as any).oyun;
      const s = oyun.scene.getScene('Hareket');
      if (adim > 0 && s.sys.isActive()) return s.scene.restart({ durakId, adim });
      oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
      oyun.scene.start('Hareket', { durakId, adim });
    }, [durakId, adim] as const);
    await page.waitForTimeout(300);
    const h = await page.evaluate(() => {
      const s = (window as any).oyun.scene.getScene('Hareket');
      const h = s.liste()[s.adim];
      return s.kamera ? { adim: s.adim as number, animasyon: h.animasyon as string, adet: h.adet as number } : null;
    });
    if (h) return { ...h, yol: saymaYolu(h.animasyon as never)! };
  }
  throw new Error('kameralı adım yok');
}

const durumYaz = (page: Page, durum: object) => page.evaluate((d) => Object.assign((window as any).benzetim.durum, d), durum);
const kayit = (page: Page) => page.evaluate(() => (window as any).kayit);
const degerler = (k: any, tur: string): string[] => k.olaylar.filter((o: any) => o.tur === tur).map((o: any) => o.deger);
const bilgiBekle = (page: Page, metin: string, timeout = 60_000) =>
  page.waitForFunction((m) => (window as any).kayit.olaylar.some((o: any) => o.tur === 'bilgi' && o.deger === m), metin, { timeout });
const istatistik = (page: Page) =>
  page.evaluate(() => Object.values<any>(JSON.parse(localStorage.getItem('zipzip-istatistik-v1') ?? '{"gunler":{}}').gunler)[0] ?? null);
const yaptimVar = (page: Page) =>
  page.evaluate(() => (window as any).oyun.scene.getScene('Hareket').children.list.some((o: any) => (o.list ?? []).some((c: any) => c.text === 'Yaptım!')));

test('benzetim: çocuk baştan ayağa görünür, hareketi yapar → ayna yeşil "Hazırsın!", kutu sayar, kamera görünce kendiliğinden geçer', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  // Çocuk önce çok yakın (topuklar görünmez); ayna açılınca geri gider ve baştan ayağa görünür.
  await durumYaz(page, { gizli: [SOL_TOPUK, SAG_TOPUK] });
  const h = await kameraliHareket(page);
  await bilgiBekle(page, 'Ekranda kendine bak!');
  await page.waitForTimeout(1_000);
  await durumYaz(page, { gizli: [] });
  await bilgiBekle(page, 'Sen de yap!');
  await durumYaz(page, { hareket: h.yol });
  // Hedef sayıyı görünce "Kamera gördü" denir ve dokunmadan sıradaki harekete geçilir.
  await page.waitForFunction((adim) => (window as any).oyun.scene.getScene('Hareket').adim === adim + 1, h.adim, { timeout: 150_000 });
  const k = await kayit(page);
  const bilgi = degerler(k, 'bilgi');
  expect(bilgi.slice(0, 5)).toEqual(['Önce Zıpzıp’ı izle!', 'Ekranda kendine bak!', 'Hazırsın!', 'Hazır ol!', 'Sen de yap!']);
  const kutu = degerler(k, 'kutu');
  expect(kutu).toContain('✅ Hazırsın!');
  expect(kutu).toContain(`📷 ${h.adet}/${h.adet}`);
  // Sayım hareketle başlar: "Sen de yap!" öncesinde (ayna) sayı yazılmaz, sonra 0'dan birer birer artar.
  const sayilar = kutu.filter((y) => /^📷 \d+\//.test(y)).map((y) => Number(y.match(/\d+/)![0]));
  expect(sayilar[0]).toBe(0);
  for (let i = 1; i < sayilar.length; i++) expect(sayilar[i] - sayilar[i - 1]).toBe(1);
  // Ayna yeşil düz çerçeve; aynadan çıkınca çerçeve gizli.
  const renk = degerler(k, 'renk');
  expect(renk.indexOf('rgb(255, 201, 60) block dashed')).toBeLessThan(renk.indexOf('rgb(63, 191, 95) block solid'));
  expect(renk).toContain('rgb(255, 201, 60) block dashed');
  expect(renk).toContain('rgb(63, 191, 95) block solid');
  expect(renk[renk.length - 1]).toMatch(/none/);
  const soylenen: string[] = await page.evaluate(() => (window as any).__soylenen);
  expect(soylenen).toEqual(expect.arrayContaining(['Ekranda kendine bak! Başından ayağına kadar görün.', 'Hazırsın! Seni görüyorum.', 'Kamera gördü, harikasın!']));
  expect(await istatistik(page)).toMatchObject({ kameraAcik: 1, kameraGordu: 1 });
  expect(k0.hatalar).toEqual([]);
  expect(k0.disIstekler).toEqual([]);
});

test('benzetim: çocuk ayna açılmadan zaten baştan ayağa görünüyorsa ayna kısa geçer, uzun yönlendirme söylenmez', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  await kameraliHareket(page);
  await bilgiBekle(page, 'Hazır ol!');
  const k = await kayit(page);
  expect(degerler(k, 'bilgi').slice(0, 3)).toEqual(['Önce Zıpzıp’ı izle!', 'Hazırsın!', 'Hazır ol!']);
  // Kısa geçiş oyunun saatiyle 0,9 sn (yavaş makinede gerçek saatle uzayabilir; 6 sn'lik bekleme hiç başlamadı).
  expect(k.aynaOyunSon - k.aynaOyunBas).toBeLessThan(1_500);
  const soylenen: string[] = await page.evaluate(() => (window as any).__soylenen);
  expect(soylenen).not.toContain('Ekranda kendine bak! Başından ayağına kadar görün.');
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: her üç karenin birinde kimse bulunmasa da (kesik/gecikmiş sonuç) hareket tam sayılır', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  const h = await kameraliHareket(page);
  await durumYaz(page, { bosKareHer: 3 });
  await bilgiBekle(page, 'Sen de yap!');
  await durumYaz(page, { hareket: h.yol });
  await page.waitForFunction((adim) => (window as any).oyun.scene.getScene('Hareket').adim === adim + 1, h.adim, { timeout: 150_000 });
  expect(degerler(await kayit(page), 'kutu')).toContain(`📷 ${h.adet}/${h.adet}`);
  expect(await istatistik(page)).toMatchObject({ kameraAcik: 1, kameraGordu: 1 });
  expect(k0.hatalar).toEqual([]);
});

// K41 en olası neden: telefon masada, baş ve omuzlar görünüyor ama ayaklar kadraj dışında. Kamera hiç saymaz, "Geri git" der;
// oyun beklemez (ayna en çok 6 sn), "Yaptım!" çıkar, kaybettirmez.
// K41 (c): yazı ve ses neyin eksik olduğunu söyler; sesli ipucu aynada bir kez (sayılar söylenirken araya girmez).
for (const [ad, gizli, aynaYazisi, kutuYazisi, sesli] of [
  ['iki topuk görünmez (telefon masada)', [SOL_TOPUK, SAG_TOPUK], '🦶 Ayakların görünmüyor: biraz geri git', '🦶 Ayakların görünmüyor', 'Ayakların görünmüyor. Biraz geri git.'],
  ['bir topuk görünmez', [SAG_TOPUK], '🦶 Ayakların görünmüyor: biraz geri git', '🦶 Ayakların görünmüyor', 'Ayakların görünmüyor. Biraz geri git.'],
  ['omuzlar görünmez', [SOL_OMUZ, SAG_OMUZ], '🙋 Çok yakınsın: biraz geri git', '📷 Çok yakınsın', 'Çok yakınsın. Biraz geri git.'],
  ['kimse görünmez', [SOL_OMUZ, SAG_OMUZ, SOL_TOPUK, SAG_TOPUK], '🧍 Seni göremiyorum: kameranın önüne gel', '📷 Seni göremiyorum', 'Seni göremiyorum. Kameranın önüne gel.'],
] as const) {
  test(`benzetim: ${ad} → ayna eksik yeri söyler, ~6 sn sonra geri sayım; hareket sayılmaz, "Yaptım!" bekler`, async ({ page }) => {
    test.setTimeout(240_000);
    await benzetimKur(page);
    const k0 = await oyunuAc(page);
    await durumYaz(page, { gizli });
    const h = await kameraliHareket(page);
    await durumYaz(page, { hareket: h.yol });
    await page.waitForFunction(() => (window as any).kayit.aynaSon, null, { timeout: 150_000 });
    let k = await kayit(page);
    expect(degerler(k, 'bilgi')).not.toContain('Hazırsın!');
    expect(degerler(k, 'kutu')).toContain(aynaYazisi);
    expect(degerler(k, 'renk')).not.toContain('rgb(63, 191, 95) block solid');
    // Gerçek saatle 6 sn (ölçüm payı).
    expect(k.aynaSon - k.aynaBas).toBeGreaterThan(5_500);
    expect(k.aynaSon - k.aynaBas).toBeLessThan(7_500);
    await expect.poll(() => yaptimVar(page), { timeout: 150_000 }).toBe(true);
    // Çocuk bütün hareket boyunca yaptı; kamera saymadı, kutu "Geri git" dedi. Kendiliğinden geçilmez (Uzaktan oyna kapalı).
    await page.waitForTimeout(2_500);
    k = await kayit(page);
    expect(degerler(k, 'kutu')).toContain(kutuYazisi);
    expect(degerler(k, 'kutu').filter((y) => /^📷 \d/.test(y))).toEqual([]);
    expect(degerler(k, 'tasma')).toEqual([]);
    expect(await page.evaluate(() => (window as any).oyun.scene.getScene('Hareket').kamera.sayi)).toBe(0);
    expect(await yaptimVar(page)).toBe(true);
    // Sesli ipucu: "Ekranda kendine bak"tan sonra bir kez, bütün hareket boyunca yinelenmez.
    const soylenen: string[] = await page.evaluate(() => (window as any).__soylenen);
    expect(soylenen.filter((c) => c === sesli)).toHaveLength(1);
    expect(soylenen.indexOf(sesli)).toBeGreaterThan(soylenen.indexOf('Ekranda kendine bak! Başından ayağına kadar görün.'));
    expect(soylenen.indexOf(sesli)).toBeLessThan(soylenen.indexOf('Başla!'));
    expect(k0.hatalar).toEqual([]);
  });
}

// Ebeveynin kamera denemesi: tanı satırı hangi noktanın görünmediğini yazar (K41); satır ekrana sığar, kutuyu ve sayıyı örtmez.
test('benzetim: kamera denemesinde tanı satırı eksik noktayı yazar (topuklar, omuzlar, kimse, kenar), sığar', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
    oyun.scene.start('EbeveynKamera', {});
  });
  await page.waitForTimeout(500);
  const r = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + (r.height * 635) / 1280); // 📷 Kamerayı aç
  const satir = () =>
    page.evaluate(() => {
      const s = (window as any).oyun.scene.getScene('EbeveynKamera');
      const yazilar = s.children.list.filter((c: any) => c.type === 'Text');
      const durum = yazilar.find((c: any) => c.y === 595);
      const sayi = yazilar.find((c: any) => c.y === 650);
      const b = durum.getBounds();
      return { yazi: durum.text as string, sol: b.x, sag: b.x + b.width, alt: b.y + b.height, ust: b.y, sayiUst: sayi.getBounds().y };
    });
  for (const [gizli, beklenen] of [
    [[], '✅ Bütün vücut görünüyor'],
    [[SOL_TOPUK, SAG_TOPUK], 'Topuklar görünmüyor: biraz geri gidin'],
    [[SAG_TOPUK], 'Sağ topuk görünmüyor: biraz geri gidin'],
    [[SOL_OMUZ, SAG_OMUZ], 'Omuzlar görünmüyor: biraz geri gidin'],
    [[SAG_OMUZ, SOL_TOPUK, SAG_TOPUK], 'Sağ omuz ve topuklar görünmüyor: ortaya gelin'],
    [[SOL_OMUZ, SAG_OMUZ, SOL_TOPUK, SAG_TOPUK], 'Kimse görünmüyor'],
    [[], '✅ Bütün vücut görünüyor'],
  ] as const) {
    await durumYaz(page, { gizli });
    await expect.poll(async () => (await satir()).yazi, { timeout: 60_000 }).toBe(beklenen);
    const s = await satir();
    expect(s.sol).toBeGreaterThanOrEqual(10);
    expect(s.sag).toBeLessThanOrEqual(710);
    expect(s.alt).toBeLessThanOrEqual(s.sayiUst);
    expect(s.ust).toBeGreaterThanOrEqual(395 + 165 + 4); // kamera kutusunun altı
  }
  // Tanı satırı kaydedilmez: cihaz kaydında yok.
  const depo = await page.evaluate(() => Object.keys(localStorage).join(','));
  expect(depo).not.toMatch(/tani|eksik/);
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: "Yaptım!"a dokununca özet dürüst: kamera açık, görmedi', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page);
  await oyunuAc(page);
  await durumYaz(page, { gizli: [SOL_TOPUK, SAG_TOPUK] });
  const h = await kameraliHareket(page);
  await durumYaz(page, { hareket: h.yol });
  await expect.poll(() => yaptimVar(page), { timeout: 150_000 }).toBe(true);
  await page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('Hareket');
    const bul = (o: any): any => ((o.list ?? []).some((c: any) => c.text === 'Yaptım!') ? o : null);
    s.children.list.map(bul).find(Boolean).emit('pointerdown', { x: 0, y: 0 });
  });
  await expect.poll(() => istatistik(page), { timeout: 10_000 }).toMatchObject({ hareket: 1, kameraAcik: 1 });
  expect((await istatistik(page)).kameraGordu ?? 0).toBe(0);
});

test('benzetim: tanıma modeli geç hazır olur (ayna süresi içinde) → "Hazırlanıyor", sonra "Hazırsın!"', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page, { modelElle: true });
  const k0 = await oyunuAc(page);
  await kameraliHareket(page);
  await bilgiBekle(page, 'Ekranda kendine bak!');
  await page.waitForTimeout(2_000);
  await page.evaluate(() => (window as any).benzetim.modelHazir());
  await bilgiBekle(page, 'Sen de yap!');
  const k = await kayit(page);
  expect(degerler(k, 'bilgi')).toContain('Hazırsın!');
  const kutu = degerler(k, 'kutu');
  expect(kutu.indexOf('📷 Hazırlanıyor')).toBeLessThan(kutu.indexOf('✅ Hazırsın!'));
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: tanıma modeli çok geç gelir → ayna beklemez (≤6 sn), sonra kamera yine sayar ve kendiliğinden geçer', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page, { modelElle: true });
  const k0 = await oyunuAc(page);
  const h = await kameraliHareket(page);
  await durumYaz(page, { hareket: h.yol });
  await page.waitForFunction(() => (window as any).kayit.aynaSon, null, { timeout: 150_000 });
  let k = await kayit(page);
  expect(k.aynaSon - k.aynaBas).toBeLessThan(7_500);
  expect(degerler(k, 'bilgi')).not.toContain('Hazırsın!');
  expect(degerler(k, 'kutu')).toEqual(['📷 Hazırlanıyor']);
  await page.evaluate(() => (window as any).benzetim.modelHazir());
  await page.waitForFunction((adim) => (window as any).oyun.scene.getScene('Hareket').adim === adim + 1, h.adim, { timeout: 150_000 });
  k = await kayit(page);
  expect(degerler(k, 'kutu')).toContain(`📷 ${h.adet}/${h.adet}`);
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: kamera geç açılır (4 sn) → ayna "Hazırlanıyor" der, açılınca görür', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page, { kameraGecikmeMs: 4_000 });
  const k0 = await oyunuAc(page);
  await kameraliHareket(page);
  await bilgiBekle(page, 'Sen de yap!');
  const k = await kayit(page);
  expect(degerler(k, 'kutu')[0]).toBe('📷 Hazırlanıyor');
  // Hazırlanırken küçük kutuda aynanın çerçevesi görünmez (hata, 16 Ekim: ilk durum yazılmadan önce görünüyordu).
  expect(degerler(k, 'renk')[0]).toBe('rgb(255, 201, 60) none dashed');
  expect(degerler(k, 'bilgi')).toContain('Hazırsın!');
  expect(await page.evaluate(() => (window as any).kameraAcilma)).toBe(1);
  expect(k0.hatalar).toEqual([]);
});

// Hata (bulundu 16 Ekim): kamera açılırken (iPhone izin penceresi açık, yavaş telefon) sıradaki harekete geçilince kamera ikinci kez
// açılıyor, ilk açılan hiç kapanmadan açık kalıyordu. Şimdi aynı açılış beklenir; hareket ekranından çıkınca hepsi kapanır.
test('benzetim: kamera açılırken sıradaki harekete geçilirse kamera ikinci kez açılmaz, çıkınca hiçbir kamera açık kalmaz', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page, { kameraGecikmeMs: 3_000 });
  const k0 = await oyunuAc(page);
  const h = await kameraliHareket(page);
  // Kamera daha açılmadan aynı hareket yeniden başlar (oyundaki "sıradaki hareket" geçişiyle aynı yol).
  await page.evaluate((h) => (window as any).oyun.scene.getScene('Hareket').scene.restart({ durakId: 'istanbul', adim: h.adim }), h);
  await bilgiBekle(page, 'Sen de yap!');
  expect(await page.evaluate(() => (window as any).kameraAcilma)).toBe(1);
  // Açılırken hareket ekranından çıkılırsa da gelen kamera kapanır.
  await page.evaluate((h) => (window as any).oyun.scene.getScene('Hareket').scene.restart({ durakId: 'istanbul', adim: h.adim }), h);
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
    oyun.scene.start('Harita', {});
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).akislar.flatMap((a: MediaStream) => a.getTracks()).filter((t: MediaStreamTrack) => t.readyState === 'live').length), { timeout: 10_000 })
    .toBe(0);
  expect(k0.hatalar).toEqual([]);
});

// Ortak kamera hareketler arasında açık kalır; her hareket ekranı kendi "kamera bitti" dinleyicisini çıkarken kaldırmalı
// (yoksa durak boyunca eski ekranlar bellekte birikir). Hareket 5 kez yeniden başlar: izde en çok 1 dinleyici kalır.
test('benzetim: hareketler arasında açık kalan kamerada eski ekranların dinleyicisi birikmez', async ({ page }) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    const w = window as any;
    w.bittiDinleyici = 0;
    const ekle = MediaStreamTrack.prototype.addEventListener;
    const kaldir = MediaStreamTrack.prototype.removeEventListener;
    MediaStreamTrack.prototype.addEventListener = function (this: MediaStreamTrack, ad: string, ...a: any[]) {
      if (ad === 'ended') w.bittiDinleyici++;
      return (ekle as any).call(this, ad, ...a);
    } as any;
    MediaStreamTrack.prototype.removeEventListener = function (this: MediaStreamTrack, ad: string, ...a: any[]) {
      if (ad === 'ended') w.bittiDinleyici--;
      return (kaldir as any).call(this, ad, ...a);
    } as any;
  });
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  const h = await kameraliHareket(page);
  await bilgiBekle(page, 'Sen de yap!');
  for (let i = 0; i < 5; i++) {
    // Her yeniden başlayışta yeni ekranın kamerası bağlanana kadar beklenir (yeni bir "Sen de yap!" ve dinleyici).
    const once = await page.evaluate((h) => {
      const w = window as any;
      const n = w.kayit.olaylar.length;
      w.oyun.scene.getScene('Hareket').scene.restart({ durakId: 'istanbul', adim: h.adim });
      return n;
    }, h);
    await page.waitForFunction((n) => (window as any).kayit.olaylar.slice(n).some((o: any) => o.tur === 'bilgi' && o.deger === 'Sen de yap!'), once, { timeout: 60_000 });
  }
  expect(await page.evaluate(() => (window as any).kameraAcilma)).toBe(1);
  expect(await page.evaluate(() => (window as any).bittiDinleyici)).toBeLessThanOrEqual(1);
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: kamera açılırken hareket ekranından çıkılırsa, sonradan gelen kamera hemen kapanır', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page, { kameraGecikmeMs: 4_000 });
  const k0 = await oyunuAc(page);
  await kameraliHareket(page);
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
    oyun.scene.start('Harita', {});
  });
  await page.waitForFunction(() => (window as any).kameraAcilma === 1, null, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => (window as any).sahteAkis.getVideoTracks()[0].readyState), { timeout: 3_000 }).toBe('ended');
  expect(k0.hatalar).toEqual([]);
});

for (const [ad, ayar] of [
  ['kamera izni verilmedi', { kameraHatasi: 'NotAllowedError' }],
  ['kamera yok', { kameraHatasi: 'NotFoundError' }],
  ['tanıma modeli yüklenemedi', { modelHatasi: true }],
] as const) {
  test(`benzetim: ${ad} → ayna açılmaz, kutu "Açılamadı", oyun kamerasız sürer; özete "kamera açık" yazılmaz`, async ({ page }) => {
    test.setTimeout(240_000);
    await benzetimKur(page, ayar);
    const k0 = await oyunuAc(page);
    await kameraliHareket(page);
    await expect.poll(() => yaptimVar(page), { timeout: 150_000 }).toBe(true);
    const k = await kayit(page);
    expect(degerler(k, 'bilgi')).not.toContain('Ekranda kendine bak!');
    expect(degerler(k, 'kutu')).toContain('📷 Açılamadı');
    // Model yüklenemediyse açılan kamera hemen kapanır (K38).
    if ('modelHatasi' in ayar) await expect.poll(() => page.evaluate(() => (window as any).sahteAkis?.getVideoTracks()[0].readyState), { timeout: 5_000 }).toBe('ended');
    await page.evaluate(() => {
      const s = (window as any).oyun.scene.getScene('Hareket');
      s.children.list.find((o: any) => (o.list ?? []).some((c: any) => c.text === 'Yaptım!')).emit('pointerdown', { x: 0, y: 0 });
    });
    await expect.poll(() => istatistik(page), { timeout: 10_000 }).toMatchObject({ hareket: 1 });
    expect((await istatistik(page)).kameraAcik ?? 0).toBe(0);
    expect(k0.hatalar).toEqual([]);
  });
}

// Ayna en çok süresi gerçek saatle: oyunun saati (Phaser) yavaş telefonda geri kalsa da uzamaz. Oyun saati 4 kat yavaşlatılır.
for (const [tempo, enCok] of [['Normal', 6_000], ['Sakin', 8_000]] as const) {
  test(`benzetim: ayna en çok ${enCok / 1000} sn (${tempo} tempo), oyunun saati 4 kat yavaşken de gerçek saatle`, async ({ page }) => {
    test.setTimeout(240_000);
    await benzetimKur(page);
    const k0 = await oyunuAc(page, tempo === 'Sakin' ? { 'zipzip-oyun-ayar-v1': JSON.stringify({ yas: 'kucuk' }) } : {});
    await durumYaz(page, { gizli: [SOL_TOPUK, SAG_TOPUK] });
    await page.evaluate(() => {
      const oyun = (window as any).oyun;
      oyun.events.on('prestep', () => oyun.scene.getScenes(true).forEach((s: any) => ((s.time.timeScale = 0.25), (s.tweens.timeScale = 0.25))));
    });
    await kameraliHareket(page);
    await page.waitForFunction(() => (window as any).kayit.aynaSon, null, { timeout: 120_000 });
    const k = await kayit(page);
    expect(k.aynaSon - k.aynaBas).toBeGreaterThan(enCok - 500);
    expect(k.aynaSon - k.aynaBas).toBeLessThan(enCok + 2_000);
    expect(k0.hatalar).toEqual([]);
  });
}

// Sayfa ayna sırasında uzun donarsa (yük, modelin ilk hazırlanışı) donma süresi de sayılır: ayna gerçek saatle en çok 6 sn.
// Eskiden her ölçüme en çok 1,5 sn ekleniyordu; iki 2,5 sn'lik donmada ayna ~8 sn sürüyordu (eski kodda kırmızı).
test('benzetim: ayna sırasında sayfa iki kez 2,5 sn donsa da ayna gerçek saatle ~6 sn', async ({ page }) => {
  test.setTimeout(240_000);
  // Tuvalden gelen sahte görüntü, sayfa donunca "susturuldu" olur ve oyun kamerayı "durdu" sayıp aynayı o yoldan kapatır
  // (gerçek kamera donmada susmaz). Burada sürenin kendisi denendiği için susturma görmezden gelinir; kutu "Durdu" demez.
  await page.addInitScript(() => Object.defineProperty(MediaStreamTrack.prototype, 'muted', { configurable: true, get: () => false }));
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  await durumYaz(page, { gizli: [SOL_TOPUK, SAG_TOPUK] });
  // Donmalar ayna başlamadan sayfanın içinde kurulur: ayna başlayınca 20 ms içinde zamanlanır. Eskiden test aynanın
  // başladığını görüp sonra kuruyordu; yavaş makinede bu gidip gelme gecikince donmalar geç başlıyor, ikinci donma
  // 6 sn'yi aşıp ayna onunla birlikte geç bitiyordu (22 Ekim CI: 7329,8 ms). Gerçek başlangıç/bitiş zamanları da yazılır.
  await page.evaluate(() => {
    const w = window as any;
    w.donmalar = [];
    const don = (ms: number) => {
      const bas = performance.now();
      while (performance.now() < bas + ms);
      w.donmalar.push({ bas, son: performance.now() });
    };
    const bekle = setInterval(() => {
      const bas = w.kayit.aynaBas;
      if (!bas) return;
      clearInterval(bekle);
      setTimeout(() => don(2_500), Math.max(0, bas + 1_000 - performance.now()));
      setTimeout(() => don(2_500), Math.max(0, bas + 3_600 - performance.now()));
    }, 20);
  });
  await kameraliHareket(page);
  await page.waitForFunction(() => (window as any).kayit.aynaSon, null, { timeout: 120_000 });
  const k = await kayit(page);
  const donmalar: { bas: number; son: number }[] = await page.evaluate(() => (window as any).donmalar);
  expect(degerler(k, 'kutu')).not.toContain('📷 Durdu');
  // Kural tests/aynaDonmaKurali.ts'te (sahte kayıtlarla denenir: tests/ayna-donma.test.ts). İki donma da oldu, her biri
  // en az 2,5 sn, sıralı, ayna sürerken; süre ikinci donma sırasında doldu; ayna, ikinci donmanın planlanan (6,1 sn)
  // değil gerçek bitişinden en geç 1 sn sonra kapandı. Yükte testin kendi sayacı 0,5-0,9 sn geç tetikleniyor (23 Ekim
  // ölçümü; eski sabit 7,2 sn sınırını aşan buydu, oyun donma bitince çoğunlukla 3-17 ms içinde kapatıyordu).
  expect(aynaDonmaHatalari({ aynaBas: k.aynaBas, aynaSon: k.aynaSon, donmalar })).toEqual([]);
  expect(k0.hatalar).toEqual([]);
});

// Sayfa gizliyken (arama, kilit) geçen süre aynadan düşülür: telefon gibi Phaser de durur (sayfa gizli görünür).
test('benzetim: ayna sırasında sayfa 4 sn gizli kalırsa o süre sayılmaz', async ({ page }) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    const w = window as any;
    w.sayfaGizli = false;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => w.sayfaGizli });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (w.sayfaGizli ? 'hidden' : 'visible') });
  });
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  await durumYaz(page, { gizli: [SOL_TOPUK, SAG_TOPUK] });
  await kameraliHareket(page);
  await page.waitForFunction(() => (window as any).kayit.aynaBas, null, { timeout: 120_000 });
  await page.evaluate(async () => {
    const w = window as any;
    await new Promise((r) => setTimeout(r, Math.max(0, w.kayit.aynaBas + 1_000 - performance.now())));
    w.sayfaGizli = true;
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 4_000));
    w.sayfaGizli = false;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => (window as any).kayit.aynaSon, null, { timeout: 120_000 });
  const k = await kayit(page);
  expect(k.aynaSon - k.aynaBas).toBeGreaterThan(9_500);
  expect(k.aynaSon - k.aynaBas).toBeLessThan(11_500);
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: hareket ekranından çıkınca kamera kapanır, tanıma durur, görüntü hiçbir yere gitmez', async ({ page }) => {
  test.setTimeout(240_000);
  await benzetimKur(page);
  const k0 = await oyunuAc(page);
  await kameraliHareket(page);
  await bilgiBekle(page, 'Sen de yap!');
  expect(await page.evaluate(() => (window as any).sahteAkis.getVideoTracks()[0].readyState)).toBe('live');
  // ⌂ ile haritaya dönülür.
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
    oyun.scene.start('Harita', {});
  });
  await expect.poll(() => page.evaluate(() => (window as any).sahteAkis.getVideoTracks()[0].readyState), { timeout: 5_000 }).toBe('ended');
  const once = await page.evaluate(() => (window as any).benzetim.tanima);
  await page.waitForTimeout(1_500);
  expect(await page.evaluate(() => (window as any).benzetim.tanima)).toBe(once);
  // Sayfada canlı görüntü taşıyan video kalmadı; cihaz kaydında görüntü (data:/base64) yok; dış sunucuya istek yok.
  expect(await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => v.srcObject).length)).toBe(0);
  const depo = await page.evaluate(() => Object.entries(localStorage).map(([a, d]) => `${a}=${d}`).join('\n'));
  expect(depo).not.toMatch(/data:|base64|image/);
  expect(depo.length).toBeLessThan(5_000);
  expect(k0.disIstekler).toEqual([]);
  expect(k0.hatalar).toEqual([]);
});

// Benzetim sadece geliştirme sunucusunda: yayın paketinde (vite build) iz yok. Derleme yoksa (yerelde `vite build` yapılmadıysa) atlanmaz, hata verir.
test('benzetim yayın paketine girmez', () => {
  const dosyalar = fs.readdirSync('dist/assets').filter((d) => d.endsWith('.js'));
  expect(dosyalar.length).toBeGreaterThan(0);
  for (const d of dosyalar) expect(fs.readFileSync(`dist/assets/${d}`, 'utf8'), d).not.toContain('zipzipBenzetim');
});

// Zıplama denemesi (ZiplaDenemeScene), kameralı yol: çocuk zıplıyor (benzetim). Sayfa donunca ya da gizlenince
// (T3, T7, T10; 18 Ekim) zıplamalar birikip bir anda gelmez, ritim yolu açık kalmaz, kamera saymayı sürdürür.
async function kameraliZipla(page: Page) {
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop());
    oyun.scene.start('ZiplaDeneme', {});
  });
  await page.waitForTimeout(700);
  const r = (await page.locator('canvas').boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + (r.height * 925) / 1280); // 📷 Kamerayla zıpla
  await page.waitForFunction(() => (window as any).oyun.scene.getScene('ZiplaDeneme').kameraZiplamasi >= 2, null, { timeout: 120_000 });
}
const ziplaDurum = (page: Page) =>
  page.evaluate(() => {
    const s = (window as any).oyun.scene.getScene('ZiplaDeneme');
    return { toplam: s.ziplamaSayisi as number, kamera: s.kameraZiplamasi as number, ritim: !!s.ritim, durum: s.kamera?.durum as string };
  });

test('benzetim: Zıpzıp da zıplasın (kamerayla): sayfa iki kez 2,5 sn donsa da zıplamalar bir anda gelmez, ritim açık kalmaz', async ({ page }) => {
  test.setTimeout(240_000);
  // Ayna testindeki gibi: sahte tuval görüntüsü donmada "susturuldu" olur (gerçek kamera için 🔎); burada donmanın kendisi denenir.
  await page.addInitScript(() => Object.defineProperty(MediaStreamTrack.prototype, 'muted', { configurable: true, get: () => false }));
  await benzetimKur(page);
  const k0 = await oyunuAc(page, { 'zipzip-beta-dunya': '1' });
  await durumYaz(page, { hareket: 'zipla' });
  await kameraliZipla(page);
  const artislar = await page.evaluate(async () => {
    const s = (window as any).oyun.scene.getScene('ZiplaDeneme');
    const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const sonuc: number[] = [];
    for (let i = 0; i < 2; i++) {
      const once = s.ziplamaSayisi;
      const bit = performance.now() + 2_500;
      while (performance.now() < bit);
      await bekle(300);
      sonuc.push(s.ziplamaSayisi - once);
      await bekle(1_500);
    }
    return sonuc;
  });
  for (const a of artislar) expect(a).toBeLessThanOrEqual(1);
  const sonra = await ziplaDurum(page);
  // Yüklü makinede sahte model saniyede ~2 kez çalışır, benzetimin zıplamalarının çoğunu kaçırır: bekleme uzun.
  await expect.poll(async () => (await ziplaDurum(page)).kamera, { timeout: 90_000 }).toBeGreaterThan(sonra.kamera);
  await expect.poll(async () => { const d = await ziplaDurum(page); return [d.durum, d.ritim]; }, { timeout: 30_000 }).toEqual(['goruyorum', false]);
  expect(k0.hatalar).toEqual([]);
});

test('benzetim: Zıpzıp da zıplasın (kamerayla): sayfa 4 sn gizliyken zıplama sayılmaz, dönünce kamera yine sayar', async ({ page }) => {
  test.setTimeout(240_000);
  // Telefon gibi: gizliyken kare çizilmez (oyunun saati ve kamera döngüsü durur).
  await page.addInitScript(() => {
    const w = window as any;
    w.sayfaGizli = false;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => w.sayfaGizli });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (w.sayfaGizli ? 'hidden' : 'visible') });
    const kare = window.requestAnimationFrame.bind(window);
    let bekleyen: FrameRequestCallback[] = [];
    window.requestAnimationFrame = (f) => kare((t) => (w.sayfaGizli ? bekleyen.push(f) : f(t)));
    w.sayfayiGizle = (gizli: boolean) => {
      w.sayfaGizli = gizli;
      document.dispatchEvent(new Event('visibilitychange'));
      if (!gizli) {
        bekleyen.forEach((f) => kare(f));
        bekleyen = [];
      }
    };
  });
  await benzetimKur(page);
  const k0 = await oyunuAc(page, { 'zipzip-beta-dunya': '1' });
  await durumYaz(page, { hareket: 'zipla' });
  await kameraliZipla(page);
  const gizliyken = await page.evaluate(() => {
    (window as any).sayfayiGizle(true);
    const s = (window as any).oyun.scene.getScene('ZiplaDeneme');
    return { toplam: s.ziplamaSayisi, kamera: s.kameraZiplamasi };
  });
  await page.waitForTimeout(4000);
  const d1 = await ziplaDurum(page);
  expect({ toplam: d1.toplam, kamera: d1.kamera }).toEqual(gizliyken);
  await page.evaluate(() => (window as any).sayfayiGizle(false));
  await page.waitForTimeout(300);
  expect((await ziplaDurum(page)).toplam - gizliyken.toplam).toBeLessThanOrEqual(1);
  await expect.poll(async () => (await ziplaDurum(page)).kamera, { timeout: 90_000 }).toBeGreaterThan(gizliyken.kamera + 1);
  await expect.poll(async () => { const d = await ziplaDurum(page); return [d.durum, d.ritim]; }, { timeout: 30_000 }).toEqual(['goruyorum', false]);
  expect(k0.hatalar).toEqual([]);
});

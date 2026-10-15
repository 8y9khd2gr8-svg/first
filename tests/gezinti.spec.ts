import { expect, Page, test } from '@playwright/test';

// Gerçek çocuk gibi gezinme (K25): düğmelere fareyle, nesnenin ekrandaki yerine dokunulur (olay elle tetiklenmez).
// Böylece bir düğmenin üstünü örten nesne, yanlış dokunma alanı ya da ikinci kez çalışmayan düğme yakalanır.
// Ana yollar en az iki kez dolaşılır (⌂ ile dönüp yeniden girince de çalışmalı). Beta adresiyle (çocuğun gördüğü hâl).

type Kayit = { hatalar: string[]; disIstekler: string[] };

async function oyunuAc(page: Page): Promise<Kayit> {
  const kayit: Kayit = { hatalar: [], disIstekler: [] };
  page.on('pageerror', (e) => kayit.hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && kayit.hatalar.push(m.text()));
  page.on('request', (r) => {
    const adres = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(adres.hostname) && !['data:', 'blob:'].includes(adres.protocol)) kayit.disIstekler.push(r.url());
  });
  // GEZINTI_YAVAS=4: işlemci 4 kat yavaş (CI gibi yavaş makineyi yerelde denemek için).
  if (process.env.GEZINTI_YAVAS) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.GEZINTI_YAVAS) });
  }
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
    localStorage.setItem('zipzip-pasaport-v1', JSON.stringify({ ad: '', soruldu: true }));
    localStorage.setItem('zipzip-uzaktan-v1', '1');
  });
  await page.reload();
  await page.waitForFunction(() => (window as any).oyun?.scene?.isActive('Acilis'));
  // Oyunun saati hızlı akar (bekleme kısalır, akış aynı).
  await page.evaluate(() => {
    const oyun = (window as any).oyun;
    oyun.events.on('prestep', () =>
      oyun.scene.getScenes(true).forEach((s: any) => {
        s.time.timeScale = 6;
        s.tweens.timeScale = 6;
      }),
    );
  });
  return kayit;
}

// Açık sahnede (üstteki sahneden başlayarak) yazısı `metin`i içeren dokunulabilir nesneyi bulur ve ekrandaki yerini verir.
async function yerBul(page: Page, metin: string, tam = false, enCok = 15_000): Promise<{ x: number; y: number; sahne: string }> {
  const h = await page.waitForFunction(
    ([metin, tam]) => {
      const oyun = (window as any).oyun;
      const r = (oyun.canvas as HTMLCanvasElement).getBoundingClientRect();
      const k = r.width / oyun.scale.gameSize.width;
      const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
      const sahneler = oyun.scene.getScenes(true).reverse();
      for (const s of sahneler) {
        // Haritaya uzaydan iniş bitmeden dokunulmaz (inişteki dokunuş inişi atlar; yavaş makinede iniş uzun sürer).
        if (s.harita && (s.harita.scale !== 1 || s.harita.alpha < 1)) return false;
        let bulunan: any = null;
        const gez = (o: any) => {
          if (bulunan || o.visible === false) return;
          if (o.input?.enabled && (tam ? yazi(o).trim() === metin : yazi(o).includes(metin))) bulunan = o;
          else (o.list ?? []).forEach(gez);
        };
        s.children.list.forEach(gez);
        if (!bulunan) continue;
        const m = bulunan.getWorldTransformMatrix();
        let sabit = false;
        for (let o = bulunan; o; o = o.parentContainer) if (o.scrollFactorX === 0) sabit = true;
        const kam = s.cameras.main;
        const p0 = kam.getWorldPoint(0, 0);
        const p1 = kam.getWorldPoint(100, 100);
        const sx = sabit ? m.tx : ((m.tx - p0.x) * 100) / (p1.x - p0.x);
        const sy = sabit ? m.ty : ((m.ty - p0.y) * 100) / (p1.y - p0.y);
        return { x: r.left + sx * k, y: r.top + sy * k, sahne: s.scene.key };
      }
      return false;
    },
    [metin, tam] as const,
    { timeout: enCok, polling: 100 },
  );
  return (await h.jsonValue()) as { x: number; y: number; sahne: string };
}

// yerBul, bulamazsa neyi aradığını ve ekranda ne olduğunu söyler.
async function yerBulYa(page: Page, metin: string, tam = false) {
  return yerBul(page, metin, tam).catch(async () => {
    const acik = await page.evaluate(() => {
      const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
      return (window as any).oyun.scene.getScenes(true).map((s: any) => `${s.scene.key}: ${s.children.list.map(yazi).join(' ').replace(/\s+/g, ' ').slice(0, 200)}`).join(' | ');
    });
    throw new Error(`"${metin}" bulunamadı; ekranda: ${acik}`);
  });
}

async function dokun(page: Page, metin: string, sonraSahne: string, tam = false) {
  // Yer yarım saniye aynı kalana kadar bekle (iniş gibi animasyon arası boşluklarda kayan düğmeye dokunulmasın).
  let yer = await yerBulYa(page, metin, tam);
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500);
    const yeni = await yerBul(page, metin, tam);
    const ayni = Math.abs(yeni.x - yer.x) < 1 && Math.abs(yeni.y - yer.y) < 1;
    yer = yeni;
    if (ayni) break;
  }
  // Hata olursa dokunuşun neye geldiği yazılsın.
  await page.evaluate((ad) => {
    const w = window as any;
    w.dokunmaLog = [];
    const s = w.oyun.scene.getScene(ad);
    s.input.once('pointerdown', (p: any, o: any[]) => w.dokunmaLog.push(`${Math.round(p.x)},${Math.round(p.y)} ${o.map((x: any) => `${x.type}:${x.text ?? ''}`).join('/')} fps=${Math.round(w.oyun.loop.actualFps)}`));
  }, yer.sahne);
  await page.mouse.click(yer.x, yer.y);
  if (process.env.GEZINTI_RESIM) await page.screenshot({ path: `test-results/dokun-${metin.replace(/\W/g, '_')}.png` });
  await page
    .waitForFunction((ad) => (window as any).oyun.scene.isActive(ad), sonraSahne, { timeout: 15_000 })
    .catch(async () => {
      const acik = await page.evaluate(() => (window as any).oyun.scene.getScenes(true).map((s: any) => s.scene.key).join(',') + ' log=' + (window as any).dokunmaLog.join(';'));
      throw new Error(`"${metin}" (${yer.sahne}, ${Math.round(yer.x)},${Math.round(yer.y)}) dokununca ${sonraSahne} açılmadı; açık: ${acik}`);
    });
}

// Ödül ekranında rozet/kostüm kutlaması çıkarsa çocuk gibi "Harika! ✓" ya da "Sonra"ya dokunur (perde alttaki düğmeleri örter).
// Kutlanmayı bekleyen rozet/kostüm kalmayana kadar sürer (kutlamalar damgadan sonra sırayla gelir; yavaş makinede geç).
async function kutlamalariGec(page: Page) {
  // Rozet/kostüm modülleri bir kez yüklenir: waitForFunction async kontrolü beklemez (söz döner, hemen "doğru" sayılır).
  await page.evaluate(async () => {
    const w = window as any;
    w.yeniRozetler = (await import('/src/rozetler.ts')).yeniRozetler;
    w.yeniKostumler = (await import('/src/kostumler.ts')).yeniKostumler;
  });
  for (let i = 0; i < 20; i++) {
    const durum = await page.waitForFunction(
      () => {
        const w = window as any;
        const s = w.oyun.scene.getScene('Odul');
        const yazi = (o: any): string => (o.type === 'Text' ? o.text : (o.list ?? []).map(yazi).join(' '));
        if (s.kutlamaKatmani?.list.length) return yazi(s.kutlamaKatmani).includes('Sonra') ? 'Sonra' : 'Harika! ✓';
        return w.yeniRozetler().length || w.yeniKostumler().length ? false : 'bitti';
      },
      null,
      { timeout: 30_000, polling: 200 },
    );
    const metin = await durum.jsonValue();
    if (metin === 'bitti') return;
    const yer = await yerBulYa(page, metin as string, true);
    await page.mouse.click(yer.x, yer.y);
    await page.waitForTimeout(300);
  }
  throw new Error('kutlamalar bitmedi');
}

const bekle = (page: Page, ad: string, enCok = 60_000) =>
  page.waitForFunction((ad) => (window as any).oyun.scene.isActive(ad), ad, { timeout: enCok });

test('gerçek dokunuşla: Oyna → Türkiye → durak → ödül → ⌂ → ⌂, iki tur', async ({ page }) => {
  test.setTimeout(240_000);
  const kayit = await oyunuAc(page);
  for (const durak of ['İstanbul', 'Çanakkale']) { // haritada durağın yeri yazar (Truva → Çanakkale)
    await dokun(page, 'Oyna', 'Macera');
    await dokun(page, 'Türkiye', 'Harita');
    await dokun(page, durak, 'Durak');
    await dokun(page, 'Başla', 'Hareket');
    // Uzaktan oyna açık: hareketler kendiliğinden geçer, sonunda ödül ekranı.
    await bekle(page, 'Odul', 180_000);
    await kutlamalariGec(page);
    await dokun(page, 'Haritaya dön', 'Harita');
    await dokun(page, '🏠', 'Macera');
    await dokun(page, '🏠', 'Acilis');
  }
  const biten = await page.evaluate(() => JSON.parse(localStorage.getItem('zipzip-ilerleme-v1') ?? '[]'));
  expect(biten).toEqual(expect.arrayContaining(['istanbul', 'truva']));
  expect(kayit.hatalar).toEqual([]);
  expect(kayit.disIstekler).toEqual([]);
});

test('gerçek dokunuşla: Ailece iki kez, 🔒 Ebeveyn iki kez gir/çık', async ({ page }) => {
  test.setTimeout(240_000);
  const kayit = await oyunuAc(page);
  await dokun(page, 'Oyna', 'Macera');
  for (let i = 0; i < 2; i++) {
    await dokun(page, 'Ailece', 'Hareket');
    await bekle(page, 'Odul', 180_000);
    await kutlamalariGec(page);
    await dokun(page, 'Maceraya dön', 'Macera');
  }
  for (let i = 0; i < 2; i++) {
    await dokun(page, 'Ebeveyn', 'Ebeveyn');
    // Çarpma sorusu: ekrandaki soruyu okuyup doğru cevaba dokunur.
    const cevap = await page.evaluate(() => {
      const t = (window as any).oyun.scene.getScene('Ebeveyn').children.list.find((c: any) => c.type === 'Text' && / × /.test(c.text));
      const [a, b] = t.text.match(/\d+/g).map(Number);
      return a * b;
    });
    await dokun(page, String(cevap), 'EbeveynMenu', true);
    await dokun(page, '🏠', 'Macera');
  }
  await dokun(page, '🏠', 'Acilis');
  await dokun(page, 'Oyna', 'Macera');
  expect(kayit.hatalar).toEqual([]);
  expect(kayit.disIstekler).toEqual([]);
});

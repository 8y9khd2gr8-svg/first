import { Page, test } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

// GEÇİCİ deneme turu: her ekranı farklı durumlarla açar, taşma/çakışma/küçük düğme ölçer, ekran görüntüsü alır.

const DIZIN = process.env.TUR_DIZIN ?? 'test-results/tur';

async function oyunuAc(page: Page, depo: Record<string, string>) {
  const hatalar: string[] = [];
  page.on('pageerror', (e) => hatalar.push(e.message));
  page.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  await page.goto('/');
  await page.evaluate((depo) => {
    localStorage.clear();
    localStorage.setItem('zipzip-guvenlik-notu-v1', '1');
    for (const [k, v] of Object.entries(depo)) localStorage.setItem(k, v);
  }, depo);
  await page.reload();
  await page.waitForFunction(() => (window as any).oyun?.scene?.getScenes(true).length > 0);
  return hatalar;
}

async function olc(page: Page) {
  return page.evaluate(() => {
    const oyun = (window as any).oyun;
    const sorunlar: string[] = [];
    const yazilar: { t: string; r: any }[] = [];
    for (const s of oyun.scene.getScenes(true)) {
      const gez = (o: any, gorunur: boolean) => {
        const g = gorunur && o.visible !== false && o.alpha !== 0;
        if (!g) return;
        if (o.type === 'Container') return o.list.forEach((c: any) => gez(c, g));
        if (o.type === 'Text' && o.text?.trim()) {
          const r = o.getBounds();
          const t = o.text.replace(/\n/g, '⏎').slice(0, 50);
          if (r.left < -1 || r.right > 721 || r.top < -1 || r.bottom > 1281) sorunlar.push(`TAŞMA [${s.scene.key}] "${t}" x:${r.left | 0}-${r.right | 0} y:${r.top | 0}-${r.bottom | 0}`);
          yazilar.push({ t: `[${s.scene.key}] "${t}"`, r });
        }
        if (o.input?.enabled && o.input.hitArea) {
          const ha = o.input.hitArea;
          const w = (ha.width ?? ha.radius * 2) * Math.abs(o.scaleX ?? 1) * (o.parentContainer?.scaleX ?? 1);
          const h = (ha.height ?? ha.radius * 2) * Math.abs(o.scaleY ?? 1) * (o.parentContainer?.scaleY ?? 1);
          if (Math.min(w, h) < 80) {
            const etiket = o.text ?? o.parentContainer?.list?.find((c: any) => c.type === 'Text')?.text ?? o.type;
            sorunlar.push(`KÜÇÜK DÜĞME [${s.scene.key}] "${String(etiket).slice(0, 30)}" ${w | 0}x${h | 0}`);
          }
        }
      };
      s.children.list.forEach((c: any) => gez(c, true));
    }
    for (let i = 0; i < yazilar.length; i++)
      for (let j = i + 1; j < yazilar.length; j++) {
        const a = yazilar[i].r, b = yazilar[j].r;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 6 && oy > 6) sorunlar.push(`ÇAKIŞMA ${yazilar[i].t} ↔ ${yazilar[j].t} (${ox | 0}x${oy | 0})`);
      }
    return sorunlar;
  });
}

async function sahneAc(page: Page, ad: string, veri: object, bekle = 900) {
  await page.evaluate(() => (window as any).oyun.scene.getScenes(true).forEach((s: any) => s.scene.stop()));
  await page.waitForTimeout(100);
  await page.evaluate(([ad, veri]) => (window as any).oyun.scene.start(ad, veri), [ad, veri] as const);
  await page.waitForTimeout(bekle);
}

test('deneme turu', async ({ page }) => {
  test.setTimeout(1_200_000);
  mkdirSync(DIZIN, { recursive: true });
  const rapor: string[] = [];
  await oyunuAc(page, {});
  const ids: Record<string, string[]> = await page.evaluate(async () => {
    const { BOLUMLER } = await import('/src/duraklar.ts');
    return Object.fromEntries(Object.entries(BOLUMLER).map(([k, b]: any) => [k, b.duraklar.map((d: any) => d.id)]));
  });
  const hepsi = Object.values(ids).flat();
  const durumlar: [string, Record<string, string>][] = ([
    ['yeni', {}],
    ['yarim', { 'zipzip-beta-dunya': '1', 'zipzip-ilerleme-v1': JSON.stringify([...ids.turkiye, ...ids.dunya.slice(0, 3)]), 'zipzip-pasaport-v1': JSON.stringify({ ad: 'Yağız', avatar: '🦊', soruldu: true }) }],
    ['bitti', { 'zipzip-beta-dunya': '1', 'zipzip-ilerleme-v1': JSON.stringify(hepsi), 'zipzip-pasaport-v1': JSON.stringify({ ad: 'Muhammed Mustafa', avatar: '🐼', soruldu: true }) }],
  ] as [string, Record<string, string>][]).filter(([d]) => !process.env.TUR || d === 'yarim');
  for (const [durum, depo] of durumlar) {
    const hatalar = await oyunuAc(page, depo);
    const sahneler: [string, object][] = [
      ['Acilis', {}], ['Macera', {}], ['Harita', {}], ['Dunya', {}], ['Uzay', {}], ['Spor', {}], ['Dinozor', {}], ['Evde', {}],
      ['Pasaport', {}], ...Object.keys(ids).map((b) => ['Pasaport', { sayfa: b }] as [string, object]),
      ['Rozet', {}], ['Rozet', { sayfa: 1 }], ['Rozet', { sayfa: 2 }], ['Kostum', {}], ['Avatar', {}], ['Kurulum', {}], ['Guvenlik', {}],
      ['Ebeveyn', { hedef: 'EbeveynMenu' }], ['EbeveynMenu', {}], ['EbeveynOzet', {}], ['PasaportAyar', {}],
      ...Object.keys(ids).map((b) => ['Sertifika', { bolum: b }] as [string, object]),
    ];
    for (const [ad, veri] of process.env.TUR ? [] : sahneler) {
      await sahneAc(page, ad, veri, ['Macera', 'Harita', 'Dunya', 'Uzay'].includes(ad) ? 2500 : 900);
      const ek = JSON.stringify(veri).replace(/[^a-z0-9]/gi, '');
      await page.screenshot({ path: `${DIZIN}/${durum}-${ad}${ek}.png` });
      for (const s of await olc(page)) rapor.push(`${durum} ${ad}${ek}: ${s}`);
    }
    if (durum === 'yarim') {
      for (const id of hepsi) {
        for (const [ad, veri] of (process.env.TUR ? [] : [['Durak', { durakId: id }], ['Odul', { durakId: id }]]) as [string, object][]) {
          await sahneAc(page, ad, veri, ad === 'Odul' ? 3200 : 1200);
          await page.screenshot({ path: `${DIZIN}/durak-${id}-${ad}.png` });
          for (const s of await olc(page)) rapor.push(`${id} ${ad}: ${s}`);
        }
        const adimSayisi: number = await page.evaluate(async (id) => (await import('/src/duraklar.ts')).oturum((await import('/src/duraklar.ts')).durakBul(id)).length, id);
        for (let adim = 0; adim < adimSayisi; adim++) {
          await sahneAc(page, 'Hareket', { durakId: id, adim }, 1500);
          await page.screenshot({ path: `${DIZIN}/hareket-${id}-${adim}.png` });
          for (const s of await olc(page)) rapor.push(`${id} Hareket${adim}: ${s}`);
        }
      }
    }
    for (const h of hatalar) rapor.push(`${durum}: HATA ${h}`);
  }
  writeFileSync(`${DIZIN}/rapor.txt`, [...new Set(rapor)].join('\n'));
});

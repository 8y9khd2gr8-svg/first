import { expect, test } from '@playwright/test';

// Derlenmiş oyun bir kez açıldıktan sonra internet olmadan da açılmalı (PWA: dosyalar telefona kaydedilir).
test('oyun internetsiz açılır', async ({ page, context }) => {
  const hatalar: string[] = [];
  page.on('pageerror', (e) => hatalar.push(e.message));
  await page.goto('http://localhost:5198/');
  // Hizmet çalışanı (service worker) dosyaları kaydedip sayfayı devralana kadar bekle.
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated', null, { timeout: 30_000 });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });

  await context.setOffline(true);
  await page.reload();
  // Oyun tuvali çizildi mi? (Phaser canvas'ı sayfada ve boyutlu)
  await expect(page.locator('#oyun canvas')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1500);
  expect(hatalar).toEqual([]);
  await context.setOffline(false);
});

// Yavaş internet ve ucuz telefon için: ilk açılışta indirilen dosyalar (PWA önbelleği) küçük kalsın.
// Kamera modeli (~24 MB) önbelleğe girmez; sadece ebeveyn kamerayı açınca iner.
// Ölçüm (10 Ekim 2026): önbellek ~2.5 MB, ana dosya ~460 KB (sıkıştırılmış); 4 kat yavaş işlemci + yavaş
// internette oyun ~2.6 sn'de açılıyor.
test('ilk açılışta indirilenler küçük kalır (kamera modeli hariç)', async () => {
  const fs = await import('fs');
  const zlib = await import('zlib');
  const sw = fs.readFileSync('dist/sw.js', 'utf8');
  const adresler = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
  expect(adresler.length).toBeGreaterThan(5);
  expect(adresler.filter((a) => a.includes('mediapipe'))).toEqual([]);
  const toplam = adresler.reduce((t, a) => t + fs.statSync(`dist/${a}`).size, 0);
  expect(toplam).toBeLessThan(3.5 * 1024 * 1024);
  const ana = adresler.find((a) => /assets\/index-.*\.js$/.test(a))!;
  expect(zlib.gzipSync(fs.readFileSync(`dist/${ana}`)).length).toBeLessThan(600 * 1024);
});

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

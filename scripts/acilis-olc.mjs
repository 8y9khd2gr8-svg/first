// Açılış hızı ölçümü: derlenmiş oyunu (npm run build) yavaş telefon gibi davranan tarayıcıda açar ve
// "Oyna" düğmesinin kaç milisaniyede göründüğünü ölçer (AcilisScene'deki 'acilis-hazir' işareti).
// Kullanım: npm run build && npx vite preview --port 5198 & node scripts/acilis-olc.mjs [yavaşlatma=6]
// 6 kat yavaşlatma, eski/ucuz bir Android telefona yakın sayılır.
import { chromium } from '@playwright/test';

const yavaslatma = Number(process.argv[2] ?? 6);
const hazirChromium = process.env.PLAYWRIGHT_BROWSERS_PATH === '/opt/pw-browsers' ? '/opt/pw-browsers/chromium' : undefined;
const tarayici = await chromium.launch(hazirChromium ? { executablePath: hazirChromium } : {});
const sureler = [];
for (let i = 0; i < 5; i++) {
  const baglam = await tarayici.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: 'block' });
  const sayfa = await baglam.newPage();
  const cdp = await baglam.newCDPSession(sayfa);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: yavaslatma });
  await sayfa.goto('http://localhost:5198/');
  await sayfa.waitForFunction(() => performance.getEntriesByName('acilis-hazir').length > 0, null, { timeout: 60_000, polling: 100 });
  sureler.push(Math.round(await sayfa.evaluate(() => performance.getEntriesByName('acilis-hazir')[0].startTime)));
  await baglam.close();
}
sureler.sort((a, b) => a - b);
console.log(`${yavaslatma}x yavaş: "Oyna" düğmesi ${sureler[2]} ms'de göründü (ortanca; hepsi: ${sureler.join(', ')})`);
await tarayici.close();

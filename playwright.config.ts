import { defineConfig } from '@playwright/test';

// Tarayıcıda oyun testleri (tests/*.spec.ts). Geliştirme sunucusunu kendisi açar.
// Bulut/CI ortamında hazır Chromium varsa onu kullanır.
const hazirChromium = process.env.PLAYWRIGHT_BROWSERS_PATH === '/opt/pw-browsers' ? '/opt/pw-browsers/chromium' : undefined;

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.ts',
  timeout: 60_000,
  // Dosyalar ayrı işçilerde aynı anda koşar (butun-duraklar uzun sürer); bir dosyanın testleri kendi içinde sırayla.
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5199/',
    viewport: { width: 360, height: 640 },
    launchOptions: hazirChromium ? { executablePath: hazirChromium } : {},
  },
  webServer: [
    { command: 'npx vite --port 5199 --strictPort', url: 'http://localhost:5199/', reuseExistingServer: !process.env.CI, timeout: 60_000 },
    // İnternetsiz çalışma testi için derlenmiş sürüm (önce `vite build` gerekir; npm run test:oyun yapar).
    { command: 'npx vite preview --port 5198 --strictPort', url: 'http://localhost:5198/', reuseExistingServer: !process.env.CI, timeout: 60_000 },
  ],
});

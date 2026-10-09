import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // './' sayesinde oyun GitHub Pages'te alt klasörde (/first/) de çalışır.
  base: './',
  // Oyun motoru (Phaser) tek başına büyük bir dosya; bu uyarı beklenen bir durum.
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    // Telefona uygulama gibi kurulum ve internetsiz çalışma: ilk açılışta bütün dosyalar
    // telefona kaydedilir; yeni sürüm yayınlanınca bir sonraki açılışta kendiliğinden güncellenir.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ikon/*.png', 'ses/*.mp3'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Zıp Zıp Dünya',
        short_name: 'Zıp Zıp',
        description: '4-9 yaş çocuklar için reklamsız, Türkçe hareket ve keşif oyunu.',
        lang: 'tr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#14213D',
        theme_color: '#14213D',
        icons: [
          { src: 'ikon/ikon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'ikon/ikon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'ikon/ikon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});

import { defineConfig } from 'vite';

// './' sayesinde oyun GitHub Pages'te alt klasörde (/first/) de çalışır.
export default defineConfig({
  base: './',
  // Oyun motoru (Phaser) tek başına büyük bir dosya; bu uyarı beklenen bir durum.
  build: { chunkSizeWarningLimit: 2000 },
});

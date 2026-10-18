import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import paket from './package.json' with { type: 'json' };

// Phaser'ın derleme ayarları (Phaser kendi paketini bu değerlerle derler): kaynak dosyalardaki
// "typeof WEBGL_RENDERER" gibi soruların cevabı.
const PHASER_AYARLARI: Record<string, boolean> = {
  CANVAS_RENDERER: true,
  WEBGL_RENDERER: true,
  WEBGL_DEBUG: false,
  EXPERIMENTAL: false,
  PLUGIN_3D: false,
  PLUGIN_CAMERA3D: false,
  PLUGIN_FBINSTANT: false,
  FEATURE_SOUND: true,
};
const phaserAyarlari = (): Plugin => ({
  name: 'phaser-ayarlari',
  enforce: 'pre',
  transform(kod, kimlik) {
    if (!kimlik.includes('/phaser/src/')) return null;
    return kod.replace(/typeof (CANVAS_RENDERER|WEBGL_RENDERER|WEBGL_DEBUG|EXPERIMENTAL|PLUGIN_3D|PLUGIN_CAMERA3D|PLUGIN_FBINSTANT|FEATURE_SOUND)\b/g, (_, ad: string) => String(PHASER_AYARLARI[ad]));
  },
});

// Tarayıcı güvenlik kuralı (CSP, K47): "oyun hiçbir dış sunucuya bağlanmaz" sözünü testlerin yanında tarayıcı da zorlar.
// Sadece derlemede (test sitesi ve mağaza paketi); geliştirme sunucusu kuralsız kalır (ZIPZIP_CSP=1 ile açılır, aşağıda).
// - script-src: sadece oyunun kendi dosyaları; 'wasm-unsafe-eval' kamera tanıma modelinin (MediaPipe, WebAssembly) çalışması için
//   (JavaScript eval'ine izin vermez). Satır içi betik yok.
// - style-src 'unsafe-inline': index.html'deki <style> ve ebeveyn köşesi bağlantılarındaki style="..." (betik değil, yazı biçimi).
// - img-src data: blob:: Phaser'ın kendi küçük resimleri, çocuğun fotoğrafı (cihazda), sertifika resmi.
// - connect-src 'self': ses kayıtları ve kamera modeli oyunun içinden; başka hiçbir adrese istek gidemez.
// - object-src/form-action 'none', base-uri 'self'. frame-ancestors <meta> ile verilemez (tarayıcı uyarı yazar), konmadı.
// Telefonun konuşma motoru, ödeme, ekran açık tutma Capacitor köprüsüyle çalışır (ağ isteği değil); iPhone'da köprü
// WKUserScript, yeni Android'de belge başı betiğiyle gelir, kurala takılmaz. 🔎 Gerçek telefonda denenecek (docs/KAYIT.md K47).
const GUVENLIK_KURALI = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');
const guvenlikKurali = (): Plugin => ({
  name: 'guvenlik-kurali',
  // ZIPZIP_CSP=1: bütün oyun testleri kuralla birlikte geliştirme sunucusunda da koşturulabilsin (kural bir şeyi engellerse
  // tarayıcı hata yazar, testler kırmızı olur).
  apply: (_, { command }) => command === 'build' || process.env.ZIPZIP_CSP === '1',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: GUVENLIK_KURALI }, injectTo: 'head-prepend' }],
});

export default defineConfig(({ command }) => ({
  // './' sayesinde oyun GitHub Pages'te alt klasörde (/first/) de çalışır.
  base: './',
  // Sürüm numarası (package.json'dan) ebeveyn köşesinde görünür; geri bildirimde hangi sürüm olduğu anlaşılır.
  define: { __SURUM__: JSON.stringify(paket.version) },
  // Oyun motoru (Phaser) tek başına büyük bir dosya; bu uyarı beklenen bir durum.
  build: { chunkSizeWarningLimit: 2000, commonjsOptions: { include: [/node_modules/, /phaser(Hafif|Nesneleri)\.cjs$/] } },
  // Derlemede Phaser'ın hafif hâli (src/phaserHafif.cjs; kullanılmayan fizik motorları yok).
  // Geliştirmede (npm run dev) tam Phaser kalır: hızlı açılır, davranış aynıdır.
  resolve: command === 'build' ? { alias: [{ find: /^phaser$/, replacement: fileURLToPath(new URL('./src/phaserHafif.cjs', import.meta.url)) }] } : {},
  plugins: [
    phaserAyarlari(),
    guvenlikKurali(),
    // Telefona uygulama gibi kurulum ve internetsiz çalışma: ilk açılışta bütün dosyalar
    // telefona kaydedilir; yeni sürüm yayınlanınca bir sonraki açılışta kendiliğinden güncellenir.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ikon/*.png', 'ses/*.mp3'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Kamera modelinin büyük dosyaları baştan indirilmez; kamera ilk açıldığında
        // indirilip telefona kaydedilir, sonra internetsiz de çalışır.
        globIgnores: ['mediapipe/**'],
        runtimeCaching: [{ urlPattern: /\/mediapipe\//, handler: 'CacheFirst', options: { cacheName: 'kamera-modeli' } }],
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
}));

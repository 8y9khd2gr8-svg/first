# Zıp Zıp Dünya — Görsel Durum ve Envanter

**Tarih:** 12 Ekim 2026 · `main` @ `fe37906`
Ekran görüntüleri (720×1280, telefon dikey) tek sayfada: `ekran-kolaji.jpg`. Aşağıdaki tek tek dosyalar 12 Ekim ChatGPT paketindeydi, depoya konmadı (boyut).
Görüntüler tarayıcıda (Chromium) alındı; telefonda yazı tipi ve renkler çok küçük farklarla görünebilir. Oyun durumu: Türkiye Turu'nda 3 durak bitmiş, çocuk adı "Yağız", karakter 🐼, beta için bütün bölümler açık.

## 1. Ekran görüntüleri

| Dosya | Ekran | Ne görülüyor |
|---|---|---|
| 01-guvenlik-notu.png | Güvenlik notu (ilk açılış, ebeveyn için) | 6 madde, ebeveyn köşesinin yeri, "Anladım" |
| 02-acilis.png | Açılış | Logo, Zıpzıp, "Oyna" |
| 03-buyuk-macera.png | Büyük Macera | 7 bölüm kıvrımlı yolda, "İstanbul'un 7 Tepesi – Yakında", Ailece |
| 04-harita-turkiye.png | Türkiye haritası | Duraklar, altın iz, sıradaki durak (Nevşehir) |
| 05-durak-girisi.png | Durak girişi (Kapadokya) | Ad, simge, "Biliyor muydun?", Başla, Uzaktan oyna |
| 06-hareket-ekrani.png | Hareket | İlerleme noktaları, hikâye, komut, Zıpzıp gösteriyor |
| 07-odul.png | Ödül | Süpersin, yıldızlar, damga, "Evde birine sor", düğmeler |
| 08-pasaport.png | Pasaport | Ad, karakter, damgalar, bölüm sekmeleri |
| 09-rozetler.png | Rozetlerim | 26 rozet (kazanılmayanlar "?") |
| 10-kostum-dolabi.png | Kostüm dolabı | 14 kostüm (kapalılar kilitli) |
| 11-karakter-secimi.png | Karakterini seç | 8 hayvan (emoji) |
| 12-sertifika.png | Türkiye Gezgini sertifikası | Kaydet / Paylaş |
| 13-dunya-harikalari-kure.png | Dünya Harikaları | Dönen küre üzerinde duraklar |
| 14-uzay.png | Uzay Yolculuğu | Dikey Güneş Sistemi |
| 15-spor-kampi.png | Spor Kampı | Atletizm pisti, serbest sıra |
| 16-dinozorlar.png | Dinozorlar Diyarı | Orman yolu |
| 17-evde-macera.png | Evde Macera | Oda, halı |
| 18-okyanus.png | Okyanus | Deniz, kumsal |
| 19-ailece.png | Ailece hareket | "Bir büyüğünü çağır!" |
| 20-ebeveyn-kilidi.png | Ebeveyn kilidi | Çarpma sorusu |
| 21-ebeveyn-koesi.png | Ebeveyn köşesi menüsü | Bütün ebeveyn seçenekleri |
| 22-ebeveyn-ozet.png | Hareket özeti | Haftalık sayılar, günlük grafik, paylaş |
| 23-ebeveyn-ayarlar.png | Oyun ayarları | Sakin/Normal, oturarak oyna |
| 24-nasil-oynanir.png | Nasıl oynanır | 4 adım + ipuçları |
| 25-sesi-dene.png | Sesi dene | (Bu bilgisayarda Türkçe ses olmadığı için uyarı görünüyor) |
| 26-kamera-denemesi.png | Kamera denemesi | Kutu, "Kamerayı aç", sayma yolları |
| 27-telefonda-neler-var.png | Bu telefonda neler var? | Saklanan her kayıt ve toplam boyut |
| 28-pasaport-ayar.png | Pasaportu hazırla | Ad, isteğe bağlı fotoğraf |
| 29-tam-surum.png | Tam sürüm | Web test sürümünde "bütün bölümler ücretsiz açık" |
| 30-kurulum.png | Telefona yükle | Web'den ana ekrana ekleme adımları |
| 31-yatay-telefon-uyarisi.png | Yatay telefon | "Telefonu dik çevir" |

Mağaza için hazırlanmış resmi ekran görüntüleri ayrıca depoda: `docs/magaza-gorselleri/` (Android 1080×1920 ×7, iPhone 1320×2868 ×7, iPad 2064×2752 ×7, tanıtım 1024×500, ikon 512).

## 2. Görsel dünyanın özeti

- **Zıpzıp (maskot):** Gülen, kollu-bacaklı dünya. Dosya değil, **kodla çizilir**: `src/zipzip.ts` (uzuvlar, duruşlar, hareketler), `src/zipzipKure.ts` (gövde: gerçek dünya haritası, Türkiye altın sarısı), `src/zipzipYuz.ts` (gözler, kaşlar, ağız, ifadeler). Renkler: uzuv turuncu-sarı `#FFB627`, ayakkabı kırmızı `#EF4E5E`. Giyilen kostüm Zıpzıp'ın üstünde çizilir (`src/kostumler.ts`).
- **Arka plan:** Koyu lacivert, yıldızlı (`arayuz.yildizliArkaPlan`). Bölüm haritaları kendi zeminleriyle (yeşil pist, orman, oda, deniz) kodla çizilir (`BolumScene` `AYARLAR[...].arkaPlan`).
- **Düğmeler:** Yuvarlak köşeli, kalın beyaz kenarlı, turuncu (`0xEE6A1F`), yeşil (`0x2FA84F`), mavi, mor (`arayuz.buyukDugme`).
- **Yazı tipi:** Baloo 2 (700/800), pakette.
- **Simgeler:** Türkiye ve Dünya durakları için çizili SVG; diğer bölümler, karakterler ve kostümlerin çoğu **emoji** (telefonun emoji setine göre görünüş değişir — Android ile iPhone'da farklı görünür).
- **Kararlı durum:** "Çizer gelince Zıpzıp tarzında yeniden çizilecek" kararı var (maskot, durak simgeleri, karakterler, tematik arka planlar). Çizer henüz yok.

## 3. Görsel varlık listesi (dosyalar)

| Dosya | Boyut (piksel / viewBox) | Disk | Nerede kullanılır |
|---|---|---|---|
| `public/simge/{istanbul,truva,pamukkale,kapadokya,nemrut,gobeklitepe,karadeniz,efes,kolezyum,piramitler,petra,tacmahal,cinseddi,machupicchu}.svg` | viewBox 0 0 100 100 (oyunda 256×256 yüklenir) | ~1 KB/adet | Türkiye ve Dünya durak simgeleri (`AcilisScene` arkada yükler) |
| `public/harita-turkiye.svg` | viewBox 0 0 720 560 | 58 KB | Türkiye haritası (`npm run harita` ile üretilir) |
| `public/dunya.svg` | viewBox 79 49 242 242 | 59 KB | `HaritaScene` yükler |
| `public/ikon/ikon-192.png` | 192×192 | 60 KB | Açılış ekranı, PWA |
| `public/ikon/ikon-512.png`, `ikon-maskable-512.png` | 512×512 | ~340 KB | PWA |
| `public/ikon/apple-touch-icon.png` | 180×180 | 53 KB | iPhone ana ekran |
| `public/ikon/favicon-64.png` | 64×64 | 8 KB | Tarayıcı sekmesi |
| `assets/icon-only.png`, `icon-foreground.png`, `icon-background.png` | 1024×1024 | 0,3-1 MB | Capacitor ikon kaynağı |
| `assets/splash.png`, `splash-dark.png` | 2732×2732 | 6,5 MB/adet | Capacitor açılış ekranı kaynağı |
| `android/app/src/main/res/…`, `ios/App/App/Assets.xcassets/…` | çeşitli | — | `node scripts/ikon-uret.mjs` ile üretilen ikon/açılış görselleri |
| `public/mediapipe/pose_landmarker_lite.task` + `vision_wasm_internal.{js,wasm}` | — | 5,6 MB + 9,2 MB | Kamera modeli (görsel değil) |

İkonlar ve açılış ekranı oyundaki Zıpzıp'tan üretilir: `node scripts/ikon-uret.mjs`.

## 4. Görselleri/animasyonları değiştirirken etkilenebilecek dosyalar

| Değişiklik | Değişecek dosyalar | Dikkat |
|---|---|---|
| Zıpzıp'ı çizerin resmiyle değiştirmek | `src/zipzip.ts`, `zipzipKure.ts`, `zipzipYuz.ts`; yeni resimler `public/` altına; yükleme `AcilisScene.preload` | Bütün ekranlar Zıpzıp kullanır; kostümler ve ifadeler yeni çizime uyarlanmalı; ikonlar `scripts/ikon-uret.mjs` ile yeniden üretilir; paket boyutu ve açılış süresi ölçülmeli |
| Durak simgelerini çizimle değiştirmek | `public/simge/<id>.svg` (aynı adla), `src/arayuz.ts` `durakSimgesi` ve `CIZILI_SIMGELER` listesi | Emoji kullanan bölümlere yeni dosya eklenince listeye eklenmeli |
| Bölüm arka planı | `src/scenes/BolumScene.ts` (`AYARLAR`), `HaritaScene.ts`, `DunyaScene.ts`, `UzayScene.ts` | Renk zıtlığı testi (yazılar okunur) yeniden geçmeli |
| Yeni animasyon / hareket | `src/zipzip.ts` (duruş + adımlar), `src/hareketler.ts` (`Animasyon` türü), gerekiyorsa `kamera.ts` `SAYMA_YOLU` | "Zıpzıp her hareketi hatasız yapar" testi; süs ise `hareketiAzalt()` |
| Düğme/yazı stili | `src/arayuz.ts`, `src/ayarlar.ts` (`RENK`) | Düğme boyu ve renk zıtlığı testleri |
| Yeni Phaser nesnesi (parçacık, sprite animasyonu, Rive vb.) | `src/phaserNesneleri.cjs` (+ gerekirse `phaserHafif.cjs`), `package.json` | Paket boyutu; `npm test` eksik nesneyi yakalar |
| Mağaza görselleri | `scripts/magaza-gorselleri.mjs` → `docs/magaza-gorselleri/` | Görünüm değişince yeniden üretilmeli |

# Zıp Zıp Dünya — Teknik Durum Raporu

**Tarih:** 12 Ekim 2026 · **Depo:** `github.com/8y9khd2gr8-svg/first` (herkese açık) · **Dal:** `main` @ `fe37906` · **Sürüm:** 0.9.0
Bu belge, kodu değiştirmeden geliştirmeye devam edebilmek için gereken her şeyi anlatır. Her bilgi depodan okunarak ya da komut çalıştırılarak doğrulandı; doğrulanamayanlar ayrıca belirtildi.

---

## 1. Teknolojiler

| Katman | Kullanılan | Not |
|---|---|---|
| Dil | **TypeScript** (~5.6) | Kodda isimler ve yorumlar Türkçe |
| Oyun motoru | **Phaser 3.90** (2B, WebGL/Canvas) | Derlemede "hafif Phaser": sadece kullanılan oyun nesneleri (`src/phaserHafif.cjs`, `src/phaserNesneleri.cjs`); fizik, karo haritası, parçacık, video yok. Geliştirmede tam Phaser |
| Derleyici / sunucu | **Vite 6** | `vite.config.ts` |
| Çevrimdışı | **vite-plugin-pwa** | Ana ekrana yüklenir, internetsiz çalışır |
| Harita/küre çizimi | **d3-geo**, topojson-client, world-atlas | Zıpzıp'ın gövdesi ve Dünya Harikaları küresi |
| Hareket algılama | **@mediapipe/tasks-vision** (Pose Landmarker lite, cihaz içinde) | İsteğe bağlı kamera modu |
| Mobil paket | **Capacitor 7** (`android/`, `ios/`, kimlik `com.zipzipdunya.oyun`) | |
| Telefon sesi | @capacitor-community/text-to-speech (uygulamada), `speechSynthesis` (tarayıcıda) | |
| Ödeme | @capgo/native-purchases (Play Billing / StoreKit, sunucusuz) | |
| Yazı tipi | @fontsource/baloo-2 (pakette) | Google Fonts'a bağlanılmaz |
| Testler | Node test runner + tsx (veri testleri), **Playwright** (tarayıcıda oyun testleri) | |
| CI / yayın | **GitHub Actions** | Ayrıntı: bölüm 7 |

Arka uç (sunucu), veritabanı, hesap sistemi **yoktur**. Bütün kayıtlar telefonun `localStorage`'ında.

## 2. Klasör yapısı

```
first/
├─ CLAUDE.md            ← Proje kuralları ve ALINMIŞ BÜTÜN KARARLAR (en önemli belge; önce bunu okuyun)
├─ README.md            ← Kısa tanıtım
├─ index.html           ← Tek sayfa; "Telefonu dik çevir" uyarısı burada
├─ package.json         ← Bağımlılıklar, komutlar, SÜRÜM NUMARASI (tek kaynak)
├─ vite.config.ts, tsconfig.json, playwright.config.ts, capacitor.config.ts
├─ src/                 ← Oyun kodu (~7.600 satır)
│  ├─ main.ts           ← Oyunu başlatır, bütün sahneleri kaydeder, 720×1280 dik tuval (FIT)
│  ├─ scenes/           ← 26 sahne sınıfı (ekranlar), bkz. bölüm 3
│  ├─ duraklar.ts       ← 7 bölüm, 50 durak: ad, yer, bilgi, özel hareket, ekler (en büyük veri dosyası)
│  ├─ hareketler.ts     ← Hareket kütüphanesi (K), ısınma/soğuma, sürprizler (DONMA, AYNA), Animasyon türü
│  ├─ oturum.ts         ← Bir durağın hareket listesini kurar (ısınma+4+sürpriz+soğuma); durak başında bir kez
│  ├─ uyarla.ts         ← Sakin tempo / oturarak oyna uyarlaması
│  ├─ zipzip.ts         ← Maskot: kol/bacak duruşları ve her hareketin animasyon adımları
│  ├─ zipzipKure.ts     ← Maskotun gövdesi (dönen dünya, d3-geo)
│  ├─ zipzipYuz.ts      ← Maskotun yüzü (göz kırpma, konuşurken ağız, ifadeler)
│  ├─ arayuz.ts         ← Ortak düğmeler (buyukDugme, evDugmesi), arka plan, durak simgesi
│  ├─ ayarlar.ts        ← Renkler (RENK), yazı tipi, hareketiAzalt(), uzaktan oyna
│  ├─ metinler.ts       ← SESLİ SÖYLENEN BÜTÜN CÜMLELER (M) — yeni cümle buraya
│  ├─ okunus.ts         ← Ses motorunun yanlış okuyacağı yazımlar (T-Rex → "Ti Reks")
│  ├─ ses.ts, sesSecimi.ts, sesAnahtari.ts, sesDosyalari.ts ← konuşma, bip sesleri, Türkçe ses seçimi, kayıtlı ses listesi
│  ├─ kamera.ts         ← MediaPipe ile sayma (SAYMA_YOLU: 13 hareket, 6 yol)
│  ├─ ilerleme.ts, istatistik.ts, pasaport.ts, rozetler.ts, kostumler.ts, oyunAyari.ts, guvenlik.ts ← cihaz kayıtları
│  ├─ satinAlma.ts      ← Tam sürüm (mağaza ödemesi)
│  ├─ hiz.ts            ← Yavaş telefon algılama ve sadeleşme
│  ├─ aile.ts           ← Ailece oturumu; tepeler.ts ← İstanbul'un 7 Tepesi (hazırlık, oyunda kapalı)
│  └─ iletisim.ts, kurulum.ts, haritaKonumlar.ts, turkiye-sinir.json
├─ public/              ← Olduğu gibi yayınlanan dosyalar (bkz. GORSEL_ENVANTER.md)
│  ├─ simge/*.svg (14), harita-turkiye.svg, dunya.svg, ikon/*.png
│  ├─ mediapipe/ (~15 MB: model + wasm)
│  ├─ ses/ (BOŞ — doğal ses kayıtları buraya gelecek)
│  └─ gizlilik.html, kosullar.html, belge.css
├─ tests/               ← veri.test.ts, kayit.test.ts, kamera.test.ts (Node) · oyun.spec.ts, butun-duraklar.spec.ts, cevrimdisi.spec.ts (Playwright)
├─ scripts/             ← harita-uret, ikon-uret, seslendir, seslendirme-metni, surum-esitle, acilis-olc, magaza-gorselleri, katalog/
├─ docs/                ← Mağaza, beta, Yağız testi, seslendirme rehberleri; mağaza görselleri
├─ assets/              ← İkon ve açılış ekranı kaynakları (Capacitor için)
├─ android/, ios/       ← Capacitor yerel projeleri
└─ .github/workflows/   ← test.yml, yayinla.yml, android-apk.yml, android-play.yml, ios-derleme.yml
```

## 3. Sahneler (ekranlar) ve akış

Bütün ekranlar Phaser sahnesidir (`src/scenes/`). Tuval 720×1280 dikey; ekrana sığdırılır.

| Sahne | Ne yapar | Nereden açılır |
|---|---|---|
| `AcilisScene` | Logo, Zıpzıp, "Oyna"; arkada durak simgelerini yükler | Uygulama açılınca |
| `GuvenlikScene` | Ebeveyn güvenlik notu (ilk açılışta bir kez) | Açılış / Nasıl oynanır |
| `AvatarScene` | Hayvan karakteri seçimi (pasaport görünümü) | İlk pasaport |
| `MaceraScene` | Büyük Macera: bütün bölümler kıvrımlı yolda; 👪 Ailece, 👕 dolap, 🛂 pasaport | "Oyna" |
| `HaritaScene` | Türkiye haritası (SVG) | Macera |
| `DunyaScene` | Dönen küre, Dünya Harikaları | Macera |
| `UzayScene` | Dikey Güneş Sistemi | Macera |
| `BolumScene` ×4 | Spor, Dinozor, Evde, Okyanus (tek sınıf, ayarları `AYARLAR` tablosunda) | Macera |
| `DurakScene` | Durak adı, simge, "Biliyor muydun?" bilgisi, "Başla", "Uzaktan oyna" | Harita |
| `HareketScene` | Hareketleri sırayla oynatır (gösterim → 3-2-1 → sayaç → "Yaptım!" → Aferin); kamera önizlemesi | Durak / Ailece |
| `OdulScene` | Konfeti, yıldız, damga, merak sorusu, rozet/kostüm kutlaması; "Haritaya dön", "Bir daha", "🌙 Bitirelim" | Hareket sonu |
| `PasaportScene`, `RozetScene`, `KostumScene`, `SertifikaScene` | Ödül sayfaları | Macera / harita / ödül |
| `EbeveynScene` | Çarpma sorulu kilit | ✏️ (pasaport), ödeme kilidi |
| `EbeveynMenuScene` + `EbeveynOzet/Ayar/Rehber/Ses/Kamera/Veri`, `PasaportAyarScene`, `TamSurumScene`, `KurulumScene` | Ebeveyn köşesi | Kilitten sonra |

**Önemli kural:** `init` alan bir sahneye geçerken her zaman veri nesnesi verilir (`scene.start('X', {})`), yoksa Phaser önceki verinin aynısını kullanır.

## 4. Hareket sistemi ve hareket algılama

- **Hareket verisi:** `src/hareketler.ts` → `K` kütüphanesi (~40 yerinde hareket), `hikayeli(komut, 'hikâye', { ritim, adet })`, `birlesik` (zıpla, zıpla, çömel…). Her hareketin `tur`'u ya `sayi` (adet × tempoMs) ya `sure` (saniye).
- **Durak listesi:** `oturum.ts` `oturumKur()` → ısınma? + durağın 4 hareketi + sürpriz + soğuma?; `uyarla.ts` ebeveyn ayarını uygular. Liste durak başında bir kez kurulur (12 Ekim'de 50 durak için otomatik doğrulandı).
- **Doğrulama:** Varsayılan: "Yaptım!" düğmesi süre/sayım bitince çıkar; oyun hareketin yapıldığını bilemez (ebeveyn özetinde bu dürüstçe yazar).
- **Kamera (isteğe bağlı):** `src/kamera.ts`, MediaPipe Pose Landmarker **lite** modeli (`public/mediapipe/`), önce GPU, olmazsa CPU. Cihaz içinde çalışır, görüntü kaydedilmez/gönderilmez. `SAYMA_YOLU`: kollar, çömel, zıpla, dizler, ayak aç-kapa, yana adım (6 yol, 13 hareket). Süreli hareketlerde ve Ailece'de kamera açılmaz. Eşikler **gerçek çocukla denenmedi** (`tests/kamera.test.ts` yapay vücut noktalarıyla sınar). SIMD desteklemeyen eski telefonda seçenek gizlenir. Yavaş telefonda tanıma, sürdüğü kadar ara verir (#96).

## 5. Animasyonlar

- **Görüntü dosyası yok, hepsi kod:** Zıpzıp Phaser `Graphics` ile çizilir. `zipzip.ts`'de `D` tablosu duruşları (her uzvun omuz/kalça açısı ve dirsek/diz bükülmesi) tanımlar; her `Animasyon` (zipla, comel, kos, dizler, … ~50 ad) bir duruş dizisidir ve Phaser **tween**'leriyle duruşlar arasında geçilir. `birKez()`, `surekli()`, `durdur()`, `yolculuk()` ana çağrılardır.
- **Yüz:** `zipzipYuz.ts` — göz kırpma (süs), konuşurken ağız (`ses.ts` `konusmayiDinle`), ifadeler: normal / mutlu / kirpan / saskin / uykulu.
- **Gövde:** `zipzipKure.ts` — bölüme göre dünyanın o tarafına döner (`BOLUM_YONU`).
- **Sahne animasyonları:** konfeti, yıldızlar, nabız gibi atan sıradaki durak, Zıpzıp'ın duraklar arası zıplaması — hepsi tween.
- **Kural:** Yeni süs animasyonu `hareketiAzalt()` ile korunmalı (telefonda "hareketi azalt" açıksa ya da `hiz.ts` telefonu yavaş bulduysa kapanır).
- Not: İleride çizer gelince Rive ile yeniden yapılması **düşünülüyor** (karar verilmedi).

## 6. Görsel ve ses dosyaları

- Görseller: `public/` (simge, harita, ikon), `assets/` (Capacitor ikon/açılış), `docs/magaza-gorselleri/` (mağaza ekran görüntüleri). Liste ve boyutlar: **GORSEL_ENVANTER.md**.
- Ses: `public/ses/` **boş** (sadece `.gitkeep`). Cümleler `src/metinler.ts`'de; tam liste `docs/seslendirme-metni.csv` (760 cümle). `npm run seslendir` Azure/ElevenLabs anahtarıyla eksik cümleleri kaydeder (anahtar yok, hiç çalıştırılmadı). Bip/zafer sesleri kodla üretilir (Web Audio).

## 7. Çalıştırma, test, yayın

```bash
npm ci                      # bağımlılıklar (bir kez)
npm run dev                 # geliştirme: http://localhost:5173 ; tarayıcı konsolunda window.oyun ile sahne açılabilir
npm run build               # tsc + vite build → dist/
npm test                    # hızlı veri/kural testleri (~1 sn, 25 test)
npm run test:oyun           # derler + Playwright ile tarayıcı testleri (~6 dk yerelde, ~7-8 dk GitHub'da; 30 test, 2 işçi)
node scripts/acilis-olc.mjs # açılış hızı (önce build + vite preview --port 5198)
npm run magaza              # sürüm eşitle + derle + cap sync (Android/iOS projelerine kopyalar)
```

GitHub Actions:
| İş | Ne zaman | Ne yapar |
|---|---|---|
| **Testler** (`test.yml`) | Her PR'da | derle + `npm test` + `npm run test:oyun` |
| **Oyunu yayınla** (`yayinla.yml`) | `main`'e her push'ta | derler ve GitHub Pages'e yayınlar (https://8y9khd2gr8-svg.github.io/first/) — **main'e giren her şey birkaç dakika içinde test sitesinde canlıdır** |
| Android deneme paketi / Play kapalı test paketi / iPhone derleme | Elle (Actions sekmesi) | APK / imzalı AAB / imzasız iOS derleme denetimi |

Ölçümler (12 Ekim, bulut bilgisayarında, telefon değil):
- Açılış: 6 kat yavaşlatılmış işlemcide "Oyna" düğmesi ~1,9 sn'de; 4 kat ~1,3 sn.
- JS belleği 10-14 MB; 40 ekran geçişinden sonra artmadı (sızıntı görülmedi).
- Oyunun kendi JS işi kare başına 6 kat yavaşlatmada 11-22 ms (30 kare bütçesi 33 ms); Uzay haritası ve kamera denemesi ekranı sınıra yakın.
- Bu bulut makinesinde çizim yazılımla yapıldığı için kare hızı ölçümleri telefonu temsil etmez. **Gerçek telefonda ölçüm yapılmadı.**

## 8. Teknik borçlar, hatalar, riskler

| Risk | Etki | Öneri |
|---|---|---|
| Doğal ses kaydı yok; telefonun Türkçe sesine bağımlı | Türkçe sesi olmayan telefonda çocuk yönlendirmeyi duyamaz | Azure kaydı (altyapı hazır) |
| `main` korumasız; tag/sürüm etiketi yok | Bozuk bir değişiklik doğrudan test sitesine gider; "çalışan sürüm"e dönmek için commit aramak gerekir | IS_AKISI.md: dal koruması + sürüm etiketleri |
| Testler sadece PR'da çalışır, main'e push'ta çalışmaz | PR dışı push denetlenmez | Dal koruması ile doğrudan push'u kapatmak |
| Süreye bağlı tarayıcı testleri | Yavaş CI makinesinde ara sıra zaman aşımı (12 Ekim'de bir kez oldu, #95 düzeltti) | Kırılan testte saat hızlandırma; sonucu okumadan birleştirmemek |
| GitHub'da 94 eski dal | Karışıklık | Birleşmiş dalları temizlemek (onayla) |
| `android/`, `ios/` ve `assets/` büyük (23 MB, 58 MB, 15 MB; açılış görselleri 6,5 MB) | Depo ağır | Şimdilik sorun değil |
| MediaPipe ~15 MB pakette | Uygulama boyutu | Bilinçli karar (internetsiz kamera) |
| Mağaza tarafı (ödeme, imza, izinler) gerçek cihazda denenmedi | Beta'da sürpriz çıkabilir | Play kapalı test + TestFlight |
| Phaser Graphics her karede yeniden üçgenleniyor (harita çizimleri) | Çok yavaş telefonda takılma olabilir | Gerekirse sabit çizimleri resme çevirmek (ölçüm sonrası) |

## 9. Kod değiştirmeden önce bilinmesi gerekenler (kurallar)

1. **Önce `CLAUDE.md`'yi okuyun**; bütün ürün kararları orada. Çelişen öneri yapmadan önce kararı kontrol edin.
2. Yeni sesli cümle → `src/metinler.ts`'e eklenir (`npm test` denetler), sonra `npm run seslendirme-metni` ile `docs/seslendirme-metni.csv` güncellenir.
3. Komutlarda "gibi" kullanılmaz (test yakalar); yürü/koş komutları "yerinde" der.
4. Yeni cihaz kaydı → anahtar `zipzip-` ile başlar, `public/gizlilik.html` tablosuna ve `EbeveynVeriScene` listesine eklenir (test denetler).
5. Kodda dış adres (http…) olamaz (test denetler). Oyun hiçbir sunucuya bağlanmaz.
6. Yeni Phaser özelliği (ör. parçacık) gerekirse `src/phaserNesneleri.cjs`'e eklenir (test eksik nesneyi yakalar).
7. Yeni süs animasyonu `hareketiAzalt()` ile korunur.
8. Çocuk ekranlarındaki düğmeler en az 72 nokta; yazılar ekrandan taşmaz; renk zıtlığı 4.5 / 3 (testler denetler).
9. Yeni bölüm eklemek: `duraklar.ts` (liste + `BOLUMLER`), `BolumScene` `AYARLAR`, `main.ts`, `metinler.ts`, rozet, `SertifikaScene` `UNVAN`, sonra seslendirme metni.
10. Sürüm numarası tek yerde: `package.json`.
11. Kodda isimler/yorumlar Türkçe; proje sahibine sade Türkçe.

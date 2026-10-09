# Zıp Zıp Dünya – çalışma kuralları

## Proje
4-9 yaş çocuklar için reklamsız, şiddetsiz, Türkçe hareket oyunu. Maskot "Zıpzıp":
Türkiye merkezli, kollu-bacaklı gülen dünya; Türkiye altın sarısı (#FFC93C).
Yapı: 1. bölüm Türkiye Turu (ücretsiz): İstanbul → Truva → Pamukkale → Kapadokya → Nemrut →
Göbeklitepe → Karadeniz. 2. bölüm Dünya Harikaları (Efes'ten başlar; Rio yerine Piramitler).
Sonra ülke turları. Her durak 5 hareketlik antrenman: ısınma → özel hareket → 2 hareket → soğuma.
Teknoloji: Phaser 3 + TypeScript + Vite, GitHub Pages ile yayın. İleride Capacitor ile mağazalar.

## Değişmez kurallar
- Reklam yok, şiddet yok, kaybetmek yok.
- Hesap/kayıt yok, çocuktan veri toplanmaz; ilerleme sadece cihazda saklanır.
- Yazı okumayı bilmeyen çocuk da oynayabilmeli: büyük düğmeler, sesli yönlendirme.

## Alınan kararlar
- Para modeli: ilk harika (Türkiye) ücretsiz, tüm dünya turu tek seferlik ödemeyle açılır.
  Ödeme ekranı ebeveyn kilidinin arkasında. Kostüm/kıyafet satılmaz; hareketle kazanılan
  yıldızlarla açılır. İleride okullara/anaokullarına lisans düşünülebilir.
- Önce web (PWA), oyun olgunlaşınca Capacitor ile Play Store ve App Store.
- Kamera ile hareket algılama sonraya bırakıldı; şimdilik çocuk "Yaptım!" düğmesine basar.

- Hareket komutları benzetme değil, vücut parçasını söyleyen tek ve net eylem olmalı
  ("Tek ayağını kaldır", "Dizlerini sırayla kaldır"). "Leylek gibi", "kuş gibi kanat çırp",
  "yıldız gibi açıl kapan" 6 yaşa anlaşılır gelmedi (Yağız testi).
- Aşama 3: her harikanın kendine özgü, hikâyeli bir hareketi olacak (ör. Efes: sütun gibi
  dimdik dur; Çin Seddi: duvarda dizleri kaldırarak yürü; Piramitler: kollarla piramit yap).
- Harika listesini biz seçeriz; dini figür/ibadet odaklı yapılar (ör. Kurtarıcı İsa heykeli)
  Türkiye'de yanlış anlaşılabileceği için listeye alınmaz.

- Pasaport: çocuğun adı, görünümü ve damgaları. Görünüm varsayılan olarak çocuğun kendi
  seçtiği hayvan karakteri; fotoğraf tamamen isteğe bağlı (bazı aileler istemez). Ad ve
  fotoğraf sadece cihazda saklanır; ad/fotoğraf girişi ebeveyn kilidinin (çarpma sorusu) arkasında.
- Harita: girişte uzaydan iniş; durak bitince Zıpzıp rota üzerinde zıplayarak sıradaki
  durağa gider, arkasında altın iz kalır.
- Yol haritası ("mutlaka indirin" özellikleri): Zıpzıp şarkısı + doğal ses, ebeveyn hareket
  özeti, paylaşılabilir Gezgin Sertifikası, aileyle (anne-baba) hareketler, hareketle kazanılan
  kostümler. Sonra: kardeş modu, sınıf/anaokulu modu, 23 Nisan özel bölümü.
- İleriki bölümler için fikir: evdeki eşyalarla hareket (en sevdiği oyuncak, yumuşak top,
  balon, yastık): yerden alıp kaldırma, taşıma, başının üstünde tutma, balonu yere düşürmeme.
- Ses: bütün seslendirilen cümleler `src/metinler.ts`'de. `npm run seslendir` eksik cümleleri
  doğal sesle (Azure veya ElevenLabs anahtarıyla) public/ses/ altına kaydeder; kaydı olmayan
  cümle telefonun sesiyle okunur. Çocuğun adı sesli söylenmez ("Merhaba gezgin!"), sadece yazılır.
  Yeni bir konus() cümlesi eklenince metinler.ts'e de eklenmeli.
- Çıkış planı: Kasım'da ~100 kişilik beta (TestFlight / Google kapalı test), Ocak sonu yarıyıl
  tatilinde mağaza, 23 Nisan büyük güncelleme. Yorumlar organize ettirilmez (mağaza kuralı);
  çevre beta testçisi olarak kullanılır.
- Hareketler futbol takımının fizyoterapistlerine danışılacak (hareket kataloğu sayfası).
- Durak simgeleri şimdilik emoji; ileride çizerin çizdiği özel görseller gelecek.

## Kod düzeni
- `src/zipzip.ts`: maskot; duruşlar (uzuv açıları) ve her hareketin adımları burada.
- `src/duraklar.ts`: duraklar, bilgiler, özel hareketler. `src/ilerleme.ts`: cihazdaki kayıt.
- `npm run harita`: harita SVG'sini ve durak konumlarını yeniden üretir (scripts/harita-uret.mjs).
- `src/hareketler.ts`: hareket listesi. `src/ses.ts`: sesler. `src/arayuz.ts`: düğmeler, arka plan.
- Test: `npm run dev` ile açınca `window.oyun` üzerinden sahneler başlatılabilir (sadece geliştirmede).

## Proje sahibiyle çalışma şekli
- Proje sahibi yazılım bilmiyor: her şeyi sade Türkçeyle anlat, teknik terimleri açıkla.
- Karar gereken her noktada önce metinde 5+ seçeneği sıralı bir tabloyla yaz (önerilen en
  başta), sonra AskUserQuestion ile en güçlü 4'ünü sun (önerilen ilk sırada, "(Önerilen)"
  etiketiyle); kullanıcı yazmadan seçebilsin. Her zaman en iyisi için kafa yor.
- Her aşama küçük ve telefonda test edilebilir olsun; sonunda Yağız (6 yaş) test eder.
- Değişiklikler PR olarak açılır; testleri geçince PR'ı Claude birleştirir (kullanıcı onayladı).
- Kodda isimler ve yorumlar Türkçe.

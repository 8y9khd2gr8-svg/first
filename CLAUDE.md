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
  Hedef sadece mağazalar: web adresi (GitHub Pages) beta sonuna kadar yalnızca test için kalır;
  mağazaya çıkarken oyun siteden kaldırılır, sadece gizlilik.html ve kosullar.html kalır
  (mağazalar gizlilik politikası adresi ister).
- Hareket doğrulama kararı: "Yaptım!" düğmesi hareket süresi/sayımı bitince belirir (varsayılan).
  Kamera modu isteğe bağlı, ebeveyn köşesinden açılır: MediaPipe Pose, model dosyası pakette, cihaz
  içinde çalışır, görüntü kaydedilmez/gönderilmez (gizlilik.html'e eklenmeli). Önce basit hareketler
  (zıpla, çömel, kollar). Sesli "Yaptım" komutu yok (ses dış sunucuya gidebilir, çocuk sesi zor tanınır).

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
  Ses motorunun yanlış okuyabileceği yazım (ör. T-Rex → "Ti Reks") src/okunus.ts sözlüğüne eklenir: ekranda yazıldığı gibi
  kalır, hem doğal kayda hem telefonun sesine okunuşu gider (`npm test` sözlükte olmayan kısaltma/tireyi yakalar).
  Ses kararı: beta için Azure doğal ses (ücretsiz katman; hesabı kullanıcı açar, anahtar ortam
  ayarlarına gizli değişken). Cümleler oturunca (beta sonrası) seslendirmen/ajansla insan sesi.
- Çıkış planı: Kasım'da 25-30 ailelik beta (iki dalga; Play için en az 12 test kullanıcısı 14 gün) (TestFlight / Google kapalı test), Ocak sonu yarıyıl
  tatilinde mağaza, 23 Nisan büyük güncelleme. Yorumlar organize ettirilmez (mağaza kuralı);
  çevre beta testçisi olarak kullanılır.
- Hareketler futbol takımının fizyoterapistlerine danışılacak (hareket kataloğu sayfası; ertelendi).
- Test: ücretli yapay zekâ test hizmeti (Nunu.ai gibi) şimdilik yok; Play ön lansman raporu (ücretsiz, gerçek telefonlarda
  çökme/ekran görüntüsü) + kendi otomatik testlerimiz + Yağız testi. Beta sonrası gerekirse yeniden bakılır.
- Ebeveyn köşesi (kilitli): haftalık hareket özeti (bütün bölümlerdeki durak ilerlemesiyle) + paylaş, pasaport düzenleme. Özet dürüst:
  sayılar çocuğun "Yaptım!" dediği hareketler; oyun gerçekten yapıldığını algılayamaz. Kamera açıkken yapılan hareketlerden
  kaçını kameranın gördüğü ayrıca yazılır (zipzip-istatistik-v1: kameraAcik / kameraGordu). Kamera ile
  algılama (cihaz içinde, görüntü gönderilmeden) bu yüzden önemli bir sonraki adım.
- "🔊 Sesi dene" (ebeveyn köşesi, EbeveynSesScene): örnek cümleyi okur, doğal kayıt / telefonun Türkçe sesi var mı
  gösterir; Türkçe ses yoksa telefona göre yükleme adımlarını yazar (Android uygulamada yükleme ekranını açar).
  Beta kontrol listesi: docs/beta-hazir-mi.md.
- "❓ Nasıl oynanır" (ebeveyn köşesi, EbeveynRehberScene): 4 adım (durağa dokun → Zıpzıp gösterir → "Yaptım!" → damga) +
  ipuçları; güvenlik notu buradan açılır (ilk açılıştaki güvenlik notu aynen kalır). Düğme yazısı uzunsa düğmeye sığacak kadar küçülür (arayuz.buyukDugme).
- Türkiye Turu bitince Gezgin Sertifikası (resim olarak kaydet/paylaş). Kaydet/paylaş telefonun dışına çıktığı için sadece
  ebeveyn kilidinden sonra (çocuk "🔒 Kaydet / Paylaş"a dokununca kilit; mağaza çocuk kuralları, 12 Ekim).
- PWA: ana ekrana yüklenir, internetsiz çalışır (vite-plugin-pwa). Yazı tipi pakette
  (@fontsource/baloo-2); oyun hiçbir dış sunucuya bağlanmaz, öyle kalmalı.
- Avatar hayvanları çizim olarak kalır (gerçek fotoğraf değil); ileride çizer Zıpzıp
  tarzında çizecek. İkonlar ve açılış ekranı: `node scripts/ikon-uret.mjs` (oyundaki Zıpzıp'tan; public/ikon, assets, android, ios).
- Dünya Harikaları (2. bölüm, ücretli kısım): dönen küre (DunyaScene, d3-geo ile canvas'a
  çizilir); Efes → Kolezyum → Piramitler → Petra → Tac Mahal → Çin Seddi → Machu Picchu.
  Türkiye Turu bitince açılır; beta için ebeveyn köşesinde geçici "Beta: Dünya bölümünü aç"
  (mağazadan önce kaldırılacak). Ödeme mağaza (Capacitor) aşamasında bağlanacak.
- Ödeme (src/satinAlma.ts, TamSurumScene): @capgo/native-purchases (Play Billing / StoreKit, sunucusuz; RevenueCat gibi
  dış servis yok). Tek tüketilmeyen ürün `tam_surum`; Türkiye dışındaki bütün bölümler (önceki bölüm bitince) bunu ister.
  Ödeme ekranı sadece ebeveyn kilidinden sonra; kapalı bölüme dokunan çocuk kilide gider ("bir büyüğüne göster").
  Cihazda sadece zipzip-tam-surum-v1; açılışta mağazaya sessizce sorulur (yeni telefon), "Satın alımı geri yükle" var.
  Web (test sitesi) ödemesiz; `?odeme=deneme` sahte mağaza (testler). Mağaza dışı ödeme yolu eklenmez (hediye kartı/
  operatör faturası mağazanın içinde zaten var). Android↔iPhone taşınmaz; Apple'da Aile Paylaşımı açık.
- Yasal yol: bireysel geliştirici hesaplarıyla başlanır (GVK 20/B istisnası; mali müşavir doğrulayacak).
  Marka: "Zıp Zıp Dünya" için TÜRKPATENT araştırması + başvuru betadan önce (Ekim-Kasım; sınıf 9 ve 41).
  Şahıs şirketi okul lisansı satışı başlayınca (okullar fatura ister). Hesap/başvuruları kullanıcı yapar.
- Para modeli kesinleşti: Türkiye ücretsiz + tek ödemeyle tam sürüm; sonra okul lisansı.
  Uygulama içi reklam ve abonelik yok. İkinci gelir ayağı (okul lisansı / İngilizce sürüm)
  mağazaya çıktıktan sonra satışlara bakılarak seçilecek.
  Bağış: uygulama içinde bağış toplanmaz (Apple kuralı, Yardım Toplama Kanunu). Mağaza sonrası
  değerlendirilecek: gelirden bağış sözü (ör. her satışa 1 fidan) ya da oyun içi sanal fidan teması.
- Beta hazırlığı: ilk açılışta bir kez ebeveyn güvenlik notu; durak girişinde kısa hatırlatma;
  public/gizlilik.html ve kosullar.html (taslak, avukata gösterilecek; iletişim adresi eklenecek);
  ebeveyn köşesinde "Tüm verileri sil" (zipzip- ile başlayan bütün anahtarlar). Yeni bir cihaz
  kaydı eklenirse anahtarı zipzip- ile başlamalı ve gizlilik.html'deki tabloya ve "Teknik ayrıntı"
  satırına eklenmeli (`npm test` denetler).
- İletişim/geri bildirim: adres alan adı alınınca (ör. merhaba@zipzipdunya.com) `src/iletisim.ts`'e yazılır;
  boşken ebeveyn köşesinde "beta grubuna yazın" notu görünür, doluysa "✉️ Geri bildirim yaz" telefonun e-posta
  uygulamasını açar (sadece sürüm numarası eklenir). Adres gelince gizlilik.html ve kosullar.html de güncellenir.
  Sürüm numarası package.json'da (beta: 0.9.x), ebeveyn köşesinin altında görünür.
- Yasal düzenleme (Ekim 2026): sosyal ağlara 15 yaş sınırı + e-Devlet yaş doğrulaması (yönetmelik 10 Ekim 2026,
  yürürlük 1 Kasım 2026) bizi kapsamaz; oyun sosyal ağ değildir ve öyle kalmalı (sohbet, profil, skor tablosu, arkadaş
  ekleme yok). 5651 Ek Madde 5 (oyunlar, 1 Kasım 2026): platformlar derecelendirilmemiş oyun sunamaz → mağaza yaş
  derecelendirmesi (IARC/Apple; beklenen PEGI 3 / 4+) eksiksiz yapılır; ayrıntı yönetmeliği takip edilir.
  Ayrıntı ve avukata sorulacaklar: docs/magaza-rehberi.md (4b ve 7). "Sosyal ağ değildir" vurgusu mağaza ve gizlilik metninde.
- Her yeni özellik/bölümde sorulur: 4-5, 6-7, 8-9 yaş ve hareket kısıtı olan çocuk için nasıl? (Yaşa göre tempo ve
  oturarak oyna bu soru sorulmadığı için geç geldi; ChatGPT değerlendirmesi, Ekim 2026.) Ebeveyn köşesi → ⚙️ Ayarlar:
  "Hareket temposu" 🐢 Sakin (daha az tekrar, %25 yavaş, süreli hareket kısa; 4-5 yaş/yeni başlayan için önerilir) /
  🐇 Normal (varsayılan); yaş etiketi kullanılmaz (çocuğu damgalamasın). Ve "oturarak oyna"
  (ayakta yapılan hareketler kol/gövde hareketine döner, donma oyununda kollarla dans; test her durağı denetler); src/uyarla.ts, kayıt zipzip-oyun-ayar-v1. Ailece etkilenmez.
- Cinsiyet sorulmaz (veri azaltma, kalıp yargı). "Herkes kendini bulsun" ihtiyacı cinsiyetle
  değil, çocuğun seçtiği ilgi alanıyla karşılanır (ör. Spor Kampı'nda sporunu seçer).
- Bölüm yol haritası: Türkiye (ücretsiz) → Dünya Harikaları → Uzay Yolculuğu (sıradaki büyük
  bölüm) → İstanbul'un 7 Tepesi (Şehir Turları; çizer gelince) → Spor Kampı → Dinozorlar →
  Evde Macera → Okyanus → mevsim/bayram bölümleri. Bölüm bitince rozet (pasaport + sertifika).
- Rozetler (src/rozetler.ts, 26 adet): kayıtlardan hesaplanır; cihazda sadece kutlananlar
  tutulur (kutlanan rozet, koşulu sonradan zorlaşsa da kaybolmaz). "Üst üste gün" gibi baskı yaratan rozet yok. Durak sonunda yeni rozet kutlanır.
- Uzay Yolculuğu (3. bölüm, UzayScene): dikey Güneş Sistemi; Merkür → Venüs → Ay → Mars →
  Jüpiter → Satürn → Uranüs → Neptün. Dünya Harikaları bitince açılır. Rozet: Uzay Yolcusu.
- Spor Kampı, Dinozorlar Diyarı, Evde Macera (4-6. bölümler): ortak harita BolumScene (src/scenes/BolumScene.ts;
  bölüm ayarı AYARLAR'da). Zincir: Uzay → Spor → Dinozor → Evde (her biri öncekini bitirince açılır).
  Spor Kampı serbest sıralı: 7 spor istasyonu, çocuk istediğiyle başlar. Evde Macera'da bilgi kutusu
  "Hazırla!" der (ne hazırlanacağı + güvenlik); sadece yumuşak eşyalar, balon yok (boğulma tehlikesi).
  Hikâyede bile "… gibi olalım" yok; test (`npm test`) baslik/sesli içinde "gibi" yakalar.
  İstanbul'un 7 Tepesi (çizer gelince) "Yakında".
- Okyanus (7. bölüm, BolumScene; Evde Macera bitince açılır): deniz canlıları; Deniz Kaplumbağası (Caretta, Dalyan) →
  Yunus → Ahtapot → Yengeç → Denizatı → Mavi Balina → Mercanlar. Köpekbalığı yok (ürkütücü). Rozet/sertifika:
  Okyanus Kâşifi; kostüm: Dalış Maskesi (bölüm sonu).
- Büyük Macera (MaceraScene): Oyna → bütün bölümler kıvrımlı yolda; açık bölümler ilerlemesiyle,
  gelecekler "Yakında" (ebeveyne "daha çok şey gelecek" vaadi). Bölüm haritalarının ⌂'si buraya döner.
  Vaat: tek ödemeyle gelecek bütün bölümler dahil.
- Kostümler (src/kostumler.ts): her biri bir yerin hatırası, o durak/bölüm bitince açılır (Kapadokya → pilot
  gözlüğü...); 14 adet, herkese uygun (fiyonk, kep gibi cinsiyet çağrıştıran yok). Satın alma yok; yıldız sayılır.
  Yeni kostüm kutlamasında "Giy! 👕" düğmesi; Büyük Macera'da 👕 dolap düğmesi. Giyilen kostüm her ekrandaki Zıpzıp'ta görünür. Kostüm dolabı
  pasaporttan (👕). Durak sonunda yeni rozet ve kostümler sırayla kutlanır.
- Durak simgeleri: Türkiye ve Dünya için çizili SVG (public/simge/<id>.svg, arayuz.durakSimgesi); diğerleri emoji.
  İleride çizer hepsini Zıpzıp tarzında yeniden çizecek.
- Hareket sistemi (Yağız/ebeveyn testi: "hep aynı hareket sıkıcı"): src/hareketler.ts'de K komut kütüphanesi
  (~40 yerinde hareket) + hikayeli(komut, 'yere ait hikâye', { ritim: 'yavas'|'hizli', adet }) + birlesik (zıpla,
  zıpla, çömel). Her durak: özel + 3 hikâyeli hareket; oturum.ts ekler: ısınma sadece oturumun ilk durağında
  (15 dk aradan sonra yine), her durakta 1 sürpriz (donma / ayna oyunu), soğuma bölüm sonunda ya da Ödül
  ekranındaki "🌙 Bitirelim" ile. Test: sıralı bölümde önceki 2 durağın hareket türü tekrar edilmez; yürü/koş
  komutu "yerinde" der (kamera için çocuk yerinden ayrılmaz). Bilgi 2 cümle; durak sonunda "Evde birine sor: ..."
- "Bilgiler sadece bu telefonda" kanıtla gösterilir: ebeveyn köşesinin altındaki bağlantı EbeveynVeriScene'i açar (telefonda
  saklanan her şey + toplam boyut + "uçak modunu açıp deneyin"). Yeni bir kayıt eklenirse bu listeye de eklenmeli.
- Okunurluk: `npm run test:oyun` her ekranda renk zıtlığını ölçer (küçük yazı 4.5, büyük 3). Turuncu 0xee6a1f, yeşil 0x2fa84f
  (beyaz yazı okunsun diye); açık kâğıt üstünde turuncu yazı #C2410C.
- Renk körlüğü: durum sadece renkle anlatılmaz (biten durakta altın yıldız arayuz.bittiYildizi, kapalıda 🔒, kazanılmamış rozette "?";
  `npm run test:oyun` denetler). Biten sarı / sıradaki turuncu renkleri şimdilik kalır, çizer gelince birlikte bakılır (Ekim 2026 kararı).
- Ekran: oyun 720×1280 dik tuvali ekrana sığdırır. Telefon dik kilitli; yatay telefonda/basık pencerede index.html "📱 Telefonu dik
  çevir" gösterir. iPad yatayda oyun ortada, yanlar boş: betada böyle kalır, iPad'li ailelerin görüşüne bakılır (Ekim 2026 kararı).
- "Uzaktan oyna" (durak girişinde): açıksa "Yaptım!" beklemeden 3 sn sonra geçer (zipzip-uzaktan-v1).
- Kamera isteğe bağlı kalır (izin velileri tedirgin eder); Ailece'de kamera kapalı (iki kişi güvenilir sayılmaz).
  Oynanış kararı (12 Ekim): kamera isteğe bağlı kalır, macerada "önerilen" olur; her yeni mekanik kamerasız da oynanır
  (kameralı ve kamerasız iki yol). Bugün kamera sadece sayar, Zıpzıp'ı/dünyayı etkilemez (docs/rapor-2026-10-12/OYNANIS_ANALIZI.md).
  Kameranın saydığı hareketler src/kamera.ts SAYMA_YOLU'nda (13 hareket, 6 sayma yolu: kollar, çömel, zıpla, dizler,
  ayak aç-kapa, yana adım); süreli hareketlerde kamera açılmaz. Yavaş telefonda tanıma her seferinde sürdüğü kadar ara verir (oyun takılmasın). Yapay vücut noktalarıyla testi: tests/kamera.test.ts.
  Eşikler gerçek çocukla denenmedi; Yağız testinde ayarlanacak.
  Pakette MediaPipe'in sadece hızlı (SIMD) hâli var (~15 MB; yavaş kopya 9 MB'tı, çıkarıldı): SIMD'siz eski telefonda
  (iOS 16.4 öncesi) kamera seçeneği görünmez (kamera.ts kameraDesteklenir), oyun aynen çalışır.
  Kamera denemesi (EbeveynKameraScene, ebeveyn köşesinde kamera ayarının yanında "🔍 Dene"): canlı görüntü + vücut noktaları,
  6 sayma yolundan biri seçilir, sayı ve "görüyorum/geri git" durumu görünür; kamera dokununca açılır, sayılar özete eklenmez.
  Yağız testinde eşik ayarı için kullanılır.
- Doğruluk: Çin Seddi uzaydan gözle GÖRÜLMEZ (efsane); Truva Atı "efsaneye göre". Ürkütücü kelime yok
  ("taş heykel başları" gibi); hayali nesne kaldırmada "hayali" denir (dışarıda gerçek taş kaldırma özentisi olmasın).
- İleride konuşulacak (acele yok, 23 Nisan ya da sonrası): Zıpzıp'ın kendi dünyası haritası ve ek oyunlar
  (eşleştirme 4-8-12 kart, boyama, resim; TRT Çocuk örneği); Zıpzıp şarkısı/jingle (marka kontrolünden sonra);
  QR tanıtım (mağaza sonrası; çocuk reklamı kuralları); her durak için tematik arka plan (çizerle).
- Animasyon kararı: "canlı ama sakin". Hareket bir işe yaramalı (giriş, sıradaki durak, kutlama);
  sürekli oynayan süs yok. Pasaport sakin, damga/rozet anı canlı. Telefonda "hareketi azalt" açıksa
  animasyonlar azalır. Telefon yavaşsa da aynısı olur (src/hiz.ts: oyun boyunca gerçek kare hızı ölçülür,
  40'ın altına düşerse süs animasyonları kapanır ve kare hızı 30'a sabitlenir; sonuç kaydedilmez). Yeni
  süs animasyonu `hareketiAzalt()` ile korunmalı. Yağız testinde dikkat dağıtan yer sadeleştirilir.
- Zıpzıp tasarımı (Ekim 2026, "B · Sevimli"): büyük parlak gözler (mavi iris, iki parıltı), kaşlar, hep pembe yanak,
  açık gülen ağız (diş + dil), bulutlu küre, parmaklı eller, beyaz tabanlı kırmızı spor ayakkabı. Gövde kodla çizilir
  (src/zipzipKure.ts, d3-geo; govde.svg yok): bölüme göre dünyanın o tarafı görünür (BOLUM_YONU; Dünya Harikaları'nda
  her durak kendi ülkesi, Okyanus'ta Büyük Okyanus, Dinozorlar'da Kuzey Amerika, diğerleri Türkiye). Haritaya girince ve
  Dünya'da sıradaki harikaya giderken küre yavaşça döner (hareketiAzalt'ta hemen). Türkiye hep altın sarısı (Zıpzıp'ın evi).
- Zıpzıp'ın yüzü kodla çizilir (src/zipzipYuz.ts): göz kırpar (süs, hareketiAzalt'ta kapalı),
  konuşurken ağzı oynar (ses.ts konusmayiDinle), ifadeler: normal / mutlu ("Aferin!", varış, açılış) / uykulu (soğuma sonu).
  Zıplarken gövde hafifçe basılıp esner (süs). İleride çizer gelince Rive ile yeniden yapılması düşünülebilir.

## Kod düzeni
- `src/zipzip.ts`: maskot; duruşlar (uzuv açıları) ve her hareketin adımları burada.
- `src/duraklar.ts`: duraklar, bilgiler, özel hareketler. `src/ilerleme.ts`: cihazdaki kayıt.
- Mağaza paketi: Capacitor 7 (`android/`, `ios/`, `capacitor.config.ts`, kimlik com.zipzipdunya.oyun).
  `npm run magaza` = sürüm eşitle + derle + cap sync. Sürüm numarası tek yerde: package.json (iPhone'a
  scripts/surum-esitle.mjs yazar, Android build.gradle kendisi okur; `npm test` denetler). Android deneme APK'sı: Actions → "Android deneme paketi".
  Play kapalı test (imzalı AAB): Actions → "Play kapalı test paketi" (yükleme anahtarı android/yukleme-anahtari.jks.enc içinde kilitli, parolası tek gizli değer PLAY_ANAHTAR_PAROLASI; sürüm kodu = çalıştırma numarası).
  Kullanıcı rehberi: docs/magaza-rehberi.md.
- `npm run harita`: harita SVG'sini ve durak konumlarını yeniden üretir (scripts/harita-uret.mjs).
- `src/hareketler.ts`: hareket listesi. `src/ses.ts`: sesler. Kaydı olmayan cümle: uygulamada telefonun konuşma
  motoru (@capacitor-community/text-to-speech; Android uygulama içi tarayıcısında tarayıcı konuşması çalışmaz),
  tarayıcıda speechSynthesis. Ses seçimi src/sesSecimi.ts (önce internetsiz çalışan Türkçe ses).
- Açılış hızı: derlemede Phaser'ın hafif hâli (src/phaserHafif.cjs: fizik motorları ve karo haritası yok; oyun nesneleri
  src/phaserNesneleri.cjs: sadece kullandıklarımız, parçacık/video/3B yok; paket 1,50 → 1,34 MB; geliştirmede tam Phaser).
  Yeni bir Phaser özelliği (ör. fizik, this.add.particles) gerekirse oraya eklenir; `npm test` eksik nesneyi yakalar. Durak simgeleri açılış ekranı çizildikten
  sonra arkada yüklenir. Ölçüm: `node scripts/acilis-olc.mjs` (6 kat yavaş: ~1,9 sn, Ekim 2026; önce ~4,5 sn). `src/arayuz.ts`: düğmeler, arka plan.
- Sahne geçişi: `init` alan bir sahneye geçerken HER ZAMAN veri nesnesi ver (`scene.start('X', {})`);
  Phaser veri verilmezse önceki geçişin verisini yeniden kullanır.
- Test: `npm run dev` ile açınca `window.oyun` üzerinden sahneler başlatılabilir (sadece geliştirmede).
  `npm test`: veri/kural testleri (tests/veri.test.ts: tekil kimlikler, zincir, "gibi" yok, her cümle
  seslendirme listesinde, kayıt anahtarı zipzip-, kodda dış adres yok). `npm run test:oyun`: Playwright ile
  bütün ekranlar, her hareket, dış sunucu isteği yok, internetsiz açılış.
  Yerleşim testi: yazı ekrandan taşmaz, çocuk ekranlarındaki yazı düğmeleri en az 72 nokta (küçük görünen
  düğmeye `arayuz.genisDokunma` ile geniş dokunma alanı verilir). PR'larda Actions → "Testler" çalışır.
- Yeni bölüm eklemek: duraklar.ts'e durak listesi + BOLUMLER satırı, BolumScene AYARLAR'a ayar,
  main.ts'e `new BolumScene('id')`, metinler.ts'e cümleler, rozet ve SertifikaScene UNVAN.
  Sonra `npm run seslendirme-metni` ve katalog (scripts/katalog/README.md).

## Proje sahibiyle çalışma şekli
- Proje sahibi yazılım bilmiyor: her şeyi sade Türkçeyle anlat, teknik terimleri açıkla.
- Karar gereken her noktada önce metinde 5+ seçeneği sıralı bir tabloyla yaz (önerilen en
  başta), sonra AskUserQuestion ile en güçlü 4'ünü sun (önerilen ilk sırada, "(Önerilen)"
  etiketiyle); kullanıcı yazmadan seçebilsin. Her zaman en iyisi için kafa yor.
- Her aşama küçük ve telefonda test edilebilir olsun; sonunda Yağız (6 yaş) test eder.
- Değişiklikler PR olarak açılır; testleri geçince PR'ı Claude birleştirir (kullanıcı onayladı). Ama GitHub'daki `test`
  kontrolü (iş akışı "Testler") PR'ın son hâlinde yeşil olmadan ve sonucu okunmadan birleştirilmez; kırmızıysa önce
  düzeltilir (12 Ekim: #94 kırmızıyken birleşti, ders). Oyunda neyin değişeceğine kullanıcıyla birlikte karar verilir.
- Çalışan sürüm etiketlenir (ilk: `v0.9.0` = fe37906, 12 Ekim). main'e giren her şey test sitesinde (GitHub Pages)
  hemen yayınlanır. Geri alma: PR'daki Revert düğmesi → geri alma PR'ı → test yeşil → birleştir; geçmiş yeniden
  yazılmaz (force push yok). Bulut oturumu etiket, release ve dal koruması oluşturamaz; bunları kullanıcı GitHub'dan yapar.
- Kayıt: `docs/KAYIT.md` her oturum başında okunur, sonunda güncellenir (birleşenler, hatalar, ölçümler, kararlar).
  Onay verilmemiş, ertelenmiş ya da cevapsız kalan her öneri/soru/bulgu da oraya yazılır; ancak karar verilince
  listeden çıkar. Sohbette kalıp kaybolan bilgi olmamalı (oturum kapanınca bulut bilgisayarı silinir).
- Kodda isimler ve yorumlar Türkçe.
- Kota: plan yükseltilmeden tasarruflu çalışılır (yarıyıl öncesi belki yükseltilir). Uzun sohbet
  yerine iş listesi bitince yeni sohbet; istekler toplu; uygun olunca sabah otomatik başlangıç.
- "Yeni oturuma geçelim" denildiğinde: önce iş seçenekleri (tablo + AskUserQuestion, çoklu seçim), sonra Claude yeni oturumu
  kendisi açar (claude-code-remote create_session; ilk mesaj hazır: CLAUDE.md'yi ve docs/KAYIT.md'yi oku, son durum, seçilen işler, "onaylı,
  sormadan yap; testler geçince PR'ı birleştir; büyük ürün kararlarını sabaha bırak"). Önce açık PR birleştirilir ki yeni
  oturum güncel main'den başlasın. Kullanıcı bir şey yazmaz.
- "Yeni sohbet aç" denildiğinde, cevabın sonunda yeni sohbete aynen yapıştırılacak hazır bir başlangıç mesajı
  (kod bloğu içinde) verilir: "CLAUDE.md'yi oku", son birleşen PR'lar, kullanıcıda bekleyenler, sıradaki iş
  seçenekleri (önerilen başta). Kullanıcı kopyalayıp yapıştırır, başka bir şey yazmasına gerek kalmaz.
- Oturum temizliği: yeni oturum başlarken, işi bitmiş eski oturumları (PR'ları birleşmiş/kapanmış, açık iş yok)
  archive_session ile arşivler (silmez; konuşmalar okunabilir kalır). Oturum kendini arşivlemez (cevap yarım kalır).
  Çalışan ya da birleşmemiş PR'ı olan oturuma dokunulmaz.

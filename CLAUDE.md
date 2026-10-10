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
  Ses kararı: beta için Azure doğal ses (ücretsiz katman; hesabı kullanıcı açar, anahtar ortam
  ayarlarına gizli değişken). Cümleler oturunca (beta sonrası) seslendirmen/ajansla insan sesi.
- Çıkış planı: Kasım'da ~100 kişilik beta (TestFlight / Google kapalı test), Ocak sonu yarıyıl
  tatilinde mağaza, 23 Nisan büyük güncelleme. Yorumlar organize ettirilmez (mağaza kuralı);
  çevre beta testçisi olarak kullanılır.
- Hareketler futbol takımının fizyoterapistlerine danışılacak (hareket kataloğu sayfası; ertelendi).
- Ebeveyn köşesi (kilitli): haftalık hareket özeti + paylaş, pasaport düzenleme. Özet dürüst:
  sayılar çocuğun "Yaptım!" dediği hareketler; oyun gerçekten yapıldığını algılayamaz. Kamera ile
  algılama (cihaz içinde, görüntü gönderilmeden) bu yüzden önemli bir sonraki adım.
- Türkiye Turu bitince Gezgin Sertifikası (resim olarak kaydet/paylaş).
- PWA: ana ekrana yüklenir, internetsiz çalışır (vite-plugin-pwa). Yazı tipi pakette
  (@fontsource/baloo-2); oyun hiçbir dış sunucuya bağlanmaz, öyle kalmalı.
- Avatar hayvanları çizim olarak kalır (gerçek fotoğraf değil); ileride çizer Zıpzıp
  tarzında çizecek. İkonlar: public/ikon/ (Zıpzıp'tan üretildi).
- Dünya Harikaları (2. bölüm, ücretli kısım): dönen küre (DunyaScene, d3-geo ile canvas'a
  çizilir); Efes → Kolezyum → Piramitler → Petra → Tac Mahal → Çin Seddi → Machu Picchu.
  Türkiye Turu bitince açılır; beta için ebeveyn köşesinde geçici "Beta: Dünya bölümünü aç"
  (mağazadan önce kaldırılacak). Ödeme mağaza (Capacitor) aşamasında bağlanacak.
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
  kaydı eklenirse anahtarı zipzip- ile başlamalı ve gizlilik.html'deki tabloya eklenmeli.
- Cinsiyet sorulmaz (veri azaltma, kalıp yargı). "Herkes kendini bulsun" ihtiyacı cinsiyetle
  değil, çocuğun seçtiği ilgi alanıyla karşılanır (ör. Spor Kampı'nda sporunu seçer).
- Bölüm yol haritası: Türkiye (ücretsiz) → Dünya Harikaları → Uzay Yolculuğu (sıradaki büyük
  bölüm) → İstanbul'un 7 Tepesi (Şehir Turları; çizer gelince) → Spor Kampı → Dinozorlar →
  Okyanus → Evde Macera → mevsim/bayram bölümleri. Bölüm bitince rozet (pasaport + sertifika).
- Rozetler (src/rozetler.ts, 21 adet): kayıtlardan hesaplanır; cihazda sadece kutlananlar
  tutulur. "Üst üste gün" gibi baskı yaratan rozet yok. Durak sonunda yeni rozet kutlanır.
- Uzay Yolculuğu (3. bölüm, UzayScene): dikey Güneş Sistemi; Ay → Venüs → Merkür → Mars →
  Jüpiter → Satürn → Uranüs → Neptün. Dünya Harikaları bitince açılır. Rozet: Uzay Yolcusu.
- Büyük Macera (MaceraScene): Oyna → bütün bölümler kıvrımlı yolda; açık bölümler ilerlemesiyle,
  gelecekler "Yakında" (ebeveyne "daha çok şey gelecek" vaadi). Bölüm haritalarının ⌂'si buraya döner.
  Vaat: tek ödemeyle gelecek bütün bölümler dahil.
- Kostümler (src/kostumler.ts): her "Yaptım!" 1 yıldız; 9 kostüm yıldız eşiğiyle kendiliğinden
  açılır (harcama/satın alma yok). Giyilen kostüm her ekrandaki Zıpzıp'ta görünür. Kostüm dolabı
  pasaporttan (👕). Durak sonunda yeni rozet ve kostümler sırayla kutlanır.
- Durak simgeleri şimdilik emoji; ileride çizerin çizdiği özel görseller gelecek.
- Animasyon kararı: "canlı ama sakin". Hareket bir işe yaramalı (giriş, sıradaki durak, kutlama);
  sürekli oynayan süs yok. Pasaport sakin, damga/rozet anı canlı. Telefonda "hareketi azalt" açıksa
  animasyonlar azalır. Yağız testinde dikkat dağıtan yer sadeleştirilir.

## Kod düzeni
- `src/zipzip.ts`: maskot; duruşlar (uzuv açıları) ve her hareketin adımları burada.
- `src/duraklar.ts`: duraklar, bilgiler, özel hareketler. `src/ilerleme.ts`: cihazdaki kayıt.
- Mağaza paketi: Capacitor 7 (`android/`, `ios/`, `capacitor.config.ts`, kimlik com.zipzipdunya.oyun).
  `npm run magaza` = derle + cap sync. Android deneme APK'sı: Actions → "Android deneme paketi".
  Kullanıcı rehberi: docs/magaza-rehberi.md.
- `npm run harita`: harita SVG'sini ve durak konumlarını yeniden üretir (scripts/harita-uret.mjs).
- `src/hareketler.ts`: hareket listesi. `src/ses.ts`: sesler. `src/arayuz.ts`: düğmeler, arka plan.
- Sahne geçişi: `init` alan bir sahneye geçerken HER ZAMAN veri nesnesi ver (`scene.start('X', {})`);
  Phaser veri verilmezse önceki geçişin verisini yeniden kullanır.
- Test: `npm run dev` ile açınca `window.oyun` üzerinden sahneler başlatılabilir (sadece geliştirmede).

## Proje sahibiyle çalışma şekli
- Proje sahibi yazılım bilmiyor: her şeyi sade Türkçeyle anlat, teknik terimleri açıkla.
- Karar gereken her noktada önce metinde 5+ seçeneği sıralı bir tabloyla yaz (önerilen en
  başta), sonra AskUserQuestion ile en güçlü 4'ünü sun (önerilen ilk sırada, "(Önerilen)"
  etiketiyle); kullanıcı yazmadan seçebilsin. Her zaman en iyisi için kafa yor.
- Her aşama küçük ve telefonda test edilebilir olsun; sonunda Yağız (6 yaş) test eder.
- Değişiklikler PR olarak açılır; testleri geçince PR'ı Claude birleştirir (kullanıcı onayladı).
- Kodda isimler ve yorumlar Türkçe.
- Kota: plan yükseltilmeden tasarruflu çalışılır (yarıyıl öncesi belki yükseltilir). Uzun sohbet
  yerine iş listesi bitince yeni sohbet; istekler toplu; uygun olunca sabah otomatik başlangıç.

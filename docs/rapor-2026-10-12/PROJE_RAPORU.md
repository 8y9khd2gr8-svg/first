# Zıp Zıp Dünya — Proje Raporu

**Tarih:** 12 Ekim 2026 · **Sürüm:** 0.9.0 (beta öncesi) · **Kaynak:** GitHub `8y9khd2gr8-svg/first`, `main` dalı, son birleşen commit `fe37906` (#97)
**Hazırlayan:** Claude (Claude Code). Bu rapor kodu değiştirmeden, deponun ve çalışan oyunun incelenmesiyle hazırlandı.

> **Okuyan yapay zekâ için not:** Bu belgedeki "✅ çalışıyor" ifadeleri otomatik testlerle ve tarayıcıda (masaüstü Chromium, telefon boyutunda pencere) doğrulanmıştır. **Gerçek bir telefonda, gerçek bir çocukla ve gerçek bir mağazada henüz doğrulanmamış** konular ayrıca "doğrulanmadı" diye işaretlenmiştir. Proje sahibi yazılımcı değildir; her şey sade Türkçeyle anlatılmalıdır.

Diğer belgeler: [TEKNIK_DURUM.md](TEKNIK_DURUM.md) · [GORSEL_ENVANTER.md](GORSEL_ENVANTER.md) · [YOL_HARITASI.md](YOL_HARITASI.md) · [IS_AKISI.md](IS_AKISI.md) · ekran görüntüleri: `ekran-kolaji.jpg`

---

## 1. Oyunun amacı ve hedef kitlesi

- **Ne:** 4-9 yaş çocuklar için Türkçe, **reklamsız, şiddetsiz, kaybetmenin olmadığı** bir hareket (egzersiz) oyunu. Çocuk telefonu sabit bir yere koyar, ekrandaki maskot **Zıpzıp**'ın gösterdiği hareketleri (zıpla, çömel, dizleri kaldır…) yapar.
- **Kimin için:** 4-9 yaş; okuma bilmeyen çocuk da oynayabilmeli (büyük düğmeler, her ekranda sesli yönlendirme). Hareket kısıtı olan çocuk için "oturarak oyna" seçeneği var.
- **Değişmez kurallar (proje sahibinin kararı):** reklam yok · şiddet yok · kaybetmek yok · hesap/kayıt yok · çocuktan veri toplanmaz, her şey sadece telefonda saklanır · oyun hiçbir dış sunucuya bağlanmaz · sosyal ağ özelliği yok (sohbet, skor tablosu, arkadaş ekleme yok).
- **Para modeli (karar verildi):** Türkiye Turu ücretsiz; tek seferlik ödemeyle ("tam sürüm") bütün bölümler açılır. Abonelik yok, oyun içinde başka satış yok, kostümler hareketle kazanılır. Ödeme ekranı ebeveyn kilidinin arkasında.

## 2. Temel oynanış döngüsü

```
Açılış ("Oyna") → Büyük Macera (bölüm yolu) → Bölüm haritası → Durak girişi (kısa bilgi + "Başla")
   → 5-7 hareketlik antrenman (her hareket: Zıpzıp gösterir → 3-2-1 → çocuk yapar → "Yaptım!")
   → Ödül ekranı (damga, yıldız, bazen rozet/kostüm) → Harita (Zıpzıp sıradaki durağa zıplar, altın iz kalır)
   → Bölüm bitince: sertifika + sıradaki bölüm açılır
```

Bir durağın hareket listesi (src/oturum.ts):
- **Isınma:** sadece oturumun ilk durağında (ya da 15 dk aradan sonra).
- **Durağın 4 hareketi:** 1 özel ("hikâyeli") hareket + 3 hikâyeli hareket.
- **1 sürpriz:** "donma oyunu" (Zıpzıp "Dur!" deyince kıpırdama) ya da "ayna oyunu".
- **Soğuma:** bölümün son durağında ya da Ödül ekranındaki "🌙 Bitirelim" ile.

"Yaptım!" düğmesi hareket süresi/sayımı bitince çıkar; oyun hareketin gerçekten yapıldığını (kamera kapalıyken) **bilemez**. İsteğe bağlı kamera modu açıksa bazı hareketleri kamera sayar.

## 3. İçerik: 7 bölüm, 50 durak

| # | Bölüm | Duraklar | Açılma |
|---|---|---|---|
| 1 | Türkiye Turu (ücretsiz) | İstanbul → Çanakkale (Truva) → Denizli (Pamukkale) → Nevşehir (Kapadokya) → Adıyaman (Nemrut) → Şanlıurfa (Göbeklitepe) → Trabzon (Karadeniz) | baştan açık |
| 2 | Dünya Harikaları | Efes → Kolezyum → Piramitler → Petra → Tac Mahal → Çin Seddi → Machu Picchu (dönen küre üzerinde) | Türkiye bitince + tam sürüm |
| 3 | Uzay Yolculuğu | Merkür → Venüs → Ay → Mars → Jüpiter → Satürn → Uranüs → Neptün | önceki bitince + tam sürüm |
| 4 | Spor Kampı | Futbol, Basketbol, Yüzme, Jimnastik, Tenis, Voleybol, Atletizm (**serbest sıra**) | 〃 |
| 5 | Dinozorlar Diyarı | Yumurta → T-Rex → Brakiyozor → Pterozor → Ayak İzleri → Raptor → Fosil Kazısı | 〃 |
| 6 | Evde Macera | Oyuncak → Yastık → Çorap Topu → Yastık Adası → Dans → Kanguru → Toplama (yumuşak ev eşyalarıyla) | 〃 |
| 7 | Okyanus | Deniz Kaplumbağası → Yunus → Ahtapot → Yengeç → Denizatı → Mavi Balina → Mercanlar | 〃 |
| — | İstanbul'un 7 Tepesi | "Yakında" (veri hazır, çizer bekleniyor) | açılmıyor |
| — | 👪 Ailece | Bir büyükle birlikte 5 hareket (damga vermez, kamera kapalı) | Büyük Macera'dan |

Ek içerik: **26 rozet**, **14 kostüm** (her biri bir yerin hatırası, durak/bölüm bitince açılır), her bölüm için **sertifika** (resim olarak kaydet/paylaş), pasaport (ad, seçilen hayvan karakteri ya da isteğe bağlı fotoğraf, damgalar).

## 4. Tamamlanan özellikler (main dalında, testli)

| Alan | Özellik | Doğrulama |
|---|---|---|
| Oynanış | 7 bölüm, 50 durak, ısınma/sürpriz/soğuma, ödül, harita yolculuğu | 12 Ekim'de 50 durağın hepsi otomatik olarak baştan sona oynatıldı; hareket atlanmadı, hata yok |
| Erişilebilirlik | Her çocuk ekranında sesli yönlendirme; büyük düğmeler (en az 72 nokta); renk zıtlığı; renk körlüğü için yıldız/🔒/"?" işaretleri; yazı taşmaz | Otomatik testler |
| Uyarlama | 🐢 Sakin / 🐇 Normal tempo, 🪑 oturarak oyna, 📱 Uzaktan oyna ("Yaptım!" beklemeden 3 sn sonra geçer) | Otomatik testler |
| Ödül | Damga, yıldız, 26 rozet, 14 kostüm (giyilen kostüm her ekranda Zıpzıp'ta görünür), bölüm sertifikaları | Otomatik testler + tarayıcıda görüldü |
| Ebeveyn | Çarpma sorulu kilit; Ebeveyn köşesi: haftalık hareket özeti + paylaş, pasaport düzenleme, ⚙️ Ayarlar, ❓ Nasıl oynanır, 🔊 Sesi dene, 📷 kamera aç/kapa + 🔍 Dene, "Bu telefonda neler var?", 🗑️ Tüm verileri sil, sürüm numarası | Tarayıcıda gezildi |
| Güvenlik | İlk açılışta ebeveyn güvenlik notu, durak girişinde kısa hatırlatma | Tarayıcıda görüldü |
| Gizlilik | Hesap yok, dış sunucu yok, internetsiz çalışır (PWA), gizlilik.html + kosullar.html taslağı | Otomatik testler (dış istek yok, internetsiz açılış) |
| Kamera (isteğe bağlı) | MediaPipe Pose cihaz içinde; 13 hareket 6 sayma yoluyla sayılır; görüntü kaydedilmez | Yapay vücut noktalarıyla test; **gerçek çocukla denenmedi** |
| Ödeme | `tam_surum` tek ürün, satın al/geri yükle, ebeveyn kilidi arkasında | Sahte mağazayla test; **gerçek mağazada denenmedi** |
| Mağaza paketi | Capacitor 7 ile Android/iOS projeleri; GitHub Actions ile Android deneme APK'sı ve imzalı Play paketi (AAB) | Actions'ta derleniyor; **mağazaya hiç yüklenmedi** |
| Performans | Hafif Phaser paketi; yavaş telefonda otomatik sadeleşme (30 kare sınırı, süs animasyonu kapanır); yavaş telefonda kamera tanıması araya süre koyar | Tarayıcıda işlemci yavaşlatılarak ölçüldü |

## 5. Çalışan / kısmen çalışan / yapılmamış

**Kısmen çalışan veya doğrulanmamış**
- **Ses:** 760 cümlenin hiçbirinin doğal ses kaydı yok (`public/ses/` boş). Şu an telefonun kendi metin-okuma sesi kullanılıyor. Telefonda Türkçe ses yüklü değilse **Zıpzıp konuşamaz** ve okuma bilmeyen çocuk yönlendirmeyi duyamaz. Azure ile kayıt altyapısı hazır (`npm run seslendir`), hesap açılmadı.
- **Kamera sayımı:** eşikler gerçek çocukla ayarlanmadı (Yağız testinde ayarlanacak). Eski telefonlarda (SIMD desteği yoksa, ör. iOS 16.4 öncesi) kamera seçeneği hiç görünmez.
- **Ödeme:** kod hazır, gerçek Play/App Store ürünüyle denenmedi.
- **İnternetsiz Android paketi:** kullanıcının telefonda denemesi bekleniyor; sonuç gelene kadar Android'in internet izni bilerek duruyor.
- **iPhone:** imzasız derleme Actions'ta denetleniyor; Mac/Xcode ile gerçek cihaza hiç yüklenmedi.

**Yapılmamış**
- İstanbul'un 7 Tepesi bölümü (veri ve kurallar hazır, çizer bekleniyor).
- Çizer işi: Zıpzıp ve bütün durak simgeleri şu an kodla çizilmiş/emoji; "çizer gelince yeniden çizilecek" kararı var.
- Zıpzıp şarkısı, kardeş modu, sınıf/anaokulu modu, 23 Nisan bölümü, İngilizce sürüm (yol haritasında).
- Geri bildirim e-posta adresi (alan adı alınınca; şimdilik "beta grubuna yazın" notu).

## 6. Görsel dünya (ayrıntı: GORSEL_ENVANTER.md)

- **Maskot Zıpzıp:** kollu-bacaklı, gülen bir dünya küresi. Türkiye her zaman altın sarısı (#FFC93C). Büyük parlak gözler, pembe yanak, gülen ağız, kırmızı spor ayakkabı. **Tamamen kodla çiziliyor** (resim dosyası yok): gövde `src/zipzipKure.ts` (d3-geo ile gerçek dünya haritası), yüz `src/zipzipYuz.ts`, kol/bacak ve hareketler `src/zipzip.ts`. Bölüme göre dünyanın o tarafı görünür (Okyanus'ta Büyük Okyanus, Dinozor'da Kuzey Amerika…).
- **Genel görünüm:** koyu lacivert yıldızlı uzay arka planı, turuncu/yeşil/mavi yuvarlak büyük düğmeler, Baloo 2 yazı tipi (pakette).
- **Haritalar:** Türkiye (SVG harita), Dünya Harikaları (dönen 3B görünümlü küre), Uzay (dikey Güneş Sistemi), Spor (atletizm pisti), Dinozor (orman), Evde (oda), Okyanus (deniz). Bölüm haritaları kodla çiziliyor; durak simgeleri Türkiye/Dünya için 14 küçük SVG, diğerleri emoji.
- **Animasyon kararı:** "canlı ama sakin" — sürekli oynayan süs yok; hareket bir işe yarar (giriş, sıradaki durak, kutlama). Telefonda "hareketi azalt" açıksa ya da telefon yavaşsa süs animasyonları kapanır.

## 7. Oyuncunun ilerlemesi

- Sıralı bölümlerde duraklar sırayla açılır (kapalıda 🔒); Spor Kampı'nda çocuk istediği sporu seçer.
- Her bölüm öncekini bitirince açılır; Türkiye dışındakiler ayrıca tam sürüm ister (web test sürümünde ödeme yok; beta için ebeveyn köşesinde geçici "🧪 Beta: bütün bölümleri aç" var — mağazadan önce kaldırılacak).
- İlerleme, rozetler, kostümler, istatistik ve ayarlar sadece telefonda (`localStorage`, `zipzip-` ile başlayan 11 anahtar) saklanır. Uygulama silinirse ilerleme gider; telefonlar arası taşıma yok (bilinçli karar).

## 8. Alınmış önemli tasarım kararları (özet)

Tam liste depodaki `CLAUDE.md` dosyasındadır; aşağıdakiler en çok etkileyenler:
1. Komutlar benzetme değil, vücut parçası söyleyen net eylem ("Tek ayağını kaldır"; "leylek gibi" yok — 6 yaşındaki test çocuğu anlamadı). Test "gibi" kelimesini yakalar.
2. Çocuğun adı sesli söylenmez ("Merhaba gezgin!"), sadece yazılır. Cinsiyet sorulmaz; cinsiyet çağrıştıran kostüm yok.
3. Dini figür/ibadet odaklı yapılar listeye alınmaz; köpekbalığı yok (ürkütücü); balon yok (boğulma riski); "üst üste gün" gibi baskı yaratan rozet yok.
4. Kamera isteğe bağlı ve ebeveyn köşesinden açılır; sesli "Yaptım" komutu yok.
5. Yaş etiketi kullanılmaz ("4-5 yaş" yerine "🐢 Sakin").
6. Hedef sadece mağazalar: web adresi (GitHub Pages) beta sonuna kadar test için; mağazaya çıkınca sitede sadece gizlilik/koşullar sayfaları kalır.
7. Takvim: Kasım'da 25-30 ailelik kapalı beta, Ocak sonu mağaza, 23 Nisan büyük güncelleme.

## 9. Bilinen sorunlar ve eksikler (12 Ekim itibarıyla)

| # | Konu | Durum |
|---|---|---|
| 1 | Telefonda Türkçe ses yoksa oyun sessiz kalır | Doğal ses kaydı yapılmadı; "Sesi dene" ekranı ebeveyne yükleme adımlarını gösteriyor |
| 2 | Ebeveyn köşesine giriş sadece Pasaport → ✏️ düğmesinden; ebeveynin bulması zor olabilir | #97 ile ilk açılış güvenlik notuna yeri yazıldı; ayrı bir ebeveyn düğmesi gerekip gerekmediği **karar bekliyor** |
| 3 | Kamera denemesi ekranında "📷 Kamerayı aç" düğmesi kamera kutusunun arkasında kalıyordu | ✅ #97 ile düzeltildi (12 Ekim), testi eklendi |
| 4 | Kamera sayma eşikleri gerçek çocukla denenmedi | Yağız testi bekleniyor |
| 5 | Ödeme, Play/App Store'da hiç denenmedi | Geliştirici hesapları açılmadı |
| 6 | Android internet izni hâlâ var | İnternetsiz APK denemesinin sonucu bekleniyor |
| 7 | Çok yavaş telefonda Uzay haritası ve kamera denemesi ekranı kare bütçesinin sınırında (ölçüm: işlemci 6 kat yavaşlatılmış tarayıcıda) | Gerçek telefonda ölçülmedi |
| 8 | Otomatik testlerin GitHub'daki süresi ~7-8 dk'ya çıktı (50 durak testi eklendi; testler iki işçide paralel) | Çalışıyor; süreye bağlı testler yavaş makinede kırılgan olabilir (bir tanesi #95'te sağlamlaştırıldı) |
| 9 | `main` dalı GitHub'da korumalı değil; sürüm etiketi (tag) hiç yok | Bkz. IS_AKISI.md |
| 10 | Gizlilik ve koşullar metinleri taslak; avukata gösterilmedi; iletişim adresi yok | Kullanıcıda bekliyor |

**Dürüstlük notu:** 12 Ekim'de PR #94 testleri kırmızıyken (süreye bağlı bir test zaman aşımına düştü) yanlışlıkla birleştirildi; sorun oyunda değil testteydi ve hemen #95 ile düzeltildi. Bundan sonra birleştirme sadece testler yeşilken ve sonucu okunduktan sonra yapılır (IS_AKISI.md).

## 10. Sıradaki aşamalar ve öncelik

Ayrıntılı iş listesi, bağımlılıklar ve tamamlanma ölçütleri: **[YOL_HARITASI.md](YOL_HARITASI.md)**. Kısaca:
1. **Sağlamlaştırma (beta öncesi, şart):** internetsiz APK denemesi → Android internet izninin kaldırılması; Yağız testi ve kamera eşikleri; doğal ses kaydı.
2. **Görsel kalite:** çizer ile Zıpzıp ve durak simgeleri; bölüm arka planları.
3. **Yeni içerik:** İstanbul'un 7 Tepesi, 23 Nisan bölümü, evdeki eşyalarla yeni hareketler.
4. **Test, performans, yayın:** Play kapalı test (en az 12 testçi, 14 gün), TestFlight, mağaza yaş derecelendirmesi, "Beta: bütün bölümleri aç" düğmesinin kaldırılması.

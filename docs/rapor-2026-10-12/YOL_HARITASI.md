# Zıp Zıp Dünya — Geliştirme Yol Haritası

**Tarih:** 12 Ekim 2026 · `main` @ `fe37906` · Hedef takvim (proje sahibinin kararı): **Kasım** kapalı beta (25-30 aile), **Ocak sonu** mağaza, **23 Nisan** büyük güncelleme.
İlke: projeyi baştan yazmak yok; mevcut yapı korunarak küçük, telefonda denenebilir adımlar. Her iş ayrı dal + PR, testler yeşil olmadan birleştirme yok (IS_AKISI.md).
"Kim" sütunu: **Siz** = proje sahibi (hesap, telefon, karar), **Kod** = yapay zekâ ile kod işi.

---

## Öncelik 1 — Mevcut oyunu sağlamlaştırma (beta öncesi)

| # | İş | Mevcut durum | Yapılacak | Bağımlılık | Tamamlanma ölçütü | Kim |
|---|---|---|---|---|---|---|
| 1.1 | İnternetsiz Android paketi denemesi | APK Actions'ta üretiliyor; telefonda denenmedi | Uçak modunda APK'yı açıp ses, kamera, sertifika kaydını denemek | Android telefon | Deneme listesinin (docs/beta-hazir-mi.md bölüm 5) her maddesi işaretli | Siz |
| 1.2 | Android internet iznini kaldırmak | İzin bilerek duruyor | `AndroidManifest.xml`'den `INTERNET` çıkarılır | 1.1 sonucu olumlu | Yeni APK uçak modunda ve normalde aynı çalışır; Play formu "internet yok" ile uyumlu | Kod |
| 1.3 | Yağız testi (6 yaş) | Gözlem listesi hazır (docs/yagiz-testi.md) | 15-20 dk oynatıp not almak; kamerayı da açmak | — | Doldurulmuş gözlem listesi | Siz |
| 1.4 | Kamera sayma eşiklerini ayarlamak | Eşikler yapay verilerle ayarlı | Yağız testindeki "🔍 Dene" sonuçlarına göre `src/kamera.ts` eşikleri | 1.3 | Her 6 sayma yolunda 10 tekrarın en az 8'i doğru sayılır (gerçek çocukla) | Kod + Siz |
| 1.5 | Doğal ses | 760 cümlenin kaydı yok; telefon sesi | Azure ücretsiz hesap → anahtar gizli değişkene → `npm run seslendir` | Azure hesabı | `public/ses/` dolu; "Sesi dene" doğal kaydı gösterir; paket boyutu kontrol edildi | Siz + Kod |
| 1.6 | Yağız testinden çıkan küçük düzeltmeler | — | Anlaşılmayan cümleler, ıskalanan düğmeler | 1.3 | Her not için PR ya da "kalsın" kararı | Kod |
| 1.7 | Ebeveyn köşesine ulaşmak | Sadece Pasaport → ✏️; güvenlik notunda yazıyor (#97) | Ayrı kilitli ebeveyn düğmesi gerekip gerekmediğine karar | Karar | Beta ailelerinin ilk günde köşeyi bulabilmesi (beta-rehberi'ne de yazılır) | Siz (karar) |
| 1.8 | GitHub'da çalışan sürümü korumak | `main` korumasız, sürüm etiketi yok | Dal koruması + `v0.9.0` etiketi (IS_AKISI.md) | Onay | Testler geçmeden main'e girilemiyor; etiketten geri dönülebiliyor | Siz (ayar) + Kod |

## Öncelik 2 — Görsel kalite ve animasyonlar

| # | İş | Mevcut durum | Yapılacak | Bağımlılık | Tamamlanma ölçütü |
|---|---|---|---|---|---|
| 2.1 | Çizer bulmak ve stil rehberi | Zıpzıp kodla çiziliyor ("B · Sevimli" tasarım) | Çizere Zıpzıp'ın mevcut hâli + `docs/yedi-tepe.md` istek listesi | Bütçe/kişi | Onaylı Zıpzıp karakter sayfası (ön, yan, ifadeler) |
| 2.2 | Durak simgeleri (50) tek tarzda | 14 SVG + 36 emoji (telefona göre farklı görünür) | Çizerden 50 simge; aynı adla `public/simge/` | 2.1 | Bütün haritalarda emoji kalmaz; paket artışı ölçülür; testler yeşil |
| 2.3 | Karakter (hayvan) ve kostüm çizimleri | Emoji | Çizim | 2.1 | Android ve iPhone'da aynı görünür |
| 2.4 | Bölüm arka planları | Kodla düz şekiller | Tematik arka plan resimleri | 2.1 | Renk zıtlığı testi geçer; açılış süresi 6× yavaşta 2,5 sn'yi aşmaz |
| 2.5 | Zıpzıp animasyonunu çizimle yeniden yapmak (Rive vb.) | Kodla tween animasyonu, ~50 hareket | Önce tek hareketle deneme (örn. zıpla), performans ölçümü | 2.1 | Deneme hareketi yavaş telefonda takılmaz; karar sonrası kademeli geçiş |
| 2.6 | Çok yavaş telefonda Uzay haritası/kamera ekranı | Ölçümde sınıra yakın | Gerçek eski telefonda ölçüm; gerekirse sabit çizimleri resme çevirmek | Eski telefon | 30 karede akıcı |

## Öncelik 3 — Yeni sahneler, mekanikler, içerik

| # | İş | Mevcut durum | Yapılacak | Bağımlılık | Tamamlanma ölçütü |
|---|---|---|---|---|---|
| 3.1 | İstanbul'un 7 Tepesi | Veri ve kurallar hazır (`src/tepeler.ts`, testli); oyunda "Yakında" | Harita çizimi gelince `BolumScene` ayarı ve açılma | 2.1 | 7 durak oynanır, 50 durak testine eklenir |
| 3.2 | 23 Nisan özel bölümü | Fikir | İçerik ve hareket listesi | Karar | Nisan güncellemesinde |
| 3.3 | Evdeki eşyalarla hareketler (yeni bölüm/ek) | Fikir; Evde Macera var | Güvenli (yumuşak) eşyalarla yeni hareketler | Fizyoterapist görüşü (ertelendi) | Güvenlik kuralına uygun ("balon yok") |
| 3.4 | Zıpzıp şarkısı/jingle | Fikir | Marka araştırmasından sonra | Marka | — |
| 3.5 | Kardeş modu, sınıf/anaokulu modu, İngilizce sürüm | Yol haritasında | Mağaza sonrası satışlara göre seçilecek | Mağaza | — |
| 3.6 | Ek oyunlar (eşleştirme, boyama) | "Acele yok" notu | 23 Nisan ya da sonrası konuşulacak | Karar | — |

Her yeni özellik için kural (CLAUDE.md): 4-5, 6-7, 8-9 yaş ve hareket kısıtı olan çocuk için nasıl olacağı önceden yazılır.

## Öncelik 4 — Test, performans, yayın hazırlığı

| # | İş | Mevcut durum | Yapılacak | Bağımlılık | Tamamlanma ölçütü | Kim |
|---|---|---|---|---|---|---|
| 4.1 | Google Play geliştirici hesabı + kapalı test | Hesap yok; formların cevapları hazır (docs/play-formlari.md) | Hesap, formlar, AAB yükleme, ≥12 testçi | ~25 $ | 14 günlük kapalı test başladı | Siz |
| 4.2 | Ödemeyi gerçek mağazada denemek | Sahte mağazayla testli | `tam_surum` ürünü + lisans testçisi | 4.1 | Satın al + geri yükle gerçek cihazda çalışır | Siz + Kod |
| 4.3 | Apple hesabı + TestFlight | Hesap yok; imzasız derleme denetimi var | Hesap, Mac ile paket | ~99 $/yıl, Mac | TestFlight'ta oyun açılır | Siz |
| 4.4 | Play ön lansman raporu | — | Kapalı testle otomatik gelir | 4.1 | Çökme yok | — |
| 4.5 | Mağaza yaş derecelendirmesi (IARC/Apple) | Beklenen PEGI 3 / 4+ | Formlar | 4.1, 4.3 | Derecelendirme alındı (1 Kasım 2026 düzenlemesi için şart) | Siz |
| 4.6 | Gizlilik/koşullar ve iletişim adresi | Taslak; adres yok | Avukat görüşü; alan adı ve e-posta | Avukat | Mağaza gizlilik adresi hazır | Siz |
| 4.7 | Marka (TÜRKPATENT, sınıf 9 ve 41) | Yapılmadı | Araştırma + başvuru (Ekim-Kasım) | — | Başvuru numarası | Siz |
| 4.8 | Mağazadan önce temizlik | "🧪 Beta: bütün bölümleri aç" düğmesi var; web sitesinde oyun var | Düğmeyi kaldırmak; siteden oyunu kaldırıp sadece gizlilik/koşullar bırakmak | Beta sonu | Mağaza sürümünde beta düğmesi yok | Kod |
| 4.9 | Otomatik testlerin süresi ve sağlamlığı | ~7-8 dk, 2 işçi; süreye bağlı testler | Gerekirse süreye bağlı testleri saat hızlandırmayla sağlamlaştırmak | — | Arka arkaya 5 koşuda kırmızı yok | Kod |

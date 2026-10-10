# Play Console formları: hazır cevaplar

Play Console'da uygulamayı oluşturduktan sonra **Politika → Uygulama içeriği** (App content) bölümündeki
formların hepsi doldurulmadan kapalı test bile yayınlanmaz. Aşağıda her form, ne seçileceği ve nedeni var.
Menü adları Türkçe arayüzdeki gibi; parantez içinde İngilizcesi. Play arayüzü zamanla değişebilir,
emin olmadığın bir soru çıkarsa göndermeden bana yaz.

Ön koşul: Geliştirici hesabında bir **iletişim e-postası** zorunlu (mağaza sayfasında görünür). Alan adı
alınana kadar bu iş için ayrı bir e-posta adresi açman iyi olur (kişisel adresini kullanma).

---

## 1. Gizlilik politikası (Privacy policy)
- Adres: `https://8y9khd2gr8-svg.github.io/first/gizlilik.html`
- Mağazaya çıkarken oyun web sitesinden kaldırılsa da bu sayfa kalır (CLAUDE.md kararı).

## 2. Uygulama erişimi (App access)
- Seç: **"Tüm işlevler özel erişim gerektirmeden kullanılabilir"** (All functionality is available without special access).
- Neden: Hesap ya da şifre yok. Ebeveyn köşesindeki çarpma sorusu ekranda yazıyor, inceleyici kendisi çözebilir.

## 3. Reklamlar (Ads)
- Seç: **"Hayır, uygulamam reklam içermiyor."**

## 4. İçerik derecelendirmesi (Content rating)
Mağaza rehberi 4b'de neden önemli olduğu yazıyor (1 Kasım 2026 düzenlemesi). Anket:

| Soru | Cevap |
|---|---|
| E-posta | İletişim e-postan |
| Kategori | **Oyun** (Game) |
| Şiddet, kan, korku | Hayır |
| Cinsellik, çıplaklık | Hayır |
| Küfür, kaba dil | Hayır |
| Uyuşturucu, alkol, tütün | Hayır |
| Kumar, şans oyunu | Hayır |
| Kullanıcılar birbiriyle iletişim kurabiliyor ya da içerik paylaşabiliyor mu? | **Hayır** (sohbet, profil, skor tablosu yok) |
| Kullanıcının konumu paylaşılıyor mu? | Hayır |
| Dijital ürün satın alınabiliyor mu? | **Kapalı testte: Hayır** (ödeme henüz yok). Ödeme eklendiği sürümde anket yeniden doldurulur ve "Evet" seçilir. |
| Sınırsız internet erişimi (tarayıcı) var mı? | Hayır |

Beklenen sonuç: **PEGI 3 / Herkes (Everyone)**. Farklı çıkarsa göndermeden bana yaz.

## 5. Hedef kitle ve içerik (Target audience and content)
| Soru | Cevap |
|---|---|
| Hedef yaş grupları | **5 yaş ve altı**, **6-8**, **9-12** (oyun 4-9 yaş için; 13 ve üstünü seçme) |
| Mağaza varlığı / Aileler politikası | Çocuklar hedeflendiği için uygulama **Aileler politikasına** girer. Buna uyuyoruz: reklam yok, veri toplama yok, üçüncü taraf kitaplık (SDK) yok. |
| Uygulama istemeden çocukların ilgisini çekiyor mu? | (Çocuklar zaten hedef kitle olduğu için sorulmaz.) |
| "Öğretmen Onaylı" (Teacher Approved) | Şimdilik seçme. Mağazaya çıktıktan sonra değerlendirilir. |

## 6. Veri güvenliği (Data safety)
Bu formda "toplama", verinin **telefondan dışarı gönderilmesi** demek. Telefonda kalan ve telefonda işlenen
veri toplama sayılmaz (Google'ın kendi tanımı). Bizim oyunumuz hiçbir şeyi dışarı göndermiyor.

| Soru | Cevap |
|---|---|
| Uygulama gerekli kullanıcı verisi türlerinden herhangi birini topluyor ya da paylaşıyor mu? | **Hayır** |

Bu kadar. "Hayır" deyince şifreleme ve silme soruları gelmez. Mağaza sayfasında **"Veri toplanmıyor"** ve
**"Üçüncü taraflarla veri paylaşılmıyor"** yazar.

Neden doğru:
- Ad, fotoğraf, ilerleme, hareket kaydı sadece telefonda (ebeveyn köşesindeki "Bu telefonda neler var?" ekranı bunu gösteriyor).
- Kamera görüntüsü telefonda işleniyor, kaydedilmiyor, gönderilmiyor.
- Oyunda analiz, çökme raporu ya da reklam kitaplığı yok. Testler oyunun hiçbir dış sunucuya bağlanmadığını her PR'da denetliyor.
- **Dikkat:** İleride çökme raporu, analiz ya da bulut kaydı eklenirse bu form yeniden doldurulmalı.

## 7. Diğer beyanlar
| Form | Cevap |
|---|---|
| Haber uygulaması (News apps) | Hayır |
| COVID-19 temaslı izleme / durum | Uygulamam bunlardan biri değil |
| Devlet uygulaması (Government apps) | Hayır |
| Finansal özellikler (Financial features) | Uygulamamda finansal özellik yok |
| Sağlık uygulamaları (Health apps) | **"Etkinlik ve fitness"** (Activity and fitness) işaretlenir: oyun hareket ettirir ve hareket özetini telefonda tutar. Tıbbi bir iddiamız yok; "tıbbi" seçenekleri seçme. |
| Hassas izinler | Gerekmez. Kamera izni hassas izin beyanı istemiyor; izin sadece ebeveyn kamerayla saymayı açarsa ya da pasaport fotoğrafı çekerse soruluyor (gizlilik.html, 4. madde). |

## 8. Mağaza ayarları ve sayfası (Store settings / Main store listing)
| Alan | Değer |
|---|---|
| Uygulama mı oyun mu | **Oyun** |
| Kategori | **Eğitici** (Educational) |
| Etiketler | Eğitici, Aile, Çocuk (Play'in listesinden en yakınları) |
| Uygulama adı | Zıp Zıp Dünya |
| Kısa açıklama | `docs/magaza-metinleri.md` → "Kısa açıklama – Google" |
| Uzun açıklama | `docs/magaza-metinleri.md` → "Uzun açıklama" |
| Uygulama simgesi | `docs/magaza-gorselleri/ikon-512.png` |
| Öne çıkan grafik | `docs/magaza-gorselleri/tanitim-1024x500.png` |
| Telefon ekran görüntüleri | `docs/magaza-gorselleri/ekran-1.png` … `ekran-7.png` (bu sırayla) |
| İletişim e-postası | Ön koşuldaki adres |
| Gizlilik politikası | 1. maddedeki adres |

## 9. Fiyat
- Kapalı testte uygulama **Ücretsiz**. (Uygulamanın kendisi her zaman ücretsiz kalır; tam sürüm ileride uygulama içi tek seferlik ödemeyle açılır.)
- **Dikkat:** Play'de ücretsiz yayınlanan bir uygulama sonradan ücretliye çevrilemez. Bizim planımız zaten "ücretsiz uygulama + uygulama içi ödeme", bu yüzden sorun yok.

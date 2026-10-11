# Beta hazır mı? (Kasım kapalı beta kontrol listesi)

Son kontrol: 10 Ekim 2026, sürüm 0.9.0. ✅ = hazır, ⬜ = bekliyor.
Ayrıntılı adımlar: [magaza-rehberi.md](magaza-rehberi.md), [seslendirme-rehberi.md](seslendirme-rehberi.md),
testçilere gönderilecek metin: [beta-rehberi.md](beta-rehberi.md).

## 1. Oyun (kod tarafı, bende)

| | Konu | Not |
|---|---|---|
| ✅ | 7 bölüm oynanır: Türkiye, Dünya, Uzay, Spor, Dinozor, Evde, Okyanus | Her bölüm öncekini bitirince açılır |
| ✅ | Ebeveyn kilidi, güvenlik notu (ilk açılışta), durak girişinde kısa hatırlatma | |
| ✅ | Ebeveyn köşesi: özet, pasaport, tam sürüm, güvenlik, **🔊 Sesi dene**, kamera, veri silme, "Bu telefonda neler var?" | Sesi dene bu PR'da eklendi |
| ✅ | Kamerayla sayma (isteğe bağlı): 13 hareket | Eşikler Yağız testinde ayarlanacak |
| ✅ | Ödeme: `tam_surum`, geri yükleme, kilidin arkasında | Gerçek mağazada denenmedi (aşağıda 2) |
| ✅ | İnternetsiz çalışma, dış sunucuya bağlanmama | Otomatik testler her PR'da denetler |
| ✅ | Okunurluk, düğme büyüklüğü, yazı taşması | Otomatik testler |
| ✅ | Açılış hızı (yavaş telefonda ~2,9 sn) | |
| ✅ | Android'de telefon sesi (uygulama içinde) | Gerçek telefonda internetsiz denenmedi (aşağıda 2) |
| ✅ | Sürüm numarası ebeveyn köşesinin altında; Play paketine otomatik yazılır | iPhone paketi şimdilik "1.0" gösterir, TestFlight'ta sorun değil |
| ⬜ | Doğal ses: 655 cümle kaydı yok, şimdilik telefonun sesi okuyor | Azure hesabı açılınca `npm run seslendir` (sizde, aşağıda) |
| ⬜ | Geri bildirim adresi boş; ebeveyn köşesi "beta grubuna yazın" diyor | Betada yeterli; alan adı gelince eklenir |

## 2. Sizde bekleyenler (betadan önce)

| Sıra | İş | Neden önemli | Rehber |
|---|---|---|---|
| 1 | Android deneme APK'sını telefonda deneyin: Ebeveyn köşesi → **🔊 Sesi dene** → Dinle | Ses yoksa okuma bilmeyen çocuk oynayamaz; en kritik kontrol | Aşağıda 5 (10 dk) |
| 2 | Aynı denemeyi internetsiz APK ile yapın (uçak modunda) | "İnternete bağlanmaz" sözünün kanıtı | Aşağıda 5 |
| 3 | Yağız testi (kamerayı da açıp sayım doğru mu bakın) | Gerçek çocukla ilk sonuç | yagiz-testi.md |
| 4 | Google Play geliştirici hesabı + formlar + ilk yükleme (kapalı test) | Android betası buna bağlı | magaza-rehberi 3, 3b, 4b |
| 5 | Play'de `tam_surum` ürünü ve lisans testçisi | Ödemeyi gerçekten denemek için | magaza-rehberi 3c |
| 6 | Apple geliştirici hesabı (TestFlight) | iPhone betası buna bağlı | magaza-rehberi 4 |
| 7 | Azure hesabı ve doğal ses kaydı | Ses daha anlaşılır olur; telefonun sesine bağımlılık biter | seslendirme-rehberi |
| 8 | Marka araştırması ve başvurusu (TÜRKPATENT, sınıf 9 ve 41) | Ad betada herkese duyulmadan önce | magaza-rehberi 1 |
| 9 | Avukat görüşmesi (gizlilik ve koşullar taslağı) | Mağaza gizlilik adresi ister | magaza-rehberi 7 |

## 3. Beta günü

- ⬜ Beta testçilerine beta-rehberi.md'nin sonundaki WhatsApp mesajı ve davet bağlantıları
- ⬜ Testçilere: "ilk gün Ebeveyn köşesi → 🔊 Sesi dene'ye bakın" hatırlatması
- ⬜ Beta grubundaki geri bildirimleri haftada bir toplayıp bana getirin (telefon modeli + sürüm numarasıyla)

## 4. Kanıt: telefonda ne izin istiyoruz, içinde ne var? (11 Ekim denetimi)

Ebeveyn "bu uygulama ne istiyor?" diye sorarsa cevap burada. Kaynak: `android/app/src/main/AndroidManifest.xml`,
eklentilerin kendi izin dosyaları ve `ios/App/App/Info.plist`.

**Android izinleri**

| İzin | Neden | Ebeveyn ne görür |
|---|---|---|
| Kamera (`CAMERA`) | Sadece ebeveyn kamera modunu açarsa hareketleri saymak için; pasaport fotoğrafı (isteğe bağlı) | İlk kullanımda telefon izin sorar; vermezse oyun aynen çalışır |
| Satın alma (`com.android.vending.BILLING`) | Google Play ödeme kütüphanesi ekler; tam sürüm için | İzin sorulmaz (mağazanın kendi ödeme ekranı) |
| İnternet (`INTERNET`) | Capacitor şablonunda hazır geliyor; oyun hiçbir sunucuya bağlanmaz (`npm run test:oyun` her ekranda denetler) | Play sayfasında "tam ağ erişimi" yazar. Kaldırmak sabah kararı (aşağıda) |

Konum, rehber, mikrofon, dosyalar, bildirim, reklam kimliği **yok**. Konuşma eklentisi sadece telefonun
konuşma motorunu bulmak için "TTS_SERVICE" sorgusu ekler (izin değildir).

**Bu denetimde değişen**
- `allowBackup="false"`: Önceden Android, oyunun kayıtlarını (çocuğun adı, fotoğrafı, ilerleme) ailenin Google Drive yedeğine
  gönderebiliyordu; artık göndermez. "Bilgiler sadece bu telefonda" sözü Android'de de tam doğru.
  Bedeli: yeni telefona geçince ilerleme taşınmaz (satın alma taşınır: "Satın alımı geri yükle").
- iPhone: `NSPhotoLibraryAddUsageDescription` eklendi. Sertifikayı paylaş ekranında "Resmi Kaydet"e basılınca bu
  metin yoksa uygulama kapanıyordu (Apple kuralı). Metin: "Uygulama fotoğraflarınızı görmez, sadece sertifikayı ekler."

**iPhone gizlilik dosyası**: `ios/App/App/PrivacyInfo.xcprivacy` "izleme yok, veri toplanmıyor" der; App Store etiketi "Data Not Collected" (magaza-rehberi 4).

**iPhone izin metinleri**: Kamera ("Ebeveyn açarsa kamera... görüntü telefonda işlenir; kaydedilmez ve hiçbir yere
gönderilmez") ve fotoğraflara ekleme (yukarıda). Başka izin yok.

**İçindeki kütüphaneler** (hepsi pakette, hiçbiri veri göndermez; reklam, analiz, çökme raporu SDK'sı yok)

| Kütüphane | Ne işe yarar |
|---|---|
| Capacitor 7 (core, android, ios) | Web oyununu telefon uygulamasına çevirir |
| @capgo/native-purchases + Google Play Billing 8.3 / StoreKit | Tek seferlik ödeme (sunucusuz) |
| @capacitor-community/text-to-speech | Kaydı olmayan cümleyi telefonun kendi sesiyle okur |
| Phaser 3.90 | Oyun motoru (ekranlar, animasyon) |
| @mediapipe/tasks-vision (+ model dosyası pakette) | İsteğe bağlı kamera sayımı, telefonun içinde |
| d3-geo, topojson-client, world-atlas | Dönen dünya ve Zıpzıp'ın küresi (harita verisi pakette) |
| @fontsource/baloo-2 | Yazı tipi (pakette) |

## 5. Sabah denemesi: Android APK (10 dakika)

Amaç: oyun gerçek bir Android uygulaması olarak sorunsuz mu, ve **internet izni olmadan da** çalışıyor mu?
İkinci sorunun cevabı, Play sayfasında "internet erişimi yok" yazıp yazamayacağımızı belirler.
Her adımda **"Görmelisiniz"** yazanı görmüyorsanız adım numarasını ve ekranın fotoğrafını bana getirin.

**Hazırlık (bilgisayarda ya da telefonda, 2 dk)**

1. GitHub'da proje → **Actions** → soldan **Android deneme paketi**. Listede iki yeşil ✅ iş görmelisiniz
   (önceki oturum ikisini de başlattı). Biri sarı/dönüyorsa birkaç dakika bekleyin; kırmızı ❌ ise bana yazın.
2. İşlerin her birine girin, en altta **Artifacts** bölümü var:
   - `zip-zip-dunya-apk-internetsiz` → **asıl denenecek olan bu** (internet izni yok)
   - `zip-zip-dunya-apk` → internetli, karşılaştırma için (internetsiz sorun çıkarırsa bunu deneriz)
3. `zip-zip-dunya-apk-internetsiz`'i indirin. Zip'in içinden **app-debug.apk** çıkar; telefona gönderin
   (kendinize WhatsApp/e-posta ya da kabloyla).

**Kurulum (2 dk)**

4. Telefonda app-debug.apk'ya dokunun. "Bilinmeyen kaynak" uyarısında izin verip **Yükle**.
   Görmelisiniz: ana ekranda Zıpzıp simgeli **Zıp Zıp Dünya**. (Eski deneme kuruluysa "güncelle" der, sorun değil.)
5. Kurulduktan sonra telefonun **Ayarlar → Uygulamalar → Zıp Zıp Dünya → İzinler**'e bakın.
   Görmelisiniz: sadece "Kamera" (henüz izin verilmemiş). Konum, mikrofon, dosya **olmamalı**.

**Uçak modunda oyun (4 dk)**

6. **Uçak modunu açın** (Wi-Fi de kapalı olsun). Uygulamayı açın.
   Görmelisiniz: 3 saniye içinde açılış ekranı, Zıpzıp ve yazılar düzgün (kutucuk/garip harf yok).
7. **Oyna ▶** → Büyük Macera → Türkiye → İstanbul durağına girin, bir hareketi yapıp **Yaptım!**'a basın.
   Görmelisiniz: Zıpzıp konuşuyor (ses geliyor), hareket gösteriliyor, sayaç ilerliyor.
   Ses yoksa telefonun sesi açık mı bakın; yine yoksa 8. adım sebebini gösterir.
8. Pasaport (🛂) → sağ üstteki ✏️ → çarpma sorusu → **Ebeveyn köşesi** → **🔊 Sesi dene** → **🔊 Dinle**.
   Görmelisiniz: örnek cümle duyulur; altta "✅ Telefonun Türkçe sesi: ..." yazar.
   "⚠️ Telefonda Türkçe ses bulunamadı" yazıyorsa: **⚙️ Türkçe sesi yükle**'ye basın, Türkçeyi indirin
   (bu adım için uçak modunu kısa süre kapatmanız gerekir), sonra tekrar deneyin. Ne yazdığını not edin.
9. Ebeveyn köşesine dönün → **📷 Kamerayla sayma** satırının yanındaki **🔍 Dene** → **📷 Kamerayı aç**.
   Telefon kamera izni sorar, verin. Telefonu 2-3 metre öteye koyun, kollarınızı birkaç kez kaldırın.
   Görmelisiniz: görüntünüz ve üstünde vücut noktaları, sayı her kaldırışta 1 artar.
   (Satır hiç görünmüyorsa telefon çok eskidir; bu da bilgi, not edin.)
10. Ebeveyn köşesinin altındaki **🔒 Bilgiler sadece bu telefonda: göster** bağlantısı.
    Görmelisiniz: telefonda saklanan kayıtların listesi; internet gerekmeden açılır.

**Sertifika (Türkiye Turu bitmişse, 1 dk)**

11. Türkiye haritasında **🏆 Sertifikanı al** → **Kaydet / Paylaş 📤**.
    Görmelisiniz: telefonun paylaş menüsü; "Galeriye kaydet"i seçince resim galeride görünür.
    (Tur bitmemişse bu adımı atlayın; Yağız testinde bakarız.)

**Sonuç**

12. Uçak modunu kapatın. Bana tek satır yazmanız yeter, örneğin:
    "İnternetsiz: hepsi çalıştı" ya da "İnternetsiz: 8. adımda ses yok, 9 çalıştı, telefon Samsung A54".

| Sonuç | Ne yaparım |
|---|---|
| İnternetsiz pakette 6-11 hepsi çalıştı | İnternet iznini kalıcı kaldıran PR'ı açarım (Play'de "internet erişimi yok" görünür) |
| İnternetsizde bir adım bozuk, internetli pakette aynı adım çalışıyor | İzin kalır; sebebini araştırırım |
| İki pakette de aynı adım bozuk | İzinle ilgisi yok; o hatayı düzeltirim |

## Karar

Kod tarafı beta için hazır. Betayı başlatmak için gereken **en az** şey: 1, 3 ve 4 numaralı işler (Android için)
ya da 1, 3 ve 6 (iPhone için). Doğal ses (7) betadan önce gelirse çok iyi olur ama şart değil.

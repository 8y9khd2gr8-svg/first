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
| 1 | Android deneme APK'sını telefonda deneyin: Ebeveyn köşesi → **🔊 Sesi dene** → Dinle | Ses yoksa okuma bilmeyen çocuk oynayamaz; en kritik kontrol | magaza-rehberi 5 |
| 2 | Aynı denemeyi internetsiz APK ile yapın (uçak modunda) | "İnternete bağlanmaz" sözünün kanıtı | magaza-rehberi 6 |
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

## Karar

Kod tarafı beta için hazır. Betayı başlatmak için gereken **en az** şey: 1, 3 ve 4 numaralı işler (Android için)
ya da 1, 3 ve 6 (iPhone için). Doğal ses (7) betadan önce gelirse çok iyi olur ama şart değil.

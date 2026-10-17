# K41 — Kamera neden saymadı? (kod incelemesi + benzetim, 16 Ekim 2026 akşamı)

> Bu belge **kod ve benzetim** sonucudur. Gerçek telefon kamerası ve gerçek çocukla doğrulanmadı.
> Benzetim: gerçek vücut tanıma modeli yerine testin verdiği yapay vücut noktaları (sadece geliştirme sunucusunda; yayın paketinde yok, test denetler).

## 1. Sayma hangi koşulda olur? (kanıt: `src/kamera.ts`, testler `tests/kamera.test.ts` "K41" ve `tests/kamera-benzetim.spec.ts`)

| Koşul | Sonuç | Kutu yazısı |
|---|---|---|
| İki omuz **ve** iki topuk görünür (model güveni 0,5'ten büyük) | Sayar | `📷 3/8` |
| İki topuk görünmez (telefon masada, ayaklar kadraj dışı) | **Hiç saymaz**, kollar hareketinde de | `📷 Geri git` (aynada: `🧍 Baştan ayağa görün: biraz geri git`) |
| Tek topuk görünmez | Hiç saymaz | aynı |
| Omuzlar görünmez (çok yakın / baş kesik) | Hiç saymaz | aynı |
| Kimse yok | Hiç saymaz | aynı |
| Dizler, kalçalar, burun görünmese de | "Görüyorum" der | sayı |
| Kenarda duran çocuk (hepsi görünür) | Sayar | sayı |
| Nokta kadraj dışında ama model "görünür" diyorsa | Sayar (sadece güvene bakılır, konuma bakılmaz) | 🔎 gerçek model kadraj dışı noktaya ne güven veriyor, bilinmiyor |
| Omuz-topuk boyu görüntünün %5'inden kısa | "Görüyorum" der ama saymaz | sayı 0'da kalır |

Neden topuklar şart? Bütün eşikler vücut boyuna (omuz → topuk) göre oranlanır: çocuğun kameraya uzaklığı önemli olmasın diye.
Kollar hareketi ayrıca iki bileğin de **burnun üstüne** çıkmasını ister; omuz hizasına kaldırmak ya da tek kol sayılmaz.

## 2. Sonuç: K41'in en olası nedeni kanıtlandı
Telefon masada dururken baş ve omuzlar görünür, topuklar görünmez → kod bütün hareket boyunca "Geri git" der ve hiçbir tekrarı saymaz.
Benzetimde kollar 8 kez kalkıp indi, sayı 0 kaldı; oyun beklemedi (ayna 6 sn sonra kapandı), "Yaptım!" çıktı (kaybettirmez).
Eşik ve "kollarda ayak şartı" **değiştirilmedi** (karar sizde, bölüm 5).

## 3. Kamera açılmazsa / gecikirse (benzetimle denendi)
| Durum | Oyun ne yapar |
|---|---|
| İzin verilmedi / kamera yok | Ayna açılmaz, kutu `📷 Açılamadı`, "Yaptım!" çıkar. Özete "kamera açıkken" **yazılmaz** (düzeltildi) |
| Model yüklenemedi | Aynı; açılan kamera hemen kapanır (K38) |
| Model ayna süresi içinde gelir | `📷 Hazırlanıyor` → `✅ Hazırsın!` |
| Model çok geç gelir | Ayna en çok 6 sn (Sakin 8 sn) bekler, geri sayım başlar; model gelince sayım yine çalışır, hedef görülünce kendiliğinden geçer |
| Kamera 4 sn geç açılır | Ayna "Hazırlanıyor" der, açılınca görür; kamera bir kez açılır |
| Her üç karenin biri boş | Sayım kaybolmaz (yukarıdaki kol kayıp karede de yukarıda kalır) |
| Oyunun saati 4 kat yavaş | Ayna yine gerçek saatle 6 / 8 sn |

## 4. Bulunan ve düzeltilen hatalar
1. **Kamera iki kez açılıp biri açık kalıyordu:** kamera açılırken (iPhone izin penceresi açık, yavaş telefon) sıradaki harekete geçilince
   kamera ikinci kez isteniyor, ilk açılan görüntü hiç kapatılmıyordu. Şimdi aynı açılış beklenir; açılırken hareket ekranından çıkılırsa
   gelen görüntü hemen kapanır. Telefon listesi T2 (izin bir kez) ile ilgili.
2. **Özet dürüst değildi:** kamera hiç açılamadığında (izin yok, model yok) yapılan hareketler "kamera açıkken yapılan ... kamera görmedi"
   diye yazılıyordu. Artık kamera çalışmadıysa o hareket "kamera açıkken" sayılmaz.
3. **Görsel:** kamera hazırlanırken küçük kutuda aynanın sarı kesik çerçevesi görünüyordu (ilk durum yazılmadan önce).
Üçünün de testi eski kodda kırmızı, yenide yeşil.

## 5. Gerçek kamera / çocuk gerektirenler (🔎)
- Gerçek modelin kadraj dışı topuklara verdiği güven (0,5 altında mı?).
- Telefon masada dururken 2-3 m'de çocuğun ayakları kadraja giriyor mu? (Muhtemelen telefonu yere yakın / eğik koymak gerekir.)
- Eşikler (kollar: burnun üstü; zıplama %7; çömel 0,35/0,48) gerçek çocukta tutuyor mu?
- Tanıma hızı (bulutta 1,5-4,6 sn; telefonu temsil etmez).

## 6. Karar sizde (öneriler, yapılmadı)
| Seçenek | Ne olur |
|---|---|
| (a) Önce gerçek telefonda kutu yazısına bakılsın (önerilen) | Hiçbir şey değişmez; kardeş/Yağız denemesinde "Geri git" görülüyorsa neden kesinleşir |
| (b) Kol hareketlerinde topuk şartı kalksın (omuz + kalça yeter) | Masa senaryosunda kollar sayılır; boy ölçüsü omuz-kalçaya göre yeniden kurulmalı |
| (c) "Geri git" yerine eksik yere göre yazı ("Ayakların görünmüyor") | ✅ **Onaylandı, yapıldı (17 Ekim):** ayna/kutu yazısı + aynada bir kez ses; 🔍 Dene'de tanı satırı. Sayma şartı aynı |
| (d) Eşikleri şimdiden gevşetmek | Önerilmez: yanlış sayım riski, kanıt yok |

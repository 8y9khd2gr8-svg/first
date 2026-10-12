# Zıp Zıp Dünya — Oynanış Vizyonu ve Bölüm Tasarımı Analizi

**12 Ekim 2026** · main @ `1b6dba5` üzerinde incelendi (inceleme sırasında kod değiştirilmedi) · Hazırlayan: Claude (Claude Code)

İşaretler: **✔ koddan doğrulandı** (kaynak dosyada okundu) · **≈ tahmin** (gerçek telefonda ya da gerçek çocukla doğrulanmadı).

> **Karar (12 Ekim, proje sahibi):** Kamera **isteğe bağlı kalır, macerada "önerilen"** olur. Kamerasız da tam oynanır; kamera açıkken dünya gerçek tepki verir. Her yeni mekanik iki yoldan (kameralı / kamerasız) tasarlanır.
>
> **Proje sahibinin notu:** Amaç çocuğa oyun boyunca 40-50 farklı hareket yaptırmak değil; daha az hareketi daha anlamlı kullanmak.

---

## Önce en önemli gerçek

✔ **Bugünkü oyun bir "hareketle kontrol" oyunu değil; "izle, yap, say" oyunudur.** Zıpzıp hareketi önceden belirlenmiş zamanlamayla yapar, sayaç saate göre ilerler. Kamera **varsayılan kapalıdır**; açıkken bile **Zıpzıp'ı ya da oyun dünyasını etkilemez**, sadece arka planda tekrar sayar. Vizyondaki "çocuk zıplar → karakter engeli aşar" bugün kodda **yoktur**; bu yeni bir oyun mekaniği demektir.

## 1. Mevcut oynanış

**Kamera nasıl algılıyor?** (✔ `src/kamera.ts`) Google MediaPipe Pose (hafif "lite" model, tek kişi) telefonun içinde çalışır. Her kamera karesinde 33 vücut noktası bulunur; oyun omuz, bilek, kalça, diz, topuk ve burnu kullanır. Eşikler çocuğun boyuna (omuz-topuk mesafesi) oranlanır. Saymak için omuzlar ve topuklar görünmeli (baştan ayağa kadraj). Ebeveyn köşesinden açılır; SIMD desteklemeyen eski telefonda seçenek görünmez.

**Karakter hangi hareketlerle kontrol ediliyor?** (✔ `HareketScene.ts`) **Hiçbiriyle.** Zıpzıp'ın animasyonu, sayaç ve "Bir! İki!" sesi saate bağlıdır.

**Akış:** (1) Hareket başlar; kamera açıksa sağ üstte küçük önizleme ve "📷 2/5". (2) Kamera **sadece beklenen hareketi** sayar; hangi hareketin yapıldığını ayırt etmez. (3) Saat bitince kamera hedefi gördüyse "Kamera gördü" denir ve kendiliğinden geçilir; görmediyse "Yaptım!" bekler, kamera saymaya devam eder (kaybetmek yok). (4) Ebeveyn özetine "kameranın gördüğü" sayı yazılır.

## 2. Hareket envanteri

✔ 39 animasyon tanımlı (38'i kullanılıyor; `heykel` tanımlı, kullanılmıyor), 35 hazır komut, 50 durakta 200 hareket yuvası, 26'sı ritim çeşidi (yavaş/hızlı). Birleşik hareket altyapısı (zıpla, zıpla, çömel) var ama **1 yerde** kullanılmış.

| Aile | Animasyonlar (kullanım sayısı) | Gerçekten farklı mı? (≈ sınıflandırma) |
|---|---|---|
| Zıplama | zıpla (15), aç-kapa (10), engel: zıpla+diz çek (5), yana zıpla (1), basket: çömel-zıpla-uzan (5) | 4-5 desen |
| Çömelme / yerden alma | çömel (13), balon (5), yumurta (2), taş kaldır (3), kaz (5), topla (1) | balon ≈ yumurta; 4-5 desen |
| Yerinde yürü/koş/ayak | koş (11), dizler (11), tırman (6), parmak ucu (7), T-Rex (1), tepin (4), horon (2), yastık başta yürü (2) | tepin ≈ horon; koş ≈ dizler; 5-6 desen |
| Kollar | kollar (11), uzan (10), kol salla (11), kanat (5), kulaç (6), raket (1), voleybol (1), elden ele (1) | kollar ≈ uzan ≈ voleybol; 5-6 desen |
| Gövde | bel döndür (7), yana eğil (11), dön (8) | 3 |
| Duruş / denge | sütun (3), piramit (2), T harfi (2), kocaman (10), tek ayak (8); heykel (kullanılmıyor) | sütun/piramit/T harfi aynı duruşun kol çeşitleri; 2-3 desen |
| Yana adım | yana adım (8) | 1 |
| Bacak | şut (1) | 1 |
| Sakinleşme | kendine sarıl, sallan (3) | 1 |

**Sonuç (≈):** 38 animasyon, ama **gerçekten farklı motor desen yaklaşık 20-22.** Fazlalığın kaynağı aynı hareketin farklı sayı, süre, ritim ve hikâyeyle gelmesi (ör. zıpla 15 yerde, 6 çeşitle). Asıl sorun hareket sayısı değil, **hareketin oyunda hiçbir sonuç doğurmaması.**

## 3. Teknik güvenilirlik

✔ Kamerayla sayılabilen 13 animasyon, 6 sayma yolu:

| Sayma yolu | Hareketler | Yöntem | Bilinen sınırlama |
|---|---|---|---|
| kollar | kollar, uzan, basket, taş kaldır | İki bilek burnun üstüne çıkar, omuz altına iner = 1 | basket ve taş kaldırda sadece kol kısmı sayılır; tek kol sayılmaz |
| çömel | çömel, balon, yumurta | Kalça topuğa yaklaşır (<0,35), kalkar (>0,48) | Topuklar görünmeli; ≈ yarım çömelme sayılmayabilir |
| zıpla | zıpla, engel | Omuz, ayakta yükseklikten boyun %7'si kadar yükselir, iner | ≈ Parmak ucunda yükselmeyi sayabilir; ≈ alçak zıplamayı kaçırabilir |
| dizler | dizler, tırman | Diz kalçaya yaklaşır, iner (her diz ayrı) | ≈ Alçak diz kaldırma sayılmayabilir |
| aç-kapa | aç-kapa | Topuk açıklığı omuz genişliğinin 1,6 katı → 1,1 | Adımla açmak da sayılır |
| yana adım | yana adım | Kalça ortası bir yana, sonra öbür yana | ≈ Gövde sallamak da sayılabilir |

Genel: tek kişi izlenir (kadrajda ikinci kişi yanlış izlenebilir; Ailece'de bu yüzden kapalı); süreli, birleşik ve sürpriz hareketlerde kamera açılmaz; sayılar sadece yapay vücut noktalarıyla test edildi, **gerçek çocukla denenmedi**. Yavaş telefon benzetiminde bir tanıma ~0,8 sn sürdü; **gerçek telefonda ölçülmedi** (gerçek zamanlı kontrolün en büyük bilinmeyeni).

✔ Kameranın sayamadığı 25 animasyon (sadece "Yaptım!" ile): koş, kol salla, yana eğil, kocaman, tek ayak, dön, parmak ucu, bel döndür, kulaç, kaz, kanat, tepin, sütun, sallan, piramit, T harfi, horon, yastık başta yürü, şut, raket, voleybol, T-Rex, elden ele, yana zıpla, topla. 200 yuvanın kabaca yarısı kamerayla sayılabilir (≈).

## 4. Görev çeşitliliği

| Görev türü | Bugün | Ne gerektirir |
|---|---|---|
| Sayılı tekrar, süreli hareket, ritim | ✔ var | — |
| Birleşik dizi | ✔ altyapı var, 1 yerde | Sadece içerik (ucuz) |
| Ayna oyunu, donma oyunu | ✔ var | Sadece içerik |
| Her tekrarın dünyada sonucu olması | ✖ | Küçük-orta: sayaç her tekrarda sinyal veriyor; kamerasızda saate, kameralıda kameraya bağlanır |
| Hafıza dizisi | ✖ | Orta: yeni ekran akışı |
| Engel parkuru | ✖ | Büyük: yeni sahne, zamanlama, gecikme ölçümü |
| Hareketle seçim (zıpla = sol, çömel = sağ) | ✖ | Büyük ve riskli: kamera hangi hareketin yapıldığını bugün ayırt edemiyor |
| Denge tutma (kamera doğrular) | ✖ | Orta: yeni "duruş tutma" algılaması |
| Müzik vuruşuyla ritim | ✖ | Büyük: ses-görüntü eşleme + gecikme |

## 5. Üç dünya

| Dünya | Bugünkü karşılığı | Uygunluk | Eksik | Karmaşıklık (≈) | Bağımlılık |
|---|---|---|---|---|---|
| Keşif Ormanı (öğretici, ücretsiz) | Ücretsiz başlangıç bugün Türkiye Turu | Kontrolü öğretmek şart; ama Türkiye'yi kaldırmak markayı değiştirir | Gerçek tepki, hareket-sonuç öğretimi | Orta-büyük | Tepki prototipi, çizer |
| Spor Kampı (ritim, kombinasyon) | ✔ var (7 spor, serbest sıra), kalıp aynı | **En uygun**; birleşik/ayna/donma hazır | Farklı görev kuralları | Küçük-orta | Az; kamerasız çalışır |
| Macera Dünyası (Kayıp İnci) | Okyanus var ama sadece tema | Ücretli değerin asıl taşıyıcısı | Engel parkuru, nesne etkileşimi, görev zinciri, değişen dünya | Büyük | Gerçek zamanlı tepki, telefonda gecikme ölçümü, çizer, kamerasız oynanış |

Hipotez (macera ana gövde, spor kampı özel dünya) ürün olarak doğru görünüyor (≈); şartı maceranın kamerasız da oynanabilmesi.

## 6. Ücretli içerik değeri

✔ Bugün tam sürüm = aynı mekanikle 6 bölüm daha + kostüm/rozet; ilkeye göre yeterli değil. Somut farklar (≈): (1) her dünyanın kendi kuralı; (2) dünya çocukla değişir (köprü kurulur, inci toplanır); (3) tekrar oynanabilirlik (karışık dizi, rastgele sürpriz); (4) ebeveyne görünür gelişme; (5) hikâye bütünlüğü. Yeni arka planlar tek başına yeterli değil.

## 7. Çocuk deneyimi ve güvenlik

- 4-5 yaş: zamanlama penceresi zor; **bekleyen engel** olmalı. Algılama hoşgörülü olmalı.
- 6-7 yaş: gerçek tepki ve basit görev zinciri en uygun.
- 8-9 yaş: zamanlama, dizi hafızası, kendi rekoru (kaybettirmeyen zorluk).
- Yanlış negatif (yaptı, görülmedi) en büyük risk: "ben yapamıyorum" hissi. Yanlış pozitif daha az zararlı.
- İlkeler: kamera ilerlemeyi asla engellemez ("Yaptım!" yedeği); sadece olumlu geri bildirim; engel beklesin; birkaç denemeden sonra Zıpzıp yardım etsin.
- Alan: baştan ayağa görünmek için birkaç metre gerekir (≈ ölçülmedi). Gerçek zamanlı tepki çocuğu ekrana çekebilir; yerinde kalma kuralı korunmalı, hareketler uzmana gösterilmeli.

## 8. Yol haritası

**A. Mevcut sistemle:** A1 çekirdek fiil seti (6-8: zıpla, çömel, kollar yukarı, dizler, yana adım, aç-kapa; hepsi kamerayla sayılabilir) · A2 birleşik dizi ve ayna görevlerini çoğaltmak · A3 kamera eşiklerini gerçek çocukla ayarlamak (Yağız testi) · A4 gerçek telefonda tanıma süresini ölçmek.

**B. Yeni mekanik:** B1 her tekrarın dünyada sonucu (kamerasızda saat, kameralıda kamera) · B2 tek hareketle gerçek tepki prototipi (zıpla → Zıpzıp zıplar) · B3 bekleyen engel parkuru (tek dünya, 3-4 engel) · B4 Spor Kampı'nda yeni kurallar · B5 denge tutma algılaması · B6 hareketle seçim, müzik ritmi (en son).

## Üç sorunun cevabı

1. **Mevcut hareketlerle üç farklı dünya?** Hareketler açısından evet (~20 desen fazlasıyla yeter, macera için 6-8 fiil yeter); mekanik açısından hayır. Spor Kampı mevcut altyapıyla farklılaşabilir; Keşif Ormanı ve Macera yeni mekanik ister.
2. **Ücretli sürüm için gerekli mekanikler:** (1) hareketin dünyada sonuç doğurması (kamerasız da), (2) bekleyen engel ve görev zinciri, (3) Spor Kampı'nda farklı görev kuralları. Gerçek zamanlı kamera kontrolü değeri artırır ama telefon performansı doğrulanmadan temel taş yapılmamalı.
3. **Kod öncesi kararlar:** (1) kameranın rolü — **karar verildi: isteğe bağlı + önerilen**; (2) kamerasız oynanışta engeli ne geçirir; (3) çekirdek fiil seti; (4) ücretsiz bölüm Türkiye mi, Keşif Ormanı mı; (5) başarısızlık politikası (kamera görmezse, kaç denemede yardım); (6) Kasım betası bugünkü mekanikle mi (öneri: evet; B1-B2 beta sırasında prototiplensin).

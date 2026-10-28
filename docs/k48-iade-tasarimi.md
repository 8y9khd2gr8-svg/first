# K48 — İade edilen tam sürüm: karar ve teknik tasarım (28 Ekim 2026)

Durum: **28 Ekim kullanıcı A'yı seçti; kodlandı** (`src/satinAlma.ts magazayaSor`, test `tests/kayit.test.ts`). Hiçbiri gerçek mağazada/telefonda denenmedi.

## 1. Bugün ne oluyor (koddan, `src/satinAlma.ts`)
- Satın alınca ya da mağaza "alınmış" deyince cihaza `zipzip-tam-surum-v1 = 1` yazılır.
- Açılışta mağazaya sessizce sorulur (`magazayaSor`): tam sürüm bulunursa kaydedilir, **bulunmazsa hiçbir şey silinmez.**
- Sonuç: para iade edilse de telefonda tam sürüm açık kalır (K48).
- "Satın alımı geri yükle" var: mağazadan geri yükler, bulursa kaydeder (geçerli satın alımların geri yüklenmesi bugün çalışıyor; 🔎 gerçek mağazada denenmedi).

## 2. Mağaza ne söylüyor (eklentinin kaynak kodundan, @capgo/native-purchases)
| | iPhone (StoreKit 2) | Android (Play Billing) |
|---|---|---|
| Liste nereden | `Transaction.currentEntitlements` + `Transaction.all`, sadece Apple imzası doğrulanmış (`.verified`) işlemler | `queryPurchasesAsync` (Play'in cihazdaki önbelleği + Play hizmeti) |
| İade edilince | İşlem listede kalır, **`revocationDate` dolu** gelir → açık iade kanıtı | İşlem listeden **kaybolur** (ayrı bir "iade edildi" işareti yok) |
| Sorgu hata verirse | 🔎 belgeye göre önbellekten cevap verir | **Eklenti hatayı bildirmez, boş liste döndürür** (kaynak: `NativePurchasesPlugin.java` getPurchases, `else` dalı sadece günlüğe yazar) |
| Onay bekleyen ödeme | — | `purchaseState = "2"`: ne "var" ne "yok" sayılmalı |

**En önemli sonuç:** Android'de "boş liste" = "satın alınmamış" değildir; Play bağlantısı kopuksa da boş gelir.
"Boşsa sil" diye yapılırsa ödemiş aile yanlışlıkla kilitlenir. Bu yüzden Android'de tek bir boş cevaba güvenilmez.

## 3. Önerilen tasarım (seçenek A: "kanıta dayalı, temkinli")
1. **iPhone:** `tam_surum` işlemi `revocationDate` ile gelirse ve aynı listede iadesiz başka geçerli `tam_surum` yoksa → kayıt hemen silinir (Apple imzalı açık kanıt).
2. **Android:** "yok" sayılması için iki şart birlikte:
   a. Aynı açılışta önce `getProducts` ürünü döndürmeli (Play bağlantısı çalışıyor kanıtı); döndürmezse bu açılış sayılmaz.
   b. Bu şekilde **en az 2 ayrı günde, aralarında en az 24 saat** "yok" görülmeli; arada bir kez "var" görülürse sayaç sıfırlanır.
3. Onay bekleyen ödeme (`"2"`) sayacı değiştirmez.
4. Erişim kalkınca: ilerleme, damga, rozet, kostüm **silinmez**; sadece ücretli bölümler yeniden kilitlenir. Çocuğa mesaj yok
   (kaybetmek yok kuralı); ebeveyn köşesi → ⭐ Tam sürüm "alınmadı" gösterir, "Satın alımı geri yükle" durur.
5. Yanlışlıkla silinirse geri dönüş: bir sonraki açılışta mağaza "var" derse kendiliğinden geri gelir; ya da "Satın alımı geri yükle".
6. Yeni cihaz kaydı: Android sayacı için `zipzip-tam-surum-kontrol-v1` (son "yok" günü + sayı; kişisel veri yok). Kural gereği
   gizlilik.html tablosu, "Teknik ayrıntı" satırı ve EbeveynVeriScene listesine eklenir (`npm test` denetler).
7. Kod yeri: `satinAlma.ts magazayaSor()` tek işlev; eklenti test için dışarıdan verilebilir hâle gelir (sahte mağaza ile birim test).

## 4. Seçenekler
| # | Seçenek | Artı | Eksi |
|---|---|---|---|
| A (önerilen) | Kanıta dayalı, temkinli (yukarıdaki) | Sunucusuz kalır; iPhone'da kesin, Android'de yanlış kilit riski düşük | Android'de iade ~1-2 gün geç kapanır; yeni bir küçük cihaz kaydı |
| B | A + eklentiye yama (Android hata verince boş liste değil hata döndürsün) | Android "boş"u güvenilir olur | Eklenti güncellemesinde yama elle taşınır; yine de 2 gün kuralı önerilir |
| C | Sadece iPhone'daki açık iade kanıtıyla kapat, Android'de bugünkü gibi | En basit, yanlış kilit riski sıfır | Android'de iade sonrası açık kalır |
| D | Sunucu ile doğrulama (Google Voided Purchases API, Apple App Store Server Notifications) | En kesin | Sunucu, hesap anahtarı, maliyet; "sunucusuz, dış servis yok" kararına aykırı |
| E | Böyle kalsın (iade edilen açık kalır) | Hiç risk yok | Satış açığı (iade edip oynamak); mağaza kuralına aykırı değil ama zayıf |

## 5. Nasıl test edilir
- **Bulutta (kanıt):** sahte mağaza ile birim testler: iPhone iade kanıtı → kapanır; Android tek boş cevap → açık kalır; 2 gün boş → kapanır;
  arada "var" → sıfırlanır; bağlantı yok (`getProducts` boş) → sayılmaz; bekleyen ödeme → değişmez; eski kodda kırmızı olmalı.
- **Gerçek mağaza (🔎, kullanıcı/Mac):** Android: Play Console lisans test kullanıcısıyla kapalı testte satın al → Play Console'dan iade et →
  2 gün açılış. iPhone: Xcode StoreKit testinde işlem yöneticisinden iade (Mac gerekir) ya da TestFlight sandbox.
  Gerçek mağazada denenmeden "çalışıyor" denmez.

## 6. Onay
Ödeme davranışı değiştiği için kod yazmadan önce kullanıcı seçimi gerekir. Mağaza yayını bu işle başlatılmaz.

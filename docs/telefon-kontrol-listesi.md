# Gerçek telefonda kontrol listesi

Otomatik testler (bulutta, ekransız tarayıcı) bunları **göremez**. 15 Ekim'deki aile testinde ikisi kaçtı: ekranın
kararması ve iPhone'un kamera iznini tekrar tekrar sorması. Kural: kamera, ses, ekran, izin ya da "dokunmadan oynama"
(Uzaktan oyna, Ailece) ile ilgili her değişiklikte Claude bu listeyi tek tek düşünür, PR'a ve rapora hangi maddenin
etkilendiğini ve telefonda neyin denenmesi gerektiğini yazar. Testle taklit edilebilen madde testle de denetlenir.

| # | Ne | Telefonda ne olur | Testle taklit | Durum |
|---|---|---|---|---|
| T1 | Ekran kararması (otomatik kilit) | Dokunulmazsa 30 sn-5 dk'da ekran kararır, kilitlenir; kamera durur | Sahte Wake Lock: dokunmadan bütün durak/Ailece boyunca "açık tut" isteniyor mu (`oyun.spec.ts` "dokunmadan bütün durak") | #131 (iOS ana ekran uygulamasında 18.4 öncesi 🔎) |
| T2 | Kamera izni penceresi | Her `getUserMedia` çağrısında iPhone (özellikle ana ekran uygulaması) yeniden sorabilir | Sahte kamera: bir durakta kaç kez açıldı; kamera açılırken (izin penceresi açık) sıradaki harekete geçilse de bir kez (`kamera-benzetim.spec.ts`) | #131; 16 Ekim: izin beklenirken ikinci kez açılıp ilki açık kalıyordu → düzeltildi. 🔎 iPhone'da izin penceresi açıkken oyun ilerliyor mu |
| T3 | Ekran kilidinden / başka uygulamadan dönüş | Kamera durur, ses yarıda kalır, Wake Lock düşer | Kısmen ("Kamera durdu" testi); gösterimde yarıda kalan komut dönüşte bir kez yeniden söylenir, geri sayım onu kesmez (`oyun.spec.ts` "yarıda kalan hareket komutu", eski kodda kırmızı; K39 b, 17 Ekim) | Kısmen; 18 Ekim: zıplama denemesinde (kamerasız ve kameralı) gizli sayfa testi eklendi. 🔎 gerçek kilitte komutun yeniden söylendiği telefonda denenmeli (aşağıda A1-A2, A5-A6) |
| T4 | Ses | Sessiz mod düğmesi, Türkçe ses yoksa konuşmama, ilk dokunuştan önce ses çalmama; arkaya alınınca konuşmanın yarıda kalması | Kısmen: sayfa gizlenince konuşma susar, yarıda kalan hareket komutu dönüşte bir kez yeniden söylenir (sayılar yinelenmez; K39 b), dönüşte iPhone'da duraklatılmış konuşma sürdürülür, aramadan sonra "interrupted" ses bağlamı yeniden açılır (`oyun.spec.ts` "kesinti") | Kısmen (16 Ekim); sessiz mod düğmesi ve Türkçe ses 🔎 (Sesi dene ekranı) |
| T5 | Düşük güç modu | Wake Lock reddedilebilir, kare hızı düşer | Evet: sahte reddetme; durak "Uzaktan oyna" ile dokunmadan ilerler, hata yok; istek 10 sn'de bir yinelenir (eskiden saniyede 2), dokununca hemen (`oyun.spec.ts` "T5") | ✅ taklit (16 Ekim); 🔎 gerçek telefonda: düşük güç modunda ekran kararır mı (o zaman telefonun Otomatik Kilit ayarı geçerli) |
| T6 | Telefon yan çevrilince | "Telefonu dik çevir" görünmeli | Evet (basık pencere) | ✅ |
| T7 | Yavaş / eski telefon | Kamera tanıma yavaş, animasyon takılır; model yüklenemeyebilir | İşlemci 6 kat yavaş: kameralı hareket ekranı biter ve ilerler (`oyun.spec.ts` "T7"); model yüklenemezse kamera kapanır (K38); gezinti `GEZINTI_YAVAS` | Kısmen (16 Ekim). Bulgu: kare 200 ms'yi aşınca oyunun saati geri kalır (Phaser), sayaçlar/süreler uzar (test makinesinde ~12 kare/sn'de 6 sn → 11 sn); kaybettirmez, büyük aynanın en çok süresi gerçek saatle. 18 Ekim: sayfa donunca Uzaktan oyna tek kayıt/tek adım, zıplama denemesinde zıplamalar birikmez (test). 🔎 eski iPhone'da denenmeli (A7, A9) |
| T8 | İnternetsiz | Oyun açılmalı | Evet | ✅ |
| T9 | Çocuk 2-3 m uzakta, telefona dokunmadan | Her şey kendiliğinden ilerlemeli, ekran açık kalmalı | T1 ile birlikte | #131 |
| T10 | Bildirim / arama gelirse | Oyun duraklar mı, ses kesilir mi | Evet (sahte gizleme; telefon gibi kare de durur): sayma, "Uzaktan oyna" geri sayımı ve konuşma durur, dönünce kaldığı yerden bir kez devam eder; sayma sırasında kesilirse komut yinelenmez (`oyun.spec.ts` "kesinti") | ✅ taklit (16-17 Ekim; 18 Ekim: Uzaktan oyna geri sayımında donma, bozuk kayıt değeri, zıplama denemesi); 🔎 gerçek aramada denenmeli (A3-A4). Not: üstten inen bildirim sayfayı gizlemez, oyun sürer (sorun değil) |

Yeni bir telefon davranışı fark edilirse bu tabloya eklenir.

**Telefonda doldurulan sayfa (17 Ekim):** kardeş ve Yağız için bu tablo ve `docs/yagiz-testi.md` tek sayfada, iPhone'da işaretlenip
notları kopyalanabilir: https://claude.ai/artifact/DjZd22aR1pZNm82WUP6j8r (özel bağlantı; başkası açacaksa sayfanın Paylaş menüsünden paylaşılır).
Erişilebilirlik (hareketi azalt, büyük yazı, VoiceOver) de orada; hareketi azalt bulutta taklit edilir (`oyun.spec.ts` "hareketi azalt"), büyük yazı ve VoiceOver 🔎.

**VoiceOver deneme sayfası (17 Ekim akşamı, K46):** https://claude.ai/artifact/AgsJCsCMZwZ3MZmw1Lf1cT . Üç yol (bugünkü tuval, adı olan tuval,
görünmez HTML düğmeler); her birinde VoiceOver'ın ne okuduğu ve doğru düğmenin çalışıp çalışmadığı yazılır, ayrıca gerçek oyunda da bakılır.
Bulutta sadece tarayıcının erişilebilirlik ağacı görüldü (çocuk ekranlarında adsız tek "Canvas"); iPhone davranışı 🔎.

## iPhone'da adım adım (18 Ekim; T3, T7, T10 ve büyük ayna süresi)

**Durum:** bu adımların hiçbiri gerçek telefonda yapılmadı. Bulut testleri ekransız tarayıcıda sahte kilit/arama (sayfa gizlenir,
kare çizilmez), sahte donma (işlemci meşgul) ve sahte kamera (renkli tuval + sahte model) ile yapıldı. Sonuçlar KAYIT.md'ye
"telefonda denendi" olarak yazılmadan önce aşağıdaki adımlar bir yetişkin tarafından iPhone'da yapılmalı.

**Kanıtlanmayan (önemli):** kamera uzun süre durduğunda (kilit, arama, başka uygulama, telefonun kamerayı susturması) gerçek
telefonda ne olduğu otomatik testlerle **kanıtlanmadı**. Testlerde sahte görüntü 2 sn'den uzun donmada "susturuldu" oluyor; gerçek
iPhone kamerasının kilitten sonra kendiliğinden geri gelip gelmediği, "📷 Durdu" yazısının ne kadar kaldığı bilinmiyor.

Hazırlık: test sitesi Safari'de (ya da ana ekran uygulaması), ebeveyn köşesi → kamerayla sayma AÇIK, Uzaktan oyna bir denemede
açık bir denemede kapalı. Yanında ikinci bir telefonun kronometresi (süre ölçmek için) ve arayacak biri (T10 için).

| # | Ne yapılır | Ne görülmeli (doğru) | Not edilecek |
|---|---|---|---|
| A1 (T3) | Bir durakta Zıpzıp hareketi söylerken yan tuşla ekranı kilitle, 10 sn bekle, aç | Ses kilitte susar; açınca komut **bir kez** yeniden söylenir, sayılar yinelenmez; oyun kaldığı yerden sürer | Komut yeniden söylendi mi, kaç kez? Takılma/çift ses? |
| A2 (T3) | Kamera açıkken (büyük ayna ya da sayma sırasında) kilitle, 10 sn bekle, aç | Kamera ışığı kilitte söner. Açınca kutuda görüntü geri gelir **ya da** "📷 Durdu" yazar; "Yaptım!" yine çıkar | Görüntü kendiliğinden geldi mi? "Durdu" kaç sn kaldı? İzin yeniden soruldu mu? |
| A3 (T3) | Uzaktan oyna açık, "📱 3… 2… 1…" geri sayımında ana ekrana çık (yukarı kaydır), 10 sn sonra dön | Gizliyken geçmez; dönünce geri sayım sürer, hareket **bir kez** sayılır (ebeveyn özetinde) | Özet sayısı önce/sonra |
| A4 (T10) | Bir hareket sayılırken birisi arasın; aç, 10 sn konuş, kapat, oyuna dön | Arama boyunca ses yok; dönünce sayma kaldığı yerden; sonraki cümle duyulur (ses kesilmiş kalmaz) | Dönüşte Zıpzıp'ın sesi geldi mi? |
| A5 (T10) | Zıpzıp da zıplasın (ebeveyn → kamera → 🔍 Dene → 🌍): kamerasız ritimdeyken kilitle, 10 sn, aç | Kilitte zıplama/yıldız ilerlemez; dönünce yıldızlar **tek tek** yanmaya devam eder (birden çok yıldız bir anda yanmaz) | Dönüşte kaç yıldız birden yandı? |
| A6 (T10) | Aynı ekranda "📷 Kamerayla zıpla", zıplarken kilitle, 10 sn, aç | Kilitte sayı artmaz; dönünce kamera yine sayar ya da "Kamera durdu" yazar ve ritim yoluna döner | Kamera geri geldi mi? |
| A7 (ayna süresi) | Kamera açık, telefon masada (ayaklar görünmesin), kameralı bir harekette ayna açılınca kronometreyi başlat; geri sayım ("3") görününce durdur | Normal tempoda en çok ~6 sn, Sakin tempoda ~8 sn | Ölçülen süre (3 deneme) |
| A8 (ayna + kilit) | A7'yi tekrarla, aynanın 2. saniyesinde 5 sn kilitle, aç | Kilitte geçen süre sayılmaz; ayna ya kalan süreyi tamamlar ya da kamera durduysa hemen geri sayıma geçer | Toplam süre, "Durdu" yazdı mı |
| A9 (T7) | Eski/yavaş bir iPhone varsa (ya da Düşük Güç Modu açık): bir durağı kamerayla baştan sona oyna | Oyun takılsa da biter; ayna en çok ~6 sn (gerçek saatle); "Yaptım!" her harekette çıkar | Hangi model/iOS, takılma oldu mu, ayna süresi |
| A10 (ebeveyn kilidi) | Ebeveyn sorusunda önce yanlış, hemen ardından doğru cevaba çok hızlı dokun (birkaç kez; Düşük Güç Modunda da) | Kilit hiçbir zaman açılmaz, iki ekran üst üste görünmez; geri dönülür | Bir kez bile açıldı mı? (Bulutta sadece "aynı karede iki dokunuş" taklit edildi) Düzeltme #156 ile 19 Ekim'de test sitesinde (7ce6370) |

Sonuçlar KAYIT.md'ye tarih, telefon modeli ve iOS sürümüyle yazılır; denenmeyen madde 🔎 kalır.

## K47 tarayıcı güvenlik kuralı (CSP): telefonda (19 Ekim; PR #157 taslak, birleşmedi)

**Durum:** hiçbiri gerçek telefonda denenmedi. Kural (#157) **test sitesinde yok**; bu yüzden aşağıdaki maddeler ancak kuralı
taşıyan bir paketle denenebilir: Android'de `k47-csp` dalından üretilen deneme APK'sı (Actions → "Android deneme paketi" →
dal: `k47-csp`), iPhone'da kural test sitesine çıkınca Safari'de (iPhone'a kurulabilen paket Apple hesabı ister; K49 kararı).

**Bulutta kanıtlanan (Chromium, ekransız; `tests/guvenlik-kurali.spec.ts` + bütün oyun testleri kural açık):** kural derlenmiş
sayfada betiklerden önce; dış adrese istek/resim/betik/bağlantı engellenir; oyun, yazı tipi, internetsiz açılış (hizmet çalışanı
dış dosyadan, satır içi betik yok), ses kaydı yükleme ve çözme, fotoğraf (blob:) ve resim (data:), gerçek kamera modeli (önce
GPU, olmazsa CPU) kural altında çalışır; `'wasm-unsafe-eval'` çıkarılırsa model çalışmaz.

**Kuralın kapsamında olmayanlar (ağ isteği değil, kural engellemez):** kamera akışı (izin, canlı görüntü), telefonun konuşma
motoru, ekran açık tutma (tarayıcının Wake Lock'ı), paylaşma menüsü, e-posta bağlantısı. Bunlar kural yüzünden bozulmaz;
**ama uygulamada** konuşma, ödeme ve ekran açık tutma Capacitor köprüsüyle çalışır ve köprünün sayfaya nasıl girdiği telefona
göre değişir (aşağıda A-K2, A-K3, A-K5 ve "En önemli risk").

### Android (deneme APK'sı, `k47-csp` dalından)

| # | Ne yapılır | Ne görülmeli (doğru) | Not edilecek |
|---|---|---|---|
| A-K1 | APK'yı kurup aç; Ayarlar → Uygulamalar → Android System WebView (ya da Chrome) **sürüm numarasını** yaz | Oyun açılır, yazı tipi yuvarlak (Baloo) | WebView sürümü, Android sürümü, telefon modeli |
| A-K2 | Bir durak oyna (ses açık) | Zıpzıp konuşur (telefonun Türkçe sesi; uygulamada eklentiyle) | Ses geldi mi? |
| A-K3 | Uzaktan oyna açık, dokunmadan bir durak bitir | Ekran kararmaz (eklentiyle ekran açık) | Karardı mı? |
| A-K4 | 🔒 Ebeveyn → kamerayla sayma aç → 🔍 Dene | İzin bir kez sorulur, görüntü ve vücut noktaları görünür, sayı artar | Model yüklendi mi (noktalar çıktı mı)? |
| A-K5 | 🔒 Ebeveyn köşesine gir, yeşil düğmeye bak; **⭐ Tam sürüm** varsa aç, "Satın al"a bir kez dokun | Köşede **⭐ Tam sürüm** görünür (köprü çalışıyor). Deneme APK'sı Play'den gelmediği için "Satın alma tamamlanmadı…" yazar, çökme yok (gerçek ödeme denenmez). **📲 Telefona yükle** görünürse köprü engellenmiştir (oyun kendini web sitesi sanar, bütün bölümler ücretsiz açılır) | Hangi düğme göründü? Ne yazdı? |
| A-K6 | Uçak modu → uygulamayı kapat/aç | Oyun açılır ve oynanır | — |

**En önemli risk (koddan, 🔎; 19 Ekim akşamı düzeltildi):** Capacitor köprüyü yeni WebView'de "belge başı betiği" olarak ekler
(kurala takılmaz). Bu özelliği desteklemeyen WebView'de köprüyü sayfaya satır içi betik olarak, `<head>`'in hemen arkasına, yani
**kuraldan önce** ekler; sayfa içi kural kendisinden önceki betiğe uygulanmaz, köprü çalışır. Bulutta Capacitor'ın gerçek köprü
dosyasıyla taklit edildi (Chromium; gerçek eski telefon değil). Hangi WebView sürümünün bu özelliği desteklediği bilinmiyor
(belgede yok; telefon kendisi sorar). Köprü yine de eksik kalırsa belirti: A-K5'te "📲 Telefona yükle", ses yok, ekran kararır,
bütün bölümler ödemesiz açık (K50). Eski bir Android varsa onda da denenmeli. Ayrıca eski WebView `'wasm-unsafe-eval'`i tanımazsa
kamera modeli yüklenmeyebilir (K38: kamera kapanır, oyun kamerasız sürer; sürüm sınırı doğrulanmadı).

### iPhone (kural test sitesine çıkınca, Safari ve ana ekran uygulaması)

| # | Ne yapılır | Ne görülmeli (doğru) | Not edilecek |
|---|---|---|---|
| I-K1 | Test sitesini Safari'de aç (sayfayı bir kez yenile: yeni sürüm gelsin) | Oyun açılır, yazı tipi yuvarlak | iPhone modeli, iOS sürümü |
| I-K2 | 🔒 Ebeveyn → 🔊 Sesi dene; sonra bir durak | Zıpzıp konuşur | Ses geldi mi? |
| I-K3 | Kamerayla sayma aç → 🔍 Dene | Görüntü + vücut noktaları, sayı artar (iOS 16.4 ve sonrası; öncesinde kamera seçeneği görünmez) | Noktalar çıktı mı? |
| I-K4 | Uzaktan oyna açık, dokunmadan bir durak | Ekran kararmaz | Karardı mı? |
| I-K5 | Uçak modu → ana ekrandaki oyunu aç | Açılır ve oynanır | — |
| I-K6 | Sertifika ya da özet → 🔒 Kaydet / Paylaş | Paylaşma menüsü açılır | — |

iPhone uygulamasında (ileride, TestFlight) köprü WKUserScript ile girer, kurala takılmaması beklenir; `capacitor://localhost`
adresinde `'self'` eşleşmesi ve wasm izni de orada ayrıca denenmeli (🔎, Mac/Apple hesabı gerekir).

### Sıra ve geri dönüş yolu (K49, 19 Ekim kullanıcı kararı)
1. Android deneme APK'sı `k47-csp` dalından üretilir (sadece indirilebilir dosya; mağazaya/test sitesine gitmez).
2. Android telefonu olan biri A-K1…A-K6'yı dener. **Cihaz bulunamazsa KAYIT'a "bulunamadı" yazılır, hiçbir madde denenmiş sayılmaz.**
3. Android'de A-K2, A-K3, A-K5'ten biri olmazsa (özellikle "📲 Telefona yükle" görünürse) #157 birleştirilmez; neden KAYIT'a yazılır,
   önlem (en düşük WebView sürümü ya da başka yol) kullanıcıya seçenek olarak sunulur.
4. Android geçerse #157'yi main'e birleştirmek için kullanıcıdan **ayrıca onay** istenir (test sitesi sadece main'den yayınlanır).
5. Birleşince birkaç gün iPhone Safari'de I-K1…I-K6. Test sitesinde ya da iPhone'da bir şey bozulursa: birleştirme PR'ındaki
   **Revert** düğmesi → geri alma PR'ı → `test` yeşil → birleştir (geçmiş yeniden yazılmaz, force push yok). Telefon yeni sürümü
   alsın diye sayfa bir kez yenilenir (hizmet çalışanı bir sonraki açılışta günceller). Nedeni KAYIT'a yazılır.
6. Mağaza yayını bu adımlarla başlatılmaz.

**Eski WebView davranışı (koddan + Chromium taklidi, 🔎 telefonda):** belge başı betiği yoksa köprü satır içi `<script>` olarak
`<head>`'in arkasına girer, kuraldan önce kalır ve çalışır (`guvenlik-kurali.spec.ts` "eski WebView taklidi"). `index.html`'de
`<head>` etiketine özellik eklenirse köprü `</head>`'in önüne, kuralın arkasına düşer ve engellenir (test bunu yakalar).
Köprü eksikse belirti: ebeveyn köşesinde "⭐ Tam sürüm" yerine "📲 Telefona yükle", Zıpzıp'ın sesi yok, ekran kararıyor; bütün
bölümler ödemesiz açık.

**19 Ekim akşamı:** Android test cihazı şimdilik yok; A-K1…A-K6 denenmedi. **iPhone:** test sitesi sadece main'den yayınlanır;
#157 main'e girmeden Safari'de yapılan deneme K47'yi kapsamaz.

### Sonuç kaydı (telefonda doldurulur; Claude doldurmaz)

```
Tarih:            Deneyen:
Telefon modeli:   Android/iOS sürümü:      WebView/Safari sürümü:
Paket: APK (k47-csp, commit …) / test sitesi (Safari / ana ekran)
A-K1 … A-K6 ya da I-K1 … I-K6: Oldu / Olmadı / Denenmedi · not
```
Sonuçlar KAYIT.md'ye (K47 satırı ve günlük) aynen yazılır; denenmeyen madde 🔎 kalır.

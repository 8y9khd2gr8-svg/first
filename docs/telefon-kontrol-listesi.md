# Gerçek telefonda kontrol listesi

Otomatik testler (bulutta, ekransız tarayıcı) bunları **göremez**. 15 Ekim'deki aile testinde ikisi kaçtı: ekranın
kararması ve iPhone'un kamera iznini tekrar tekrar sorması. Kural: kamera, ses, ekran, izin ya da "dokunmadan oynama"
(Uzaktan oyna, Ailece) ile ilgili her değişiklikte Claude bu listeyi tek tek düşünür, PR'a ve rapora hangi maddenin
etkilendiğini ve telefonda neyin denenmesi gerektiğini yazar. Testle taklit edilebilen madde testle de denetlenir.

| # | Ne | Telefonda ne olur | Testle taklit | Durum |
|---|---|---|---|---|
| T1 | Ekran kararması (otomatik kilit) | Dokunulmazsa 30 sn-5 dk'da ekran kararır, kilitlenir; kamera durur | Sahte Wake Lock: dokunmadan bütün durak/Ailece boyunca "açık tut" isteniyor mu (`oyun.spec.ts` "dokunmadan bütün durak") | #131 (iOS ana ekran uygulamasında 18.4 öncesi 🔎) |
| T2 | Kamera izni penceresi | Her `getUserMedia` çağrısında iPhone (özellikle ana ekran uygulaması) yeniden sorabilir | Sahte kamera: bir durakta kaç kez açıldı; kamera açılırken (izin penceresi açık) sıradaki harekete geçilse de bir kez (`kamera-benzetim.spec.ts`) | #131; 16 Ekim: izin beklenirken ikinci kez açılıp ilki açık kalıyordu → düzeltildi. 🔎 iPhone'da izin penceresi açıkken oyun ilerliyor mu |
| T3 | Ekran kilidinden / başka uygulamadan dönüş | Kamera durur, ses yarıda kalır, Wake Lock düşer | Kısmen ("Kamera durdu" testi); gösterimde yarıda kalan komut dönüşte bir kez yeniden söylenir, geri sayım onu kesmez (`oyun.spec.ts` "yarıda kalan hareket komutu", eski kodda kırmızı; K39 b, 17 Ekim) | Kısmen; 🔎 gerçek kilitte komutun yeniden söylendiği telefonda denenmeli |
| T4 | Ses | Sessiz mod düğmesi, Türkçe ses yoksa konuşmama, ilk dokunuştan önce ses çalmama; arkaya alınınca konuşmanın yarıda kalması | Kısmen: sayfa gizlenince konuşma susar, yarıda kalan hareket komutu dönüşte bir kez yeniden söylenir (sayılar yinelenmez; K39 b), dönüşte iPhone'da duraklatılmış konuşma sürdürülür, aramadan sonra "interrupted" ses bağlamı yeniden açılır (`oyun.spec.ts` "kesinti") | Kısmen (16 Ekim); sessiz mod düğmesi ve Türkçe ses 🔎 (Sesi dene ekranı) |
| T5 | Düşük güç modu | Wake Lock reddedilebilir, kare hızı düşer | Evet: sahte reddetme; durak "Uzaktan oyna" ile dokunmadan ilerler, hata yok; istek 10 sn'de bir yinelenir (eskiden saniyede 2), dokununca hemen (`oyun.spec.ts` "T5") | ✅ taklit (16 Ekim); 🔎 gerçek telefonda: düşük güç modunda ekran kararır mı (o zaman telefonun Otomatik Kilit ayarı geçerli) |
| T6 | Telefon yan çevrilince | "Telefonu dik çevir" görünmeli | Evet (basık pencere) | ✅ |
| T7 | Yavaş / eski telefon | Kamera tanıma yavaş, animasyon takılır; model yüklenemeyebilir | İşlemci 6 kat yavaş: kameralı hareket ekranı biter ve ilerler (`oyun.spec.ts` "T7"); model yüklenemezse kamera kapanır (K38); gezinti `GEZINTI_YAVAS` | Kısmen (16 Ekim). Bulgu: kare 200 ms'yi aşınca oyunun saati geri kalır (Phaser), sayaçlar/süreler uzar (test makinesinde ~12 kare/sn'de 6 sn → 11 sn); kaybettirmez, büyük aynanın en çok süresi gerçek saatle. 🔎 eski iPhone'da denenmeli |
| T8 | İnternetsiz | Oyun açılmalı | Evet | ✅ |
| T9 | Çocuk 2-3 m uzakta, telefona dokunmadan | Her şey kendiliğinden ilerlemeli, ekran açık kalmalı | T1 ile birlikte | #131 |
| T10 | Bildirim / arama gelirse | Oyun duraklar mı, ses kesilir mi | Evet (sahte gizleme; telefon gibi kare de durur): sayma, "Uzaktan oyna" geri sayımı ve konuşma durur, dönünce kaldığı yerden bir kez devam eder; sayma sırasında kesilirse komut yinelenmez (`oyun.spec.ts` "kesinti") | ✅ taklit (16-17 Ekim); 🔎 gerçek aramada denenmeli. Not: üstten inen bildirim sayfayı gizlemez, oyun sürer (sorun değil) |

Yeni bir telefon davranışı fark edilirse bu tabloya eklenir.

**Telefonda doldurulan sayfa (17 Ekim):** kardeş ve Yağız için bu tablo ve `docs/yagiz-testi.md` tek sayfada, iPhone'da işaretlenip
notları kopyalanabilir: https://claude.ai/artifact/DjZd22aR1pZNm82WUP6j8r (özel bağlantı; başkası açacaksa sayfanın Paylaş menüsünden paylaşılır).
Erişilebilirlik (hareketi azalt, büyük yazı, VoiceOver) de orada; hareketi azalt bulutta taklit edilir (`oyun.spec.ts` "hareketi azalt"), büyük yazı ve VoiceOver 🔎.

**VoiceOver deneme sayfası (17 Ekim akşamı, K46):** https://claude.ai/artifact/AgsJCsCMZwZ3MZmw1Lf1cT . Üç yol (bugünkü tuval, adı olan tuval,
görünmez HTML düğmeler); her birinde VoiceOver'ın ne okuduğu ve doğru düğmenin çalışıp çalışmadığı yazılır, ayrıca gerçek oyunda da bakılır.
Bulutta sadece tarayıcının erişilebilirlik ağacı görüldü (çocuk ekranlarında adsız tek "Canvas"); iPhone davranışı 🔎.

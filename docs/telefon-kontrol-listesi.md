# Gerçek telefonda kontrol listesi

Otomatik testler (bulutta, ekransız tarayıcı) bunları **göremez**. 15 Ekim'deki aile testinde ikisi kaçtı: ekranın
kararması ve iPhone'un kamera iznini tekrar tekrar sorması. Kural: kamera, ses, ekran, izin ya da "dokunmadan oynama"
(Uzaktan oyna, Ailece) ile ilgili her değişiklikte Claude bu listeyi tek tek düşünür, PR'a ve rapora hangi maddenin
etkilendiğini ve telefonda neyin denenmesi gerektiğini yazar. Testle taklit edilebilen madde testle de denetlenir.

| # | Ne | Telefonda ne olur | Testle taklit | Durum |
|---|---|---|---|---|
| T1 | Ekran kararması (otomatik kilit) | Dokunulmazsa 30 sn-5 dk'da ekran kararır, kilitlenir; kamera durur | Sahte Wake Lock: dokunmadan bütün durak/Ailece boyunca "açık tut" isteniyor mu (`oyun.spec.ts` "dokunmadan bütün durak") | #131 (iOS ana ekran uygulamasında 18.4 öncesi 🔎) |
| T2 | Kamera izni penceresi | Her `getUserMedia` çağrısında iPhone (özellikle ana ekran uygulaması) yeniden sorabilir | Sahte kamera: bir durakta kaç kez açıldı | #131 |
| T3 | Ekran kilidinden / başka uygulamadan dönüş | Kamera durur, ses yarıda kalır, Wake Lock düşer | Kısmen ("Kamera durdu" testi) | 🔎 |
| T4 | Ses | Sessiz mod düğmesi, Türkçe ses yoksa konuşmama, ilk dokunuştan önce ses çalmama | Hayır | 🔎 (Sesi dene ekranı) |
| T5 | Düşük güç modu | Wake Lock reddedilebilir, kare hızı düşer | Hayır | 🔎 |
| T6 | Telefon yan çevrilince | "Telefonu dik çevir" görünmeli | Evet (basık pencere) | ✅ |
| T7 | Yavaş / eski telefon | Kamera tanıma yavaş, animasyon takılır | İşlemci yavaşlatma (`GEZINTI_YAVAS`) | Kısmen |
| T8 | İnternetsiz | Oyun açılmalı | Evet | ✅ |
| T9 | Çocuk 2-3 m uzakta, telefona dokunmadan | Her şey kendiliğinden ilerlemeli, ekran açık kalmalı | T1 ile birlikte | #131 |
| T10 | Bildirim / arama gelirse | Oyun duraklar mı, ses kesilir mi | Hayır | 🔎 |

Yeni bir telefon davranışı fark edilirse bu tabloya eklenir.

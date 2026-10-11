# İstanbul'un 7 Tepesi: hazırlık

Durumu: duraklar, bilgiler ve hareketler hazır (`src/tepeler.ts`). Bölüm Büyük Macera'da hâlâ "Yakında".
Çizer haritayı ve 7 durak resmini çizince bölüm açılır (adımlar `src/tepeler.ts`'in başında).

| Tepe | Durak | Özel hareket | Diğer 3 hareket |
|---|---|---|---|
| 1 | Topkapı Sarayı | Kollar yana, dimdik dur (saray nöbetçisi) | El salla · Parmak ucunda yürü · Uzan |
| 2 | Çemberlitaş | Dimdik dur, kollar yukarı (sütun) | Bel döndür · Zıpla · Çömel-kalk (boncuk topla) |
| 3 | Beyazıt Kulesi | Diz kaldır, öbür kol uzat (merdiven) | Kollar kaldır-indir · Aç-kapa (hızlı) · Tek ayak |
| 4 | Bozdoğan Kemeri | Ayaklar açık, eller başın üstünde (kemer) | Dizleri kaldırarak yerinde yürü · Yana eğil · Yana adım |
| 5 | Çukurbostan | Çömel, yeri kaz (bostan) | Hayali sepeti kaldır · Uzan (elma) · Kollar yana, salla |
| 6 | Tekfur Sarayı | Ayakları sırayla yere vur (nöbet) | Arkanı dön · Engel zıpla (hayali taş) · Kollar (yavaş) |
| 7 | Yedikule | 7 kere zıpla (yedi kule) | El salla · Çömel · Kocaman ol |

Kurallar korundu: ibadet yeri olarak kullanılan yapılar durak değil (tepeler saray, sütun, kule, su kemeri, bostan,
sur ve hisarla anlatılır); "gibi" yok; bir hareket türü önceki iki durakta tekrar etmez (`npm test` denetler).

## Bilgilerin doğrulanması (11 Ekim)

| Durak | Bilgi | Durum | Not / kaynak |
|---|---|---|---|
| Topkapı (1. tepe) | Padişahlar yüzlerce yıl yaşadı; Boğaz ve Marmara görünür | ✅ | 1478'de yaptırıldı, ~400 yıl saray (Habertürk, Kure Ansiklopedi) |
| Çemberlitaş (2. tepe) | ~1700 yıllık (MS 330); demir çemberler | ✅ | Çemberler sütun hasar gördükten sonra tutmak için takıldı; "çatlamasın diye" çocuk dilinde doğru |
| Beyazıt Kulesi (3. tepe) | Yangın gözetleme kulesi; İstanbul Üniversitesi bahçesinde | ✅ | Kaynaklar 3. tepeye Beyazıt ve İstanbul Üniversitesi'ni koyuyor |
| Bozdoğan Kemeri (4. tepe) | Romalılar, 1600 yıldan uzun önce (MS 368) | ✅ | Kemer 3. ve 4. tepe arasındaki çukuru aşar; metin "yanından geçer" diyor, doğru |
| Çukurbostan (5. tepe) | Açık su deposu → bostan → park | ✅ | Aspar Sarnıcı, Yavuz Selim çevresi (5. tepe) |
| Tekfur Sarayı (6. tepe) | Bir zamanlar çini yapılırdı | ✅ | Çini atölyesi yaklaşık 1719–1752 (Leiden Üniv., Theunissen; Columbia MCID) |
| Yedikule (7. tepe) | "Yedinci tepenin yakınında" | ⚠️ yeterli | Kaynaklar 7. tepeye Cerrahpaşa/Haseki'yi koyuyor; Yedikule bunun güneybatısında, surların ucunda. "Yakınında" demek doğru; "üstünde" denmemeli |

Genel not: Bazı kaynaklar "topografik olarak tam yedi tepe yok, bu geleneksel bir anlatım" diyor. Çocuk metninde sorun
değil; ebeveyn sorarsa "Bizans'tan beri yedi tepeli şehir diye anılır" denebilir. Tepe–yapı eşleşmesinde kaynaklar
arasında küçük farklar var (Kapalıçarşı 2. mi 3. mü gibi); bizim duraklarımız en yaygın listeyle uyumlu.

Kaynaklar: haberturk.com "İstanbul'un 7 tepesi nerede", hurriyet.com.tr "İşte yedi tepe", kureansiklopedi.com
"İstanbul'un Yedi Tepesi", scholarlypublications.universiteitleiden.nl/handle/1887/3631544 (Tekfur atölyesi),
mcid.mcah.columbia.edu/node/1418 (Tekfur Sarayı).

## Çizer için istek listesi

Genel: Zıpzıp tarzı (yuvarlak hatlar, kalın koyu çizgi, düz renk + tek gölge), açık ve sıcak renkler, ürkütücü öğe yok
(karanlık zindan, silah, asker yok). Yazı yok (oyun yazıyı kendisi koyar). Teslim: SVG (tercih) ya da 2x PNG, saydam zemin.

1. **Harita** (dikey, 1080×1920 telefona sığacak; SVG): Tarihi Yarımada yukarıdan; Haliç (üst), Boğaz (sağ), Marmara (alt)
   mavi; 7 tepe yumuşak yeşil tümsekler, her birinin üstünde boş bir yuvarlak (numara/simge oyunda konur); surlar
   batıda ince bir çizgi; Zıpzıp'ın zıplayacağı kıvrımlı yol 1'den 7'ye. Oyun konumları bu çizimden okuyacak, tepe
   ortalarını ayrıca bir listede (x, y) verin.
2. **7 durak simgesi** (her biri 256×256, aynı çerçeve dili):
   - Topkapı: saray kapısı (Bâb-ı Hümâyun) ve iki kule; bayrak yok
   - Çemberlitaş: çemberli mor-kızıl sütun, çemberler belirgin
   - Beyazıt Kulesi: ince beyaz kule, tepede küçük köşk
   - Bozdoğan Kemeri: iki katlı taş kemerler, altından araba yolu
   - Çukurbostan: çukurda sebze bahçesi (havuç, domates), kenarda taş duvar
   - Tekfur Sarayı: tuğla-taş çizgili cephe, önünde birkaç renkli çini
   - Yedikule: yıldız biçimli hisar, yedi kule sayılabilsin
3. **Durak arka planları** (isteğe bağlı, sonra): her durak için sade bir manzara, ortası boş (Zıpzıp orada durur).
4. **Bölüm simgesi**: Büyük Macera yolundaki "İstanbul'un 7 Tepesi" düğmesi için 7 tümsekli küçük şehir silueti
   (ibadet yapısı silueti olmadan: kule, sütun, kemer, hisar).

Bölümü açmak için kod adımları `src/tepeler.ts`'in başında.

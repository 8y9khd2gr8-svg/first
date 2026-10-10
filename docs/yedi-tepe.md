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

## Yayından önce doğrulanacaklar (taslak bilgiler)
- Tepe–yapı eşleşmeleri (kaynaklarda küçük farklar var): Bozdoğan Kemeri 3. ve 4. tepe arasında; Yedikule 7. tepenin yakınında.
- Çemberlitaş "yaklaşık 1700 yıllık" (MS 330), Bozdoğan Kemeri "1600 yıldan uzun" (MS 4. yüzyıl).
- Çukurbostan: eski açık su deposu (Aspar Sarnıcı), sonra bostan, bugün park.
- Tekfur Sarayı'nda 18. yüzyılda çini atölyesi.

## Çizer için
- Harita: Tarihi Yarımada'yı yukarıdan gösteren, 7 tepenin numaralı olduğu sade bir harita (Haliç, Boğaz, Marmara).
- 7 durak simgesi (Zıpzıp tarzında): saray, çemberli sütun, kule, kemer, bostan, sur, yedi kuleli hisar.

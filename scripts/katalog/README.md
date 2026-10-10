# Hareket kataloğu (fizyoterapist için)

Çıktı: `docs/hareket-katalogu.html` (tek dosya, resimler içinde; tarayıcıda açılır, not alınır, PDF kaydedilir).
Hareketler değişince yeniden üretmek için (Playwright gerekir, `npm run dev` açık olmalı):

```
npx tsx scripts/katalog/veri.ts /tmp/katalog.json
node scripts/katalog/pozlar.mjs kollar,uzan,zipla,... /tmp/pozlar.json   # veri.ts'in yazdığı animasyon listesi
node scripts/katalog/yap.mjs /tmp/katalog.json /tmp/pozlar.json docs/hareket-katalogu.html
```

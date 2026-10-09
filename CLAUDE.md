# Zıp Zıp Dünya – çalışma kuralları

## Proje
4-9 yaş çocuklar için reklamsız, şiddetsiz, Türkçe hareket oyunu. Maskot "Zıpzıp":
Türkiye merkezli, kollu-bacaklı gülen dünya; Türkiye altın sarısı (#FFC93C).
Tema: Dünyanın 7 harikası turu, Türkiye'den (Efes – Artemis Tapınağı) başlar.
Teknoloji: Phaser 3 + TypeScript + Vite, GitHub Pages ile yayın. İleride Capacitor ile mağazalar.

## Değişmez kurallar
- Reklam yok, şiddet yok, kaybetmek yok.
- Hesap/kayıt yok, çocuktan veri toplanmaz; ilerleme sadece cihazda saklanır.
- Yazı okumayı bilmeyen çocuk da oynayabilmeli: büyük düğmeler, sesli yönlendirme.

## Alınan kararlar
- Para modeli: ilk harika (Türkiye) ücretsiz, tüm dünya turu tek seferlik ödemeyle açılır.
  Ödeme ekranı ebeveyn kilidinin arkasında. Kostüm/kıyafet satılmaz; hareketle kazanılan
  yıldızlarla açılır. İleride okullara/anaokullarına lisans düşünülebilir.
- Önce web (PWA), oyun olgunlaşınca Capacitor ile Play Store ve App Store.
- Kamera ile hareket algılama sonraya bırakıldı; şimdilik çocuk "Yaptım!" düğmesine basar.

- Hareket komutları benzetme değil, vücut parçasını söyleyen tek ve net eylem olmalı
  ("Tek ayağını kaldır", "Dizlerini sırayla kaldır"). "Leylek gibi", "kuş gibi kanat çırp",
  "yıldız gibi açıl kapan" 6 yaşa anlaşılır gelmedi (Yağız testi).
- Aşama 3: her harikanın kendine özgü, hikâyeli bir hareketi olacak (ör. Efes: sütun gibi
  dimdik dur; Çin Seddi: duvarda dizleri kaldırarak yürü; Piramitler: kollarla piramit yap).
- Harika listesini biz seçeriz; dini figür/ibadet odaklı yapılar (ör. Kurtarıcı İsa heykeli)
  Türkiye'de yanlış anlaşılabileceği için listeye alınmaz.

## Kod düzeni
- `src/zipzip.ts`: maskot; duruşlar (uzuv açıları) ve her hareketin adımları burada.
- `src/hareketler.ts`: hareket listesi. `src/ses.ts`: sesler. `src/arayuz.ts`: düğmeler, arka plan.
- Test: `npm run dev` ile açınca `window.oyun` üzerinden sahneler başlatılabilir (sadece geliştirmede).

## Proje sahibiyle çalışma şekli
- Proje sahibi yazılım bilmiyor: her şeyi sade Türkçeyle anlat, teknik terimleri açıkla.
- Karar gereken her noktada AskUserQuestion ile 4 seçenek sun (önerilen ilk sırada,
  "(Önerilen)" etiketiyle); kullanıcı yazmadan seçebilsin. Her zaman en iyisi için kafa yor.
- Her aşama küçük ve telefonda test edilebilir olsun; sonunda Yağız (6 yaş) test eder.
- Değişiklikler PR olarak açılır; testleri geçince PR'ı Claude birleştirir (kullanıcı onayladı).
- Kodda isimler ve yorumlar Türkçe.

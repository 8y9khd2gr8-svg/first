# ChatGPT için Zıp Zıp Dünya rapor paketi (12 Ekim 2026)

> **12 Ekim 2026 anlık görüntüsü.** Bu klasör o günkü durumu anlatır, sonradan güncellenmez; güncel durum için `docs/KAYIT.md` ve `CLAUDE.md`. (Rapor aynı gün ChatGPT ile paylaşıldı.)

## Dosyalar
| Dosya | İçerik |
|---|---|
| `PROJE_RAPORU.md` | Oyunun amacı, oynanış, 7 bölüm/50 durak, tamamlananlar, eksikler, kararlar, bilinen sorunlar |
| `TEKNIK_DURUM.md` | Teknoloji, klasörler, sahneler, hareket/kamera sistemi, animasyon, çalıştırma/test, riskler, kurallar |
| `GORSEL_ENVANTER.md` | 30 ekran görüntüsünün listesi, görsel dünya, varlık dosyaları ve boyutları |
| `YOL_HARITASI.md` | 4 öncelik grubunda işler: durum, yapılacak, bağımlılık, tamamlanma ölçütü |
| `IS_AKISI.md` | Dal/PR iş akışı, çalışan sürümü koruma, geri alma |
| `ekran-kolaji.jpg` | 30 ekran görüntüsü tek sayfada (tek tek dosyalar ChatGPT paketindeydi, depoya konmadı) |
| `OZET.pdf` | Okunabilir 3-4 sayfalık özet |

Kaynak kodun tamamı herkese açık: https://github.com/8y9khd2gr8-svg/first (en önemli dosya: `CLAUDE.md`). Test sitesi: https://8y9khd2gr8-svg.github.io/first/

## ChatGPT'ye yapıştırılacak başlangıç mesajı

```
Ekteki dosyalar "Zıp Zıp Dünya" adlı, 4-9 yaş çocuklar için Türkçe, reklamsız bir hareket oyununun
güncel durum raporudur (12 Ekim 2026, sürüm 0.9.0, Kasım'da kapalı beta planlanıyor).
Kaynak kod: https://github.com/8y9khd2gr8-svg/first (kurallar ve kararlar CLAUDE.md'de).

Ben yazılım bilmiyorum; lütfen sade Türkçeyle yaz. Kodu Claude Code ile birlikte yazıyoruz;
senden ikinci bir göz istiyorum. Şu kurallara uy:
- Projeyi baştan yazmayı önerme; mevcut yapıyı koru.
- "Değişmez kurallar"a (reklam yok, şiddet yok, kaybetmek yok, veri toplanmaz, dış sunucu yok,
  sosyal ağ yok) ve CLAUDE.md'deki alınmış kararlara aykırı öneri yapma; bir kararı değiştirmeyi
  önereceksen bunu açıkça "karar değişikliği" diye belirt ve gerekçesini yaz.
- Raporda "doğrulanmadı" yazan şeyleri çalışıyor sayma.

Senden istediklerim:
1. Raporu okuyup en önemli 5 riski ve gözden kaçmış olabilecek 5 konuyu yaz.
2. Ekran görüntülerine bakarak 4-9 yaş çocuk ve ebeveyn gözüyle "ufak dokunuş" önerileri ver
   (metin, düğme, yerleşim, ses yönlendirmesi). Her öneri için: hangi ekran, şu anki hâli, önerilen hâli,
   neden. Küçük/orta/büyük diye işaretle.
3. Hareket komutları ve hikâye cümleleri için Türkçe dil önerileri (6 yaşındaki çocuğun anlayacağı,
   benzetmesiz net eylem; "gibi" kullanılmaz).
4. YOL_HARITASI.md'deki öncelik sırasına katılıyor musun? Değiştirirsen nedenini yaz.
Önerilerini numaralı bir liste olarak ver; ben bunları Claude Code'a uygulatacağım.
```

# Zıp Zıp Dünya — Kontrollü Geliştirme İş Akışı (inceleme ve öneri)

**Tarih:** 12 Ekim 2026. Bu belge mevcut durumu (doğrulanmış) ve önerilen iş akışını anlatır. **Öneriler henüz uygulanmadı**; GitHub ayarları sizin onayınızla (bazıları sizin tarafınızdan) yapılır.

## 1. Teknolojiler ve çalıştırma (özet)
TypeScript + Phaser 3 + Vite; mobil paket Capacitor 7; testler Node + Playwright. Ayrıntı: TEKNIK_DURUM.md.
```bash
npm ci          # bir kez
npm run dev     # http://localhost:5173
npm test        # hızlı testler (~1 sn)
npm run test:oyun   # tarayıcı testleri (~6-8 dk)
```

## 2. Deponun şu anki durumu (12 Ekim, komutlarla kontrol edildi)

| Konu | Durum |
|---|---|
| Varsayılan dal | `main` @ `fe37906` (#97, 12 Ekim) |
| Açık PR | Yok (#93-#97 bugün birleşti) |
| Çalışma ağacı (bulut bilgisayarı) | Temiz; tek fark commit edilmemiş bu rapor klasörü (`chatgpt-rapor/`, depoya gönderilmedi) |
| `main` dal koruması | **Yok** (GitHub "Branch not protected") — testler geçmeden de birleştirme ya da doğrudan push mümkün |
| Sürüm etiketleri (tag) / GitHub Releases | **Yok** (0 adet) |
| GitHub'daki dal sayısı | 94 (çoğu birleşmiş eski PR dalları) |
| Testler | Her PR'da otomatik ("Testler" işi); `main`'e push'ta çalışmaz |
| Yayın | `main`'e her push'ta otomatik GitHub Pages'e (test sitesi) yayın |
| Bugünkü bir aksaklık | #94 testleri kırmızıyken yanlışlıkla birleştirildi (test zaman aşımı, oyun hatası değil); #95 ile düzeltildi |

## 3. Çalışan sürümü nasıl koruruz? (öneri)

1. **Sürüm etiketi:** Bugünkü `main`'e `v0.9.0-beta-oncesi` gibi bir etiket konur. Her betaya/mağazaya giden sürüme de etiket (`v0.9.1`…). Böylece "çalışan sürüm" tek adla bulunur.
2. **Dal koruması (GitHub → Settings → Branches → `main`):** "Require a pull request" + "Require status checks to pass: test". Bu ayarı sizin yapmanız gerekebilir (yapay zekâ erişimi ayar sayfasına izin vermeyebilir; **doğrulanmadı**).
3. **Birleştirme kuralı (sizin son talimatınız):** PR'ı Claude birleştirir, ama **sadece "Testler" yeşil olduğunda ve sonuç okunduktan sonra**. Değişiklik fikirleri sizinle konuşularak seçilir.
4. **Mağaza paketleri:** Play'e/TestFlight'a giden her paket bir etiketten üretilir; sürüm numarası `package.json`'da artırılır.

## 4. Önerilen iş akışı (her özellik için)

```
1. İş seçilir (sizinle; büyük ürün kararıysa önce seçenek tablosu)
2. Güncel main'den yeni dal:  git fetch origin main && git checkout -B <is-adi> origin/main
3. Küçük değişiklik + gerekiyorsa yeni test
4. Yerelde: npx tsc --noEmit · npm test · ilgili tarayıcı testleri (gerekirse hepsi)
5. PR açılır; açıklamada: hangi dosya neden değişti, nasıl denenir, bilinen sorunlar, geri alma yolu
6. GitHub "Testler" yeşil → sonuç okunur → birleştirilir (kırmızıysa birleştirilmez, düzeltilir)
7. Birleşince test sitesinde (GitHub Pages) birkaç dakika içinde görünür → telefonda denenir
```
Dal adları kısa ve Türkçe (ör. `kamera-esik`, `ses-kaydi`). Aynı test dosyasına dokunan PR'lar sırayla birleştirilir.

## 5. Önceki sürüme dönmek

| Durum | Nasıl |
|---|---|
| Son birleşen PR bir şeyi bozdu | GitHub'da PR sayfasında **Revert** düğmesi → yeni bir "geri alma" PR'ı açılır → testler yeşilse birleştirilir. Geçmiş silinmez. |
| Komutla | `git revert <commit>` → PR (aynı sonuç) |
| Test sitesini hemen eski hâline almak | Geri alma PR'ı birleşince site kendiliğinden eski hâline döner (birkaç dakika) |
| Belirli bir sürümü yeniden paketlemek | Etiketten: Actions → paket işi o etiketle çalıştırılır (etiketler kurulunca) |
| Asla | `main`'de geçmişi yeniden yazmak (force push) |

## 6. Görsel ve animasyon entegrasyonunda değişebilecek dosyalar
Ayrıntılı tablo: GORSEL_ENVANTER.md bölüm 4. Kısaca: maskot `src/zipzip*.ts`; durak simgeleri `public/simge/` + `src/arayuz.ts`; arka planlar `src/scenes/BolumScene.ts`, `HaritaScene.ts`, `DunyaScene.ts`, `UzayScene.ts`; yeni Phaser yeteneği `src/phaserNesneleri.cjs`; ikonlar `scripts/ikon-uret.mjs`; mağaza görselleri `scripts/magaza-gorselleri.mjs`.

## 7. Her işin sonunda verilecek rapor şablonu
- **Ne değişti:** dosya → neden
- **Test sonuçları:** yerel + GitHub "Testler" (bağlantı)
- **Bilinen sorunlar / doğrulanmayanlar:** (örn. "gerçek telefonda denenmedi")
- **Geri alma:** PR numarası → Revert

## 8. Doğrulanamayanlar (açıkça)
- Gerçek telefonda performans, ses, kamera ve ödeme.
- GitHub ayar sayfalarına (dal koruması) yapay zekânın yazma izni olup olmadığı.
- 94 eski dalın silinmesinin güvenli olduğu (birleşmiş görünüyorlar; tek tek kontrol edilmedi).

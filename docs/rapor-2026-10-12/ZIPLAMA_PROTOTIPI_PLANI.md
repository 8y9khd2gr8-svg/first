# Zıp Zıp Dünya — Gerçek Hareket Tepkisi: Zıplama Prototipi Teknik Planı

**12 Ekim 2026** · main @ `963474b` incelendi · Kod değiştirilmedi · Hazırlayan: Claude (Claude Code)
İşaretler: **✔ koddan doğrulandı** · **≈ tahmin / öneri** (gerçek telefonda ya da çocukla denenmedi)

> **Kararlar (12 Ekim, proje sahibi):** D1 prototip **kamera denemesinde** ("Zıpzıp da zıplasın") · D2 kamerasızda **ritim + dokunma** · D3 tetik **inişte + en az 400 ms ara** · D4 ölçüm **kamera denemesinde ebeveynin gördüğü ölçüm satırı** (hiçbir şey kaydedilmez).

Hedef: Çocuk gerçekten zıpladığında Zıpzıp **bir kez** zıplasın ve dünyada küçük bir sonuç olsun. Kamera kapalıyken aynı oyun başka yolla oynansın. Sadece **zıplama**.

---

## 1. Mevcut sistemin doğrulanmış özeti

| Parça | Durum (✔) | Dosya |
|---|---|---|
| Model | MediaPipe Pose Landmarker **lite**, `runningMode: VIDEO`, `numPoses: 1`; önce GPU, olmazsa CPU; model ve wasm pakette | `src/kamera.ts` `modelYukle` |
| Kare döngüsü | `requestAnimationFrame` ile; video yeni kare verdiyse tanıma yapılır. Yavaş telefonda her tanımadan sonra onun süresi kadar ara verilir (#96) | `KameraSayaci.baslat` |
| Zıplama algısı | Omuz yüksekliğinin "ayakta" tabanı yavaşça güncellenir; omuz tabandan **boyun %7'si** yükselince "havada", **%2,5'in** altına inince **1 zıplama**. İki eşik (aç/kapa) aynı zıplamanın iki kez sayılmasını zaten büyük ölçüde önler | `Sayici.besle` (zipla yolu) |
| Görünürlük | Omuzlar ve topuklar görünmüyorsa sayılmaz, durum "goremiyorum" ("📷 Geri git") | `dongu` |
| Olay | **Her sayı artışında** `degisince(sayi, durum)` geri çağrısı çalışır → oyuna "bir zıplama oldu" olayı bugün de **var** | `bildir` |
| Oyuna etkisi | `HareketScene` bu olayı sadece küçük kutudaki "📷 2/5" yazısı ve süre bitince "hedefe ulaştı mı" kontrolü için kullanır. **Zıpzıp'ın animasyonu ve sayaç saate bağlı**, kamera onları etkilemez | `HareketScene.kameraKur`, `bitir` |
| Zıpzıp | `zipzip.birKez('zipla', sure)` tek zıplamayı oynatır; `surekli()` döngü. Yani "bir kez zıpla" çağrısı hazır | `src/zipzip.ts` |
| Veri | Görüntü sadece ekrandaki `<video>` önizlemesinde; kaydedilmez, gönderilmez. Vücut noktaları bellekte, kareden kareye; saklanmaz. Sahne kapanınca `durdur()`: kamera izleri durur, döngü iptal. Cihaza sadece günlük sayılar yazılır (`zipzip-istatistik-v1`: kameraAcik / kameraGordu) | `durdur`, `src/istatistik.ts` |
| Kamera denemesi | Ebeveyn köşesi → 🔍 Dene: canlı görüntü, vücut noktaları, sayma yolu seçimi (zıpla dahil), sayı; sayılar özete eklenmez | `EbeveynKameraScene.ts` |
| Testler | Yapay vücut noktalarıyla sayma testleri (`tests/kamera.test.ts`); tarayıcı testleri kamerasız akışı sınar | — |
| Bilinmeyen | Gerçek telefonda tanıma süresi ve gecikme **ölçülmedi** (6× yavaşlatılmış bulut benzetiminde ~0,8 sn/tanıma). Eşikler gerçek çocukla **denenmedi** | — |

## 2. En küçük prototipin akışı (≈ öneri)

```
Kamera karesi → MediaPipe → Sayici "zıplama bitti" (iniş anı)
   → [çift tetik koruması: son tetikten en az ~400 ms geçti mi?]
   → olay: zipladi(zaman)
   → Zıpzıp.birKez('zipla') + küçük dünya sonucu (ör. bir yıldız toplanır / taş köprüye konur) + "bip"
   → sayaç 1 artar; hedefe gelince "Aferin!"
```

- **Algılama, tetikleme ve çift sayım ayrı katmanlar:** (1) `Sayici` sadece "zıplama oldu" der (bugünkü mantık); (2) ince bir "tetikleyici" katmanı en kısa aralığı uygular ve olayı oyuna gönderir; (3) sahne Zıpzıp'ı oynatır. Böylece algılama eşikleri değişince oyun kodu değişmez.
- **Kalkış mı iniş mi?** Bugünkü sayaç **inişte** sayar (daha güvenilir, ama Zıpzıp çocuktan ~yarım saniye sonra zıplar ≈). Kalkışta saymak daha "canlı" hissettirir ama yanlış tetik riski artar. Karar D3.
- **Prototip nerede?** (Karar D1). Önerim: önce **ebeveyn köşesindeki kamera denemesinde** "Zıpzıp da zıplasın" seçeneği. Çocuk akışına dokunmaz, Yağız testinde hemen denenir.

## 3. Kamerasız alternatif (≈ öneri, karar D2)

Aynı görev, kamera yokken: **Zıpzıp ritimle zıplar ve çocuk onunla zıplar** (bugünkü sayaç gibi, her vuruşta dünya sonucu yine olur). İsteyen çocuk **ekrana dokunarak** da Zıpzıp'ı zıplatabilir. Kaybetmek yok; süre bitince "Yaptım!".

## 4. Değişebilecek dosyalar (≈)

| Dosya | Neden |
|---|---|
| `src/kamera.ts` | Zıplama olayına zaman damgası ve en kısa aralık (çift tetik koruması); belki kalkış anı seçeneği |
| `src/scenes/EbeveynKameraScene.ts` | Prototip: algılanan her zıplamada Zıpzıp zıplar + gecikme ölçümü görünür |
| (sonra) `src/scenes/HareketScene.ts` | Zıpla hareketlerinde Zıpzıp'ın kameraya bağlanması (kameralı) / ritim + dokunma (kamerasız) |
| `src/zipzip.ts` | Gerekirse "tepki zıplaması" (kısa, araya girebilen) |
| `src/metinler.ts` | Yeni sesli cümleler varsa |
| `tests/kamera.test.ts`, `tests/oyun.spec.ts` | Yeni testler (aşağıda) |

Paket ya da yeni kütüphane gerekmez (≈).

## 5. Test planı ve başarı ölçütleri

**Otomatik (her PR'da):**
- Yapay vücut noktalarıyla: tek zıplama = 1 olay; hızlı titreme / yarım zıplama = 0; 400 ms içinde iki iniş = 1 olay; görünmeyen vücut = 0.
- Tarayıcıda: kamera kapalıyken prototip ekranı ritimle ve dokunmayla çalışır, hata yok; bütün eski testler aynen geçer.

**Gerçek telefonda (Yağız testi, ≈ hedefler):**
| Ölçüt | Hedef |
|---|---|
| Doğru sayım | 10 gerçek zıplamanın en az 8'inde Zıpzıp zıplar |
| Yanlış tetik | Ayakta dururken / kollarını sallarken 30 sn'de en çok 1 |
| Çift tetik | Tek zıplamada iki Zıpzıp zıplaması yok |
| Gecikme | Çocuğun inişinden Zıpzıp'ın zıplamasına ≤ 300 ms (hissedilir sınır ≈) |
| Akıcılık | Oyun 30 kare/sn'nin altına düşmez |

## 6. Telefon performansını ölçme yöntemi (≈ öneri, karar D4)

Kamera denemesi ekranında, sadece ebeveynin gördüğü küçük bir ölçüm satırı: **tanıma süresi (ms, ortalama/en kötü), saniyedeki tanıma sayısı, oyunun kare hızı, son zıplamanın gecikmesi**. Hiçbir şey kaydedilmez; ekran görüntüsünü siz bana gönderirsiniz. En az bir eski Android ve bir iPhone'da ölçülmeli.

## 7. Riskler ve geri dönüş

| Risk | Etki | Önlem |
|---|---|---|
| Yanlış negatif (zıpladı, görülmedi) | "Yapamıyorum" hissi | Kamerasız yol hep açık; olumlu dil; eşikler Yağız testinde ayarlanır |
| Yanlış pozitif (kıpırdamadan tetik) | Hile/karmaşa | İki eşik + en kısa aralık; "görüyorum" olmadan tetik yok |
| Art arda tetik | Zıpzıp iki kez zıplar | 400 ms koruma (D3) |
| Gecikme / yavaş telefon | Tepki geç gelir, büyü bozulur | Ölçüm (D4); yavaş telefonda kameralı mod "önerilmez" uyarısı ≈ |
| Kadrajda ikinci kişi | Yanlış kişi izlenir | Ailece'de kamera zaten kapalı; "tek kişi" uyarısı |
| Çocuğun ekrana yaklaşması | Çarpma / telefon düşmesi | "Geri git" uyarısı (var); yerinde kalma kuralı; uzman görüşü (KAYIT K4) |

**Geri dönüş:** Her adım ayrı PR; prototip önce sadece ebeveyn köşesinde. Sorun olursa PR'daki **Revert** ile geri alınır; çalışan sürüm etiketi `v0.9.0` (kullanıcı GitHub'dan oluşturacak).

## 8. Karar gereken konular (önerilen ilk sırada)

**D1 — Prototip nerede?**
1. **Ebeveyn köşesi kamera denemesinde "Zıpzıp da zıplasın" (önerilen)** — çocuk akışına dokunmaz, hemen test edilir
2. Gizli deneme ekranı (sadece test adresiyle açılır)
3. Mevcut hareket ekranındaki bütün "zıpla" hareketlerinde
4. Yeni mini oyun: 3 engelli kısa parkur
5. Spor Kampı'nda tek istasyon

**D2 — Kamerasız yol**
1. **Zıpzıp ritimle zıplar + isteyen dokunarak zıplatır (önerilen)**
2. Sadece ritim (bugünkü gibi)
3. Sadece dokunma
4. Sadece "Yaptım!"
5. Prototipte kamerasız yol olmasın (sonra eklenir)

**D3 — Ne zaman tetiklensin, çift sayım nasıl önlensin?**
1. **İnişte + en az 400 ms ara (önerilen)** — güvenilir, bugünkü mantık
2. Kalkışta + 400 ms — daha canlı, yanlış tetik riski
3. İnişte, ek koruma yok (bugünkü)
4. Zıpzıp'ın zıplaması bitene kadar yeni tetik yok
5. Önce 3 sn kalibrasyon ("dik dur"), sonra inişte

**D4 — Telefon performansı nasıl ölçülsün?**
1. **Kamera denemesinde ebeveynin gördüğü ölçüm satırı (önerilen)** — kaydetmez
2. Sadece gizli test adresinde ölçüm
3. Bilgisayarda yavaşlatma benzetimi (telefonu temsil etmez)
4. Play ön lansman raporu (sonra; ayrıntı vermez)
5. Ölçmeden ilerlemek (önerilmez)

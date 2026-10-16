# Zıp Zıp Dünya — Kayıt (karar, onay ve oturum günlüğü)

Bu dosya hiçbir şey unutulmasın diye tutulur. **Her oturum başında okunur, sonunda güncellenir.**
Onay verilmemiş, ertelenmiş ya da reddedilmiş öneriler de buraya yazılır; listeden ancak karar verilince
("yapıldı", "yapılmayacak") çıkar ve günlükte nedeni kalır. Kurallar ve kesinleşmiş kararlar `CLAUDE.md`'de.

İşaretler: ⏳ onay/karar bekliyor · 👤 kullanıcıda bekliyor · 🔎 doğrulanmadı · ✅ bitti · ✖️ yapılmayacak (nedeniyle)

---

## 1. Onay ya da karar bekleyenler (açık liste)

| # | Konu | Ne öneriliyor / soru | Neden önemli | Eklendiği gün |
|---|---|---|---|---|
| K1 | ✅ Beta kapsamı | **Yapıldı (#105, 12 Ekim):** betada Türkiye + Dünya + Ailece açık, diğer 5 bölüm Büyük Macera'da "Yakında" (kod duruyor; tek liste `BETA_BOLUMLERI`; test sitesinde `?bolumler=hepsi` hepsini açar) | Ses kaydı ve uzman kontrolü 14 durağa odaklanır | 12 Ekim |
| K2 | ✅ Sertifikadaki "Kaydet / Paylaş" çocuk ekranında kilitsizdi | **Yapıldı (#99, 12 Ekim):** çocuk "🔒 Kaydet / Paylaş"a dokununca ebeveyn kilidi; doğru cevapla aynı sertifika paylaşılabilir. 🔎 Mağaza kural metni yine de mağaza başvurusunda kontrol edilecek | | 12 Ekim |
| K3 | ✅ Ebeveyn köşesine giriş | **Yapıldı (#106):** Büyük Macera'nın sağ altında küçük kilitli "🔒 Ebeveyn" düğmesi (Pasaport → ✏️ da duruyor); güvenlik notu yeni yeri söylüyor | Ebeveynin ayarları bulması | 12 Ekim |
| K4 | ⏳ Hareketlerin uzman kontrolü | Katalog güncel (#101, 12 Ekim): `docs/hareket-katalogu.html`; 79 hareket, her kartta Sakin tempo ve oturarak hâli, 49'u "Betada" etiketli, uzmana 6 soru, Uygun/Değişmeli/Çıkarılmalı + not, PDF kaydet. **Kullanıcıda:** fizyoterapist/çocuk hekimine göndermek | 🔎 Hiçbir hareketi uzman görmedi (sağlık konusunda varsayım yok) | 12 Ekim |
| K5 | ⏳ 4-5 yaş komutları | **Kısmen yapıldı (#106):** Sakin tempoda 36 çok adımlı komut tek eyleme iner (`src/uyarla.ts` KISA_KOMUT; tahmin, 4-5 yaşla denenecek; seslendirme 761 → 857 cümle). **14 Ekim:** sağ/sol ayna sorunu düzeltildi: "sağa sola" diyen salla/sallan/bel döndür artık ekranın sağına (çocuğun sağına) başlıyor; yana adım/zıplama zaten öyleydi. Sağ/sol adı geçen tek taraflı komut yok | 🔎 Gözlem yok, tahmin | 14 Ekim |
| K6 | ✅ 8-9 yaş ilgisi | **14 Ekim, kullanıcı seçti: 🐆 Hızlı tempo** (Ayarlar'da üçüncü tempo; yaş etiketi yok, yeni kayıt yok). Yapıldı: 4+ tekrar ~1,5 kat (en çok 12), ritim %15 hızlı, süreli %25 uzun; ısınma/soğuma/sürpriz aynen. Rekor/"bir tur daha" seçilmedi | 8-9 yaş betada denenecek | 14 Ekim |
| K7 | ⏳ Yayın onayı | GitHub Pages yayınına "onay gerekli" eklemek (her yayın kullanıcı onayıyla). Öneri: şimdilik gerek yok, main koruması yeterli | Yanlışlıkla yayın riski | 12 Ekim |
| K8 | ⏳ Eski dallar | GitHub'da ~100 eski dal var (çoğu birleşmiş) | Temizlik; tek tek kontrol edilmeden silinmez | 12 Ekim |
| K9 | ⏳ IS_AKISI'nın depoya ayrı belge olarak girmesi | Şimdilik `docs/rapor-2026-10-12/IS_AKISI.md` içinde ve CLAUDE.md'de özet | — | 12 Ekim |
| K10 | ⏳ Performans (çok yavaş telefon) | Uzay haritası ve kamera denemesi ekranı ölçümde sınıra yakın; gerekirse sabit çizimleri resme çevirmek. **12 Ekim: ertelendi** (iş listesindeki 6. iş): gerçek telefon ölçümü yok; önce kamera denemesindeki ölçüm satırıyla (#103) telefonda ölçülecek | 🔎 Gerçek telefonda ölçülmedi | 12 Ekim |
| K11 | ⏳ ChatGPT değerlendirmesi | Rapor paketi ve oynanış analizi (`docs/rapor-2026-10-12/OYNANIS_ANALIZI.md/.pdf`) ChatGPT'ye verildi; önerileri gelince buraya maddelenecek | — | 12 Ekim |
| K12 | ⏳ Görseller | Kullanıcı görsel gönderecek; güçlü/zayıf yönleri değerlendirilecek | — | 12 Ekim |
| K13 | ✅ Kameranın rolü | **Karar (12 Ekim):** isteğe bağlı kalır, macerada "önerilen". Kamerasız da tam oynanır; kamera açıkken dünya gerçek tepki verir; her yeni mekanik iki yoldan (kameralı/kamerasız) tasarlanır | Bütün oynanış kararları buna bağlı | 12 Ekim |
| K14 | ✅ Kamerasız oynanışta engeli ne geçirir? | **14 Ekim, kullanıcı seçti: ritim + dokunma** ("Zıpzıp da zıplasın"daki gibi: Zıpzıp ritimle zıplar, her zıplamada kütük geçilir; dokununca hemen zıplar). Duraklara taşıma Yağız testinden sonra (K22) | Macera mekaniği | 14 Ekim |
| K15 | ⏳ Çekirdek fiil seti | Macera için 6-8 temel hareket (öneri: zıpla, çömel, kollar yukarı, dizler, yana adım, aç-kapa; hepsi kamerayla sayılabilir). Kullanıcı notu: amaç 40-50 hareketi yaptırmak değil | Macera bu fiillerle kurulur | 12 Ekim (analiz) |
| K16 | ⏳ Ücretsiz bölüm | Türkiye Turu öğretici olarak mı kalır, yerine "Keşif Ormanı" mı gelir? | Marka (Zıpzıp Türkiye merkezli), sertifika, mağaza metinleri | 12 Ekim (analiz) |
| K17 | ⏳ Başarısızlık politikası | Kamera görmezse ne olur, kaç denemede Zıpzıp yardım eder? Öneri: sadece olumlu geri bildirim, bekleyen engel | Çocuğun "yapamıyorum" hissetmemesi | 12 Ekim (analiz) |
| K18 | ⏳ Beta hangi mekanikle? | Öneri: Kasım betası bugünkü mekanikle; yeni mekanik (her tekrarın dünyada sonucu, tek hareketle gerçek tepki prototipi) beta sırasında | Takvim | 12 Ekim (analiz) |
| K19 | ⏳ Oynanış yol haritası | A1-A4 (mevcut sistem) ve B1-B6 (yeni mekanik), ayrıntı OYNANIS_ANALIZI.md bölüm 8 | Hangi sırayla başlanacak | 12 Ekim (analiz) |
| K20 | ✅ Zıplama prototipi kararları | **12 Ekim:** D1 kamera denemesinde ("Zıpzıp da zıplasın") · D2 kamerasızda ritim + dokunma · D3 inişte + en az 400 ms ara · D4 kamera denemesinde ebeveynin gördüğü ölçüm satırı (kaydetmez). Plan: `docs/rapor-2026-10-12/ZIPLAMA_PROTOTIPI_PLANI.md` | Sıradaki geliştirme | 12 Ekim |
| K22 | ✅ Zıplamanın dünyada sonucu (iş 3) | **Kullanıcı seçti (12 Ekim): bekleyen tek engel.** Yapıldı (#108, "Zıpzıp da zıplasın" ekranında): Zıpzıp'ın önünde kütük bekler, zıplayınca altından geçer, yıldız yanar, sıradaki kütük gelir; acele/çarpma/kaybetme yok. Duraklara taşımak ayrı karar (Yağız testinden sonra) | Oynanış değişikliği | 12 Ekim |
| K23 | 👤 Yağız testi: zıplama prototipi | 10 adımlı protokol `docs/yagiz-testi.md` "Zıplama denemesi" (15 Ekim hazırlığı). Ölçütler: 10'da en az 8, çift tepki yok, 30 sn durmada kendiliğinden zıplama yok, tanıma/sn ≥ ~8, gözle "hemen". "Son zıplama ms" sadece kare işleme süresi (gerçek gecikme değil). Ekran görüntüsü kırpılıp gönderilir (çocuğun görüntüsü yok). **15 Ekim akşamı kullanıcı:** sonuç gelmeden gerçek cihazda hareket algılamanın doğrulandığı varsayılmaz. Protokolde "Kamera durdu" satırı güncellendi (#127) | Eşikler ve 400 ms koruma gerçek çocukla ayarlanacak | 14 Ekim |
| K21 | ✅ Birleştirme onayı | **12 Ekim:** testi yeşil, küçük, geri alınabilir PR'ları Claude birleştirir (kalıcı onay). Oynanışı/kapsamı ciddi değiştiren, yayın/dağıtım, force push, geniş silme, GitHub güvenlik/erişim ayarı, para harcama, çocuk verisini saklama/gönderme için tek tek açık onay | Çalışma kuralı | 12 Ekim |
| K24 | ✅ Birleştirme kuralı çelişkisi | **14 Ekim, kullanıcı seçti: K21 geçerli.** "Ana talimat"taki her birleştirmeye açık onay isteği yerine K21 uygulanır (testi yeşil, küçük, geri alınabilir PR'ı Claude birleştirir; K21'deki istisnalar için tek tek onay). #103-#107'nin sormadan birleşmesi bu kurala uygun sayıldı; #108 bu kararla birleşti | Çalışma kuralı | 14 Ekim |
| K25 | ✅ Gerçek çocuk gibi gezinme testi | **Yapıldı (#119, 15 Ekim gecesi):** `tests/gezinti.spec.ts` düğmelere ekrandaki yerinden fareyle dokunur; Oyna → Türkiye → durak → ödül → ⌂ → ⌂ iki tur, Ailece iki kez, 🔒 Ebeveyn gir/çık iki kez. #110 hatası geri konunca kırmızı oluyor. İşlemci 4-6 kat yavaşken de geçiyor (`GEZINTI_YAVAS=4`). Oyunda hata bulmadı | | 14 Ekim |
| K26 | ✅ "Hareket Kâşifi" rozeti betada kazanılamıyordu | Koşul "her hareketi en az bir kez dene" bütün bölümlerin hareketlerini istiyordu; betada 37 türün 11'i hiç gelmiyor. **15 Ekim akşamı kullanıcı seçti: (a) sadece açık bölümlerin hareketleri sayılsın.** Yapıldı (#130, 16 Ekim birleşti): `rozetler.ts kesfedilecekHareketler()` betada 26 tür; bütün bölümler açılınca 37; kazanılan rozet kaybolmaz. ⏳ Oturarak oynayan çocuk ayakta hareketleri hiç görmez, yine kazanamaz (ayrı karar) | Çocuk kazanamayacağı rozet görür | 15 Ekim |
| K27 | ✅ Oyundaki hareket ekranında kamera durursa | **Yapıldı (#123, 15 Ekim):** küçük kamera kutusu görüntü kesilince son sayı yerine "📷 Durdu" yazar. Sadece yazı: "Yaptım!", eşikler, oynanış aynı. Sahte kamerayla test (eski kodda "📷 0/8" kalıyordu). 🔎 iPhone'da gerçek ekran kilidiyle denenmedi | | 15 Ekim |
| K28 | ✅ Testlerdeki "sakinleşmesini bekle" yardımcısı | **Yapıldı (#124, 15 Ekim):** sonsuz animasyon artık doğru tanınıyor (`t.data[i].repeat === -1`). Ölçüm: Açılış ve Büyük Macera ~0,3 sn'de sakin (önce hep 1,5 sn), Dünya 2,5 sn; Uzay, Spor, Okyanus, Kostüm'de Zıpzıp'ın kısa animasyonları yüzünden yine 1,5 sn. Renk zıtlığı + örtme testleri 3'er tekrar: 3,1 → 2,7 dk, 6/6 geçti | Test süresi | 15 Ekim |
| K29 | ✅ Oturum uzayınca uyarı | **14 Ekim, kullanıcı istedi:** bağlam ~300 bin token'ı geçince ya da iş listesi bitince Claude cevabın sonunda "Yeni oturuma geçelim mi? (kota için)" diye sorar; yarım iş/açık PR varsa önce o biter. CLAUDE.md'ye yazıldı | Kota | 14 Ekim |
| K30 | ✅ Evde Macera: sıradaki durak yazısı ile sesi farklı | **15 Ekim akşamı kullanıcı seçti:** ses "Sıradaki durağımız Oyuncak Dansı!" desin. Yapıldı (#128, birleşti): durağın `yer`'i "Oyuncak Dansı" (giriş, damga, pasaport, ödül ekranı da aynı adı söyler/yazar); seslendirme listesi yenilendi (3 cümle; kayıt yoktu, kaybolan ses yok); test: sıralı bölüm haritalarında ad = yer | Çocuk ekranda başka, seste başka duyar | 15 Ekim |
| K31 | ✖️ Birleştirme onayı (K32 ile kalktı) (K21/K24'ün yerine) | **15 Ekim akşamı kullanıcı:** testler yeşil olsa bile birleştirme, yayınlama, güvenlik/izin değişikliği ve kapsamlı oynanış değişikliği için onay beklenir. Claude değişikliği ayrı dalda yapar, test eder, PR açar ve onay ister. Kamera ve çocuk verileriyle ilgili yeni işlem başlatılmaz. CLAUDE.md güncellendi | Çalışma kuralı | 15 Ekim |
| K32 | ✖️ Biten her şey birleşir (aynı akşam K33 ile kalktı) | **15 Ekim akşamı kullanıcı:** "Birleştir, bana sorma, biten her şeyi birleştir." `test` son hâlinde yeşil ve okunmuş PR'ı Claude sormadan birleştirir. Oynanış/kapsamı ciddi değiştiren, yayın/dağıtım kararı, force push, geniş silme, GitHub güvenlik/erişim, para, çocuk verisi için tek tek onay sürer. #127 ve #128 bu kararla birleşti | Çalışma kuralı | 15 Ekim |
| K33 | ✅ Otonom çalışma ve onay politikası | **15 Ekim akşamı kullanıcı** (K32'den hemen sonra): küçük, geri alınabilir işler sorulmadan yapılır, görev sonunda tek rapor; **main'e birleştirme, yayın, güvenlik/izin, para, çocuk/kamera verisi, gizlilik, büyük mimari/oynanış değişikliği, geri dönüşsüz silme için onay**. Tam metin `docs/calisma-politikasi.md`; CLAUDE.md güncellendi | Çalışma kuralı | 15 Ekim |
| K34 | ✅ Yağız testi bulguları (15 Ekim akşamı) | (1) Kamera açıkken iPhone 2-3 harekette bir yeniden kamera izni soruyordu (her kamera hareketinde kamera kapanıp yeniden açılıyordu). (2) "Uzaktan oyna" ile 3-2-1 beklerken ekran kararıyordu (otomatik kilit). **Düzeltildi (#131, 16 Ekim birleşti; dokunmadan bütün durak/Ailece testi eski kodda 63/51 kez kilitsiz):** kamera aynı durakta hareketler arasında açık kalır, hareket ekranından çıkınca kapanır (arada görüntü işlenmez; gizlilik.html cümlesi güncellendi); Durak/Hareket/kamera deneme ekranlarında Wake Lock ile ekran açık. 🔎 Wake Lock iPhone ana ekran uygulamasında iOS 18.4'ten önce çalışmayabilir; Android/iPhone mağaza paketinde (Capacitor) ayrı eklenti gerekebilir; gerçek telefonda denenmeli. Kullanıcı yeğenlerine test sitesi bağlantısını gönderecek | Çocuk testi | 15 Ekim |
| K35 | ✅ Birleştirme yine otomatik | **16 Ekim kullanıcı:** "Neden birleştir diyorum, otomatik niye birleştirmiyorsun?" → seçti: testler yeşilse Claude sormadan birleştirir. Oynanışı ciddi değiştiren, yayın/dağıtım (mağaza), güvenlik/izin, para, çocuk/kamera verisi, geri dönüşsüz silme için onay sürer. #129-#131 bu kararla birleşti | Çalışma kuralı | 16 Ekim |

## 2. Kullanıcıda bekleyenler

| # | İş | Not |
|---|---|---|
| U1 | 👤 GitHub'da `v0.9.0` etiketi/release (hedef **fe37906**) | Bulut oturumu oluşturamıyor (403). Adımlar 12 Ekim sohbetinde |
| U2 | 👤 GitHub'da main koruması (kural seti: PR zorunlu, `test` kontrolü yeşil ve güncel, bypass listesi boş, silme/force push yasak) | Bulut oturumu oluşturamıyor (403). Kurulunca Claude doğrular |
| U7 | 👤 Mac'e ertelenebilir: `v0.9.0` etiketi ve main koruması (U1-U2), iPhone mağaza paketi | Kullanıcı şu an sadece iPhone kullanıyor (Claude ve GitHub uygulamaları); terminal yok. GitHub uygulamasında bu ayarlar yok (bildiğim kadarıyla); Safari masaüstü görünümüyle yapılabilir |
| U3 | 👤 İnternetsiz APK'yı telefonda denemek | Sonuç gelince Android INTERNET izni kaldırılır (sonuç gelmeden kaldırılmaz) |
| U4 | 👤 Yağız testi (+ mümkünse 4-5 ve 8-9 yaştan birer çocuk) | docs/yagiz-testi.md |
| U5 | 👤 Play geliştirici hesabı, sonra Apple | docs/beta-hazir-mi.md |
| U6 | 👤 Azure (doğal ses), marka başvurusu, avukat, iletişim e-postası | docs/beta-hazir-mi.md. 15 Ekim: gizlilik.html ve kosullar.html'de iletişim adresi hâlâ "yayından önce eklenecek"; avukata giden taslakta 15 Ekim değişiklikleri var (ilk oynanan gün, Zıpzıp da zıplasın) |

## 3. Bilinen sorunlar / doğrulanmayanlar (özet)
- 🔎 Gerçek telefonda: ses, performans, kamera eşikleri, ödeme hiç denenmedi; iPhone'a hiç kurulmadı.
- Doğal ses kaydı yok (760 cümle); telefonda Türkçe ses yoksa Zıpzıp konuşamaz.
- Süreye bağlı tarayıcı testleri yavaş CI'da ara sıra zaman aşımına düşebilir (12 Ekim'de bir kez; #95).
- Ayrıntılı fotoğraf: `docs/rapor-2026-10-12/` (12 Ekim anlık görüntüsü).

---

## 4. Oturum günlüğü (en yeni üstte)

### 15 Ekim 2026 (akşam) — kullanıcı kararları, K30
**Kararlar:** K30 → ses "Oyuncak Dansı" desin · K26 beklet · K23 sonuç gelmeden algılama doğrulanmış sayılmaz · **K31: birleştirme
artık onayla** (testler yeşil olsa da) · kamera/çocuk verisiyle yeni işlem yok.
**Birleşenler:** #127 Yağız testi protokolünde "Kamera durdu" satırı · #128 K30 + K31 kaydı. Sonra kullanıcı K32 dedi (biten her şey sormadan birleşir), hemen ardından K33 politikasını verdi: main'e birleştirme yine onayla. `TEKNIK_DURUM.md` politikada geçiyor ama depoda yok (oluşturulmadı).

### 15 Ekim 2026 (öğleden sonra) — K27, K28, kod denetimi 2. tur
**Birleşenler (`test` son hâlinde yeşil ve okunarak, K21):**
- #123 K27: hareket ekranındaki küçük kamera kutusu kamera durunca "📷 Durdu" (sahte kamerayla test; eski kodda kırmızı).
- #124 K28: test yardımcısı sonsuz animasyonu doğru tanır; ölçüm K28 satırında.
- #125 Kod denetimi 2. tur (BolumScene, DunyaScene, UzayScene, HaritaScene, SertifikaScene, PasaportScene, MaceraScene, DurakScene,
  uyarla.ts, hiz.ts). **Hata 1:** bölüm haritasında (Spor/Dinozor/Evde/Okyanus) yolculukla açılan durak iki nabız animasyonu alıyordu
  (üst üste). **Hata 2:** Dünya küresinde önceki dönüşü durdurma satırı yanlış nesneye bakıyordu; art arda dokunuşta dönüşler
  birikiyor, yolculukta düğme küreyi çekiştiriyordu → aynı anda tek dönüş, yolculukta düğme küreyi çevirmez. İki test, eski kodda kırmızı.
- Bu PR: kayıt.

**Denetimde bakılıp sorun görülmeyenler:** uyarla.ts (Sakin/Hızlı tempo, oturarak; soğuma hikâyeleri hep dolu), hiz.ts, DurakScene
(Ailece buraya uğramaz), Harita/Uzay yolculuğu, Sertifika kilidi, Pasaport sekmeleri, Büyük Macera.
**Belirsiz/küçük (kod değişmedi):** K30 (Evde Macera ad/yer). Uzay haritasında Dünya→Merkür yolu Merkür bitene kadar beyaz (diğer
haritalarda başlangıç biten durağa bağlı; görsel tutarlılık, çizer gelince bakılır). Sertifikadaki "X hareket · Y dakika" bütün
bölümlerin toplamı (o bölümün değil); yanlış değil ama "bu bölümde" gibi okunabilir. Pasaporttan `Avatar` ve ebeveyn köşesinden
`Acilis` veri nesnesiz başlatılıyor; ikisinde `init` yok, şu an zararsız.
**Test notu:** testlerdeki `sahneAc` yardımcısı aynı sahneyi (ör. Dunya → Dunya) doğrudan yeniden başlatınca sahne durur; arada başka
sahne açılmalı (oyunda bu yol yok, sadece test yardımcısı).
**Testler:** npm test 34/34; test:oyun yerelde 46/46 (yeni: K27, tek nabız, Dünya küresi); tsc temiz.
**Arşiv:** session_01KYbNnkta2jv2dM7gTitCb5 arşivlendi.

### 15 Ekim 2026 (gece, kullanıcı uyurken) — 4 gece işi
**Birleşenler (hepsi `test` son hâlinde yeşil ve okunarak, K21):**
- #118 Kamera ekranları (sadece ebeveyn: kamera denemesi, Zıpzıp da zıplasın): görüntü kesilince (iz biter/susturulur/2 sn yeni kare yok) "⏸ Kamera durdu. ⌂ ile çıkıp kamerayı yeniden açın."; görüntü geri gelirse düzelir; ekran kilidinden dönüş yanlış "durdu" saymaz. Kamera yok → "Bu cihazda kamera bulunamadı.", izin yok → "Kameraya izin verilmedi. Telefonun ayarlarından izin verin." Zıpzıp da zıplasın'da kamera durunca ritim yolu geri gelir. HareketScene ve eşikler aynı. 🔎 iPhone'da gerçek ekran kilidiyle denenmedi (bulutta sahte kamera).
- #120 Gizlilik + beta denetimi: 11 `zipzip-` kaydı gizlilik tablosu/"Teknik ayrıntı" ile birebir. "Bu telefonda neler var?" ekranına eksik 2 kayıt (güvenlik notu, beta ayarı). **Hata:** uygulamada (Tam sürüm satırı varken) "✈️ Kendiniz deneyin" yazısı "Tamam" düğmesinin altında kalıyordu (web'de görünmüyordu) → düzeldi, test. gizlilik.html: ilk oynanan gün, Zıpzıp da zıplasın. beta-hazir-mi.md 0.9.1.
- #119 Gerçek dokunuşla gezinme testi (K25). İlk hâli CI'da kırmızıydı: harita inişi sırasında dokunuyordu (iniş dokunuşla atlanır, tasarım böyle) ve kutlama denetimi async yazılmıştı (Playwright waitForFunction async kontrolü beklemez; sonuç hemen "false" geliyordu). Düzeltildi; yavaş işlemciyle (4-6 kat) ve bütün testlerle birlikte denendi (44/44). Oyunda hata yok.
- #121 Kod denetimi düzeltmesi: Pasaport → ada dokun → kilit → Pasaportu hazırla → ⌂, önce Büyük Macera'dan ebeveyn köşesine girildiyse çocuğu Büyük Macera'ya götürüyordu (K3 "gelinen yere"); artık pasaporta döner. Kural: init alan EbeveynMenu'ye veri nesnesi.
- Bu PR: KAYIT + CLAUDE.md (K29 oturum uyarısı, kamera durdu, gezinme testi).

**Denetimde belirsiz kalanlar:** K26 (Hareket Kâşifi), K27 (hareket ekranında kamera durdu), K28 (test yardımcısı). Ödeme kodunda iOS satın alma durumu ve Android onaylama (acknowledge) gerçek mağazada denenmeden doğrulanamaz (zaten 🔎 listesinde).
**Testler:** npm test 34/34; test:oyun 40+ (yeni: 4 kamera, 2 gezinme, 1 veri ekranı, 1 pasaport dönüşü); tsc temiz.
**Arşiv:** session_01R2MaXc2uEiycTifE6DXnFk arşivlendi.

### 14 Ekim 2026 (gece) — Yağız testi öncesi çocuksuz hazırlık
**Korunan sürüm:** main 429280b (0.9.1; #114 + #115). Geri alma yolu: PR'daki Revert düğmesi (etiket `v0.9.0` = fe37906).
**Bulgu 1 (✅ kullanıcı seçti: testten önce düzelt; ayrı PR):** zıplama sayacı çömelip kalkınca "havada" takılır (taban çömelme
yüksekliğinde kalır, kalkış yükselme sayılır, iniş hiç gelmez) → sonraki zıplamalar sayılmaz; ancak yeniden açınca düzelir.
Yapay noktalarla doğrulandı; `tests/kamera.test.ts` içinde todo testi. Oyundaki zıplama hareketinde de olur (her harekette sayaç
yenilendiği için etkisi o hareketle sınırlı; "Yaptım!" yine çıkar). Düzeltme: havada kalma 1 sn'yi geçerse sayılmadan
sıfırlanır (ZIPLAMA_EN_UZUN_HAVA_MS; %7 ve 400 ms aynı). Gerçek çocukla protokol adım 10 doğrular.
**Bulgu 2 (⏳):** kamera akışı durursa (ekran kilidi, uygulama değişimi, başka uygulama kamerayı alırsa) oyun fark etmez; yazı
"✅ Görüyorum"da kalır, Zıpzıp tepki vermez. Öneri: 2 sn yeni kare gelmezse "Kamera durdu, dokunup yeniden açın".
**Bulgu 3 (öneri):** kamera hiç yoksa / izin reddedilince aynı yazı ("izin verilmedi mi?"); kamerasız ritim yolu sürer.
**Yapılan:** 3 yeni kamera testi (yanlış pozitif: kollar/omuz %3/sallanma = 0; yavaş telefon 5 tanıma/sn = 10/10; art arda 10
zıplama ~450 ms = 10/10) + 1 todo (bulgu 1). Protokol: çömelme en sona (adım 10), "Takılırsa" yolu; sonuç şablonu
`docs/yagiz-zipla-sonuc.md`. Testler: npm test 31 geçti + 1 todo; test:oyun 36/36; tsc temiz.
**Wake Lock incelemesi (kod yok, kullanıcı kararı):** iOS Safari 16.4+ destekler; ana ekran uygulamasında iOS 18.4'ten önce
çalışmıyordu (WebKit 254545). Sayfa gizlenince kilit düşer, geri gelince yeniden istemek için dokunma gerekebilir (WebKit
255363). Düşük güç modunda reddedilebilir. Capacitor sürümünde ayrı eklenti gerekebilir. Öneri: test sonrası, sadece kamera açıkken.

### 14 Ekim 2026 (akşam) — zıplama testi hazırlığı (0.9.1)
**İnceleme:** ZiplaDenemeScene, EbeveynKameraScene, kamera.ts (Sayici zıpla yolu, KameraSayaci ölçümü), tests/kamera.test.ts, oyun.spec zıplama testi.
**Bulgu (düzeltildi):** "Kamera gördü" sayısı Aferin kutlamasının 2 sn'sinde gelen kamera zıplamalarını saymıyordu; 10. zıplamada
çift tetik olursa fazla sayım gizlenirdi. Artık her kamera zıplaması sayılır (yıldız yine yanmaz). Test eski kodda kırmızı, yenide yeşil.
**Dürüst ölçüm notları:** oyun hiçbir zıplama ölçümünü kaydetmez (ekrandan çıkınca kaybolur). "Son zıplama ms" = inişin
algılandığı karenin işleme süresi; kamera gecikmesi ve iniş eşiği payı dahil değil. Tanıma ort/en uzun son 30 tanımadan.
**Bilinen riskler (açık):** ekran kilitlenmesi (oyun ekranı açık tutmaz; iPhone otomatik kilit), kadrajda ikinci kişi,
telefonun oynaması, ışık; eşikler gerçek çocukla denenmedi. Ekran açık tutma (Wake Lock): **kullanıcı seçti (14 Ekim): kod yok**, testte iPhone Otomatik Kilit elle 5 dk/Asla yapılır.
**Bekleyen:** 👤 K23 sonucu (10 adımlı tablo + kırpılmış ekran görüntüsü). Kütüğü duraklara taşıma (K22) bundan sonra ayrı karar.

### 14 Ekim 2026 — birleştirme kuralı (K24), #108, sağ/sol ayna
**Birleşenler (`test` son hâlinde yeşil ve okunarak):**
- #108 Bekleyen tek engel (K22) — kullanıcı K24'te "K21 geçerli" deyince birleşti.
- Bu PR: K24 kaydı + sağ/sol ayna (K5 kalanı): kolSalla, sallan, belDondur önce ekranın sağına eğilir (komut "sağa sola" diyor; çocuk ekrana bakınca ekranın sağı kendi sağı).

**Sonra (aynı gün, kullanıcı İngiltere'de; Yağız testi dışı işler):** #110 ⌂ ile açılışa dönülünce "Oyna" çalışmıyordu (kullanıcı telefonda buldu; açılış sahnesindeki bekleme işareti sıfırlanmıyordu; testle yeniden üretildi). #111 🐆 Hızlı tempo (K6). Ailece: Uzaktan oyna hep açık + kamera kapalı (karar vardı ama kamera açılıyordu) + sürüm 0.9.1 (ana ekrandaki sürüm 0.9.0'da kalmıştı, güncelleme görünsün diye) + "beta grubuna yazın" notu düğmeye benzemesin. K14 ✅ ritim + dokunma. Mağaza metinleri: iki sürüm (ilk sürüm: Türkiye + Dünya + Ailece / tam) yapıldı (#113). Kullanıcı ana ekrandaki uygulamada Oyna düzeltmesini doğruladı (uygulamayı kapatıp açınca yeni sürüm geldi).

**Bekleyen:** Yağız testi sonucu (K23): kullanıcı 10 zıplama sonucunu ve ölçüm satırının ekran görüntüsünü gönderecek; sonuca göre eşik/400 ms ayarı. Eski oturum (session_016R…) arşivlendi.

### 12 Ekim 2026 (öğleden sonra) — zıplama prototipi, beta kapsamı, kısa komut, ebeveyn düğmesi
**Birleşenler (hepsi `test` son hâlinde yeşil ve okunarak):**
- #103 Kamera denemesinde ölçüm satırı (D4: tanıma ms ort/en uzun, tanıma/sn, oyunun kare hızı, son sayımın gecikmesi; kaydedilmez) + zıplamada 400 ms çift tetik koruması (D3). Yapay vücut noktası testleri: 1 zıplama = 1, yarım zıplama / titreme = 0, 400 ms içinde iki iniş = 1.
- #104 "🌍 Zıpzıp da zıplasın" (D1-D2, ZiplaDenemeScene): kamerayla her zıplamada Zıpzıp bir kez zıplar + yıldız; 10'da Aferin; kamerasız ritim + dokunma. 2 yeni sesli cümle.
- #106 Sakin tempoda kısa komut (K5) + Büyük Macera'da kilitli Ebeveyn düğmesi (K3).
- #105 Beta kapsamı (K1).

**Ölçüm (bulut, telefon değil):** sahte kamerayla bulutta tanıma 1,5-4,6 sn (ekran kartı yok; telefonu temsil etmez). Gerçek değer Yağız testinde ölçüm satırından okunacak.

**Ertelenen:** iş 6 (çizim hızlandırma, K10) gerçek telefon ölçümü gelene kadar. İş 3 (dünyada sonuç, K22) kullanıcı seçimini bekliyor.

**Not:** Bir push GitHub'da "fatal error in commit_refs" ile geri döndü; ikinci denemede geçti (geçici).

### 12 Ekim 2026 — 50 durak testi, bölüm gezintisi, yavaş telefon, ebeveyn deneyimi, rapor, koruma planı
**Birleşenler (hepsi test yeşilken; #94 hariç):**
- #93 50 durağın hepsi (Ailece, soğuma dahil) otomatik oynanır; testler 2 işçide paralel. Oyunda hata çıkmadı.
- #94 Okyanus "Deniz Kaplumbağası" başlığı ekrandan taşıyordu → sığar; bölüm sonunda "Sertifikanı almak için kupaya dokun!"; 50 durak giriş ekranı taşma testi.
- #95 Kostüm kutlaması testi hızlı saatle (zaman aşımı).
- #96 Kamera: yavaş telefonda tanıma araya süre koyar (ölçümde aynı sürede 12 → 30 kare).
- #97 Kamera denemesinde "Kamerayı aç" düğmesi kutunun arkasında kalıyordu → altına alındı; güvenlik notunda ebeveyn köşesinin yeri; "10-15 dakikayla başlayın"; paylaşımda cinsiyetsiz 🏃; sayfa öğesi düğme örtmez testi.
- #98 (bu kayıt) CLAUDE.md birleştirme kuralı, geri alma yolu, bu dosya, 12 Ekim raporu.

**Hatalar ve dersler:**
- #94, `test` kontrolü kırmızıyken (süreye bağlı test zaman aşımı; oyun kodu sağlam) sonucu okunmadan birleştirildi. 09:49-09:57 arası main'de kırmızı testli commit vardı; #95 düzeltti. Ders: CLAUDE.md'ye "yeşil ve okunmadan birleştirme yok" kuralı.
- #96'nın ilk hâli (`bac4edf`) aynı nedenle kırmızıydı; fark edilmedi. Birleşen hâli (`f5ab3b7`, güncel main ile) yeşildi.

**Ölçümler (bulut, telefon değil):** açılış 6× yavaşta ~1,9 sn; JS belleği 10-14 MB, 40 geçişte sızıntı yok; kare başına JS işi 6× yavaşta 11-22 ms.

**İnceleme (ChatGPT talimatıyla, salt-okunur):** main = `fe37906` = testi geçen `1a7fe82` ile aynı dosya ağacı; etiket/release yok; dal koruması yok; yayın main'e her push'ta; dal korumasında seçilecek kontrol adı `test` (iş akışı adı "Testler"; `ios` zorunlu yapılmamalı).

**Kararlar (kullanıcı):** PR'ları Claude birleştirir ama sadece `test` yeşil ve okunmuşken; oyun değişikliklerine birlikte karar; çalışan sürüm etiketi + main koruması + kural CLAUDE.md'ye (etiket ve koruma kullanıcıda, U1-U2); her oturumda her şey kayda geçer (bu dosya).

**Sonradan (aynı gün):** #99 sertifika kaydet/paylaş ebeveyn kilidinin arkasına alındı (vazgeçince aynı bölüme dönülür; test). Oynanış analizi (ChatGPT talimatıyla, salt-okunur): bugünkü oyun "izle-yap-say"; kamera Zıpzıp'ı ya da dünyayı etkilemiyor, sadece sayıyor; 38 animasyon ≈ 20-22 gerçek desen; kararlar K13-K19. Kullanıcıya "kod yazmıyorum" sözü yanlış anlaşıldı: sadece o inceleme görevi içindi; kodu Claude yazmaya devam eder.

**Daha sonra (aynı gün):** #100 kayıt + oynanış analizi, #101 hareket kataloğu güncel (Sakin/oturarak/beta, uzmana 6 soru). Kullanıcı ChatGPT ile iş bölümü ve "ana talimat" verdi (önce çalışan oyunu koru; tek hareketin güvenilir algılanması → Zıpzıp tepkisi → dünyada sonuç; onay sınırları K21). Zıplama prototipi teknik planı (PDF kullanıcıya verildi) ve kararlar K20. Yağız ile telefondan test yapılacak (sonuçlar bekleniyor).

**Teslim edilenler:** ChatGPT rapor paketi; oynanış analizi PDF'i (`docs/rapor-2026-10-12/OYNANIS_ANALIZI.pdf`); (zip, PDF özet, 6 belge, 30 ekran görüntüsü) → depoda `docs/rapor-2026-10-12/` (tek tek ekran görüntüleri hariç).

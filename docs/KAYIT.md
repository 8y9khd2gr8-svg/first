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
| K8 | ⏳ Eski dallar (silme onayı bekliyor) | **17 Ekim listesi (silme yok):** 146 dal (main dahil). 144'ünün ucu, birleşmiş PR'ın son hâliyle aynı (PR'dan sonra eklenmiş iş yok; 149 PR'ın hepsi birleşmiş) → silinebilir. 1 dal PR'sız: `kayit/v0.3.0-2026-10-09` (392e15f, main'in 9 Ekim anı, #18; etiket gibi duruyor; önerim kalsın ya da etikete çevrilsin). Tam liste günlükte (17 Ekim gündüz). Seçenek: (a) 144'ü sil (önerilen; GitHub'da "Delete branch" ya da PR'daki düğme; bulut oturumu silebilir mi denenmedi) (b) olduğu gibi kalsın | Temizlik; tek tek kontrol edildi | 12 Ekim |
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
| K36 | ✅ Ebeveyn özetinde "toplam durak" | **16 Ekim, kullanıcı seçti (a). Yapıldı (#136):** toplam açık bölümlerin durakları üzerinden (betada "2 / 14", `?bolumler=hepsi` ile "2 / 50"; `duraklar.ts acikDuraklar`). Test eski kodda kırmızı | Ebeveyn yanlış anlamasın | 16 Ekim |
| K37 | ✅ Oturarak oynayan çocuk Hareket Kâşifi'ni kazanamazdı | **16 Ekim, kullanıcı seçti (a). Yapıldı (#136):** oturarak oyna açıkken sadece oturarak hâlde gelebilen hareketler sayılır (oyunun kurabileceği her liste `uyarla`'dan geçirilir; Ailece sayılmaz, orada hareketler ayakta kalır). Kutlanan rozet kaybolmaz. Test: sayılanlar = oyunun gerçekten kurduğu listelerde gelenler (iki yönde) | Hareket kısıtı olan çocuk | 16 Ekim |
| K38 | ✅ Oyundaki kamera: model yüklenemezse | **16 Ekim, kullanıcı seçti (a). Yapıldı (#142):** model hatasında oyundaki ortak kamera hemen kapanır, hareket ekranından çıkana kadar (o durak boyunca) açılmaz, model istenmez; kutuda "📷 Açılamadı", oyun kamerasız sürer. Test eski kodda kırmızı | Gizlilik algısı (kamera ışığı) | 16 Ekim |
| K42 | ⏳ Oturarak oynarken kamera topuk ister | Oturarak oyna açıkken de sayma için iki topuk görünmeli (K41). Sandalyede oturan çocuğun ayakları masa/kadraj dışında kalırsa kol hareketleri hiç sayılmaz, ekranda "Ayakların görünmüyor" yazar. Seçenek: K41 (b) ile birlikte karar (kol hareketinde topuk şartı kalksın) | Hareket kısıtı olan çocuk | 17 Ekim |
| K44 | ✅ Sıradaki oturumun işleri (17 Ekim, kullanıcı seçti; 17 Ekim gündüz yapıldı, (8) kamera sonucu gelmediği için beklemede) | (1) veri denetimi 7. tur (ilerleme, özet, rozet, kostüm, oturum; saat dilimi, gün değişimi, bozuk kayıt) (2) telefonda deneme listesi (kardeş + Yağız, iPhone'da tek sayfa) (3) erişilebilirlik denetimi (4) eski dalların listesi (silme onayla) (5) mağaza görselleri güncel mi (6) hareket kataloğu güncel (7) K39 (b) (8) K41 b / K42 sadece kamera sonucu gelirse | — | 17 Ekim |
| K43 | ✅ Karar kalitesi için dört soru | **17 Ekim, kullanıcı talimatı:** en iyi uygulama · özet yerine kaynak/kanıt · uygun test yöntemi · kanıtlanan/doğrulanmayan. Uzun kontrol listesine dönüşmez; onay sınırları ve güvenlik kuralları aynen. CLAUDE.md "çalışma şekli"ne tek madde; calisma-politikasi.md'deki olmayan TEKNIK_DURUM.md anıldığı yer düzeltildi | Kalite | 17 Ekim |
| K39 | ✅ Kesintide yarım kalan cümle (17 Ekim: kullanıcı (b)'yi seçti; **yapıldı**: gösterimde yarıda kalan komut dönüşte bir kez yeniden söylenir, geri sayım onu kesmez; sayılar yinelenmez; test eski kodda kırmızı. 🔎 gerçek kilitte telefonda) | Arama/kilitten dönünce, gizlenirken yarıda kesilen komut cümlesi yeniden söylenmez (ekranda yazı duruyor; sayma sürer). Seçenekler: (a) böyle kalsın (önerilen; telefonda bakılır) (b) dönüşte hareket komutunu bir kez yeniden söyle | Okuma bilmeyen çocuk | 16 Ekim |
| K45 | ⏳ Mağaza görselleri betayı mı, bütün bölümleri mi göstersin? | 17 Ekim: `scripts/magaza-gorselleri.mjs` bugün çalışınca beta kapsamını çeker (K1): Büyük Macera'da 5 bölüm "Yakında", Dünya'da Uzay kilitli, "Bu telefonda neler var"da "Güvenlik notu · beta" satırı. Depodaki görseller (12 Ekim öncesi) bütün bölümleri açık gösteriyor, başlık "Uzay, spor, dinozorlar, okyanus ve fazlası". Büyük ayna ve yeni kamera yazıları görsellerde yok (kamera kapalı çekiliyor). **Görseller değiştirilmedi.** Seçenekler: (a) mağazaya çıkış kapsamı belli olunca yeniden üret (önerilen; mağaza kuralı: görsel uygulamanın gerçeğini göstermeli) (b) şimdi betayla üret, başlığı "Yakında: uzay, spor…" yap (c) betiğe `?bolumler=hepsi` ekle, eski görünüm kalsın (mağaza sürümünde bölümler açık değilse yanıltıcı) | Mağaza sayfası doğruluğu | 17 Ekim |
| K46 | ⏳ VoiceOver açıkken oyun | Oyun tek bir çizim alanı (canvas): VoiceOver düğmeleri okuyamaz, dokunuşlar VoiceOver'a gider (iki kez dokunma gerekir). Görme engelli çocuk için bugünkü oyun sesle yönlendirir ama düğmeler erişilebilir değil. 🔎 iPhone'da hiç denenmedi (telefonda deneme sayfasında madde 10). Seçenekler: (a) önce telefonda bakılsın (önerilen) (b) ebeveyn rehberine "VoiceOver açıksa kapatın, oyun kendisi konuşur" notu (c) önemli düğmelere görünmez HTML karşılığı (büyük iş) | Erişilebilirlik | 17 Ekim |
| K40 | ✅ "Önce büyük ayna" kamera görünümü | **16 Ekim, kullanıcı seçti. Yapıldı (#143):** kameralı harekette Zıpzıp gösterdikten sonra ekranın ~%40'ı canlı görüntü + "baştan ayağa" çerçevesi (sesli yönlendirme); görünce yeşil + "Hazırsın! Seni görüyorum."; görmezse en çok 6 sn (Sakin 8 sn, gerçek saatle) sonra normal geri sayım. Hareket sırasında kutu sağ altta eskisinin ~3 katı, sayı büyük; "Yaptım!"da sağ üst köşe. Sayım hareketle başlar. Kamerasız oyun aynen. 🔎 Telefonda ve Yağız testinde denenecek (yagiz-testi.md madde 19) | Çocuk 2-3 m'den kendini görüp yerleşsin | 16 Ekim |
| K41 | ⏳ Kamera neden saymadı? | **16 Ekim akşamı, kod + benzetimle kanıtlandı (`docs/k41-kamera-analizi.md`):** kamera sadece iki omuz VE iki topuk görünürken sayar (kollar dahil; eşikler boya göre). Telefon masada → topuklar kadraj dışı → bütün hareket boyunca "Geri git", sayı 0; oyun beklemez, "Yaptım!" çıkar. Benzetimde (yapay vücut noktaları; gerçek kamera değil) iki topuk / bir topuk / omuzlar görünmez → hiç saymaz. Eşik ve ayak şartı **değiştirilmedi**. Seçenekler: (a) önce gerçek telefonda kutu yazısına bakılsın (önerilen) (b) kol hareketlerinde topuk şartı kalksın (c) "Geri git" yerine eksik yere göre yazı ("Ayakların görünmüyor") (d) eşikleri gevşetmek (önerilmez). 🔎 Gerçek model kadraj dışı topuğa ne güven veriyor bilinmiyor. **(c) onaylandı, yapıldı (17 Ekim):** "Geri git" yerine eksik yere göre yazı (aynada "🦶 Ayakların görünmüyor: biraz geri git" / "🙋 Çok yakınsın" / "🧍 Seni göremiyorum" / "↔️ Ortaya gel"; küçük kutuda kısası) + aynada bir kez sesli (aynı cümle 60 sn içinde yinelenmez; hareket sırasında sayılar söylendiği için sesli ipucu yok); ebeveyn 🔍 Dene'de tanı satırı ("Topuklar görünmüyor", "Sağ omuz ve topuklar…", "Kimse görünmüyor"). Eşik ve sayma şartı aynı. (a) kardeş denemesi sonucu, (b) bekliyor. Not: oturarak oynayan çocukta da topuk şartı var (değiştirilmedi) | Kullanıcı "kamera algılamadı" dedi | 16 Ekim |

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
- ✅ `kilitten dönüş` testi CI'da üç kez (16 Ekim) aynı yerde kırmızı oldu. Eklenen durum yazısı nedeni gösterdi: kilit aslında açıktı; sayfa, vücut tanıma modeli ilk kez hazırlanırken birkaç saniye donuyor, testin 5 sn'lik beklemesi yetmiyordu (oyun hatası değil). Bekleme 30 sn (#146). Aynı donma büyük ayna testlerinin kısa anları ("Başla!" 0,6 sn) kaçırmasına da yol açtı → ölçümler artık sayfanın içinde her karede yapılıyor (#146). CI ayarıyla (2 işçi) yerelde parça 2/2 iki kez 25/25.
- `Zıpzıp konuşurken ağzı oynar` testi yerelde yük altında bir kez kırmızı (60 ms aralıklı ölçüm), tek başına geçiyor. CI'da görülmedi.
- Yavaş telefonda (kare 200 ms'yi aşınca) Phaser oyunun saatini geri bırakır: sayaçlar/süreler uzar (test makinesinde ~12 kare/sn'de 6 sn → 11 sn). Kaybettirmez; büyük aynanın en çok süresi gerçek saatle (#143). 🔎 eski iPhone'da bakılacak.
- Ayrıntılı fotoğraf: `docs/rapor-2026-10-12/` (12 Ekim anlık görüntüsü).

---

## 4. Oturum günlüğü (en yeni üstte)

### 17 Ekim 2026 (gündüz) — K44 iş listesi: veri denetimi 7. tur, K39 (b), erişilebilirlik, dallar, katalog, telefon sayfası
**Yapılanlar (tek PR):**
- **Kod denetimi 7. tur** (ilerleme, istatistik, rozetler, kostümler, oturum, uyarla, pasaport, oyunAyari): **1 gerçek hata:** kamera ayarı (`kamera.ts kameraAcikMi/kameraAyarla`) kayıt alanına korumasız erişiyordu; Safari "Tüm çerezleri engelle" gibi kayıt alanı kapalıyken hareket ekranı ve ebeveyn menüsü hata verirdi (diğer bütün kayıtlar korumalıydı). Düzeltildi; test (`kayit.test.ts`, kayıt alanına dokunmak hata verir) eski kodda kırmızı. Saat dilimi / gece yarısı / yaz saati: haftalık özet İngiltere, Türkiye, New York, Yeni Zelanda'da yaz saati geçiş günlerinde 7 ayrı gün, sonuncusu bugün (hata yok; kalıcı test eklendi). Isınma süresi (15 dk) saat diliminden etkilenmez (evrensel saat). Tempo uyarlaması: 200 hareketin hiçbirinde söylenen sayı ile tekrar sayısı uyuşmazlığı yok (üç tempo × oturarak). Bozuk/eski kayıt testleri zaten vardı. Kesin hata bulunmayanlar: ilerleme, istatistik, rozetler, kostümler, oturum, uyarla, pasaport. Küçük not (düzeltilmedi): elle bozulmuş ilerleme kaydında aynı durak iki kez yazılıysa "Bu telefonda neler var"daki "Biten duraklar" sayısı fazla görünür (oyun normalde iki kez yazmaz).
- **K39 (b):** `ses.ts` gizlenirken yarıda kalan cümleyi hatırlar (`yarimKalaniAl`); `HareketScene` dönüşte bu cümle hareketin komutuysa ve gösterim sürüyorsa bir kez yeniden söyler, geri sayımı cümle bitecek kadar erteler. Sayma sırasında kesilirse komut yinelenmez. Test `oyun.spec.ts` "yarıda kalan hareket komutu" eski kodda kırmızı ("Üç!" komutun yerine geliyordu); var olan kesinti testine "sayma sırasında komut yinelenmez" eklendi.
- **Erişilebilirlik:** sesli yönlendirme: her çocuk ekranı için test zaten var (16 ekran), eksik yok; Açılış ekranı ilk dokunuştan önce konuşamaz (tarayıcı kuralı), büyük "Oyna" düğmesi var. Hareketi azalt: ölçüldü (normalde haritalarda ~60 sürekli yıldız pırıltısı; azaltılınca 0, sadece sıradaki durak / açılan kapı nabzı kalır, en çok 2); kalıcı test eklendi. Büyük yazı ve VoiceOver bulutta taklit edilemez → 🔎, K46.
- **Telefonda deneme sayfası** (kardeş + Yağız, iPhone'da işaretlenir, notlar kopyalanır): https://claude.ai/artifact/DjZd22aR1pZNm82WUP6j8r . Yeni depo dosyası açılmadı; `telefon-kontrol-listesi.md` ve `yagiz-testi.md` sayfaya bağlantı verir. Sayfa özel; kardeş açacaksa kullanıcı Paylaş menüsünden paylaşmalı.
- **Hareket kataloğu** yeniden üretildi: metin aynıydı (79 hareket), ama 14 Ekim'deki sağ/sol ayna değişikliğinden (#109) sonra resimler eskiydi.
- **Mağaza görselleri:** yeniden üretilip karşılaştırıldı, değiştirilmedi (K45).
- **Eski dallar (K8):** liste aşağıda, silinmedi.
- K41 (b) / K42: kardeşin kamera sonucu gelmedi; yapılmadı, beklemede.

**Telefon kontrol listesi:** T3, T4, T10 güncellendi (K39 b). T1, T2, T5-T9 etkilenmedi.

**Silinebilir dallar (144; uçları birleşmiş PR'ların son hâli):** asama-0-kurulum, asama-1-ilk-hareket, asama-1b-canli-maskot, asama-1c-net-hareketler, asama-3-turkiye-haritasi, asama-4-pasaport, asama-5-harita-yolculuk, asama-6-dogal-ses, asama-7-ozet-sertifika, asama-8-kurulum-internetsiz, asama-9-dunya-harikalari, asama-10-beta-guvenlik-gizlilik, asama-11-rozetler, asama-12-uzay, asama-13-buyuk-macera, asama-14-hata-avi, asama-15-kostumler, asama-16-sertifikalar, asama-17-aileyle, asama-18-kamera, asama-19-magaza, asama-20-katalog-ses, claude/yeni-bolumler, claude/donma-duzeltme, claude/cesitlilik, beta-toparlama, gizlilik-gozden, hiz-kontrol, claude/beta-deneme-turu, claude/zipzip-canli, claude/yasal-duzenleme, beta-hazirlik-paketi, yavas-telefon-olcumu, bu-telefonda-neler-var, play-kapali-test, sesli-yonlendirme, hata-avi, hareket-katalogu, magaza-gorselleri, paket-boyutu, bilgi-dogrulugu, otomatik-is-bakimi, gizlilik-uyumu, iphone-derleme, play-tek-parola, hiz-ve-ses, okyanus, kamera-hareketleri, onbellek-temizle, sesi-dene, claude/zip-zip-dunya-beta-u1cpv4, claude/zip-zip-dunya-testing-yqj0aa, claude/zip-zip-dunya-continue-3xgwbu, hiz-kure, turkiye-cila, ebeveyn-guveni, magaza-metin, yedi-tepe-dogrula, gece-apk-rehberi, gece-iphone-gizlilik, gece-dunya-cila, gece-uzay-cila, gece-bolum-cila, hata-tam-surum-okyanus, oturarak-denetim, animasyon-uyum, ebeveyn-ozet-bolumler, belgeler-guncel, beta-tarama, ses-temizlik, hiz-eski-telefon, nasil-oynanir, magaza-gorselleri-2, erisilebilirlik, odul-cilasi, testleri-hizlandir, not-renk-korlugu, gizlilik-uyum, metin-taramasi, ebeveyn-denetim, kod-temizligi, bozuk-kayit, beta-listesi-guncel, ipad-yatay, ozel-hareket-atlanmasin, ilk-acilis-ipuclari, karar-ipad-yatay, test-50-durak, cocuk-gezinti, test-kutlama-saglam, kamera-yavas-telefon, ebeveyn-ilk-deneyim, kural-birlestirme, paylas-kilit, kayit-analiz, katalog-uzman, kayit-zipla-plan, kamera-olcum, zipzip-ziplasin, beta-kapsami, kisa-komut, kayit-zipla-sonuc, bekleyen-engel, kayit-k24, oyna-duzelt, hizli-tempo, ailece-uzaktan, magaza-ilk-surum, zipla-olcum-kutlama, kayit-wakelock, zipla-test-hazirlik, zipla-takilma, kamera-durdu, gercek-gezinti, gizlilik-denetim, kod-denetim, gece-kayit, k27-kamera-durdu, k28-sakinlesme, denetim-2, kayit-15-ekim-ogle, yagiz-protokol-durdu, k30-oyuncak-dansi, kural-k32, k26-hareket-kasifi, kamera-izin-ekran, kural-k35, ekran-odul-kilit, magaza-ekran-acik, kayit-16-ekim, k36-k37-ozet-kasif, test-hizlandir, kesinti-ses, denetim-4, kayit-16-ekim-sabah, ses-onbellek, k38-model-hatasi, buyuk-ayna, denetim-5, t5-t7, kayit-16-ekim-ogle, k41-kamera-benzetim, k41c-kamera-tani, calisma-ilkeleri

### 17 Ekim 2026 (gece) — K41 (c), kamera tanı satırı, kod denetimi 6. tur, beta denetimi
**Görev (kullanıcı, onaylı):** 4 iş; K41 (b) ve eşikler kardeş denemesi sonucu gelene kadar yapılmaz.
**Bu PR:**
- Kamera tanı satırı (🔍 Dene): görmediğinde hangi noktanın eksik olduğunu yazar (sol/sağ omuz, topuk; kimse). Kaydedilmez.
- K41 (c): çocuğun hareket ekranında eksik yere göre yazı (ayna + küçük kutu) ve aynada bir kez sesli ipucu (4 yeni cümle; seslendirme listesi 993). Eşikler/sayma şartı aynı. `kamera.ts eksikYeri / eksikTaniYazisi`, `KameraSayaci.eksik`.
- Kod denetimi 6. tur (EbeveynMenu, Ayar, Kilit, Veri, Özet, Rehber, Ses, Kamera, Sertifika, Pasaport, PasaportAyar, ZiplaDeneme). **Hatalar (testleri eski kodda kırmızı):** (1) "Sesi dene"de ses listesi beklenirken (iPhone'da ilk açılışta en çok 1,5 sn) çıkıp hemen geri girilince sayfa hatası; (2) Pasaport ayarında fotoğraf varken yenisi seçilince eski resim ekrandayken dokusu siliniyordu → çizimde hata (WebGL'de ekranı bozabilir); (3) özet paylaşma açılamazsa (vazgeçme dışında) hiçbir şey olmuyordu → panoya kopyalanır; paylaşılan metin "bu hafta … X durak gezdi" diyordu ama X toplam → "şimdiye kadar". Sertifika: paylaşma vazgeçme dışı hatayla açılamazsa resim indirilir (🔎 iPhone'da denenmedi; testi yok). Kesin hata bulunmayan: EbeveynMenu, Ayar, Kilit, Veri, Rehber, ZiplaDeneme.
- Beta denetimi: gizlilik.html kamera cümlesi "küçük önizleme" diyordu (K40'tan beri önce büyük ayna) → düzeltildi + "neyin görünmediği yazar, kaydedilmez". beta-hazir-mi.md 17 Ekim; beta-rehberi.md'ye "kamera baştan ayağa görmeli, telefonu ayaklar görünecek yere koyun"; Yağız testi 18-19 yeni yazılar. Mağaza metinleri ve kosullar.html güncel. Eksikler (kullanıcıda): iletişim adresi, avukat, Android internet izni (APK denemesi), doğal ses, marka; "Beta: Dünya" düğmesi mağazadan önce kalkacak.
**Telefon kontrol listesi:** T2/T7 etkilenmedi (kamera açma/kapama değişmedi); T4: yeni sesli ipucu sadece aynada, sayılarla çakışmaz. 🔎 telefonda: ayakları kadraj dışında bırakınca aynada "Ayakların görünmüyor" yazıyor ve bir kez söyleniyor mu; 2-3 m'den okunuyor mu.

### 16 Ekim 2026 (akşam) — K41 kamera benzetimi, Yağız testi beklenmeden
**Görev (kullanıcı):** Yağız testi beklenmeden çocuksuz yapılabilecek her şey; eşik değiştirme yok, kol hareketlerinde ayak şartı kalmaz.
**#147 (bu oturum):**
- K41 kanıtlandı (kod + benzetim): sayma şartı iki omuz + iki topuk; telefon masada → "Geri git", sayı 0. Ayrıntı `docs/k41-kamera-analizi.md`. Eşikler aynı.
- Benzetim katmanı: `window.zipzipBenzetim` sahte model, sadece geliştirme sunucusunda (yayın paketinde yok, test denetler). `tests/kamera-benzetim.spec.ts` 20 test; GitHub'da 2 parça (toplam 7 parça). `tests/kamera.test.ts` 6 yeni K41 birim testi (47 veri testi).
- Hatalar (testleri eski kodda kırmızı): (1) kamera açılırken sıradaki harekete geçilince kamera ikinci kez açılıp ilki açık kalıyordu (T2); (2) kamera açılamadıysa özet "kamera açıkken" sayıyordu; (3) hazırlanırken küçük kutuda ayna çerçevesi görünüyordu.
- Yerelde tam oyun testleri 82/82 (2 işçi, 15,8 dk). CI ilk turda yeni testimin biri kırmızı: ayna kısa geçişini gerçek saatle ölçüyordu (oyun saatiyle 0,9 sn; yavaş CI'da 3,4 sn) → oyun saatiyle ölçülüyor (her karenin oyun süresi toplanır; `time.now` gerçek saattir, ilk denemede yanlış seçtim). Yük altında 6 kopya: oyun saati hep ~0,91 sn, gerçek saat 0,8-5,8 sn. Oyun hatası değil. Üçüncü turda "özet dürüst" testi "Yaptım!"ı 60 sn içinde göremedi (yavaş CI oyun saati; önceki turlarda 59 sn) → bekleme süreleri uzatıldı (test 240 sn, bekleme 150 sn), beklentiler aynı.
- Gizlilik denetimi (kod): kamera görüntüsü sadece ekrandaki video öğesine ve cihaz içindeki tanımaya gider; kopyalanmaz (toDataURL/kayıt yok), ağ isteği yok; çıkınca kamera kapanır, tanıma durur (testli). Değişiklik yapılmadı.
- GitHub denetimi (16 Ekim akşamı): etiket yok, release yok, `main` korumalı görünmüyor → U1/U2 hâlâ kullanıcıda.
- Zaten testli olanlar (yeni test eklenmedi): Wake Lock sıklığı ve düşük güç (T5), kesinti/kilitten dönüş (T3/T10), yavaş telefon (T7), ses önbelleği yeniden deneme (`onbellek.test.ts`, #141).
**Telefonda denenecek:** kardeşe gönderilen test bağlantısıyla kamera: kutu yazısı ("Geri git" mi?), telefon nereye konunca ayaklar görünüyor, izin bir kez mi soruluyor.

### 16 Ekim 2026 (öğle) — K40 büyük ayna, K38, ses önbelleği, kod denetimi 5. tur, T5/T7
**Birleşenler (`test` son hâlinde yeşil ve okunarak, K35):**
- #141 Ses kaydı önbelleği: yüklenemeyen doğal ses kaydı önbellekten silinir, sıradaki istek yeniden dener (`src/onbellek.ts`; test ilk istek düşer → ikincisi çalar; eski mantıkta kırmızı). Bölüm 3'teki not kaldırıldı.
- #142 K38 (a): oyundaki kamera, model yüklenemezse hemen kapanır, o durakta yeniden denenmez. Eski kodda kırmızı (kamera `live` kaldı). CI'da bir kez `kilitten dönüş` kırmızı (ilgisiz), yeniden çalıştırmada yeşil.
- #144 Kod denetimi 5. tur (Hareket, Durak, Ödül, Harita, Macera, Bölüm, Uzay, Dünya): kilitli durağa/bölüme/kapıya art arda hızlı dokununca sallanma üst üste binip işaret 8 px kaymış kalıyordu (5 yer) → sallanma hep asıl yerden. Test gerçek dokunuşla; eski kodda kırmızı. Denenip hata olmadığı görülen: uzaydan inişte saydam düğmelere dokunma (Phaser saydam nesneye dokunuşu iletmiyor; eski kod da doğru, değişiklik yapılmadı).
- #143 K40 "önce büyük ayna" (yukarıda). Yeni 3 test (her hâlde örtme yok, sesler, ≤6 sn, kamerasız aynı). Yerelde tam testte gerçek bulgu: küçük kutu uzun hikâye satırına değiyordu → kısaltıldı. CI'da bir ayna testi yük altında sahte kamera "durdu" sayıldığı için aynayı açmadı (oyun doğru davrandı) → test kamera durumunu sabitliyor.
- #145 T5/T7: düşük güç modunda Wake Lock reddedilince istek her yarım saniyede yineleniyordu (30 sn'de 49) → 10 sn ara, dokununca hemen; yavaş telefon testi (6 kat yavaş, kameralı hareket biter ve ilerler).

- #146 (bu kayıt): T5 testi CI'da yük altında 60 sn'de bitmedi (kendi testim); ayrıca "art arda dokunma" testi sallanma bitmeden ölçüyordu → bitmesini bekler → oyun saati 4 kat hızlı, süre 120 sn, dokunma denetimi 1,5 sn içinde artış; yerelde 4 işçide 8/8.

**Telefon kontrol listesi:** T2 (izin bir kez) korunur; T5 taklitle ✅; T7 kısmen (bulgu bölüm 3); T1/T9 değişmedi.
**Telefonda denenecek:** büyük ayna (çocuk kendini görüyor mu, "Hazırsın!" geliyor mu, kutu yazısı 2-3 m'den okunuyor mu); düşük güç modunda bir durak (ekran kararıyor mu); Yağız testinde kutuda ne yazdığı (madde 19).
**Kendi hatam (ders):** (1) tam test arka planda çalışırken dal değiştirdim; o çalıştırmayı geçersiz sayıp yeniden çalıştırdım. (2) Bir belge düzenlemesinde dosyanın sonunu sildim, hemen fark edip geri aldım. (3) İki kez test dosyası birleştirmesinde ortak kapanış satırı kayboldu; test listesiyle (`--list`) yakalandı. Kural: birleştirmeden sonra `npx playwright test --list`.
**Arşiv:** session_01S2TfjxvS8R2SAVzKDaVRZv arşivlendi.

### 16 Ekim 2026 (sabah) — K36, K37, testler 3 kat hızlı, kesinti testleri, kod denetimi 4. tur
**Birleşenler (`test` son hâlinde yeşil ve okunarak, K35):**
- #136 K36 + K37 (yukarıda). Testler eski kodda kırmızı, yenide yeşil.
- #137 Testler hızlandı: GitHub "Testler" **~16,5 dk → ~5 dk**. Oyun testleri 5 makinede aynı anda (süreye göre elle dengelenmiş parçalar: bütün duraklar 1/2-2/2, gezinti + internetsiz, ekranlar 1/2-2/2); derleme + veri testleri ayrı iş; dal korumasının baktığı **`test`** adlı iş en sonda, hepsi geçince yeşil. `fullyParallel: true`. Yeni test dosyası eklenince `.github/workflows/test.yml` parçalarına da eklenir (`npm test` denetler). Hiçbir test atlanmadı/gevşetilmedi (52 test). Ölçüm: tek makine 15,6 dk (oyun testleri) → en uzun parça ~5 dk, toplam iş 5 dk 4 sn.
- #138 Kesinti (kontrol listesi T4, T10): sayfa gizlenince konuşma susar; dönüşte iPhone'da duraklatılmış konuşma sürdürülür; ses bağlamı iPhone'un aramadan sonraki "interrupted" durumunda da yeniden açılır (önce sessiz kalabilirdi). Test: sayma ve "Uzaktan oyna" 3-2-1 gizliyken ilerlemez, yeni cümle yok, dönünce kaldığı yerden bir kez devam, hareket bir kez kaydedilir. Eski kodda kırmızı.
- #139 Kod denetimi 4. tur (kamera, zipzip, zipzipYuz, zipzipKure, arayuz, pasaport, ses, ekranAcik): vücut tanıma modeli yüklenemezse ebeveyn kamera ekranlarında kamera kapanmıyordu (ışık yanık kalırdı) → kapanır, "Kamera açılamadı" yazar. Eski kodda kırmızı.

**Test yarışı (düzeltildi, #139):** kesinti testi yerelde ~30 çalıştırmada bir kırmızı oldu: gizleme sayılı hareketin son sayısına denk gelince dönüşte değişen ilk sayı sıradaki hareketin geri sayımıydı. Artık sadece aynı harekette bir sayı daha gelecekken gizlenir (8/8, 4 işçide).
**Bilgi:** Phaser sayfa gizlenince kendi saatini durdurmaz; telefon kare çizmediği için oyun durur. Kesinti testi bu yüzden gizliyken kareleri de durdurur. Üstten inen bildirim sayfayı gizlemez (oyun sürer, sorun değil).
**Denetimde belirsiz kalanlar:** K38 (oyundaki kamera, model hatası), K39 (yarım kalan cümle), ses kaydı önbelleği (bölüm 3). zipzip/zipzipYuz/zipzipKure/arayuz/pasaport/ekranAcik'te kesin hata bulunmadı.
**Telefonda denenecek (kontrol listesi):** T10 gerçek arama: oyun konuşurken arama gelince ses susuyor mu, dönünce Zıpzıp yine konuşuyor mu, sayma kaldığı yerden mi (iPhone Safari + ana ekran uygulaması). T3 aynı yol.
**Kendi hatam (ders):** iki kez kaydedilmemiş değişikliği `git checkout -- dosya` ile sildim (yeniden yazıldı, kayıp yok). Kural: "eski kodda kırmızı" denetiminde önce yedek, `git show origin/main:dosya > dosya`, sonra yedeği geri koy.
**Arşiv:** session_01PpLgb8apS9jWBKniuh6AoQ arşivlendi.

### 16 Ekim 2026 (gece) — aile testi düzeltmeleri, onay kuralı, kod denetimi 3. tur
**Birleşenler:** #129 (K33 politika + kayıt), #130 (K26 Hareket Kâşifi: açık bölümler sayılır), #131 (aile testi: kamera izni bir kez,
ekran kararmaz; dokunmadan bütün durak/Ailece testi eski kodda 63/51 kez kilitsiz), #132 (K35: testler yeşilse sormadan birleştir).
**Açık / birleşecek:** #133 (ödül ekranında da ekran açık + kilitten dönüş testi), #134 (mağaza paketinde ekran açık: keep-awake 7.1.0;
Android deneme paketi derlemesi çalıştırıldı), bu kayıt.
**Ders (kullanıcı haklı):** ekran kararması 14 Ekim'de kayıttaydı; "dokunmadan oyna" (Uzaktan/Ailece) eklenirken tekrar düşünülmeliydi.
Bulut testleri ekransız tarayıcıda çalışıyor, telefon davranışlarını görmez → `docs/telefon-kontrol-listesi.md` (T1-T10); kamera/ses/
ekran/dokunmadan oynama değişikliklerinde Claude bu listeyi kendisi gözden geçirir ve raporlar.
**Kod denetimi 3. tur** (Ödül, Ebeveyn kilidi, Avatar, Rozet, Kostüm, Açılış, Ebeveyn ayarları, Tam sürüm, Zıpzıp da zıplasın, Ebeveyn
özeti): kesin hata yok. Belirsiz: K36 (özette 50 durak), K37 (oturarak + Hareket Kâşifi).
**Test bağlantısı:** https://8y9khd2gr8-svg.github.io/first/ (kullanıcı yeğenlerine gönderecek).

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

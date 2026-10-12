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
| K5 | ⏳ 4-5 yaş komutları | **Kısmen yapıldı (#106):** Sakin tempoda 36 çok adımlı komut tek eyleme iner (`src/uyarla.ts` KISA_KOMUT; tahmin, 4-5 yaşla denenecek; seslendirme 761 → 857 cümle). **Açık:** sağ/sol ayna sorunu (Zıpzıp çocuğa dönük) | 🔎 Gözlem yok, tahmin | 12 Ekim |
| K6 | ⏳ 8-9 yaş ilgisi | Kaybettirmeyen zorluk ("kendi rekorun", daha hızlı tempo) konuşulsun mu? Ya da hedef yaş 4-8'e daralsın mı? | Görsel dil küçük kardeş oyunu gibi görünebilir | 12 Ekim |
| K7 | ⏳ Yayın onayı | GitHub Pages yayınına "onay gerekli" eklemek (her yayın kullanıcı onayıyla). Öneri: şimdilik gerek yok, main koruması yeterli | Yanlışlıkla yayın riski | 12 Ekim |
| K8 | ⏳ Eski dallar | GitHub'da ~100 eski dal var (çoğu birleşmiş) | Temizlik; tek tek kontrol edilmeden silinmez | 12 Ekim |
| K9 | ⏳ IS_AKISI'nın depoya ayrı belge olarak girmesi | Şimdilik `docs/rapor-2026-10-12/IS_AKISI.md` içinde ve CLAUDE.md'de özet | — | 12 Ekim |
| K10 | ⏳ Performans (çok yavaş telefon) | Uzay haritası ve kamera denemesi ekranı ölçümde sınıra yakın; gerekirse sabit çizimleri resme çevirmek. **12 Ekim: ertelendi** (iş listesindeki 6. iş): gerçek telefon ölçümü yok; önce kamera denemesindeki ölçüm satırıyla (#103) telefonda ölçülecek | 🔎 Gerçek telefonda ölçülmedi | 12 Ekim |
| K11 | ⏳ ChatGPT değerlendirmesi | Rapor paketi ve oynanış analizi (`docs/rapor-2026-10-12/OYNANIS_ANALIZI.md/.pdf`) ChatGPT'ye verildi; önerileri gelince buraya maddelenecek | — | 12 Ekim |
| K12 | ⏳ Görseller | Kullanıcı görsel gönderecek; güçlü/zayıf yönleri değerlendirilecek | — | 12 Ekim |
| K13 | ✅ Kameranın rolü | **Karar (12 Ekim):** isteğe bağlı kalır, macerada "önerilen". Kamerasız da tam oynanır; kamera açıkken dünya gerçek tepki verir; her yeni mekanik iki yoldan (kameralı/kamerasız) tasarlanır | Bütün oynanış kararları buna bağlı | 12 Ekim |
| K14 | ⏳ Kamerasız oynanışta engeli ne geçirir? | "Yaptım!" mı, saat mi, dokunma mı? | K13'ün sonucu; macera mekaniği bunu bekliyor | 12 Ekim (analiz) |
| K15 | ⏳ Çekirdek fiil seti | Macera için 6-8 temel hareket (öneri: zıpla, çömel, kollar yukarı, dizler, yana adım, aç-kapa; hepsi kamerayla sayılabilir). Kullanıcı notu: amaç 40-50 hareketi yaptırmak değil | Macera bu fiillerle kurulur | 12 Ekim (analiz) |
| K16 | ⏳ Ücretsiz bölüm | Türkiye Turu öğretici olarak mı kalır, yerine "Keşif Ormanı" mı gelir? | Marka (Zıpzıp Türkiye merkezli), sertifika, mağaza metinleri | 12 Ekim (analiz) |
| K17 | ⏳ Başarısızlık politikası | Kamera görmezse ne olur, kaç denemede Zıpzıp yardım eder? Öneri: sadece olumlu geri bildirim, bekleyen engel | Çocuğun "yapamıyorum" hissetmemesi | 12 Ekim (analiz) |
| K18 | ⏳ Beta hangi mekanikle? | Öneri: Kasım betası bugünkü mekanikle; yeni mekanik (her tekrarın dünyada sonucu, tek hareketle gerçek tepki prototipi) beta sırasında | Takvim | 12 Ekim (analiz) |
| K19 | ⏳ Oynanış yol haritası | A1-A4 (mevcut sistem) ve B1-B6 (yeni mekanik), ayrıntı OYNANIS_ANALIZI.md bölüm 8 | Hangi sırayla başlanacak | 12 Ekim (analiz) |
| K20 | ✅ Zıplama prototipi kararları | **12 Ekim:** D1 kamera denemesinde ("Zıpzıp da zıplasın") · D2 kamerasızda ritim + dokunma · D3 inişte + en az 400 ms ara · D4 kamera denemesinde ebeveynin gördüğü ölçüm satırı (kaydetmez). Plan: `docs/rapor-2026-10-12/ZIPLAMA_PROTOTIPI_PLANI.md` | Sıradaki geliştirme | 12 Ekim |
| K22 | ⏳ Zıplamanın dünyada sonucu (iş 3) | Tek bekleyen engel mi, 3 engelli kısa parkur mu, köprü mü? Seçenek tablosu 12 Ekim sohbetinde soruldu (önerilen: bekleyen tek engel, önce "Zıpzıp da zıplasın" ekranında) | Oynanış değişikliği: kullanıcı seçmeden yapılmaz | 12 Ekim |
| K23 | ⏳ Yağız testi: zıplama prototipi | Ebeveyn köşesi → 📷 kamera → 🔍 Dene → 🌍 Zıpzıp da zıplasın → 📷 Kamerayla zıpla; 10 zıplama: Zıpzıp kaç kez zıpladı, ölçüm satırının ekran görüntüsü (hedefler: 10'da en az 8, tek zıplamada çift tepki yok, gecikme ≤ 300 ms) | Eşikler ve 400 ms koruma gerçek çocukla ayarlanacak | 12 Ekim |
| K21 | ✅ Birleştirme onayı | **12 Ekim:** testi yeşil, küçük, geri alınabilir PR'ları Claude birleştirir (kalıcı onay). Oynanışı/kapsamı ciddi değiştiren, yayın/dağıtım, force push, geniş silme, GitHub güvenlik/erişim ayarı, para harcama, çocuk verisini saklama/gönderme için tek tek açık onay | Çalışma kuralı | 12 Ekim |

## 2. Kullanıcıda bekleyenler

| # | İş | Not |
|---|---|---|
| U1 | 👤 GitHub'da `v0.9.0` etiketi/release (hedef **fe37906**) | Bulut oturumu oluşturamıyor (403). Adımlar 12 Ekim sohbetinde |
| U2 | 👤 GitHub'da main koruması (kural seti: PR zorunlu, `test` kontrolü yeşil ve güncel, bypass listesi boş, silme/force push yasak) | Bulut oturumu oluşturamıyor (403). Kurulunca Claude doğrular |
| U7 | 👤 Mac'e ertelenebilir: `v0.9.0` etiketi ve main koruması (U1-U2), iPhone mağaza paketi | Kullanıcı şu an sadece iPhone kullanıyor (Claude ve GitHub uygulamaları); terminal yok. GitHub uygulamasında bu ayarlar yok (bildiğim kadarıyla); Safari masaüstü görünümüyle yapılabilir |
| U3 | 👤 İnternetsiz APK'yı telefonda denemek | Sonuç gelince Android INTERNET izni kaldırılır (sonuç gelmeden kaldırılmaz) |
| U4 | 👤 Yağız testi (+ mümkünse 4-5 ve 8-9 yaştan birer çocuk) | docs/yagiz-testi.md |
| U5 | 👤 Play geliştirici hesabı, sonra Apple | docs/beta-hazir-mi.md |
| U6 | 👤 Azure (doğal ses), marka başvurusu, avukat, iletişim e-postası | docs/beta-hazir-mi.md |

## 3. Bilinen sorunlar / doğrulanmayanlar (özet)
- 🔎 Gerçek telefonda: ses, performans, kamera eşikleri, ödeme hiç denenmedi; iPhone'a hiç kurulmadı.
- Doğal ses kaydı yok (760 cümle); telefonda Türkçe ses yoksa Zıpzıp konuşamaz.
- Süreye bağlı tarayıcı testleri yavaş CI'da ara sıra zaman aşımına düşebilir (12 Ekim'de bir kez; #95).
- Ayrıntılı fotoğraf: `docs/rapor-2026-10-12/` (12 Ekim anlık görüntüsü).

---

## 4. Oturum günlüğü (en yeni üstte)

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

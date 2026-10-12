# Zıp Zıp Dünya — Kayıt (karar, onay ve oturum günlüğü)

Bu dosya hiçbir şey unutulmasın diye tutulur. **Her oturum başında okunur, sonunda güncellenir.**
Onay verilmemiş, ertelenmiş ya da reddedilmiş öneriler de buraya yazılır; listeden ancak karar verilince
("yapıldı", "yapılmayacak") çıkar ve günlükte nedeni kalır. Kurallar ve kesinleşmiş kararlar `CLAUDE.md`'de.

İşaretler: ⏳ onay/karar bekliyor · 👤 kullanıcıda bekliyor · 🔎 doğrulanmadı · ✅ bitti · ✖️ yapılmayacak (nedeniyle)

---

## 1. Onay ya da karar bekleyenler (açık liste)

| # | Konu | Ne öneriliyor / soru | Neden önemli | Eklendiği gün |
|---|---|---|---|---|
| K1 | ⏳ Beta kapsamı | Betada hangi bölümler açık olsun? Öneri: Türkiye + Dünya + Ailece (14 durak), diğerleri "Yakında". Seçenekler: dalgalı / hepsi açık / sadece Türkiye | Ses kaydı ve uzman kontrolü 14 durağa odaklanır | 12 Ekim (soru cevapsız kaldı) |
| K2 | ✅ Sertifikadaki "Kaydet / Paylaş" çocuk ekranında kilitsizdi | **Yapıldı (#99, 12 Ekim):** çocuk "🔒 Kaydet / Paylaş"a dokununca ebeveyn kilidi; doğru cevapla aynı sertifika paylaşılabilir. 🔎 Mağaza kural metni yine de mağaza başvurusunda kontrol edilecek | | 12 Ekim |
| K3 | ⏳ Ebeveyn köşesine giriş | Şu an sadece Pasaport → ✏️ (güvenlik notunda yazıyor, #97). Ayrı kilitli bir "Ebeveyn" düğmesi gerekir mi? | Ebeveynin ayarları (Sakin tempo, ses denemesi) bulması | 12 Ekim |
| K4 | ⏳ Hareketlerin uzman kontrolü | Beta duraklarının hareket listesi çıkarılıp fizyoterapist/çocuk doktoruna gösterilsin | 🔎 Hiçbir hareketi uzman görmedi; sayı/süre yaşa uygun mu bilinmiyor (sağlık konusunda varsayım yok) | 12 Ekim (fizyoterapist fikri daha önce ertelenmişti) |
| K5 | ⏳ 4-5 yaş komutları | Çok adımlı komutlar ("Kollarını kaldır, bir yana eğil, sonra öbür yana! Üç kere!") kısaltılsın mı? Sağ/sol ayna sorunu (Zıpzıp çocuğa dönük) nasıl olsun? | 🔎 Gözlem yok, tahmin | 12 Ekim |
| K6 | ⏳ 8-9 yaş ilgisi | Kaybettirmeyen zorluk ("kendi rekorun", daha hızlı tempo) konuşulsun mu? Ya da hedef yaş 4-8'e daralsın mı? | Görsel dil küçük kardeş oyunu gibi görünebilir | 12 Ekim |
| K7 | ⏳ Yayın onayı | GitHub Pages yayınına "onay gerekli" eklemek (her yayın kullanıcı onayıyla). Öneri: şimdilik gerek yok, main koruması yeterli | Yanlışlıkla yayın riski | 12 Ekim |
| K8 | ⏳ Eski dallar | GitHub'da ~100 eski dal var (çoğu birleşmiş) | Temizlik; tek tek kontrol edilmeden silinmez | 12 Ekim |
| K9 | ⏳ IS_AKISI'nın depoya ayrı belge olarak girmesi | Şimdilik `docs/rapor-2026-10-12/IS_AKISI.md` içinde ve CLAUDE.md'de özet | — | 12 Ekim |
| K10 | ⏳ Performans (çok yavaş telefon) | Uzay haritası ve kamera denemesi ekranı ölçümde sınıra yakın; gerekirse sabit çizimleri resme çevirmek | 🔎 Gerçek telefonda ölçülmedi | 12 Ekim |
| K11 | ⏳ ChatGPT değerlendirmesi | Rapor paketi ChatGPT'ye verildi; önerileri gelince buraya maddelenecek | — | 12 Ekim |
| K12 | ⏳ Görseller | Kullanıcı görsel gönderecek; güçlü/zayıf yönleri değerlendirilecek | — | 12 Ekim |

## 2. Kullanıcıda bekleyenler

| # | İş | Not |
|---|---|---|
| U1 | 👤 GitHub'da `v0.9.0` etiketi/release (hedef **fe37906**) | Bulut oturumu oluşturamıyor (403). Adımlar 12 Ekim sohbetinde |
| U2 | 👤 GitHub'da main koruması (kural seti: PR zorunlu, `test` kontrolü yeşil ve güncel, bypass listesi boş, silme/force push yasak) | Bulut oturumu oluşturamıyor (403). Kurulunca Claude doğrular |
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

**Teslim edilenler:** ChatGPT rapor paketi (zip, PDF özet, 6 belge, 30 ekran görüntüsü) → depoda `docs/rapor-2026-10-12/` (tek tek ekran görüntüleri hariç).

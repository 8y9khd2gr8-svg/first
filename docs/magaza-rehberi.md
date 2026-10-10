# Zıp Zıp Dünya – Mağaza rehberi

Bu rehberde, oyunu Google Play ve App Store'a çıkarmak için **sizin yapacağınız adımlar** sırayla anlatılıyor.
Hesap açmak, para ödemek ve uygulamayı mağazaya göndermek sizde. Teknik hazırlıkları ben yapıyorum.

> Not: Ücretler ve kurallar zamanla değişebilir. Ödeme yapmadan önce resmi sayfadaki güncel bilgiye bakın.
> Vergi ve marka konularında son sözü mali müşavir ve marka vekili söyler.

---

## Takvim (özet)

| Ne zaman | İş | Kimde |
|---|---|---|
| Ekim sonu – Kasım başı | Marka araştırması ve başvurusu (TÜRKPATENT) | Siz |
| Kasım başı | Google Play ve Apple geliştirici hesapları | Siz |
| Kasım başı | 20/B banka hesabı (mali müşavirle) | Siz |
| Kasım | Kapalı beta: Google'da kapalı test, Apple'da TestFlight (~100 kişi) | Siz gönderirsiniz, paketi ben hazırlarım |
| Aralık | Beta düzeltmeleri, ödeme ekranının bağlanması, insan sesi kaydı | Ben + seslendirmen |
| Ocak sonu | Mağazaya çıkış; web sitesinden oyun kaldırılır, sadece gizlilik ve koşullar sayfaları kalır | Siz gönderirsiniz, hazırlığı ben yaparım |

---

## 1. Marka (isim hakkı) – betadan önce

1. **Araştırma:** [TÜRKPATENT](https://www.turkpatent.gov.tr) sitesinde "marka araştırma" bölümünde "Zıp Zıp", "Zıpzıp", "Zıp Zıp Dünya" adlarını arayın.
   Benzer bir marka **9. sınıfta (yazılım)** ya da **41. sınıfta (eğitim/eğlence)** kayıtlıysa bana yazın. Adı birlikte değerlendiririz.
2. **Başvuru:** e-Devlet şifrenizle TÜRKPATENT'in internet başvuru sistemine (EPATS) girin. Marka başvurusu yapın.
   - Marka: **Zıp Zıp Dünya** (istersen Zıpzıp logosuyla birlikte)
   - Sınıflar: **9** ve **41**. İleride oyuncak satılırsa 28.
3. Başvuru ücreti sınıf başına ödenir. Tutarı başvuru ekranı gösterir.
4. İsterseniz bunu bir **marka vekiline** yaptırın. Vekil araştırmayı da yapar, itirazları da takip eder.

## 2. Vergi: 20/B istisnası (mali müşavirle)

- Mobil uygulama geliştiren bireyler, bankada bu iş için **ayrı bir hesap** açarak (20/B hesabı) şirket kurmadan satış geliri alabiliyor. Vergi bu hesaptan kesiliyor.
- Mali müşavire sorun: "Gelir Vergisi Kanunu 20/B istisnası benim için uygun mu, hangi bankada açayım?"
- Apple ve Google'a ödeme bilgisi olarak **bu hesabı** yazacaksınız.

## 3. Google Play geliştirici hesabı

1. [play.google.com/console](https://play.google.com/console) adresine Google hesabınızla girin. Hesap türü olarak **Kişisel** seçin.
2. Tek seferlik kayıt ücreti yaklaşık **25 $**.
3. Kimlik doğrulaması istenir (kimlik ve adres). Birkaç gün sürebilir.
4. **Önemli kural:** Yeni kişisel hesaplar, uygulamayı herkese açmadan önce **en az 12 kişiyle 14 gün kapalı test** yapmak zorunda.
   Kasım betamız bu kuralı karşılıyor. 12 kişiden fazlası iyi, çünkü bazıları test sırasında bırakabilir.
5. Uygulama formlarında:
   - **Hedef kitle:** 5 yaş ve altı ile 6-8 yaş ve 9-12 yaş. Bu seçim "Aileler" politikası kurallarını açar. Bizim oyunumuz bunlara zaten uygun: reklam yok, veri yok.
   - **Veri güvenliği formu:** "Hiçbir veri toplanmıyor ve paylaşılmıyor". Kamera görüntüsü telefonda işlenir, gönderilmez.
   - **Gizlilik politikası adresi:** `https://8y9khd2gr8-svg.github.io/first/gizlilik.html`

**Uygulama içeriği formlarının hazır cevapları:** `docs/play-formlari.md` (veri güvenliği, hedef kitle, içerik derecelendirmesi, mağaza sayfası).

## 3b. Play kapalı test paketi (yükleme anahtarı + AAB)

Play'e **AAB** denen imzalı paket yüklenir (APK sadece elden kurulum içindir). Paketi imzalayan
**yükleme anahtarı** üretildi ve size `PLAY-ANAHTARI-GIZLI.txt` + `zipzip-yukleme.jks` olarak gönderildi.
Uygulamanın asıl imzasını Google saklar (Play App Signing). Yükleme anahtarı kaybolursa Play Console'dan
yenisi istenebilir. Yine de **güvenli saklayın, kimseyle paylaşmayın**.

**Bir kez yapılacaklar:**
1. GitHub'da proje → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. `PLAY-ANAHTARI-GIZLI.txt` içindeki üç değeri (ad + değer) tek tek ekleyin: `ANDROID_KEY_ALIAS`,
   `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEYSTORE_BASE64`. Değerler eklendikten sonra GitHub da göstermez, kimse göremez.
3. İki dosyayı da güvenli bir yerde saklayın (şifre yöneticisi ya da sadece sizin erişebildiğiniz bulut klasörü).
   Sonra telefonunuzdaki indirilmiş kopyaları silebilirsiniz.

**Mağaza sayfası görselleri** (kapalı test için de gerekir): `docs/magaza-gorselleri/` klasöründe.
`ekran-1..7.png` telefon ekran görüntüleri (1080×1920), `tanitim-1024x500.png` "Öne çıkan grafik",
`ikon-512.png` uygulama simgesi. Oyun değişince yeniden üretmek için: `npx vite --port 5173` açıkken
`node scripts/magaza-gorselleri.mjs`.

**Her yeni test sürümünde:**
1. GitHub → **Actions** → **Play kapalı test paketi** → **Run workflow**.
2. 5-10 dakika sonra işin içine girin, en altta **zip-zip-dunya-play** dosyasını indirin, zip'i açın: `app-release.aab`.
3. Play Console → uygulama → **Test → Kapalı test** → yeni sürüm oluşturun → `app-release.aab` dosyasını yükleyin.
   İlk yüklemede Play, **Play App Signing**'i açmayı sorar: **kabul edin** (Google'ın önerdiği varsayılan).
4. Test kullanıcıları: e-posta listesi (beta grubundaki ailelerin Google hesapları). Play size bir **davet bağlantısı** verir.
   Bu bağlantı `docs/beta-rehberi.md`'nin sonundaki mesajdaki [BAĞLANTI] yerine yazılır.

Sürüm kodu her çalıştırmada kendiliğinden artar. Play aynı kodu ikinci kez kabul etmez, bu yüzden elle bir şey yapmanız gerekmez.

## 4. Apple geliştirici hesabı

1. [developer.apple.com/programs](https://developer.apple.com/programs) adresinden **Bireysel (Individual)** üyelik başlatın. Apple ID'nizde iki aşamalı doğrulama açık olmalı.
2. Yıllık ücret yaklaşık **99 $**.
3. Mağazada satıcı olarak **kendi adınız** görünür. Şirket kurulunca hesap şirkete taşınabilir.
4. Uygulamayı **Mac'te Xcode** ile göndereceğiz. Mac'inizde App Store'dan Xcode'u ücretsiz indirin. Adımları gönderme günü birlikte yaparız.
5. App Store Connect'te:
   - **Kategori:** Çocuklar (Kids) – 6-8 yaş. Bu kategori reklamı ve izleme yazılımlarını yasaklar. Biz zaten kullanmıyoruz.
   - **Gizlilik etiketi:** "Veri toplanmıyor" (Data Not Collected).
   - **Kamera açıklaması** pakette hazır: "Ebeveyn açarsa kamera... görüntü telefonda işlenir; kaydedilmez ve hiçbir yere gönderilmez."
6. **TestFlight** ile beta: Kasım'da test linki oluşturulur, beta testçileri TestFlight uygulamasıyla oyunu kurar.
   Dışarıdan testçi davet etmeden önce Apple kısa bir inceleme yapar (genelde 1-2 gün).

## 4b. Yaş derecelendirmesi (iki mağazada da zorunlu)

**Neden önemli:** 5651 sayılı Kanun'a eklenen oyun maddesine (Ek Madde 5) göre 1 Kasım 2026'dan itibaren oyun platformları
(Play Store, App Store gibi) yaşa göre derecelendirilmemiş oyunları sunamıyor ya da en yüksek yaş sınıfında sunabiliyor.
Derecelendirmenin ayrıntıları ileride çıkacak bir yönetmelikle belirlenecek; çıkınca bu bölümü güncelleriz.
Formu eksiksiz ve doğru doldurmak bu yüzden önemli.

- **Google Play – İçerik derecelendirmesi (IARC anketi):** Uygulama → Politika → İçerik derecelendirmesi. Kategori: **Oyun**.
  Cevaplar: şiddet yok, korku yok, kaba dil yok, kumar yok, **kullanıcılar arası iletişim yok**, içerik paylaşımı yok,
  konum paylaşımı yok, **uygulama içi satın alma var** (tek seferlik tam sürüm). Beklenen sonuç: **PEGI 3 / Herkes**.
- **Apple – Yaş derecelendirmesi:** App Store Connect → Uygulama Bilgileri → Yaş Derecelendirmesi. Bütün içerik sorularına "Yok".
  Beklenen sonuç: **4+**. (Çocuklar kategorisi ayrıca seçilir, bkz. 4. bölüm.)
- Sonuç farklı çıkarsa göndermeden bana yazın; hangi cevabın değiştirdiğine birlikte bakarız.

**Sosyal medyaya 15 yaş sınırı (10 Ekim 2026 yönetmeliği) bizi kapsamıyor:** Yönetmelik sosyal ağ sağlayıcıları içindir
(hesap açılıp içerik paylaşılan platformlar). Oyunumuzda hesap, profil, sohbet ya da kullanıcılar arası paylaşım yok;
yaş doğrulaması (e-Devlet belirteci) gerekmez. Bu yapı korunmalı: oyuna sohbet, skor tablosu, arkadaş ekleme gibi
özellikler eklenmez (eklenirse bu değerlendirme yeniden yapılır).

## 5. Android'de hemen deneme (hesap gerekmeden)

Mağaza hesabı açılmadan önce oyunu **gerçek bir Android uygulaması olarak** deneyebilirsiniz:

1. GitHub'da proje sayfasında **Actions** sekmesine girin.
2. Soldan **Android deneme paketi**'ni seçin, sağda **Run workflow** düğmesine basın.
3. 5-10 dakika sonra işin içine girin. En altta **zip-zip-dunya-apk** dosyasını indirin.
4. Zip dosyasını açın, içindeki **app-debug.apk** dosyasını Android telefona gönderin ve açın.
   Telefon "bilinmeyen kaynak" uyarısı verir. Bu dosya sadece deneme içindir, izin verip kurun.

(iPhone'da bu kolaylık yok. iPhone için TestFlight gerekiyor.)

## 6. Mağazaya çıkmadan önce benim yapacaklarım (kontrol listesi)

- [ ] Ebeveyn köşesindeki "Beta: bütün bölümleri aç" düğmesini kaldırmak
- [ ] Tek seferlik ödemeyi (Dünya ve Uzay bölümleri) mağaza ödeme sistemine bağlamak, "satın alımı geri yükle" düğmesi
- [ ] Ödeme ekranını ebeveyn kilidinin arkasına koymak
- [ ] Web sitesinden oyunu kaldırmak; sadece gizlilik.html ve kosullar.html kalsın
- [ ] Gizlilik ve koşullar sayfalarına iletişim adresi (avukat kontrolünden sonra)
- [ ] Mağaza ekran görüntüleri ve tanıtım metinleri (Türkçe + İngilizce)
- [ ] "Bilgiler sadece bu telefonda" sözünü mağazada da kanıtlamak: Android paketinden internet iznini
      (`android.permission.INTERNET`) kaldırıp APK'yla denemek. Oyun hâlâ açılıyorsa Play Store sayfasında
      "internet erişimi yok" görünür; açılmıyorsa izin kalır (ebeveyn köşesindeki "Bu telefonda neler var?" ekranı yeter)
- [ ] Beta testçilerine docs/beta-rehberi.md (sonundaki WhatsApp mesajı); Yağız testi için docs/yagiz-testi.md
- [ ] Sürüm numarası ve imzalama anahtarı (Android imzalama anahtarı **sizde güvenli saklanmalı**; kaybolursa güncelleme yapılamaz)

## 7. Avukata sorulacaklar (beta öncesi görüşme)

1. Gizlilik politikası ve kullanım koşulları taslakları (public/gizlilik.html, kosullar.html) KVKK'ya uygun mu? Aydınlatma metni ayrıca gerekir mi?
   (Hiçbir veri toplanmıyor; her şey cihazda.)
2. 5651 Ek Madde 5 (oyunlar): Bireysel **oyun geliştirici** olarak bize düşen bir yükümlülük var mı (yaş derecelendirmesi bilgisi, ebeveyn kontrolü)?
   Mağazaların kendi derecelendirmesi (IARC / Apple) yeterli mi, yoksa Türkiye'ye özel bir derecelendirme beklenmeli mi?
3. Beta süresince oyunun web adresinde (GitHub Pages) açık durması, oyunu "derecelendirilmemiş" olarak sunmak sayılır mı?
   (Plan: web sürümü sadece test için, mağazaya çıkarken kaldırılacak.)
4. Sosyal ağ yönetmeliği (10 Ekim 2026, 15 yaş sınırı): Oyunun sosyal ağ sayılmadığı görüşümüz doğru mu?
   Ebeveynin cihazın paylaşma menüsüyle sertifika/özet paylaşması bunu değiştirir mi?
5. Kamera ile sayma (cihazda, görüntü kaydedilmeden/gönderilmeden): Gizlilik metnindeki açıklama yeterli mi?
6. Bireysel geliştirici olarak (20/B) mağazada satıcı adı ve iletişim adresi zorunlulukları.

## Teknik not (geliştirici için)

- Paket: Capacitor 7. `npm run magaza` → web derlemesi + `cap sync` (android/ ve ios/ klasörlerine kopyalar).
- Uygulama kimliği: `com.zipzipdunya.oyun` (mağazaya ilk gönderimden sonra **değiştirilemez**).
- İkon ve açılış ekranı kaynakları `assets/`; yeniden üretmek için `npx @capacitor/assets generate --iconBackgroundColor '#14213D' --splashBackgroundColor '#14213D'` (sonra oluşan `icons/` ve `public/manifest.webmanifest` silinmeli; PWA bildirimi vite.config.ts'de).
- Ekran yönü: sadece dikey (Android manifest, iOS Info.plist). Kamera izni: Android `CAMERA`, iOS `NSCameraUsageDescription`.

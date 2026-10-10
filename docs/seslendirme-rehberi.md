# Seslendirme rehberi

İki yol var. Betada **1. yol (Azure)** kullanılacak. Cümleler oturunca (beta sonrası) **2. yol (insan sesi)** değerlendirilecek.

---

## 1. Azure doğal ses (beta için, ücretsiz katman)

Hesabı siz açarsınız, sesleri ben üretirim. Anahtarı **sohbete yapıştırmayın**.

1. [azure.microsoft.com/free](https://azure.microsoft.com/free) adresinden ücretsiz Azure hesabı açın.
   Kimlik doğrulama için kredi kartı istenebilir. Ücretsiz katmanda para çekilmez. Yine de ücretli plana geçmeyin.
2. Azure portalında **"Speech service"** (Konuşma hizmeti) oluşturun:
   - Bölge (Region): **West Europe**
   - Fiyat katmanı (Pricing tier): **Free F0**
3. Oluşan kaynağın **"Keys and Endpoint"** (Anahtarlar) sayfasından **KEY 1** ve bölge adını alın.
4. Claude Code'da bu ortamın ayarlarına iki **gizli değişken** ekleyin:
   - `AZURE_TTS_KEY` = KEY 1
   - `AZURE_TTS_REGION` = `westeurope`
   (Yeri bilmiyorsanız "anahtarı nereye ekleyeceğim?" diye sorun, ekranı birlikte bulalım.)
5. Bana "Azure anahtarı eklendi" yazın. Ben 3-4 Türkçe ses örneği hazırlarım. Siz Yağız'la dinleyip Zıpzıp'ın sesini seçersiniz.
   Sonra bütün cümleler (`npm run seslendir`) o sesle kaydedilip oyuna eklenir.

Ücretsiz katman ayda yaklaşık 500.000 karakter içeriyor (güncel sınıra Azure'dan bakın). Bütün oyun metni yaklaşık 10.000 karakter.

---

## 2. Seslendirmen ya da ajans (insan sesi)

**Verilecek dosya:** `docs/seslendirme-metni.csv` (Excel ile açılır). Cümle değiştikçe yeniden üretilir: `npm run seslendirme-metni`.
Her satırda şunlar var: sıra, **dosya adı**, okunacak cümle, tür ve nasıl okunacağı.

### Ajansa gönderilecek kısa not (kopyalayıp gönderebilirsiniz)

> Merhaba, 4-9 yaş çocuklar için Türkçe bir hareket oyunu (Zıp Zıp Dünya) için seslendirme istiyoruz.
>
> **Karakter:** Zıpzıp. Kolları ve bacakları olan, gülen bir dünya maskotu. Neşeli, sıcak ve enerjik; ama bağırmadan konuşuyor. 6 yaşında bir çocuğun rahat anlayacağı hızda, net bir diksiyonla.
>
> **Metin:** Ekteki tabloda yaklaşık 250 kısa cümle var (toplam ~1.550 kelime, 10-15 dakika ses). "Nasıl okunmalı" sütununda her cümlenin tonu yazıyor: hareket komutu, kutlama, sakin soğuma, merak uyandıran bilgi ya da tek kelimelik sayılar.
>
> **Teslim:**
> - Her satır **ayrı bir MP3 dosyası** olsun. Dosya adı tablodaki "Dosya adı" sütunundaki gibi olsun (ör. `1a2b3c4d.mp3`).
> - Mono, 44.1 kHz, en az 64 kbps. Başta ve sonda en fazla 0,2 saniye sessizlik.
> - Gürültüsüz, eko olmayan stüdyo kaydı, bütün dosyalarda aynı ses seviyesi.
> - "Zıpzıp" kelimesi tek kelime gibi, iki "ı" net okunarak.
>
> **Haklar:** Kayıtların süresiz ve dünya çapında, uygulama içinde ve tanıtımda (mağaza videosu, sosyal medya) kullanım hakkı. Sonradan değişen birkaç cümle için ek kayıt ücretini de belirtir misiniz?

### Teslim alınca

Dosyaları bana gönderin ya da projeye ekleyin. Ben `public/ses/` klasörüne koyup kayıt listesini güncellerim.
Kaydı olan cümle o sesle çalar. Olmayan cümle (ör. sonradan eklenen) telefonun sesiyle okunmaya devam eder.

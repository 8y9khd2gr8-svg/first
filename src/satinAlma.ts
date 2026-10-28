import { Capacitor } from '@capacitor/core';

// Tam sürüm (tek seferlik ödeme). Türkiye Turu ücretsizdir; diğer bütün bölümler (bugünküler ve
// gelecekler) tek ödemeyle açılır. Abonelik yok, oyun içinde başka satış yok.
// Ödeme mağazanın kendi ekranında yapılır (Google Play / App Store); kart bilgisi oyuna hiç gelmez.
// Satın alım velinin mağaza hesabına bağlıdır: yeni telefonda aynı hesapla açılışta kendiliğinden
// ya da ebeveyn köşesindeki "Satın alımı geri yükle" ile geri gelir.
// Oyun bu telefonda sadece "tam sürüm alındı" bilgisini tutar (mağaza açılamasa da çalışsın diye).

// Mağazada (Play Console / App Store Connect) bu kimlikle "tüketilmeyen" ürün tanımlanır.
export const URUN_KIMLIGI = 'tam_surum';
const ANAHTAR = 'zipzip-tam-surum-v1';
// İade denetimi (K48, Android): mağazanın "satın alım yok" dediği ilk anın zamanı (sadece sayı). Bkz. magazayaSor.
const KONTROL_ANAHTARI = 'zipzip-tam-surum-kontrol-v1';
// Android'de iki "yok" cevabı arasında en az bu kadar süre olmalı (tek bir hatalı cevap ödeyen aileyi kilitlemesin).
export const IADE_BEKLEME_MS = 24 * 60 * 60 * 1000;

// magaza: mağazadan indirilen uygulama (gerçek ödeme).
// deneme: tarayıcıda adres sonunda ?odeme=deneme varsa sahte mağaza (ekranları denemek ve testler için).
// web: test sitesi; ödeme yok, bölümler eskisi gibi sırayla açılır.
export type OdemeKipi = 'magaza' | 'deneme' | 'web';

// Mağaza paketi `npm run magaza` ile derlenir (vite --mode magaza). Bu işaret derlemeye yazılır: uygulamanın
// köprüsü (Capacitor) herhangi bir nedenle sayfada olmasa bile kip 'web' olmaz, ödeme kilidi açılmaz (K50).
// O durumda mağazaya ulaşılamaz: fiyat gelmez, satın alma "tamamlanmadı" der; önceden ödeyen ailenin cihazdaki kaydı geçerli kalır.
const MAGAZA_PAKETI = import.meta.env?.MODE === 'magaza';

export function odemeKipi(uygulamada = Capacitor.isNativePlatform(), magazaPaketi = MAGAZA_PAKETI): OdemeKipi {
  if (uygulamada || magazaPaketi) return 'magaza';
  try {
    if (new URLSearchParams(location.search).get('odeme') === 'deneme') return 'deneme';
  } catch {
    // adres okunamadıysa test sitesi sayılır
  }
  return 'web';
}

export function tamSurumVarMi(): boolean {
  if (odemeKipi() === 'web') return true;
  try {
    return localStorage.getItem(ANAHTAR) === '1';
  } catch {
    return false;
  }
}

function kaydet() {
  try {
    localStorage.setItem(ANAHTAR, '1');
    localStorage.removeItem(KONTROL_ANAHTARI);
  } catch {
    // Kayıt olmasa da açılışta mağazaya sorulunca yine açılır.
  }
}

// İade edilen tam sürüm kapanır (K48). İlerleme, damga, rozet ve kostüm silinmez; sadece ücretli bölümler yeniden kilitlenir.
function kapat() {
  try {
    localStorage.removeItem(ANAHTAR);
    localStorage.removeItem(KONTROL_ANAHTARI);
  } catch {
    // Silinemezse tam sürüm açık kalır (ödeyen aile kilitlenmesin diye güvenli taraf).
  }
}

// Android'de mağaza "yok" dedi: ilk seferde sadece zamanı yazılır, en az 24 saat sonraki ikinci "yok"ta kapanır.
function yokCevabi(simdi: number) {
  try {
    const ilk = Number(localStorage.getItem(KONTROL_ANAHTARI));
    if (Number.isFinite(ilk) && ilk > 0 && ilk <= simdi) {
      if (simdi - ilk >= IADE_BEKLEME_MS) kapat();
      return;
    }
    localStorage.setItem(KONTROL_ANAHTARI, String(simdi));
  } catch {
    // Kayıt yazılamazsa hiçbir şey kapanmaz.
  }
}

// Ebeveyn köşesinde "Bu telefonda neler var?" için: iade denetimi başladı mı?
export function iadeDenetimiSuruyor(): boolean {
  try {
    return localStorage.getItem(KONTROL_ANAHTARI) !== null;
  } catch {
    return false;
  }
}

const eklenti = () => import('@capgo/native-purchases');

// Mağazanın gösterdiği fiyat (ülkenin parasıyla, ör. "₺149,99"). Mağazaya ulaşılamazsa null.
export async function fiyatGetir(): Promise<string | null> {
  const kip = odemeKipi();
  if (kip === 'deneme') return '₺149,99';
  if (kip !== 'magaza') return null;
  try {
    const { NativePurchases, PURCHASE_TYPE } = await eklenti();
    const { products } = await NativePurchases.getProducts({ productIdentifiers: [URUN_KIMLIGI], productType: PURCHASE_TYPE.INAPP });
    return products[0]?.priceString ?? null;
  } catch {
    return null;
  }
}

export type SatinAlmaSonucu = 'tamam' | 'bekliyor' | 'olmadi';

export async function satinAl(): Promise<SatinAlmaSonucu> {
  const kip = odemeKipi();
  if (kip === 'deneme') {
    kaydet();
    return 'tamam';
  }
  if (kip !== 'magaza') return 'olmadi';
  try {
    const { NativePurchases, PURCHASE_TYPE } = await eklenti();
    const islem = await NativePurchases.purchaseProduct({ productIdentifier: URUN_KIMLIGI, productType: PURCHASE_TYPE.INAPP, quantity: 1 });
    // Android: "1" ödendi, "0" onay bekliyor (ör. faturaya yazdırma). iOS'ta bu alan yoktur; dönen işlem ödenmiştir.
    if (islem.purchaseState !== undefined && islem.purchaseState !== '1') return 'bekliyor';
    kaydet();
    return 'tamam';
  } catch {
    // Veli vazgeçti ya da mağaza açılamadı: ikisinde de sadece "tamamlanmadı" denir.
    return 'olmadi';
  }
}

type Eklenti = Awaited<ReturnType<typeof eklenti>>;

// Velinin mağaza hesabındaki satın alımlarda tam sürüm var mı? Varsa kaydeder. true: tam sürüm bulundu.
// Android'de onayı sonradan gelen (bekleyen) ödeme burada onaylanır; onaylanmazsa Google 3 gün sonra iade eder.
// İade (K48, docs/k48-iade-tasarimi.md), sadece daha önce tam sürüm kaydı olan telefonda:
// - iPhone: Apple'ın imzaladığı işlem iade tarihiyle (revocationDate) gelirse ve geçerli başka işlem yoksa hemen kapanır.
//   Hiç işlem gelmezse (ör. Apple hesabı açık değil) hiçbir şey değişmez.
// - Android: iade edilen satın alım listeden kaybolur ama eklenti sorgu hatasını da boş liste olarak döndürür. Bu yüzden
//   "yok" sadece aynı anda ürün bilgisi de gelmişse (Play'e ulaşıldı) sayılır ve 24 saat arayla ikinci kez görülünce kapanır.
//   Arada "var" görülürse sayaç silinir. Onay bekleyen ödeme ("2") hiçbir şeyi değiştirmez.
export async function magazayaSor(
  e?: Eklenti,
  platform: string = Capacitor.getPlatform(),
  simdi: number = Date.now(),
): Promise<boolean> {
  const { NativePurchases, PURCHASE_TYPE } = e ?? (await eklenti());
  const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
  const bizim = purchases.filter((p) => p.productIdentifier === URUN_KIMLIGI);
  const alinan = bizim.find((p) => !p.revocationDate && (p.purchaseState === undefined || p.purchaseState === '1'));
  if (alinan) {
    if (alinan.isAcknowledged === false && alinan.purchaseToken) {
      await NativePurchases.acknowledgePurchase({ purchaseToken: alinan.purchaseToken }).catch(() => undefined);
    }
    kaydet();
    return true;
  }
  if (!tamSurumVarMi()) return false;
  if (platform === 'ios') {
    if (bizim.some((p) => p.revocationDate)) kapat();
  } else if (platform === 'android' && bizim.length === 0) {
    const { products } = await NativePurchases.getProducts({ productIdentifiers: [URUN_KIMLIGI], productType: PURCHASE_TYPE.INAPP }).catch(() => ({ products: [] }));
    if (products.some((u) => u.identifier === URUN_KIMLIGI)) yokCevabi(simdi);
  }
  return false;
}

// "Satın alımı geri yükle" (yeni telefon, silinen veriler). true: tam sürüm bulundu.
export async function geriYukle(): Promise<boolean> {
  const kip = odemeKipi();
  if (kip !== 'magaza') return tamSurumVarMi();
  try {
    const { NativePurchases } = await eklenti();
    await NativePurchases.restorePurchases().catch(() => undefined);
    return await magazayaSor();
  } catch {
    return false;
  }
}

// Açılışta sessizce: bu hesap tam sürümü almış mı? (Yeni telefon ya da "Tüm verileri sil" sonrası.)
// İnternet yoksa ya da mağaza cevap vermezse hiçbir şey değişmez; oyun normal açılır.
export function acilistaKontrolEt() {
  if (odemeKipi() !== 'magaza') return;
  magazayaSor().catch(() => undefined);
}

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

// magaza: mağazadan indirilen uygulama (gerçek ödeme).
// deneme: tarayıcıda adres sonunda ?odeme=deneme varsa sahte mağaza (ekranları denemek ve testler için).
// web: test sitesi; ödeme yok, bölümler eskisi gibi sırayla açılır.
export type OdemeKipi = 'magaza' | 'deneme' | 'web';

export function odemeKipi(): OdemeKipi {
  if (Capacitor.isNativePlatform()) return 'magaza';
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
  } catch {
    // Kayıt olmasa da açılışta mağazaya sorulunca yine açılır.
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

// Velinin mağaza hesabındaki satın alımlarda tam sürüm var mı? Varsa kaydeder.
// Android'de onayı sonradan gelen (bekleyen) ödeme burada onaylanır; onaylanmazsa Google 3 gün sonra iade eder.
async function magazayaSor(): Promise<boolean> {
  const { NativePurchases, PURCHASE_TYPE } = await eklenti();
  const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
  const alinan = purchases.find(
    (p) => p.productIdentifier === URUN_KIMLIGI && !p.revocationDate && (p.purchaseState === undefined || p.purchaseState === '1'),
  );
  if (!alinan) return false;
  if (alinan.isAcknowledged === false && alinan.purchaseToken) {
    await NativePurchases.acknowledgePurchase({ purchaseToken: alinan.purchaseToken }).catch(() => undefined);
  }
  kaydet();
  return true;
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

import type Phaser from 'phaser';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { ortakKamerayiKapat } from './kamera';

// Hareket yapılırken telefonun ekranı kararmasın (Yağız testi, 15 Ekim): çocuk ekrana dokunmadan 3-2-1 ile
// kendiliğinden geçmeyi beklerken telefonun otomatik kilidi ekranı karartıyordu.
// Tarayıcının "ekranı açık tut" özelliği (Wake Lock) bu ekranlardayken istenir, çıkınca bırakılır. Destek yoksa
// (eski telefon, bazı uygulama içi tarayıcılar) sessizce hiçbir şey yapılmaz; oyun aynen çalışır. Hiçbir şey kaydedilmez.
// Ödül ekranı da: durak bitince çocuk hâlâ 2-3 m uzakta olabilir, kutlamayı ve sıradaki adımı görmeli.
const ACIK_TUTULAN = ['Durak', 'Hareket', 'Odul', 'ZiplaDeneme', 'EbeveynKamera'];

type Kilit = { release: () => Promise<void>; addEventListener: (ad: 'release', f: () => void) => void };
let kilit: Kilit | null = null;
let isteniyor = false;
let istekSuruyor = false;
// Telefon reddettiyse (düşük güç modu, izin yok) her yarım saniyede yeniden sorulmaz: 10 sn beklenir (T5).
// Dokununca ya da sayfa geri gelince hemen yeniden denenir.
const RED_SONRA_BEKLE_MS = 10_000;
let sonRed = -Infinity;

async function kilitAl(hemen = false) {
  const wl = (navigator as Navigator & { wakeLock?: { request: (tur: 'screen') => Promise<Kilit> } }).wakeLock;
  if (!isteniyor || kilit || istekSuruyor || document.hidden || !wl) return;
  if (!hemen && performance.now() - sonRed < RED_SONRA_BEKLE_MS) return;
  istekSuruyor = true;
  try {
    const k = await wl.request('screen');
    k.addEventListener('release', () => kilit === k && (kilit = null));
    if (isteniyor) kilit = k;
    else void k.release();
  } catch {
    // Düşük güç modu ya da izin yok: ekran telefonun ayarına göre kararır, oyun etkilenmez.
    sonRed = performance.now();
  } finally {
    istekSuruyor = false;
  }
}

// Mağaza paketinde (Android/iPhone uygulaması) tarayıcının Wake Lock'ı her telefonda çalışmayabilir (Android uygulama içi
// tarayıcısı desteklemiyor); orada telefonun kendi "ekranı açık tut" ayarı eklentiyle açılır.
const uygulamada = Capacitor.isNativePlatform();
let uygulamadaAcik = false;

export function ekraniAcikTut(acik: boolean) {
  if (uygulamada) {
    if (acik === uygulamadaAcik) return;
    uygulamadaAcik = acik;
    void (acik ? KeepAwake.keepAwake() : KeepAwake.allowSleep()).catch(() => {});
    return;
  }
  isteniyor = acik;
  if (acik) void kilitAl();
  else if (kilit) {
    const k = kilit;
    kilit = null;
    void k.release().catch(() => {});
  }
}

// Oyun boyunca yarım saniyede bir bakılır: açık tutulan ekranlardan biri açıksa ekran açık kalır.
// Hareket ekranı her harekette yeniden başlar (bir kare kapalı görünür); bu yüzden kapatmak için iki ölçüm üst üste beklenir.
// Aynı ölçüm, hareketler arasında açık tutulan kamerayı da hareket ekranından çıkınca kapatır (kamera.ts ortakKamerayiKapat).
export function ekranIzle(oyun: Phaser.Game) {
  let kapaliSayisi = 0;
  let hareketYokSayisi = 0;
  const bak = () => {
    const acik = ACIK_TUTULAN.some((ad) => oyun.scene.isActive(ad));
    kapaliSayisi = acik ? 0 : kapaliSayisi + 1;
    if (acik) ekraniAcikTut(true);
    else if (kapaliSayisi >= 2) ekraniAcikTut(false);
    hareketYokSayisi = oyun.scene.isActive('Hareket') ? 0 : hareketYokSayisi + 1;
    if (hareketYokSayisi >= 2) ortakKamerayiKapat();
  };
  setInterval(bak, 500);
  // Sayfa geri gelince (ekran kilidinden dönüş) ya da dokununca kilit yeniden istenir (bazı tarayıcılar dokunuş ister).
  document.addEventListener('visibilitychange', () => void kilitAl(true));
  document.addEventListener('pointerdown', () => void kilitAl(true));
}

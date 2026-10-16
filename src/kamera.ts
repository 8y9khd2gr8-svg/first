// Kamera ile sayma (deneme). Ebeveyn köşesinden açılır, varsayılan kapalı.
// Vücut noktalarını Google'ın MediaPipe modeli bulur; model ve çalışma dosyaları oyunun
// içinde (public/mediapipe) durur. Görüntü telefonun içinde işlenir: kaydedilmez,
// hiçbir yere gönderilmez. Kamera yalnızca hareket ekranında açık kalır.
import type { NormalizedLandmark, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Animasyon } from './hareketler';

const ANAHTAR = 'zipzip-kamera-v1';

export const kameraAcikMi = () => localStorage.getItem(ANAHTAR) === '1';
export const kameraAyarla = (acik: boolean) => (acik ? localStorage.setItem(ANAHTAR, '1') : localStorage.removeItem(ANAHTAR));
// Pakette MediaPipe'in sadece hızlı (SIMD) hâli var; yavaş kopyası 9 MB olduğu için çıkarıldı.
// SIMD'i olmayan eski telefonlarda (ör. iOS 16.4'ten eski) kamera seçeneği hiç görünmez, oyun aynen çalışır.
const SIMD_DENEME = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
export const simdVarMi = () => {
  try {
    return typeof WebAssembly === 'object' && WebAssembly.validate(SIMD_DENEME);
  } catch {
    return false;
  }
};
export const kameraDesteklenir = () => !!navigator.mediaDevices?.getUserMedia && simdVarMi();

// Kameranın sayabildiği hareketler ve nasıl sayıldıkları. Birbirine benzeyen hareketler aynı yolla sayılır
// (ör. "çömel, sonra yüksel, kollarını aç" da bir çömelmedir). Listede olmayan harekette kamera açılmaz.
type SaymaYolu = 'kollar' | 'comel' | 'zipla' | 'dizler' | 'acKapa' | 'yanAdim';
const SAYMA_YOLU: Partial<Record<Animasyon, SaymaYolu>> = {
  kollar: 'kollar', uzan: 'kollar', basket: 'kollar', tasKaldir: 'kollar',
  comel: 'comel', balon: 'comel', yumurta: 'comel',
  zipla: 'zipla', engel: 'zipla',
  dizler: 'dizler', tirman: 'dizler',
  acKapa: 'acKapa',
  yanAdim: 'yanAdim',
};
export const KAMERA_HAREKETLERI = Object.keys(SAYMA_YOLU) as Animasyon[];

// Vücut noktalarının numaraları (MediaPipe Pose).
export const BURUN = 0, SOL_OMUZ = 11, SAG_OMUZ = 12, SOL_BILEK = 15, SAG_BILEK = 16, SOL_KALCA = 23, SAG_KALCA = 24, SOL_DIZ = 25, SAG_DIZ = 26, SOL_TOPUK = 27, SAG_TOPUK = 28;

let modelSozu: Promise<PoseLandmarker> | null = null;

// Model ilk kullanımda yüklenir (oyunun açılışını yavaşlatmasın diye ayrı parça).
function modelYukle(): Promise<PoseLandmarker> {
  modelSozu ??= (async () => {
    const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
    const kok = new URL('mediapipe/', document.baseURI).href;
    const dosyalar = await FilesetResolver.forVisionTasks(kok);
    const kur = (delegate: 'GPU' | 'CPU') =>
      PoseLandmarker.createFromOptions(dosyalar, {
        baseOptions: { modelAssetPath: kok + 'pose_landmarker_lite.task', delegate },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
    // Ekran kartı (GPU) daha hızlı; olmayan telefonlarda işlemciyle (CPU) çalışır.
    return kur('GPU').catch(() => kur('CPU'));
  })();
  modelSozu.catch(() => (modelSozu = null));
  return modelSozu;
}

// durdu: kamera açıldıktan sonra görüntü kesildi (ekran kilidi, uygulama değişimi, başka uygulama kamerayı aldı).
export type KameraDurumu = 'yukleniyor' | 'goremiyorum' | 'goruyorum' | 'durdu' | 'hata';
// Kamera açılamayınca nedeni (ebeveyn ekranları ayrı yazı gösterir): kamera yok / izin verilmedi / başka bir sorun.
export type KameraHatasi = 'kameraYok' | 'izinYok' | 'diger';
export const kameraHatasi = (e: unknown): KameraHatasi => {
  const ad = (e as { name?: string } | null)?.name;
  if (ad === 'NotFoundError' || ad === 'OverconstrainedError' || ad === 'DevicesNotFoundError') return 'kameraYok';
  if (ad === 'NotAllowedError' || ad === 'SecurityError' || ad === 'PermissionDeniedError') return 'izinYok';
  return 'diger';
};
// Ebeveyn ekranlarındaki (kamera denemesi, Zıpzıp da zıplasın) durum yazısı. Oyundaki hareket ekranı kendi kısa yazısını kullanır.
export const kameraDurumYazisi = (d: KameraDurumu, hata: KameraHatasi | null, goruyorum: string, goremiyorum = 'Baştan ayağa görünmeli: biraz geri gidin') =>
  d === 'yukleniyor' ? 'Kamera hazırlanıyor…'
  : d === 'goremiyorum' ? goremiyorum
  : d === 'goruyorum' ? goruyorum
  : d === 'durdu' ? '⏸ Kamera durdu.\n⌂ ile çıkıp kamerayı yeniden açın.'
  : hata === 'kameraYok' ? 'Bu cihazda kamera bulunamadı.'
  : hata === 'izinYok' ? 'Kameraya izin verilmedi.\nTelefonun ayarlarından izin verin.'
  : 'Kamera açılamadı.';
// Bu kadar süre yeni kare gelmezse kamera durmuş sayılır (görüntü geri gelirse durum kendiliğinden düzelir).
export const KAMERA_DURDU_MS = 2000;
// Sayfa gizliyken (ekran kilidi) döngü durur; dönüşte bu kadar uzun ara görülürse bekleme baştan sayılır.
const DONGU_ARASI_EN_COK_MS = 1000;

// Zıplama inişte sayılır; bir önceki sayılan inişten bu kadar kısa sürede gelen iniş aynı zıplamanın
// sarsıntısı sayılır (çift tetik koruması). Çocuk saniyede en çok 2-3 kez zıplayabilir.
export const ZIPLAMA_EN_AZ_ARA_MS = 400;
// Bir zıplamada havada kalma en çok yarım saniye kadardır. "Havada" durumu bundan çok uzun sürerse bu bir zıplama değildir
// (ör. çömelip kalkınca omuzlar ayakta durulan yerden yüksek görünür); sayılmadan bırakılır, taban yeniden ölçülür.
export const ZIPLAMA_EN_UZUN_HAVA_MS = 1000;

// Bir hareketin tekrarlarını sayar. Eşikler vücut boyuna göre (omuz-topuk mesafesi)
// oranlanır; böylece çocuğun kameraya uzaklığı önemli olmaz.
export class Sayici {
  sayi = 0;
  private yukarida = false;
  private taban: number | null = null;
  private yol: SaymaYolu | undefined;
  private kalkanDiz: number | null = null; // dizler: o an havadaki diz
  private taraf: -1 | 0 | 1 = 0; // yana adım: gövde ortanın solunda mı sağında mı
  private sonInis = -Infinity; // zıpla: son sayılan inişin zamanı (ms)
  private havalanma = 0; // zıpla: "havada" durumuna geçilen zaman (ms)

  constructor(animasyon: Animasyon) {
    this.yol = SAYMA_YOLU[animasyon];
  }

  // zaman: karenin zamanı (ms); testler yapay zaman verir.
  besle(n: NormalizedLandmark[], zaman = performance.now()) {
    const gorunur = (i: number) => (n[i]?.visibility ?? 0) > 0.5;
    const orta = (a: number, b: number) => (n[a].y + n[b].y) / 2;
    const omuz = orta(SOL_OMUZ, SAG_OMUZ);
    const kalca = orta(SOL_KALCA, SAG_KALCA);
    const topuk = orta(SOL_TOPUK, SAG_TOPUK);
    const boy = topuk - omuz;
    if (boy <= 0.05) return;

    if (this.yol === 'kollar') {
      // İki bilek de başın üstündeyse "yukarı", omuzların altına inince bir tekrar.
      if (!gorunur(SOL_BILEK) || !gorunur(SAG_BILEK)) return;
      const bilek = Math.max(n[SOL_BILEK].y, n[SAG_BILEK].y);
      if (!this.yukarida && bilek < n[BURUN].y) this.yukarida = true;
      else if (this.yukarida && bilek > omuz + 0.1 * boy) {
        this.yukarida = false;
        this.sayi++;
      }
    } else if (this.yol === 'comel') {
      // Kalça topuğa yaklaşınca "aşağı", tekrar yükselince bir tekrar.
      const oran = (topuk - kalca) / boy; // ayakta ~0.55, çömelince küçülür
      if (!this.yukarida && oran < 0.35) this.yukarida = true;
      else if (this.yukarida && oran > 0.48) {
        this.yukarida = false;
        this.sayi++;
      }
    } else if (this.yol === 'zipla') {
      // Omuzlar ayakta durulan yükseklikten (taban) belirgin yükselince bir sıçrama.
      // Taban yavaşça güncellenir; sıçrama anında değişmez.
      if (this.taban === null) this.taban = omuz;
      if (!this.yukarida) this.taban = this.taban * 0.9 + omuz * 0.1;
      const yukselme = (this.taban - omuz) / boy;
      if (!this.yukarida && yukselme > 0.07) {
        this.yukarida = true;
        this.havalanma = zaman;
      } else if (this.yukarida && yukselme < 0.025) {
        this.yukarida = false;
        if (zaman - this.sonInis >= ZIPLAMA_EN_AZ_ARA_MS) {
          this.sayi++;
          this.sonInis = zaman;
        }
      } else if (this.yukarida && zaman - this.havalanma > ZIPLAMA_EN_UZUN_HAVA_MS) {
        // Takılma koruması: sayılmaz, çocuğun şimdiki duruşu yeni taban olur.
        this.yukarida = false;
        this.taban = omuz;
      }
    } else if (this.yol === 'dizler') {
      // Bir diz kalçaya yaklaşınca "kalktı", yeniden aşağı inince bir tekrar (her diz ayrı sayılır).
      // Boy yerdeki ayağa göre ölçülür (havadaki ayak boyu kısaltmasın).
      if (!gorunur(SOL_DIZ) || !gorunur(SAG_DIZ)) return;
      const yerdeki = Math.max(n[SOL_TOPUK].y, n[SAG_TOPUK].y);
      const ayaktaBoy = yerdeki - omuz;
      if (this.kalkanDiz === null) {
        for (const diz of [SOL_DIZ, SAG_DIZ]) if ((n[diz].y - kalca) / ayaktaBoy < 0.14) this.kalkanDiz = diz;
      } else if ((n[this.kalkanDiz].y - kalca) / ayaktaBoy > 0.2) {
        this.kalkanDiz = null;
        this.sayi++;
      }
    } else if (this.yol === 'acKapa') {
      // Ayaklar omuz genişliğinin belirgin dışına açılınca "açık", yeniden yaklaşınca bir tekrar.
      const omuzGenisligi = Math.abs(n[SOL_OMUZ].x - n[SAG_OMUZ].x);
      if (omuzGenisligi < 0.02) return;
      const aciklik = Math.abs(n[SOL_TOPUK].x - n[SAG_TOPUK].x) / omuzGenisligi;
      if (!this.yukarida && aciklik > 1.6) this.yukarida = true;
      else if (this.yukarida && aciklik < 1.1) {
        this.yukarida = false;
        this.sayi++;
      }
    } else if (this.yol === 'yanAdim') {
      // Kalça ortası, durduğu yerin (taban) bir yanına geçip öbür yanına geçince bir adım.
      const x = (n[SOL_KALCA].x + n[SAG_KALCA].x) / 2;
      if (this.taban === null) this.taban = x;
      const kayma = (x - this.taban) / boy;
      const yeniTaraf = kayma > 0.06 ? 1 : kayma < -0.06 ? -1 : 0;
      if (yeniTaraf !== 0 && yeniTaraf !== this.taraf) {
        this.sayi++;
        this.taraf = yeniTaraf;
      }
      // Çocuk zamanla yerinden kayarsa taban da çok yavaş onu izler.
      this.taban = this.taban * 0.995 + x * 0.005;
    }
  }
}

// Kamera denemesinde ebeveynin gördüğü ölçüm (telefon ne kadar hızlı tanıyor?). Sadece bellekte; kaydedilmez.
export type KameraOlcumu = {
  tanimaOrtMs: number; // son tanımaların ortalama süresi
  tanimaEnKotuMs: number; // son tanımaların en uzunu
  saniyedeTanima: number; // son 2 saniyede saniyede kaç kare tanındı
  sonSayimMs: number | null; // son sayılan tekrarda: kare alındıktan sayılana kadar geçen süre
};
const OLCUM_PENCERESI = 30;

// Hareket ekranında açılan kamera: küçük önizleme ve sayma.
// Oyundaki hareket ekranının kamerası hareketler arasında açık kalır (görüntü işlenmez): her harekette kamera yeniden
// açılınca iPhone (özellikle ana ekrana eklenen uygulama) her seferinde izin soruyordu (Yağız testi, 15 Ekim).
// Hareket ekranından çıkınca ekranAcik.ts en geç ~1 sn içinde kapatır. Ebeveyn kamera ekranları bunu kullanmaz.
let ortakAkis: MediaStream | null = null;
const KAMERA_AYARI: MediaStreamConstraints = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };

async function kameraAc(ortak: boolean): Promise<MediaStream> {
  if (!ortak) return navigator.mediaDevices.getUserMedia(KAMERA_AYARI);
  if (ortakAkis && ortakAkis.getVideoTracks().every((t) => t.readyState === 'live')) return ortakAkis;
  ortakKamerayiKapat();
  ortakAkis = await navigator.mediaDevices.getUserMedia(KAMERA_AYARI);
  return ortakAkis;
}

export function ortakKamerayiKapat() {
  ortakAkis?.getTracks().forEach((t) => t.stop());
  ortakAkis = null;
}

export class KameraSayaci {
  durum: KameraDurumu = 'yukleniyor';
  hata: KameraHatasi | null = null;
  private sureler: number[] = [];
  private tanimaZamanlari: number[] = [];
  private sonSayimMs: number | null = null;
  private video = document.createElement('video');
  private akis: MediaStream | null = null;
  private sayici: Sayici;
  private kare = 0;
  private bitti = false;

  // noktalarGelince: her karede bulunan vücut noktaları (kamera denemesi ekranı çizer); kimse yoksa undefined.
  constructor(
    animasyon: Animasyon,
    private degisince: (sayi: number, durum: KameraDurumu) => void,
    private noktalarGelince?: (n: NormalizedLandmark[] | undefined) => void,
    // ortak: oyundaki hareket ekranı; kamera hareketler arasında kapanmaz (ortakKamerayiKapat kapatır).
    private ortak = false,
  ) {
    this.sayici = new Sayici(animasyon);
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
  }

  get sayi() {
    return this.sayici.sayi;
  }

  // Önizleme için video öğesi (ayna gibi ters çevrilmiş gösterilir).
  get onizleme(): HTMLVideoElement {
    return this.video;
  }

  async baslat() {
    let acilan: Promise<MediaStream> | undefined;
    try {
      acilan = kameraAc(this.ortak);
      const [model, akis] = await Promise.all([modelYukle(), acilan]);
      if (this.bitti) {
        if (!this.ortak) akis.getTracks().forEach((t) => t.stop());
        return;
      }
      this.akis = akis;
      this.video.srcObject = akis;
      await this.video.play();
      this.bildir('goremiyorum');
      const izler = akis.getVideoTracks();
      izler.forEach((t) => t.addEventListener('ended', () => !this.bitti && this.bildir('durdu')));
      let sonZaman = -1;
      let sonKare = performance.now();
      let sonDongu = sonKare;
      // Yavaş telefonda tanıma uzun sürer ve oyunu (sayaç, Zıpzıp) takıltır: her tanımadan sonra
      // onun sürdüğü kadar ara verilir, zamanın en çok yarısı tanımaya gider (hızlı telefonda ~30 ms: saniyede ~15 tanıma, sayma için yeter).
      let siradakiTanima = 0;
      const dongu = () => {
        if (this.bitti) return;
        const simdi = performance.now();
        if (simdi - sonDongu > DONGU_ARASI_EN_COK_MS) sonKare = simdi; // sayfa gizliydi: kameraya geri gelme payı
        sonDongu = simdi;
        if (this.video.currentTime !== sonZaman) sonKare = simdi;
        // Bitmiş ya da susturulmuş iz (iPhone kamerayı başka uygulamaya verince "mute" olur) görüntü vermez.
        const izBitti = izler.some((t) => t.readyState === 'ended' || t.muted);
        if (izBitti || simdi - sonKare > KAMERA_DURDU_MS) {
          if (this.durum !== 'durdu') this.bildir('durdu');
        } else if (this.video.readyState >= 2 && this.video.currentTime !== sonZaman && simdi >= siradakiTanima) {
          sonZaman = this.video.currentTime;
          const sonuc = model.detectForVideo(this.video, simdi);
          const bitis = performance.now();
          siradakiTanima = 2 * bitis - simdi;
          this.olcumEkle(simdi, bitis - simdi);
          const n = sonuc.landmarks[0];
          this.noktalarGelince?.(n);
          // Tüm vücut (omuzlar ve topuklar) görünüyor mu?
          const tamGorunuyor = !!n && [SOL_OMUZ, SAG_OMUZ, SOL_TOPUK, SAG_TOPUK].every((i) => (n[i]?.visibility ?? 0) > 0.5);
          if (tamGorunuyor) {
            const once = this.sayici.sayi;
            this.sayici.besle(n, simdi);
            if (once !== this.sayici.sayi) this.sonSayimMs = performance.now() - simdi;
            if (this.durum !== 'goruyorum' || once !== this.sayici.sayi) this.bildir('goruyorum');
          } else if (this.durum !== 'goremiyorum') this.bildir('goremiyorum');
        }
        this.kare = requestAnimationFrame(dongu);
      };
      dongu();
    } catch (e) {
      // Model yüklenemedi (eski/zayıf telefon) ama kamera açıldıysa: ebeveyn ekranlarında kamera açık (ışığı yanık) kalmasın.
      // Oyundaki ortak kamera hareket ekranından çıkınca zaten kapanır.
      if (!this.ortak) void acilan?.then((a) => a.getTracks().forEach((t) => t.stop()), () => undefined);
      this.hata = kameraHatasi(e);
      this.bildir('hata');
    }
  }

  get olcum(): KameraOlcumu {
    const s = this.sureler;
    const simdi = performance.now();
    return {
      tanimaOrtMs: s.length ? s.reduce((a, b) => a + b, 0) / s.length : 0,
      tanimaEnKotuMs: s.length ? Math.max(...s) : 0,
      saniyedeTanima: this.tanimaZamanlari.filter((z) => simdi - z <= 2000).length / 2,
      sonSayimMs: this.sonSayimMs,
    };
  }

  private olcumEkle(zaman: number, sure: number) {
    this.sureler.push(sure);
    if (this.sureler.length > OLCUM_PENCERESI) this.sureler.shift();
    this.tanimaZamanlari.push(zaman);
    while (this.tanimaZamanlari.length && zaman - this.tanimaZamanlari[0] > 2000) this.tanimaZamanlari.shift();
  }

  // Kamera denemesi: başka bir hareketi saymaya baştan başlar (kamera kapanmadan).
  yolDegistir(animasyon: Animasyon) {
    this.sayici = new Sayici(animasyon);
    this.bildir(this.durum);
  }

  durdur() {
    this.bitti = true;
    cancelAnimationFrame(this.kare);
    if (!this.ortak) this.akis?.getTracks().forEach((t) => t.stop());
    this.video.srcObject = null;
  }

  private bildir(durum: KameraDurumu) {
    this.durum = durum;
    this.degisince(this.sayici.sayi, durum);
  }
}

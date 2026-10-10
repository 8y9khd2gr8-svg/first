// Kamera ile sayma (deneme). Ebeveyn köşesinden açılır, varsayılan kapalı.
// Vücut noktalarını Google'ın MediaPipe modeli bulur; model ve çalışma dosyaları oyunun
// içinde (public/mediapipe) durur. Görüntü telefonun içinde işlenir: kaydedilmez,
// hiçbir yere gönderilmez. Kamera yalnızca hareket ekranında açık kalır.
import type { NormalizedLandmark, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Animasyon } from './hareketler';

const ANAHTAR = 'zipzip-kamera-v1';

export const kameraAcikMi = () => localStorage.getItem(ANAHTAR) === '1';
export const kameraAyarla = (acik: boolean) => (acik ? localStorage.setItem(ANAHTAR, '1') : localStorage.removeItem(ANAHTAR));
export const kameraDesteklenir = () => !!navigator.mediaDevices?.getUserMedia;

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

export type KameraDurumu = 'yukleniyor' | 'goremiyorum' | 'goruyorum' | 'hata';

// Bir hareketin tekrarlarını sayar. Eşikler vücut boyuna göre (omuz-topuk mesafesi)
// oranlanır; böylece çocuğun kameraya uzaklığı önemli olmaz.
export class Sayici {
  sayi = 0;
  private yukarida = false;
  private taban: number | null = null;
  private yol: SaymaYolu | undefined;
  private kalkanDiz: number | null = null; // dizler: o an havadaki diz
  private taraf: -1 | 0 | 1 = 0; // yana adım: gövde ortanın solunda mı sağında mı

  constructor(animasyon: Animasyon) {
    this.yol = SAYMA_YOLU[animasyon];
  }

  besle(n: NormalizedLandmark[]) {
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
      if (!this.yukarida && yukselme > 0.07) this.yukarida = true;
      else if (this.yukarida && yukselme < 0.025) {
        this.yukarida = false;
        this.sayi++;
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

// Hareket ekranında açılan kamera: küçük önizleme ve sayma.
export class KameraSayaci {
  durum: KameraDurumu = 'yukleniyor';
  private video = document.createElement('video');
  private akis: MediaStream | null = null;
  private sayici: Sayici;
  private kare = 0;
  private bitti = false;

  constructor(animasyon: Animasyon, private degisince: (sayi: number, durum: KameraDurumu) => void) {
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
    try {
      const [model, akis] = await Promise.all([
        modelYukle(),
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
      ]);
      if (this.bitti) {
        akis.getTracks().forEach((t) => t.stop());
        return;
      }
      this.akis = akis;
      this.video.srcObject = akis;
      await this.video.play();
      this.bildir('goremiyorum');
      let sonZaman = -1;
      const dongu = () => {
        if (this.bitti) return;
        if (this.video.readyState >= 2 && this.video.currentTime !== sonZaman) {
          sonZaman = this.video.currentTime;
          const sonuc = model.detectForVideo(this.video, performance.now());
          const n = sonuc.landmarks[0];
          // Tüm vücut (omuzlar ve topuklar) görünüyor mu?
          const tamGorunuyor = !!n && [SOL_OMUZ, SAG_OMUZ, SOL_TOPUK, SAG_TOPUK].every((i) => (n[i]?.visibility ?? 0) > 0.5);
          if (tamGorunuyor) {
            const once = this.sayici.sayi;
            this.sayici.besle(n);
            if (this.durum !== 'goruyorum' || once !== this.sayici.sayi) this.bildir('goruyorum');
          } else if (this.durum !== 'goremiyorum') this.bildir('goremiyorum');
        }
        this.kare = requestAnimationFrame(dongu);
      };
      dongu();
    } catch {
      this.bildir('hata');
    }
  }

  durdur() {
    this.bitti = true;
    cancelAnimationFrame(this.kare);
    this.akis?.getTracks().forEach((t) => t.stop());
    this.video.srcObject = null;
  }

  private bildir(durum: KameraDurumu) {
    this.durum = durum;
    this.degisince(this.sayici.sayi, durum);
  }
}

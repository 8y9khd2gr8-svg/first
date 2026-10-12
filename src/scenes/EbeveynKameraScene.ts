import Phaser from 'phaser';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, genisDokunma, yildizliArkaPlan } from '../arayuz';
import type { Animasyon } from '../hareketler';
import { KameraSayaci, type KameraDurumu } from '../kamera';
import { bip } from '../ses';

// Kamera denemesi (ebeveyn köşesi): kameranın neyi gördüğünü ve nasıl saydığını canlı gösterir.
// Yağız testinde eşikleri ayarlamak için: hangi hareketi kaçırıyor, hangisini fazla sayıyor?
// Görüntü sadece ekranda gösterilir; kaydedilmez, gönderilmez. Sayılar özete eklenmez.
const YOLLAR: [string, Animasyon][] = [
  ['Kollar', 'kollar'], ['Çömel', 'comel'], ['Zıpla', 'zipla'],
  ['Dizler', 'dizler'], ['Ayak aç-kapa', 'acKapa'], ['Yana adım', 'yanAdim'],
];

// Vücut noktalarını birleştiren çizgiler (omuzlar, kollar, gövde, bacaklar).
const KEMIKLER: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
];

const DURUM_YAZISI: Record<KameraDurumu, string> = {
  yukleniyor: 'Kamera hazırlanıyor…',
  goremiyorum: 'Baştan ayağa görünmeli: biraz geri gidin',
  goruyorum: '✅ Bütün vücut görünüyor',
  hata: 'Kamera açılamadı (izin verilmedi mi?)',
};

export class EbeveynKameraScene extends Phaser.Scene {
  private kamera: KameraSayaci | null = null;
  private secili: Animasyon = 'zipla';

  constructor() {
    super('EbeveynKamera');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const geri = () => this.scene.start('EbeveynMenu', {});
    evDugmesi(this, geri);
    this.add.text(x, 160, 'Kamera denemesi', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '60px', color: '#FFC93C' }).setOrigin(0.5);

    // Önizleme kutusu: video ve üstünde vücut noktaları (ayna gibi ters çevrilmiş).
    const kutu = document.createElement('div');
    kutu.style.cssText = 'width:440px;height:330px;border-radius:20px;overflow:hidden;background:#0b1430;border:4px solid #FFC93C;position:relative;';
    // Ayna: Phaser dış kutunun transform'unu yerleştirme için kullanır, ters çevirme iç kutuda.
    const ayna = document.createElement('div');
    ayna.style.cssText = 'position:absolute;inset:0;transform:scaleX(-1);';
    kutu.append(ayna);
    const tuval = document.createElement('canvas');
    tuval.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;';
    this.add.dom(x, 395, kutu);

    const durum = this.add.text(x, 595, '', { fontFamily: YAZI_TIPI, fontSize: '30px', color: '#cfe3ff' }).setOrigin(0.5);
    const sayi = this.add.text(x, 650, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '60px', color: '#ffffff' }).setOrigin(0.5);
    // Ölçüm satırı (ebeveyn için; telefon ne kadar hızlı tanıyor?). Hiçbir şey kaydedilmez; ekran görüntüsüyle paylaşılır.
    const olcum = this.add.text(x, 722, '', { fontFamily: YAZI_TIPI, fontSize: '22px', color: '#9fb6d9', align: 'center' }).setOrigin(0.5);
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!this.kamera || this.kamera.durum === 'yukleniyor' || this.kamera.durum === 'hata') return;
        const o = this.kamera.olcum;
        const ms = (v: number) => `${Math.round(v)} ms`;
        olcum.setText(
          `Tanıma ${ms(o.tanimaOrtMs)} (en uzun ${ms(o.tanimaEnKotuMs)}) · ${o.saniyedeTanima.toFixed(1)} tanıma/sn\n` +
            `Oyun ${Math.round(this.game.loop.actualFps)} kare/sn · Son sayım ${o.sonSayimMs === null ? '–' : ms(o.sonSayimMs)}`,
        );
      },
    });

    // Kamera kendiliğinden açılmaz; ebeveyn dokununca açılır. Düğme kutunun altında: kutu (sayfa öğesi)
    // oyun tuvalinin üstünde durur, düğme kutunun içinde olsaydı görünmezdi.
    const ac = buyukDugme(this, x, 635, '📷 Kamerayı aç', RENK.yesil, () => {
      ac.destroy();
      let sonSayi = 0;
      const kamera = new KameraSayaci(
        this.secili,
        (n, d) => {
          durum.setText(DURUM_YAZISI[d]);
          sayi.setText(`Sayı: ${n}`);
          if (n > sonSayi) bip(990, 0.12);
          sonSayi = n;
        },
        (noktalar) => ciz(tuval, kamera.onizleme, noktalar),
      );
      const video = kamera.onizleme;
      video.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      ayna.append(video, tuval);
      this.kamera = kamera;
      void kamera.baslat();
    }, { genislik: 420, yukseklik: 110, yaziBoyu: 44 });

    // Hangi hareket sayılsın? Seçince sayı sıfırlanır. Seçili olan renkle birlikte ✓ ile de belli olur (renk körlüğü).
    let dugmeler: Phaser.GameObjects.Container[] = [];
    const dugmeleriCiz = () => {
      dugmeler.forEach((d) => d.destroy());
      dugmeler = YOLLAR.map(([ad, animasyon], i) =>
        buyukDugme(this, x + ((i % 2) - 0.5) * 320, 790 + Math.floor(i / 2) * 92, animasyon === this.secili ? `✓ ${ad}` : ad, animasyon === this.secili ? RENK.turuncu : RENK.mavi, () => {
          this.secili = animasyon;
          this.kamera?.yolDegistir(animasyon);
          dugmeleriCiz();
        }, { genislik: 300, yukseklik: 80, yaziBoyu: 38 }),
      );
    };
    dugmeleriCiz();

    genisDokunma(
      this.add.text(x, 1056, '↺ Sayıyı sıfırla', { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 14 } }).setOrigin(0.5),
    ).on('pointerdown', () => this.kamera?.yolDegistir(this.secili));

    this.add
      .text(x, 1122, 'Görüntü kaydedilmez, hiçbir yere gönderilmez.\nBu denemedeki sayılar özete eklenmez.', { fontFamily: YAZI_TIPI, fontSize: '25px', color: '#9fb6d9', align: 'center' })
      .setOrigin(0.5);
    buyukDugme(this, x, 1210, 'Tamam', RENK.mavi, geri, { genislik: 360, yukseklik: 100, yaziBoyu: 44 });

    this.events.once('shutdown', () => {
      this.kamera?.durdur();
      this.kamera = null;
    });
  }
}

// Bulunan vücut noktalarını ve aralarındaki çizgileri video boyutunda çizer.
function ciz(tuval: HTMLCanvasElement, video: HTMLVideoElement, n: NormalizedLandmark[] | undefined) {
  const g = tuval.width = video.videoWidth || 640;
  const y = tuval.height = video.videoHeight || 480;
  const c = tuval.getContext('2d');
  if (!c || !n) return;
  const gorunur = (i: number) => (n[i]?.visibility ?? 0) > 0.5;
  c.lineWidth = 6;
  c.strokeStyle = '#FFC93C';
  for (const [a, b] of KEMIKLER) {
    if (!gorunur(a) || !gorunur(b)) continue;
    c.beginPath();
    c.moveTo(n[a].x * g, n[a].y * y);
    c.lineTo(n[b].x * g, n[b].y * y);
    c.stroke();
  }
  c.fillStyle = '#2FA84F';
  n.forEach((p, i) => {
    if (i < 11 && i !== 0) return; // yüzdeki noktalar kalabalık etmesin (burun kalır)
    if (!gorunur(i)) return;
    c.beginPath();
    c.arc(p.x * g, p.y * y, 9, 0, Math.PI * 2);
    c.fill();
  });
}

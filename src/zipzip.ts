import Phaser from 'phaser';
import type { Animasyon } from './hareketler';

// Zıpzıp: gövde (yüzlü dünya) + ayrı ayrı dönebilen iki kol ve iki bacak.
// Tüm ölçüler maskot çiziminin birimleriyle; "birim" bir çizim biriminin ekranda kaç piksel olduğu.

const KOL_RENGI = 0xffb627;
const AYAKKABI_RENGI = 0xff6b6b;
const KOL_BOYU = 72;
const BACAK_BOYU = 52;
const KALINLIK = 13;

// Bir duruş: uzuvların açıları (derece, 0 = sağa, 90 = aşağı) ve bacak boyları (1 = düz, 0.5 = bükülü).
type Durus = {
  solKol: number;
  sagKol: number;
  solBacak: number;
  sagBacak: number;
  solBacakBoy?: number;
  sagBacakBoy?: number;
};

const D: Record<string, Durus> = {
  normal: { solKol: -132, sagKol: -48, solBacak: 112, sagBacak: 68 },
  yukari: { solKol: -100, sagKol: -80, solBacak: 100, sagBacak: 80 },
  comel: { solKol: 180, sagKol: 0, solBacak: 150, sagBacak: 30, solBacakBoy: 0.75, sagBacakBoy: 0.75 },
  kanatYukari: { solKol: -155, sagKol: -25, solBacak: 105, sagBacak: 75 },
  kanatAsagi: { solKol: 150, sagKol: 30, solBacak: 105, sagBacak: 75 },
  yildizAcik: { solKol: -160, sagKol: -20, solBacak: 130, sagBacak: 50 },
  yildizKapali: { solKol: 105, sagKol: 75, solBacak: 96, sagBacak: 84 },
  kosA: { solKol: -150, sagKol: -95, solBacak: 70, sagBacak: 95, solBacakBoy: 0.75 },
  kosB: { solKol: -85, sagKol: -30, solBacak: 85, sagBacak: 110, sagBacakBoy: 0.75 },
  leylek: { solKol: -175, sagKol: -5, solBacak: 92, sagBacak: 35, sagBacakBoy: 0.8 },
};

// Bir tekrar içindeki adımlar: duruş, gövdenin yukarı/aşağı kayması (birim) ve tekrar süresine oranı.
type Adim = { durus: Durus; y: number; oran: number; yumusama?: string };

const ADIMLAR: Record<Animasyon, Adim[]> = {
  zipla: [
    { durus: D.yukari, y: -130, oran: 0.35, yumusama: 'Quad.easeOut' },
    { durus: D.normal, y: 0, oran: 0.35, yumusama: 'Quad.easeIn' },
  ],
  comel: [
    { durus: D.comel, y: 45, oran: 0.4 },
    { durus: D.normal, y: 0, oran: 0.4 },
  ],
  kanat: [
    { durus: D.kanatYukari, y: -18, oran: 0.3 },
    { durus: D.kanatAsagi, y: 0, oran: 0.3 },
  ],
  yildiz: [
    { durus: D.yildizAcik, y: -70, oran: 0.35, yumusama: 'Quad.easeOut' },
    { durus: D.yildizKapali, y: 0, oran: 0.35, yumusama: 'Quad.easeIn' },
  ],
  uzan: [
    { durus: D.yukari, y: -40, oran: 0.45 },
    { durus: D.normal, y: 0, oran: 0.4 },
  ],
  kos: [
    { durus: D.kosA, y: -16, oran: 0.25, yumusama: 'Sine.easeOut' },
    { durus: D.kosA, y: 0, oran: 0.25, yumusama: 'Sine.easeIn' },
    { durus: D.kosB, y: -16, oran: 0.25, yumusama: 'Sine.easeOut' },
    { durus: D.kosB, y: 0, oran: 0.25, yumusama: 'Sine.easeIn' },
  ],
  denge: [{ durus: D.leylek, y: -10, oran: 1 }],
};

// Süreli hareketlerde bir tekrarın süresi (ms).
const SUREKLI_TEMPO: Partial<Record<Animasyon, number>> = { kos: 520 };

export class Zipzip extends Phaser.GameObjects.Container {
  private readonly birim: number;
  private readonly tabanY: number;
  private readonly solKol: Phaser.GameObjects.Graphics;
  private readonly sagKol: Phaser.GameObjects.Graphics;
  private readonly solBacak: Phaser.GameObjects.Graphics;
  private readonly sagBacak: Phaser.GameObjects.Graphics;
  private readonly golge: Phaser.GameObjects.Ellipse;
  private dongu?: Phaser.Time.TimerEvent;
  private bekleyenler: Phaser.Time.TimerEvent[] = [];

  static yukle(sahne: Phaser.Scene) {
    sahne.load.svg('govde', 'govde.svg', { width: 484, height: 484 });
  }

  constructor(sahne: Phaser.Scene, x: number, y: number, birim: number) {
    super(sahne, x, y);
    this.birim = birim;
    this.tabanY = y;

    // Gölge ayrı durur: Zıpzıp zıplarken yerde kalır ve küçülür.
    this.golge = sahne.add.ellipse(x, y + 150 * birim, 150 * birim, 24 * birim, 0x000000, 0.35);

    this.solBacak = this.uzuv(-32, 82, BACAK_BOYU, true);
    this.sagBacak = this.uzuv(32, 82, BACAK_BOYU, true);
    this.solKol = this.uzuv(-96, -6, KOL_BOYU, false);
    this.sagKol = this.uzuv(96, -6, KOL_BOYU, false);
    const govde = sahne.add.image(0, 0, 'govde').setScale(birim / 2);
    this.add([this.solBacak, this.sagBacak, this.solKol, this.sagKol, govde]);

    this.durusAl(D.normal, 0);
    sahne.add.existing(this);
  }

  // Uzuv, eklem noktasından sağa doğru çizilir; açısı değişince eklem etrafında döner.
  private uzuv(ex: number, ey: number, boy: number, bacak: boolean) {
    const b = this.birim;
    const g = this.scene.add.graphics({ x: ex * b, y: ey * b });
    g.lineStyle(KALINLIK * b, KOL_RENGI).lineBetween(0, 0, boy * b, 0);
    g.fillStyle(KOL_RENGI).fillCircle(0, 0, (KALINLIK / 2) * b);
    if (bacak) g.fillStyle(AYAKKABI_RENGI).fillEllipse((boy + 4) * b, 0, 22 * b, 40 * b);
    else g.fillStyle(KOL_RENGI).fillCircle(boy * b, 0, 13 * b);
    return g;
  }

  private durusAl(d: Durus, sure: number, yumusama = 'Sine.easeInOut') {
    const hedefler: [Phaser.GameObjects.Graphics, number, number][] = [
      [this.solKol, d.solKol, 1],
      [this.sagKol, d.sagKol, 1],
      [this.solBacak, d.solBacak, d.solBacakBoy ?? 1],
      [this.sagBacak, d.sagBacak, d.sagBacakBoy ?? 1],
    ];
    for (const [uzuv, aci, boy] of hedefler) {
      if (sure === 0) uzuv.setAngle(aci).setScale(boy, 1);
      else this.scene.tweens.add({ targets: uzuv, angle: aci, scaleX: boy, duration: sure, ease: yumusama });
    }
  }

  private kay(yBirim: number, sure: number, yumusama = 'Sine.easeInOut') {
    const y = this.tabanY + yBirim * this.birim;
    const yukseklik = Math.min(1, Math.max(0, -yBirim / 130));
    this.scene.tweens.add({ targets: this, y, duration: sure, ease: yumusama });
    this.scene.tweens.add({ targets: this.golge, scale: 1 - yukseklik * 0.45, alpha: 0.35 - yukseklik * 0.15, duration: sure, ease: yumusama });
  }

  // Hareketi bir kez yapar. sure: bir tekrarın süresi (ms).
  birKez(animasyon: Animasyon, sure: number) {
    this.bekleyenler = this.bekleyenler.filter((o) => o.getProgress() < 1);
    let t = 0;
    for (const adim of ADIMLAR[animasyon]) {
      const adimSuresi = sure * adim.oran;
      const olay = this.scene.time.delayedCall(t, () => {
        this.durusAl(adim.durus, adimSuresi, adim.yumusama);
        this.kay(adim.y, adimSuresi, adim.yumusama);
      });
      this.bekleyenler.push(olay);
      t += adimSuresi;
    }
  }

  // Hareketi durdurulana kadar tekrarlar (yerinde koşu, denge, açılıştaki neşeli zıplama).
  surekli(animasyon: Animasyon, tempo = SUREKLI_TEMPO[animasyon] ?? 1000) {
    this.durdur();
    if (animasyon === 'denge') {
      this.birKez('denge', 400);
      this.scene.tweens.add({ targets: this, angle: { from: -6, to: 6 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 400 });
      return;
    }
    this.birKez(animasyon, tempo);
    this.dongu = this.scene.time.addEvent({ delay: tempo, loop: true, callback: () => this.birKez(animasyon, tempo) });
  }

  durdur() {
    this.dongu?.remove();
    this.dongu = undefined;
    this.bekleyenler.forEach((o) => o.remove());
    this.bekleyenler = [];
    this.scene.tweens.killTweensOf([this, this.golge, this.solKol, this.sagKol, this.solBacak, this.sagBacak]);
    this.setAngle(0);
    this.durusAl(D.normal, 200);
    this.kay(0, 200);
  }
}

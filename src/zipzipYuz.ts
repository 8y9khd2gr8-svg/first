import Phaser from 'phaser';
import { hareketiAzalt } from './ayarlar';
import { konusmayiDinle } from './ses';

// Zıpzıp'ın yüzü (gözler + ağız) kodla çizilir: göz kırpar, konuşurken ağzı oynar, ifade değiştirir.
// Ölçüler gövde çiziminin (govde.svg) birimleriyle; (0, 0) gövdenin ortası.
// Göz kırpma süs sayılır: "hareketi azalt" açıksa ya da telefon yavaşsa kırpmaz. Ağız ve ifade anlamlı olduğu için kalır.

export type Ifade = 'normal' | 'mutlu' | 'uykulu';

const LACIVERT = 0x14213d;
const AGIZ_ICI = 0x8e2433;
const YANAK = 0xff8fa3;
const GOZ_Y = -52;

// İkinci dereceden eğri üzerindeki noktalar (ağız ve mutlu göz yayları için).
function egri(x1: number, y1: number, kx: number, ky: number, x2: number, y2: number, b: number) {
  return new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x1 * b, y1 * b), new Phaser.Math.Vector2(kx * b, ky * b), new Phaser.Math.Vector2(x2 * b, y2 * b)).getPoints(16);
}

export class ZipzipYuz extends Phaser.GameObjects.Container {
  private readonly b: number;
  private readonly cizim: Phaser.GameObjects.Graphics;
  private ifade: Ifade = 'normal';
  private kapanma = { k: 0 }; // göz kırpma: 0 açık, 1 kapalı
  private aciklik = 0; // ağız: 0 kapalı, 1 açık
  private konusma?: Phaser.Time.TimerEvent;
  private ifadeDonus?: Phaser.Time.TimerEvent;

  constructor(sahne: Phaser.Scene, birim: number) {
    super(sahne, 0, 0);
    this.b = birim;
    this.cizim = sahne.add.graphics();
    this.add(this.cizim);
    this.ciz();

    if (!hareketiAzalt()) this.kirpmayiKur();
    const birak = konusmayiDinle((konusuyor) => (konusuyor ? this.konusmayaBasla() : this.konusmayiBitir()));
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      birak();
      this.konusma?.remove();
      this.ifadeDonus?.remove();
    });
  }

  // İfade değiştirir; süre verilirse sonra normale döner.
  ifadeSec(ifade: Ifade, sureMs?: number) {
    this.ifade = ifade;
    this.ifadeDonus?.remove();
    if (sureMs) this.ifadeDonus = this.scene.time.delayedCall(sureMs, () => this.ifadeSec('normal'));
    this.ciz();
  }

  // Ara ara (2,5-5,5 sn) göz kırpar; düzensiz aralık doğal görünür.
  private kirpmayiKur() {
    this.scene.time.delayedCall(Phaser.Math.Between(2500, 5500), () => {
      if (!this.active) return;
      this.scene.tweens.add({ targets: this.kapanma, k: 1, duration: 70, yoyo: true, onUpdate: () => this.ciz(), onComplete: () => this.ciz() });
      this.kirpmayiKur();
    });
  }

  // Konuşurken ağız düzensiz açılıp kapanır (çizgi film gibi; gerçek dudak okuması değil).
  private konusmayaBasla() {
    if (!this.active || this.konusma) return;
    let acik = false;
    this.konusma = this.scene.time.addEvent({
      delay: 110,
      loop: true,
      callback: () => {
        acik = !acik;
        this.aciklik = acik ? 0.35 + Math.random() * 0.65 : 0.05;
        this.ciz();
      },
    });
  }

  private konusmayiBitir() {
    this.konusma?.remove();
    this.konusma = undefined;
    this.aciklik = 0;
    if (this.active) this.ciz();
  }

  private ciz() {
    const g = this.cizim.clear();
    const b = this.b;
    for (const s of [-1, 1]) this.gozCiz(g, 35 * s);

    if (this.ifade === 'mutlu') g.fillStyle(YANAK, 0.8).fillCircle(-64 * b, -18 * b, 11 * b).fillCircle(64 * b, -18 * b, 11 * b);

    if (this.ifade === 'uykulu' && this.aciklik < 0.1) {
      g.lineStyle(8 * b, LACIVERT).strokePoints(egri(-18, 54, 0, 66, 18, 54, b));
      return;
    }
    // Ağız: üstte düz çizgi, altta eğri (D biçimi). Kapalıyken içi beyaz (gülümseme), açıkken koyu + üst dişler.
    const derinlik = 86 + (this.ifade === 'mutlu' ? 12 : 0) + 22 * this.aciklik;
    const sinir = egri(-32, 52, 0, derinlik, 32, 52, b);
    if (this.aciklik > 0.1) {
      g.fillStyle(AGIZ_ICI).fillPoints(sinir, true);
      g.fillStyle(0xffffff).fillRect(-20 * b, 52 * b, 40 * b, 8 * b);
    } else {
      g.fillStyle(0xffffff).fillPoints(sinir, true);
    }
    g.lineStyle(6 * b, LACIVERT).strokePoints(sinir, true);
  }

  private gozCiz(g: Phaser.GameObjects.Graphics, cx: number) {
    const b = this.b;
    if (this.ifade === 'mutlu') {
      // Gülen gözler: ters "U" yay.
      g.lineStyle(8 * b, LACIVERT).strokePoints(egri(cx - 14, GOZ_Y + 6, cx, GOZ_Y - 16, cx + 14, GOZ_Y + 6, b));
      return;
    }
    // Göz kapağı yukarıdan iner: kırpmada tamamen, uykuluyken yarıya kadar.
    const k = Math.max(this.kapanma.k, this.ifade === 'uykulu' ? 0.55 : 0);
    if (k > 0.85) {
      g.lineStyle(6 * b, LACIVERT).lineBetween((cx - 14) * b, (GOZ_Y + 8) * b, (cx + 14) * b, (GOZ_Y + 8) * b);
      return;
    }
    const ry = 19 * (1 - k);
    const ey = GOZ_Y + 19 * k;
    g.fillStyle(0xffffff).fillEllipse(cx * b, ey * b, 30 * b, 2 * ry * b);
    g.fillStyle(LACIVERT).fillCircle((cx + 3) * b, (ey + 4 * (1 - k)) * b, 9 * (1 - k * 0.45) * b);
    if (k < 0.3) g.fillStyle(0xffffff).fillCircle((cx + 6) * b, (ey) * b, 3 * b);
  }
}

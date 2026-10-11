import Phaser from 'phaser';
import { hareketiAzalt } from './ayarlar';
import { konusmayiDinle } from './ses';

// Zıpzıp'ın yüzü (gözler + ağız) kodla çizilir: göz kırpar, konuşurken ağzı oynar, ifade değiştirir.
// Ölçüler gövde küresinin (zipzipKure.ts) birimleriyle; (0, 0) gövdenin ortası.
// Göz kırpma süs sayılır: "hareketi azalt" açıksa ya da telefon yavaşsa kırpmaz. Ağız ve ifade anlamlı olduğu için kalır.

// saskin: sürpriz hareketlerde; dusunen: "Yakında"ya dokununca; kirpan: göz kırpıp aferin der (teşvik).
// Üzgün ya da kızgın ifade yok: oyunda kaybetmek yok.
export type Ifade = 'normal' | 'mutlu' | 'uykulu' | 'saskin' | 'dusunen' | 'kirpan';

const LACIVERT = 0x14213d;
const AGIZ_ICI = 0x8e2433;
const YANAK = 0xff8fa3;
const IRIS = 0x1f5fa8;
const DIL = 0xff6f86;
const GOZ_X = 36;
const GOZ_Y = -44;
const GOZ_RX = 19;
const GOZ_RY = 23;

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
    for (const s of [-1, 1] as const) this.gozCiz(g, GOZ_X * s, s);

    // Pembe yanaklar hep var; mutluyken daha belirgin.
    const yanakSaydam = this.ifade === 'mutlu' ? 0.9 : 0.75;
    g.fillStyle(YANAK, yanakSaydam).fillEllipse(-66 * b, (GOZ_Y + 36) * b, 30 * b, 20 * b).fillEllipse(66 * b, (GOZ_Y + 36) * b, 30 * b, 20 * b);

    if (this.ifade === 'saskin' && this.aciklik < 0.1) {
      // Şaşkın: küçük yuvarlak "O" ağız
      g.fillStyle(AGIZ_ICI).fillEllipse(0, 44 * b, 26 * b, 32 * b);
      g.lineStyle(5 * b, LACIVERT).strokeEllipse(0, 44 * b, 26 * b, 32 * b);
      return;
    }
    if (this.ifade === 'dusunen' && this.aciklik < 0.1) {
      // Düşünen: yana kayık, kapalı küçük gülümseme
      g.lineStyle(6 * b, LACIVERT).strokePoints(egri(-8, 40, 12, 52, 30, 34, b));
      return;
    }
    if (this.ifade === 'uykulu' && this.aciklik < 0.1) {
      g.lineStyle(7 * b, LACIVERT).strokePoints(egri(-18, 46, 0, 58, 18, 46, b));
      return;
    }
    // Ağız: gülen, açık ağız (koyu iç, üstte dişler, altta dil). Konuşurken derinliği değişir.
    const derinlik = 70 + (this.ifade === 'mutlu' ? 10 : 0) + 18 * this.aciklik - (this.ifade === 'uykulu' ? 26 : 0);
    const dis = egri(-34, 26, 0, derinlik, 34, 26, b);
    const ust = egri(34, 26, 0, 36, -34, 26, b);
    const sinir = [...dis, ...ust];
    g.fillStyle(AGIZ_ICI).fillPoints(sinir, true);
    // Dil: ağzın alt kenarını izler, üstü yukarı kavisli (ağzın dışına taşmaz).
    const alt = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(-34 * b, 26 * b), new Phaser.Math.Vector2(0, derinlik * b), new Phaser.Math.Vector2(34 * b, 26 * b));
    const dil: Phaser.Math.Vector2[] = [];
    for (let i = 0; i <= 12; i++) dil.push(alt.getPoint(0.22 + (0.56 * i) / 12));
    const [bas, son] = [dil[0], dil[dil.length - 1]];
    const tepe = bas.y - (alt.getPoint(0.5).y - bas.y) * 0.5; // dilin üstü hafif tümsek
    dil.push(...egri(son.x / b, son.y / b, 0, tepe / b, bas.x / b, bas.y / b, b));
    g.fillStyle(DIL).fillPoints(dil, true);
    // Üst dişler
    g.fillStyle(0xffffff).fillPoints([...egri(-28, 29, 0, 38, 28, 29, b), ...egri(26, 35, 0, 44, -26, 35, b)], true);
    g.lineStyle(5 * b, LACIVERT).strokePoints(sinir, true);
  }

  private gozCiz(g: Phaser.GameObjects.Graphics, cx: number, yan: -1 | 1) {
    const b = this.b;
    // Kaşlar: göz kapağı inse de yerinde durur. Şaşkınken ikisi, düşünürken biri yukarı kalkar.
    const kalkik = this.ifade === 'saskin' || (this.ifade === 'dusunen' && yan === -1);
    const kasY = GOZ_Y - GOZ_RY - 9 + (this.ifade === 'uykulu' ? 6 : 0) - (kalkik ? 9 : 0);
    g.lineStyle(5 * b, LACIVERT).strokePoints(egri(cx - 15, kasY, cx, kasY - 10, cx + 15, kasY, b));
    if (this.ifade === 'mutlu' || (this.ifade === 'kirpan' && yan === 1)) {
      // Gülen gözler: ters "U" yay.
      g.lineStyle(8 * b, LACIVERT).strokePoints(egri(cx - 16, GOZ_Y + 8, cx, GOZ_Y - 16, cx + 16, GOZ_Y + 8, b));
      return;
    }
    // Göz kapağı yukarıdan iner: kırpmada tamamen, uykuluyken yarıya kadar.
    const k = Math.max(this.kapanma.k, this.ifade === 'uykulu' ? 0.55 : 0);
    if (k > 0.85) {
      g.lineStyle(6 * b, LACIVERT).strokePoints(egri(cx - 16, GOZ_Y + 6, cx, GOZ_Y + 14, cx + 16, GOZ_Y + 6, b));
      return;
    }
    const ry = GOZ_RY * (1 - k);
    const ey = GOZ_Y + GOZ_RY * k;
    const saskin = this.ifade === 'saskin';
    const buyume = saskin ? 1.12 : 1;
    // Göz bebeğinin yeri: normalde hafif sağ alta, düşünürken sol yukarı bakar, şaşkınken ortada.
    const [bx, by] = this.ifade === 'dusunen' ? [-5, -7] : saskin ? [0, 0] : [3, 4];
    const a = (1 - k * 0.5) * (saskin ? 0.8 : 1);
    g.fillStyle(0xffffff).fillEllipse(cx * b, ey * b, 2 * GOZ_RX * buyume * b, 2 * ry * buyume * b);
    g.lineStyle(3 * b, LACIVERT).strokeEllipse(cx * b, ey * b, 2 * GOZ_RX * buyume * b, 2 * ry * buyume * b);
    // Mavi iris + koyu göz bebeği + iki parıltı
    g.fillStyle(IRIS).fillCircle((cx + bx) * b, (ey + by * a) * b, 13 * a * b);
    g.fillStyle(LACIVERT).fillCircle((cx + bx) * b, (ey + by * a) * b, 8 * a * b);
    if (k < 0.3) {
      g.fillStyle(0xffffff).fillCircle((cx + bx + 5) * b, (ey + by - 7) * b, 5 * b);
      g.fillStyle(0xffffff).fillCircle((cx + bx - 5) * b, (ey + by + 6) * b, 2.3 * b);
    }
  }
}

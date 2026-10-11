import Phaser from 'phaser';
import { geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import karaVerisi from 'world-atlas/land-110m.json';
import turkiyeSiniri from './turkiye-sinir.json'; // scripts/turkiye-sinir-uret.mjs üretir
import { hareketiAzalt } from './ayarlar';
import type { BolumId, Durak } from './duraklar';

// Zıpzıp'ın gövdesi: kodla çizilen küçük bir dünya küresi. Bölüme göre dünyanın o tarafı görünür
// (Okyanus'ta Pasifik, Dünya Harikaları'nda o harikanın ülkesi); haritaya girince küre yavaşça o tarafa döner.
// Türkiye her zaman altın sarısı (Zıpzıp'ın evi). Ölçüler gövde birimiyle; (0, 0) kürenin ortası.

export const KARA = feature(karaVerisi as unknown as Topology, (karaVerisi as unknown as Topology).objects.land);
export const TURKIYE_SINIRI = turkiyeSiniri as unknown as GeoPermissibleObjects;
const IZGARA = geoGraticule10();

export const KURE_YARICAP = 108;
const HALE = 1.14; // dıştaki parıltılı halenin yarıçapı (küreye oranla)

// Kürenin ortasında duran nokta: [boylam, enlem]. Yüz ortayı kapladığı için yer biraz yukarıda
// (gözlerin arasında) görünsün diye enlem 9 derece aşağı kaydırılır.
export type Yon = [number, number];
const KAYMA = 9;
const yerdenYon = (boylam: number, enlem: number): Yon => [boylam, enlem - KAYMA];

const TURKIYE_YONU = yerdenYon(35, 39);
export const BOLUM_YONU: Record<BolumId, Yon> = {
  turkiye: TURKIYE_YONU,
  dunya: TURKIYE_YONU, // her durak kendi yerine bakar (durakYonu)
  uzay: TURKIYE_YONU, // uzaydan eve bakış
  spor: TURKIYE_YONU,
  dinozor: yerdenYon(-105, 42), // Kuzey Amerika: en çok dinozor fosili bulunan yerlerden
  evde: TURKIYE_YONU,
  okyanus: yerdenYon(-160, 5), // Büyük Okyanus: dünyanın en büyük okyanusu
};

export function durakYonu(d: Durak): Yon {
  return d.konum ? yerdenYon(d.konum[0], d.konum[1]) : BOLUM_YONU[d.bolum];
}

// Son bakılan yön oyun boyunca hatırlanır (kaydedilmez): yeni ekrandaki Zıpzıp oradan başlar.
let sonYon: Yon = TURKIYE_YONU;
export function zipzipYonunuAyarla(yon: Yon) {
  sonYon = yon;
}

// Bulutlar dönmez (gökyüzü gibi önde durur); [x, y, büyüklük]
const BULUTLAR: [number, number, number][] = [[-62, -58, 1], [48, 30, 0.8], [-30, 66, 0.7], [70, -60, 0.6]];
const BULUT_PARCALARI: [number, number, number][] = [[0, 0, 13], [13, -5, 11], [24, 2, 10], [10, 5, 10]];

let sayac = 0;

export class ZipzipKure extends Phaser.GameObjects.Image {
  private readonly tuval: Phaser.Textures.CanvasTexture;
  private readonly olcek: number; // bir gövde biriminin resimde kaç piksel olduğu
  private yon: Yon;
  private donus?: Phaser.Tweens.Tween;
  private sonCizim = 0;

  constructor(sahne: Phaser.Scene, birim: number) {
    // Küçük Zıpzıp'ta resim de küçük olur (her karede çizmek hızlı kalsın); büyükte keskin.
    const olcek = Phaser.Math.Clamp(birim * 1.5, 1, 2.2);
    const kenar = Math.ceil(2 * KURE_YARICAP * HALE * olcek);
    const anahtar = `zipzip-kure-${sayac++}`;
    const tuval = sahne.textures.createCanvas(anahtar, kenar, kenar)!;
    super(sahne, 0, 0, anahtar);
    this.tuval = tuval;
    this.olcek = olcek;
    this.setScale(birim / olcek);
    this.yon = sonYon;
    this.ciz();
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.donus?.remove();
      sahne.textures.remove(anahtar);
    });
  }

  // Küreyi yeni yöne yavaşça döndürür ("hareketi azalt" açıksa ya da telefon yavaşsa hemen geçer).
  yoneDon(hedef: Yon, sure = 1400) {
    sonYon = hedef;
    this.donus?.remove();
    if (hareketiAzalt() || sure === 0) {
      this.yon = hedef;
      this.ciz();
      return;
    }
    const ara = geoInterpolate(this.yon, hedef);
    const ilerleme = { t: 0 };
    this.donus = this.scene.tweens.add({
      targets: ilerleme,
      t: 1,
      duration: sure,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.yon = ara(ilerleme.t) as Yon;
        // Dönerken saniyede en çok ~30 kez çizilir (gözle fark edilmez, telefonu yarı yarıya az yorar).
        const simdi = this.scene.time.now;
        if (simdi - this.sonCizim < 30) return;
        this.sonCizim = simdi;
        this.ciz();
      },
      onComplete: () => this.ciz(),
    });
  }

  private ciz() {
    const c = this.tuval.context;
    const k = this.tuval.width;
    const r = KURE_YARICAP * this.olcek;
    const o = k / 2;
    c.clearRect(0, 0, k, k);

    // Dıştaki açık mavi hale
    const hale = c.createRadialGradient(o, o, r * 0.86 * HALE, o, o, r * HALE);
    hale.addColorStop(0, 'rgba(159,227,255,0.8)');
    hale.addColorStop(1, 'rgba(159,227,255,0)');
    c.fillStyle = hale;
    c.beginPath();
    c.arc(o, o, r * HALE, 0, Math.PI * 2);
    c.fill();

    // Deniz: sol üstten ışık alır
    const deniz = c.createRadialGradient(o - r * 0.24, o - r * 0.36, 0, o - r * 0.24, o - r * 0.36, r * 1.5);
    deniz.addColorStop(0, '#5EC8FF');
    deniz.addColorStop(1, '#2477D6');
    c.fillStyle = deniz;
    c.beginPath();
    c.arc(o, o, r, 0, Math.PI * 2);
    c.fill();

    // precision(0): kara verisi zaten sık noktalı, ek ara nokta hesabı gerekmez (çizim ~%15 hızlı).
    const projeksiyon = geoOrthographic().scale(r).translate([o, o]).clipAngle(90).precision(0).rotate([-this.yon[0], -this.yon[1]]);
    const yol = geoPath(projeksiyon, c);
    c.lineJoin = 'round';
    c.beginPath();
    yol(IZGARA);
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.lineWidth = 0.7 * this.olcek;
    c.stroke();
    c.beginPath();
    yol(KARA);
    c.fillStyle = '#7BD85C';
    c.fill();
    c.strokeStyle = '#3E9E3A';
    c.lineWidth = 1.2 * this.olcek;
    c.stroke();
    c.beginPath();
    yol(TURKIYE_SINIRI);
    c.fillStyle = '#FFC93C';
    c.fill();
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.4 * this.olcek;
    c.stroke();

    // Bulutlar (kürenin içinde kalır)
    c.save();
    c.beginPath();
    c.arc(o, o, r, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [x, y, b] of BULUTLAR) {
      c.beginPath();
      for (const [a, d, pr] of BULUT_PARCALARI) {
        c.moveTo(o + (x + a * b) * this.olcek + pr * b * this.olcek, o + (y + d * b) * this.olcek);
        c.arc(o + (x + a * b) * this.olcek, o + (y + d * b) * this.olcek, pr * b * this.olcek, 0, Math.PI * 2);
      }
      c.fill();
    }
    c.restore();

    // Kenarda ince açık çizgi + sol üstte parıltı
    c.beginPath();
    c.arc(o, o, r - 1.5 * this.olcek, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(191,239,255,0.7)';
    c.lineWidth = 3 * this.olcek;
    c.stroke();
    const parilti = c.createRadialGradient(o - r * 0.3, o - r * 0.44, 0, o - r * 0.3, o - r * 0.44, r * 1.2);
    parilti.addColorStop(0, 'rgba(255,255,255,0.45)');
    parilti.addColorStop(0.5, 'rgba(255,255,255,0)');
    c.fillStyle = parilti;
    c.beginPath();
    c.arc(o, o, r, 0, Math.PI * 2);
    c.fill();

    this.tuval.refresh();
  }
}

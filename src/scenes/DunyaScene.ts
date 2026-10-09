import Phaser from 'phaser';
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import karaVerisi from 'world-atlas/land-110m.json';
import ulkeVerisi from 'world-atlas/countries-110m.json';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { DUNYA, Durak } from '../duraklar';
import { bolumAcik, tamamlananlar } from '../ilerleme';
import { M } from '../metinler';
import { bip, konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

const KARA = feature(karaVerisi as unknown as Topology, (karaVerisi as unknown as Topology).objects.land);
const TURKIYE_SINIRI = (() => {
  const t = ulkeVerisi as unknown as Topology;
  const ulkeler = feature(t, t.objects.countries) as unknown as { features: (GeoPermissibleObjects & { id?: string })[] };
  return ulkeler.features.find((f) => f.id === '792')!;
})();
const IZGARA = geoGraticule10();

const BOYUT = 600; // küre resminin kenarı (piksel)
const YARICAP = 280;
const KURE = { x: 360, y: 600 }; // kürenin ekrandaki merkezi
const EGIM = 14; // durak kürenin tam ortasında değil, biraz altında dursun (derece)
// Akdeniz'de birbirine çok yakın duraklar: işaret biraz kayar, gerçek yerine ince bir çizgiyle bağlanır.
const KAYDIRMA: Record<string, [number, number]> = { efes: [6, -44], kolezyum: [-40, -14], piramitler: [-34, 34], petra: [38, 26] };

type Nokta = [number, number];
type Veri = { giris?: 'uzay'; yolculukDen?: string };

// Dünya Harikaları: dönen bir küre. Zıpzıp kürenin üstünde zıplar; bir durak bitince
// küre dönerek sıradaki harikayı önüne getirir, arkasında altın iz kalır.
export class DunyaScene extends Phaser.Scene {
  private veri: Veri = {};
  private tuval!: Phaser.Textures.CanvasTexture;
  private projeksiyon = geoOrthographic().scale(YARICAP).translate([BOYUT / 2, BOYUT / 2]).clipAngle(90).precision(0.6);
  private merkez: Nokta = [0, 0];
  private isaretler = new Map<string, Phaser.GameObjects.Container>();
  private biten = new Set<string>();
  private iz: { bas: Nokta; son: Nokta; t: number } | null = null; // yolculuk sırasında çizilen altın iz
  private suruyorDen: string | null = null; // yolculuğu süren yolun başladığı durak (henüz altın değil)
  private kureResmi!: Phaser.GameObjects.Image;

  constructor() {
    super('Dunya');
  }

  init(veri: Veri) {
    this.veri = veri ?? {};
    this.isaretler = new Map();
    this.iz = null;
    this.suruyorDen = null;
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    this.biten = new Set(tamamlananlar());
    const siradaki = DUNYA.findIndex((d) => !this.biten.has(d.id));
    const yolculukVar = !!this.veri.yolculukDen && siradaki > 0 && DUNYA[siradaki - 1].id === this.veri.yolculukDen;

    if (this.textures.exists('kure')) this.textures.remove('kure');
    this.tuval = this.textures.createCanvas('kure', BOYUT, BOYUT)!;
    this.kureResmi = this.add.image(KURE.x, KURE.y, 'kure');

    DUNYA.forEach((durak, i) => {
      const acik = siradaki === -1 || i < siradaki || (i === siradaki && !yolculukVar);
      this.isaretler.set(durak.id, this.isaret(durak, acik, this.biten.has(durak.id), i === siradaki));
    });

    const zipzipDurak = yolculukVar ? DUNYA[siradaki - 1] : DUNYA[siradaki === -1 ? DUNYA.length - 1 : siradaki];
    this.merkez = merkezNoktasi(zipzipDurak);
    this.ciz();
    const zipzip = new Zipzip(this, KURE.x, KURE.y - 40, 0.42);
    zipzip.yerlestir(KURE.x, KURE.y - 40);

    // Üst kısım: ana ekran, Türkiye'ye dönüş, pasaport, başlık.
    evDugmesi(this, () => {
      sustur();
      this.scene.start('Macera', {});
    });
    const geri = this.add
      .text(80, 160, '◀ Türkiye', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '30px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 16, y: 8 } })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });
    geri.on('pointerdown', () => {
      bip(700, 0.08);
      sustur();
      this.scene.start('Harita', {});
    });
    const uzayAcik = bolumAcik(DUNYA.map((d) => d.id));
    const uzay = this.add
      .text(640, 160, uzayAcik ? 'Uzay 🚀 ▶' : '🔒 Uzay', {
        fontFamily: YAZI_TIPI,
        fontStyle: 'bold',
        fontSize: '30px',
        color: uzayAcik ? '#14213D' : '#cfe3ff',
        backgroundColor: uzayAcik ? '#FFC93C' : '#ffffff1f',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });
    uzay.on('pointerdown', () => {
      if (!uzayAcik) {
        bip(220, 0.15, 'square', 0.12);
        konus(M.uzayKilitli);
        return;
      }
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Uzay', { giris: 'uzay' });
    });
    if (uzayAcik) this.tweens.add({ targets: uzay, scale: 1.06, duration: 700, yoyo: true, repeat: -1 });
    const pasaport = this.add.container(640, 80);
    pasaport.add(this.add.circle(0, 0, 50, RENK.turuncu).setStrokeStyle(5, RENK.beyaz));
    pasaport.add(this.add.text(0, 2, '🛂', { fontSize: '50px' }).setOrigin(0.5));
    pasaport.setSize(100, 100).setInteractive({ useHandCursor: true });
    pasaport.on('pointerdown', () => {
      sustur();
      this.scene.start('Pasaport', { sayfa: 'dunya' });
    });
    this.add
      .text(x, 80, 'Dünya Harikaları', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 12 })
      .setOrigin(0.5);

    // Alt kısım: 7 harika sırayla; dokununca küre o harikaya döner.
    DUNYA.forEach((durak, i) => {
      const acik = siradaki === -1 || i <= siradaki;
      const cx = x + (i - 3) * 92;
      const cip = this.add.container(cx, 1170);
      cip.add(this.add.circle(0, 0, 36, this.biten.has(durak.id) ? RENK.sari : acik ? RENK.turuncu : 0x6b7280).setStrokeStyle(4, RENK.beyaz));
      cip.add(this.add.text(0, 2, acik ? durak.simge : '🔒', { fontSize: '34px' }).setOrigin(0.5));
      cip.setSize(80, 80).setInteractive({ useHandCursor: true });
      cip.on('pointerdown', () => {
        if (!acik) {
          bip(220, 0.15, 'square', 0.12);
          konus(M.oncekiniBitir);
          return;
        }
        bip(880, 0.08, 'square', 0.12);
        this.don(merkezNoktasi(durak), 900);
      });
    });

    const altYazi = this.add.text(x, 1060, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);
    if (siradaki === -1) {
      altYazi.setVisible(false);
      buyukDugme(this, x, 1060, '🏆 Sertifikanı al', RENK.yesil, () => {
        sustur();
        this.scene.start('Sertifika', { bolum: 'dunya' });
      }, { genislik: 500, yukseklik: 110, yaziBoyu: 48 });
    }
    const durumuSoyle = () => {
      altYazi.setText(siradaki === -1 ? 'Bütün harikaları gezdin! 🏆' : siradaki === 0 ? 'İlk harikaya dokun ve başla!' : `Sıradaki durak: ${DUNYA[siradaki].yer}`);
      konus(siradaki === -1 ? M.dunyaBitti : siradaki === 0 ? M.dunyaHosgeldin : M.siradaki(DUNYA[siradaki].yer));
    };

    if (yolculukVar) {
      // Küre dönerek sıradaki harikayı getirir; Zıpzıp yerinde zıplar, arkada altın iz kalır.
      const onceki = DUNYA[siradaki - 1];
      const hedef = DUNYA[siradaki];
      this.suruyorDen = onceki.id;
      altYazi.setText('Yola çıkıyoruz!');
      konus(M.yolaCikiyoruz);
      zipzip.surekli('zipla', 600);
      this.time.delayedCall(600, () =>
        this.don(merkezNoktasi(hedef), 2600, (t) => (this.iz = { bas: onceki.konum!, son: hedef.konum!, t }), () => {
          this.iz = null;
          this.suruyorDen = null; // bu yol artık altın sarısı çizilsin
          const eski = this.isaretler.get(hedef.id)!;
          const yeni = this.isaret(hedef, true, false, false);
          eski.destroy();
          this.isaretler.set(hedef.id, yeni);
          this.ciz();
          yeni.setScale(0);
          this.tweens.add({ targets: yeni, scale: 1, duration: 450, ease: 'Back.easeOut', onComplete: () => this.nabiz(yeni) });
          zaferMuzigi();
          zipzip.surekli('zipla', 1200);
          this.time.delayedCall(500, durumuSoyle);
        }),
      );
    } else {
      zipzip.surekli('zipla', 1200);
      if (this.veri.giris === 'uzay') {
        // Uzaydan geliş: küre küçükten büyür ve dönerek durağa gelir.
        const hedef = this.merkez;
        this.merkez = [hedef[0] + 160, hedef[1]];
        this.ciz();
        this.kureResmi.setScale(0.25);
        this.tweens.add({ targets: this.kureResmi, scale: 1, duration: 1200, ease: 'Cubic.easeOut' });
        this.don(hedef, 1500, undefined, durumuSoyle);
      } else durumuSoyle();
    }
  }

  // Küreyi yeni bir merkeze döndürür. Her karede yeniden çizer.
  private don(hedef: Nokta, sure: number, ara?: (t: number) => void, bitince?: () => void) {
    const ara1 = geoInterpolate(this.merkez, hedef);
    const ilerleme = { t: 0 };
    this.tweens.killTweensOf(ilerleme);
    this.tweens.add({
      targets: ilerleme,
      t: 1,
      duration: sure,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.merkez = ara1(ilerleme.t) as Nokta;
        ara?.(ilerleme.t);
        this.ciz();
      },
      onComplete: () => bitince?.(),
    });
  }

  private ciz() {
    this.projeksiyon.rotate([-this.merkez[0], -this.merkez[1]]);
    const ctx = this.tuval.getContext();
    const yol = geoPath(this.projeksiyon, ctx);
    const m = BOYUT / 2;
    ctx.clearRect(0, 0, BOYUT, BOYUT);

    // Atmosfer ışığı ve deniz
    const hale = ctx.createRadialGradient(m, m, YARICAP * 0.9, m, m, YARICAP * 1.07);
    hale.addColorStop(0, 'rgba(159,227,255,0.55)');
    hale.addColorStop(1, 'rgba(159,227,255,0)');
    ctx.fillStyle = hale;
    ctx.beginPath();
    ctx.arc(m, m, YARICAP * 1.07, 0, Math.PI * 2);
    ctx.fill();
    const deniz = ctx.createRadialGradient(m - YARICAP * 0.35, m - YARICAP * 0.4, YARICAP * 0.1, m, m, YARICAP);
    deniz.addColorStop(0, '#4FB3F6');
    deniz.addColorStop(1, '#1C5FB8');
    ctx.fillStyle = deniz;
    ctx.beginPath();
    ctx.arc(m, m, YARICAP, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    yol(IZGARA);
    ctx.stroke();

    ctx.fillStyle = '#5BC46A';
    ctx.strokeStyle = '#2f8f45';
    ctx.beginPath();
    yol(KARA);
    ctx.fill('evenodd');
    ctx.stroke();

    ctx.fillStyle = '#FFC93C';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    yol(TURKIYE_SINIRI);
    ctx.fill();
    ctx.stroke();

    // Rota: gidilmiş yollar altın sarısı, diğerleri beyaz kesikli.
    ctx.lineCap = 'round';
    DUNYA.slice(1).forEach((d, i) => {
      const onceki = DUNYA[i];
      const gidildi = this.biten.has(onceki.id) && this.suruyorDen !== onceki.id;
      ctx.setLineDash(gidildi ? [] : [10, 12]);
      ctx.strokeStyle = gidildi ? '#FFC93C' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = gidildi ? 5 : 3;
      ctx.beginPath();
      yol({ type: 'LineString', coordinates: [onceki.konum!, d.konum!] });
      ctx.stroke();
    });
    if (this.iz) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#FFC93C';
      ctx.lineWidth = 6;
      ctx.beginPath();
      yol({ type: 'LineString', coordinates: [this.iz.bas, geoInterpolate(this.iz.bas, this.iz.son)(this.iz.t) as Nokta] });
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Kaydırılmış işaretlerin gerçek yeri: küçük nokta ve işarete giden çizgi.
    for (const durak of DUNYA) {
      const k = KAYDIRMA[durak.id];
      if (!k || geoDistance(durak.konum!, this.merkez) > 1.45) continue;
      const [px, py] = this.projeksiyon(durak.konum!)!;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + k[0], py + k[1]);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parıltı
    const parilti = ctx.createRadialGradient(m - YARICAP * 0.35, m - YARICAP * 0.45, 0, m - YARICAP * 0.35, m - YARICAP * 0.45, YARICAP * 0.9);
    parilti.addColorStop(0, 'rgba(255,255,255,0.28)');
    parilti.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = parilti;
    ctx.beginPath();
    ctx.arc(m, m, YARICAP, 0, Math.PI * 2);
    ctx.fill();
    this.tuval.refresh();

    // İşaretleri kürenin üstünde yerleştir; arka yüzdekiler gizlenir.
    const olcek = this.kureResmi?.scale ?? 1;
    for (const durak of DUNYA) {
      const isaret = this.isaretler.get(durak.id);
      if (!isaret) continue;
      const uzaklik = geoDistance(durak.konum!, this.merkez);
      const p = this.projeksiyon(durak.konum!)!;
      const [kx, ky] = KAYDIRMA[durak.id] ?? [0, 0];
      isaret.setPosition(KURE.x + (p[0] + kx - BOYUT / 2) * olcek, KURE.y + (p[1] + ky - BOYUT / 2) * olcek);
      isaret.setVisible(uzaklik < 1.45).setAlpha(Phaser.Math.Clamp((1.45 - uzaklik) / 0.35, 0, 1));
    }
  }

  private isaret(durak: Durak, acik: boolean, bitti: boolean, siradaki: boolean) {
    const isaret = this.add.container(0, 0);
    isaret.add(this.add.circle(0, 0, 32, bitti ? RENK.sari : acik ? RENK.turuncu : 0x6b7280).setStrokeStyle(5, RENK.beyaz));
    isaret.add(this.add.text(0, 2, acik ? durak.simge : '🔒', { fontSize: '34px' }).setOrigin(0.5));
    isaret.add(
      this.add
        .text(0, 50, durak.yer, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '24px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 6 })
        .setOrigin(0.5),
    );
    isaret.setSize(76, 76).setInteractive({ useHandCursor: true });
    isaret.on('pointerdown', () => {
      if (!acik) {
        bip(220, 0.15, 'square', 0.12);
        konus(M.oncekiniBitir);
        return;
      }
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Durak', { durakId: durak.id });
    });
    if (siradaki && acik) this.nabiz(isaret);
    return isaret;
  }

  private nabiz(isaret: Phaser.GameObjects.Container) {
    this.tweens.add({ targets: isaret, scale: 1.15, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

// Durak kürenin ortasının biraz altında görünsün diye merkez biraz kuzeye kaydırılır.
function merkezNoktasi(d: Durak): Nokta {
  return [d.konum![0], Phaser.Math.Clamp(d.konum![1] + EGIM, -80, 80)];
}

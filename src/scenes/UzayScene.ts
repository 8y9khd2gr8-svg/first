import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { Durak, UZAY } from '../duraklar';
import { tamamlananlar } from '../ilerleme';
import { M } from '../metinler';
import { bip, konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

type Nokta = { x: number; y: number };
type Veri = { giris?: 'uzay'; yolculukDen?: string };

// Güneş Sistemi (ölçekli değil): en altta Güneş, yukarı doğru gezegenler gerçek sırasıyla.
// Zıpzıp Dünya'dan çıkar, önce Güneş'e en yakın Merkür'e gider, sonra dışarı doğru ilerler.
const YER: Record<string, Nokta & { r: number }> = {
  merkur: { x: 330, y: 1030, r: 26 },
  venus: { x: 530, y: 950, r: 34 },
  ay: { x: 400, y: 815, r: 22 },
  mars: { x: 560, y: 740, r: 30 },
  jupiter: { x: 250, y: 610, r: 60 },
  saturn: { x: 500, y: 470, r: 44 },
  uranus: { x: 230, y: 350, r: 38 },
  neptun: { x: 480, y: 250, r: 38 },
};
const DUNYA_EVI: Nokta = { x: 250, y: 870 }; // Zıpzıp'ın evi: Venüs ile Mars arasında

// Gezegen renkleri: [ana renk, şerit/leke rengi]
const RENKLER: Record<string, [number, number]> = {
  ay: [0xcfd4dc, 0x9aa3b0],
  venus: [0xf3d9a4, 0xe0b878],
  merkur: [0xb8a99a, 0x8d7f72],
  mars: [0xe0603a, 0xb3432a],
  jupiter: [0xe8c49a, 0xc98b5a],
  saturn: [0xf0dca0, 0xd9bd72],
  uranus: [0x8fe3e8, 0x6cc9d0],
  neptun: [0x3f6fe0, 0x2f50b0],
};

export class UzayScene extends Phaser.Scene {
  private veri: Veri = {};

  constructor() {
    super('Uzay');
  }

  init(veri: Veri) {
    this.veri = veri ?? {};
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const biten = new Set(tamamlananlar());
    const siradaki = UZAY.findIndex((d) => !biten.has(d.id));
    const yolculukVar = !!this.veri.yolculukDen && siradaki > 0 && UZAY[siradaki - 1].id === this.veri.yolculukDen;

    // Ara ara ekrandan kayan yıldız geçer.
    const kayanYildiz = () => {
      const bx = Phaser.Math.Between(150, 720);
      const by = Phaser.Math.Between(200, 600);
      const iz = this.add.graphics().setDepth(-1);
      const ilerleme = { t: 0 };
      this.tweens.add({
        targets: ilerleme,
        t: 1,
        duration: 900,
        ease: 'Quad.easeIn',
        onUpdate: () => {
          const hx = bx - ilerleme.t * 380;
          const hy = by + ilerleme.t * 220;
          iz.clear();
          iz.lineStyle(3, 0xffffff, 0.8 * (1 - ilerleme.t)).lineBetween(hx, hy, hx + 70, hy - 40);
          iz.fillStyle(0xffffff, 1 - ilerleme.t).fillCircle(hx, hy, 3);
        },
        onComplete: () => iz.destroy(),
      });
    };
    this.time.addEvent({ delay: 2200, loop: true, callback: () => (kayanYildiz(), Math.random() < 0.35 && this.time.delayedCall(350, kayanYildiz)), startAt: 1800 });

    // Güneş: sol altta, ekrandan taşan kocaman ve parlayan bir daire.
    const gunes = this.add.container(30, 1170);
    gunes.add(this.add.circle(0, 0, 200, 0xffb627, 0.15));
    gunes.add(this.add.circle(0, 0, 160, 0xffc93c, 0.3));
    gunes.add(this.add.circle(0, 0, 125, 0xffd25a));
    this.tweens.add({ targets: gunes, scale: 1.05, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(70, 1240, 'Güneş', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '26px', color: '#14213D' }).setOrigin(0.5);

    // Rota: Dünya'dan başlayıp gezegenleri sırayla dolaşan kesikli çizgi.
    const noktalar: Nokta[] = [DUNYA_EVI, ...UZAY.map((d) => YER[d.id])];
    const rota = this.add.graphics();
    noktalar.slice(1).forEach((b, i) => {
      const a = noktalar[i];
      // i. parça: i === 0 Dünya→ilk durak (ilk durak bitince altın), sonrakiler UZAY[i-1]→UZAY[i]
      const baslangic = i === 0 ? null : UZAY[i - 1];
      const gidildi = i === 0 ? biten.has(UZAY[0].id) : biten.has(baslangic!.id) && !(yolculukVar && baslangic!.id === this.veri.yolculukDen);
      kesikliCiz(rota, a, b, gidildi ? RENK.sari : RENK.beyaz, gidildi ? 1 : 0.5);
    });
    const iz = this.add.graphics();

    // Zıpzıp'ın evi: küçük Dünya
    this.add.circle(DUNYA_EVI.x, DUNYA_EVI.y, 22, 0x2f80ed).setStrokeStyle(4, 0x5bc46a);
    this.add.text(DUNYA_EVI.x - 40, DUNYA_EVI.y + 30, 'Dünya', { fontFamily: YAZI_TIPI, fontSize: '22px', color: '#cfe3ff' }).setOrigin(0.5);

    const isaretler = new Map<string, Phaser.GameObjects.Container>();
    UZAY.forEach((durak, i) => {
      const acik = siradaki === -1 || i < siradaki || (i === siradaki && !yolculukVar);
      isaretler.set(durak.id, this.gezegen(durak, acik, biten.has(durak.id), i === siradaki));
    });

    // Zıpzıp gezegenin sol üstünde durur.
    const zipzipYeri = (id: string | null): Nokta => {
      if (!id) return { x: DUNYA_EVI.x - 10, y: DUNYA_EVI.y - 60 };
      const y = YER[id];
      return { x: y.x + (y.x < 360 ? y.r + 40 : -(y.r + 40)), y: y.y - y.r - 30 };
    };
    const zipzipDurak = yolculukVar ? UZAY[siradaki - 1] : siradaki === -1 ? UZAY[UZAY.length - 1] : siradaki === 0 ? null : UZAY[siradaki - 1];
    const ilk = zipzipYeri(zipzipDurak?.id ?? null);
    const zipzip = new Zipzip(this, 0, 0, 0.3);
    zipzip.yerlestir(ilk.x, ilk.y);

    // Üst kısım
    evDugmesi(this, () => {
      sustur();
      this.scene.start('Acilis', {});
    });
    this.add
      .text(80, 160, '◀ Dünya', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '30px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 16, y: 8 } })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        bip(700, 0.08);
        sustur();
        this.scene.start('Dunya', {});
      });
    const pasaport = this.add.container(640, 80);
    pasaport.add(this.add.circle(0, 0, 50, RENK.turuncu).setStrokeStyle(5, RENK.beyaz));
    pasaport.add(this.add.text(0, 2, '🛂', { fontSize: '50px' }).setOrigin(0.5));
    pasaport.setSize(100, 100).setInteractive({ useHandCursor: true });
    pasaport.on('pointerdown', () => {
      sustur();
      this.scene.start('Pasaport', { sayfa: 'uzay' });
    });
    this.add
      .text(x, 80, 'Uzay Yolculuğu', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '56px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 12 })
      .setOrigin(0.5);

    const altYazi = this.add.text(x + 60, 1180, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '38px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
    const durumuSoyle = () => {
      altYazi.setText(siradaki === -1 ? 'Bütün gezegenleri gezdin! 🏆' : siradaki === 0 ? 'Merkür’e dokun ve başla!' : `Sıradaki durak: ${UZAY[siradaki].ad}`);
      konus(siradaki === -1 ? M.uzayBitti : siradaki === 0 ? M.uzayHosgeldin : M.siradaki(UZAY[siradaki].yer));
    };

    if (yolculukVar) {
      const hedef = UZAY[siradaki];
      const bas = YER[UZAY[siradaki - 1].id];
      const son = YER[hedef.id];
      const yol = yolNoktalari(zipzipYeri(UZAY[siradaki - 1].id), zipzipYeri(hedef.id), 50);
      let adimNo = 0;
      altYazi.setText('Yola çıkıyoruz!');
      konus(M.yolaCikiyoruz);
      this.time.delayedCall(600, () =>
        zipzip.yolculuk(
          yol,
          420,
          () => {
            adimNo++;
            bip(500 + adimNo * 30, 0.08, 'triangle', 0.15);
            iz.clear();
            kesikliCiz(iz, bas, yolNoktasi(bas, son, adimNo / yol.length), RENK.sari, 1);
          },
          () => {
            const eski = isaretler.get(hedef.id)!;
            const yeni = this.gezegen(hedef, true, false, false);
            eski.destroy();
            yeni.setScale(0);
            this.tweens.add({ targets: yeni, scale: 1, duration: 450, ease: 'Back.easeOut', onComplete: () => this.nabiz(yeni) });
            zaferMuzigi();
            zipzip.surekli('zipla', 1200);
            this.time.delayedCall(500, durumuSoyle);
          },
        ),
      );
    } else {
      zipzip.surekli('zipla', 1200);
      if (this.veri.giris === 'uzay') {
        // Girişte gezegenler sırayla belirir.
        UZAY.forEach((durak, i) => {
          const g = isaretler.get(durak.id)!;
          this.tweens.killTweensOf(g);
          g.setScale(0);
          this.tweens.add({
            targets: g,
            scale: 1,
            duration: 350,
            delay: 150 + i * 110,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.suzul(g);
              if (i === siradaki) this.nabiz(g);
            },
          });
        });
        this.time.delayedCall(1100, durumuSoyle);
      } else durumuSoyle();
    }
  }

  // Gezegen çizimi: renkli daire, şeritler; Jüpiter'de kırmızı leke, Satürn'de halka, Ay'da krater.
  private gezegen(durak: Durak, acik: boolean, bitti: boolean, siradaki: boolean) {
    const { x, y, r } = YER[durak.id];
    const [ana, serit] = RENKLER[durak.id];
    const kap = this.add.container(x, y);
    // Satürn: eğik halka; arka yarısı gezegenin arkasında, ön yarısı önünde.
    const halka = (on: boolean) => {
      const h = this.add.graphics().setAngle(-16);
      for (const [kalinlik, renk, olcek] of [[9, 0xd9c48f, 1], [4, 0xf6ead0, 0.86]] as const) {
        const noktalar = Array.from({ length: 33 }, (_, i) => {
          const t = (on ? 0 : Math.PI) + (i / 32) * Math.PI;
          return new Phaser.Math.Vector2(Math.cos(t) * r * 1.75 * olcek, Math.sin(t) * r * 0.5 * olcek);
        });
        h.lineStyle(kalinlik, renk, 0.95).strokePoints(noktalar);
      }
      return h;
    };
    if (durak.id === 'saturn') kap.add(halka(false));
    const g = this.add.graphics();
    g.fillStyle(ana).fillCircle(0, 0, r);
    if (['jupiter', 'saturn', 'venus', 'uranus', 'neptun'].includes(durak.id)) {
      g.fillStyle(serit, 0.8);
      for (const k of [-0.45, 0, 0.45]) g.fillRect(-r * Math.sqrt(1 - k * k), r * k - r * 0.08, 2 * r * Math.sqrt(1 - k * k), r * 0.16);
    }
    if (durak.id === 'jupiter') g.fillStyle(0xc0392b).fillEllipse(r * 0.35, r * 0.25, r * 0.4, r * 0.22);
    if (durak.id === 'ay' || durak.id === 'merkur' || durak.id === 'mars') {
      g.fillStyle(serit);
      g.fillCircle(-r * 0.35, -r * 0.2, r * 0.18).fillCircle(r * 0.3, r * 0.3, r * 0.14).fillCircle(r * 0.25, -r * 0.4, r * 0.1);
    }
    // Parıltı ve kenar: bittiyse altın halka
    g.fillStyle(0xffffff, 0.18).fillCircle(-r * 0.3, -r * 0.35, r * 0.45);
    g.lineStyle(bitti ? 6 : 3, bitti ? RENK.sari : 0xffffff, bitti ? 1 : 0.5).strokeCircle(0, 0, r + 4);
    kap.add(g);
    if (durak.id === 'saturn') {
      const on = halka(true);
      kap.add(on);
      // Halka hafifçe sallanır ve parıldar.
      this.tweens.add({ targets: [on, kap.list[0]], angle: -10, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: on, alpha: 0.75, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    // Gezegen kendi etrafında yavaşça "döner" (şeritler hafifçe kayar gibi) ve süzülür.
    this.tweens.add({ targets: g, scaleX: 0.94, duration: 1800 + r * 20, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.suzul(kap);
    if (!acik) {
      kap.add(this.add.circle(0, 0, r + 4, 0x14213d, 0.55));
      kap.add(this.add.text(0, 0, '🔒', { fontSize: `${Math.max(24, r * 0.7)}px` }).setOrigin(0.5));
    }
    kap.add(this.add.text(0, r + 22, durak.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '24px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 6 }).setOrigin(0.5));
    const alan = Math.max(80, r * 2 + 10);
    kap.setSize(alan, alan).setInteractive({ useHandCursor: true });
    kap.on('pointerdown', () => {
      if (!acik) {
        bip(220, 0.15, 'square', 0.12);
        this.tweens.add({ targets: kap, x: x + 8, duration: 50, yoyo: true, repeat: 3 });
        konus(M.oncekiniBitir);
        return;
      }
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Durak', { durakId: durak.id });
    });
    if (siradaki && acik) this.nabiz(kap);
    return kap;
  }

  // Gezegen yerinde hafifçe yukarı aşağı süzülür.
  private suzul(kap: Phaser.GameObjects.Container) {
    this.tweens.add({ targets: kap, y: kap.y - 6, duration: 1600 + (kap.x % 7) * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: (kap.y % 5) * 200 });
  }

  private nabiz(kap: Phaser.GameObjects.Container) {
    this.tweens.add({ targets: kap, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

function yolNoktasi(a: Nokta, b: Nokta, t: number): Nokta {
  return { x: Phaser.Math.Linear(a.x, b.x, t), y: Phaser.Math.Linear(a.y, b.y, t) };
}

function yolNoktalari(a: Nokta, b: Nokta, aralik: number): Nokta[] {
  const adim = Math.max(2, Math.round(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / aralik));
  return Array.from({ length: adim }, (_, i) => yolNoktasi(a, b, (i + 1) / adim));
}

function kesikliCiz(g: Phaser.GameObjects.Graphics, a: Nokta, b: Nokta, renk: number, saydamlik: number) {
  g.lineStyle(5, renk, saydamlik);
  const adim = Math.ceil(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / 18);
  for (let k = 0; k < adim; k += 2) {
    const p = yolNoktasi(a, b, k / adim);
    const q = yolNoktasi(a, b, Math.min(1, (k + 1) / adim));
    g.lineBetween(p.x, p.y, q.x, q.y);
  }
}

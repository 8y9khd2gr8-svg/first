import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { BOLUMLER, BolumId, DUNYA, TURKIYE } from '../duraklar';
import { bolumAcik, tamamlananlar } from '../ilerleme';
import { M } from '../metinler';
import { bip, konus, sustur } from '../ses';
import { Zipzip } from '../zipzip';

// Büyük Macera: bütün bölümler kıvrımlı bir yol üzerinde. Açık bölümler ilerlemesiyle,
// gelecek bölümler "Yakında" etiketiyle görünür (ebeveyn neyin geleceğini görür).
type Satir =
  | { tur: 'bolum'; id: BolumId; simge: string; renk: number; kilitMesaji?: string; acik: () => boolean }
  | { tur: 'yakinda'; ad: string; simge: string };

const SATIRLAR: Satir[] = [
  { tur: 'bolum', id: 'turkiye', simge: '🇹🇷', renk: RENK.turuncu, acik: () => true },
  { tur: 'bolum', id: 'dunya', simge: '🌍', renk: RENK.mavi, kilitMesaji: M.dunyaKilitli, acik: () => bolumAcik(TURKIYE.map((d) => d.id)) },
  { tur: 'bolum', id: 'uzay', simge: '🪐', renk: 0x7c5cd6, kilitMesaji: M.uzayKilitli, acik: () => bolumAcik(DUNYA.map((d) => d.id)) },
  { tur: 'yakinda', ad: 'İstanbul’un 7 Tepesi', simge: '🏙️' },
  { tur: 'yakinda', ad: 'Spor Kampı', simge: '⚽' },
  { tur: 'yakinda', ad: 'Dinozorlar Diyarı', simge: '🦕' },
  { tur: 'yakinda', ad: 'Okyanus', simge: '🐠' },
  { tur: 'yakinda', ad: 'Evde Macera', simge: '🧸' },
];

const ILK_Y = 300;
const ARALIK = 122;
const konum = (i: number) => ({ x: i % 2 === 0 ? 230 : 490, y: ILK_Y + i * ARALIK });

export class MaceraScene extends Phaser.Scene {
  constructor() {
    super('Macera');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const biten = new Set(tamamlananlar());

    evDugmesi(this, () => {
      sustur();
      this.scene.start('Acilis', {});
    });
    const pasaport = this.add.container(640, 80);
    pasaport.add(this.add.circle(0, 0, 50, RENK.turuncu).setStrokeStyle(5, RENK.beyaz));
    pasaport.add(this.add.text(0, 2, '🛂', { fontSize: '50px' }).setOrigin(0.5));
    pasaport.setSize(100, 100).setInteractive({ useHandCursor: true });
    pasaport.on('pointerdown', () => {
      sustur();
      this.scene.start('Pasaport', {});
    });
    this.add
      .text(x, 85, 'Büyük Macera', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '58px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 12 })
      .setOrigin(0.5);
    this.add.text(x, 160, 'Bir bölüm seç!', { fontFamily: YAZI_TIPI, fontSize: '34px', color: '#cfe3ff' }).setOrigin(0.5);

    // Kıvrımlı yol: açık bölümler arası altın, sonrası beyaz kesikli.
    const yol = this.add.graphics();
    const acikSayisi = SATIRLAR.filter((s) => s.tur === 'bolum' && s.acik()).length;
    for (let i = 0; i < SATIRLAR.length - 1; i++) {
      const a = konum(i);
      const b = konum(i + 1);
      const altin = i < acikSayisi - 1;
      yol.lineStyle(8, altin ? RENK.sari : RENK.beyaz, altin ? 1 : 0.35);
      const egri = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(a.x, a.y),
        new Phaser.Math.Vector2(a.x, a.y + ARALIK * 0.6),
        new Phaser.Math.Vector2(b.x, b.y - ARALIK * 0.6),
        new Phaser.Math.Vector2(b.x, b.y),
      );
      const noktalar = egri.getPoints(24);
      for (let k = 0; k < noktalar.length - 1; k += altin ? 1 : 2) yol.lineBetween(noktalar[k].x, noktalar[k].y, noktalar[k + 1].x, noktalar[k + 1].y);
    }

    // Zıpzıp, oynanmakta olan bölümün yanında zıplar.
    let simdiki = 0;
    SATIRLAR.forEach((s, i) => {
      if (s.tur === 'bolum' && s.acik()) {
        const duraklar = BOLUMLER[s.id].duraklar;
        if (i === 0 || !duraklar.every((d) => biten.has(d.id)) || simdiki === i - 1) simdiki = i;
      }
    });

    SATIRLAR.forEach((s, i) => {
      const { x: nx, y: ny } = konum(i);
      const solda = i % 2 === 0;
      const kap = this.add.container(nx, ny);
      if (s.tur === 'bolum') {
        const acik = s.acik();
        const duraklar = BOLUMLER[s.id].duraklar;
        const bitenSayisi = duraklar.filter((d) => biten.has(d.id)).length;
        const tamam = bitenSayisi === duraklar.length;
        kap.add(this.add.circle(0, 0, 54, acik ? s.renk : 0x4b5563).setStrokeStyle(6, tamam ? RENK.sari : RENK.beyaz));
        kap.add(this.add.text(0, 2, s.simge, { fontSize: '56px' }).setOrigin(0.5).setAlpha(acik ? 1 : 0.5));
        if (!acik) kap.add(this.add.text(30, 30, '🔒', { fontSize: '30px' }).setOrigin(0.5));
        const yazi = this.add.container(solda ? 80 : -80, 0);
        yazi.add(
          this.add
            .text(0, -16, BOLUMLER[s.id].ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '36px', color: acik ? '#ffffff' : '#9fb6d9' })
            .setOrigin(solda ? 0 : 1, 0.5),
        );
        yazi.add(
          this.add
            .text(0, 22, tamam ? `🏆 ${bitenSayisi}/${duraklar.length} tamam!` : acik ? `⭐ ${bitenSayisi}/${duraklar.length} durak` : 'Önceki bölümden sonra', {
              fontFamily: YAZI_TIPI,
              fontSize: '26px',
              color: tamam ? '#FFC93C' : '#cfe3ff',
            })
            .setOrigin(solda ? 0 : 1, 0.5),
        );
        kap.add(yazi);
        kap.setSize(120, 120).setInteractive({ useHandCursor: true });
        kap.on('pointerdown', () => {
          if (!acik) {
            bip(220, 0.15, 'square', 0.12);
            this.tweens.add({ targets: kap, x: nx + 8, duration: 50, yoyo: true, repeat: 3 });
            konus(s.kilitMesaji ?? M.oncekiniBitir);
            return;
          }
          bip(880, 0.08, 'square', 0.12);
          sustur();
          this.scene.start(BOLUMLER[s.id].sahne, { giris: 'uzay' });
        });
        if (i === simdiki) this.tweens.add({ targets: kap, scale: 1.08, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      } else {
        const g = this.add.graphics();
        g.lineStyle(4, 0xffffff, 0.35);
        for (let a = 0; a < 360; a += 24) {
          const r1 = Phaser.Math.DegToRad(a);
          const r2 = Phaser.Math.DegToRad(a + 12);
          g.lineBetween(50 * Math.cos(r1), 50 * Math.sin(r1), 50 * Math.cos(r2), 50 * Math.sin(r2));
        }
        kap.add(g);
        kap.add(this.add.text(0, 2, s.simge, { fontSize: '48px' }).setOrigin(0.5).setAlpha(0.55));
        const yazi = this.add.container(solda ? 76 : -76, 0);
        yazi.add(this.add.text(0, -14, s.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '30px', color: '#9fb6d9' }).setOrigin(solda ? 0 : 1, 0.5));
        yazi.add(
          this.add
            .text(0, 22, 'Yakında', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '22px', color: '#14213D', backgroundColor: '#9fb6d9', padding: { x: 12, y: 2 } })
            .setOrigin(solda ? 0 : 1, 0.5),
        );
        kap.add(yazi);
        kap.setSize(110, 110).setInteractive({ useHandCursor: true });
        kap.on('pointerdown', () => {
          bip(500, 0.1, 'triangle', 0.15);
          this.tweens.add({ targets: kap, angle: { from: -6, to: 6 }, duration: 80, yoyo: true, repeat: 2, onComplete: () => kap.setAngle(0) });
          konus(M.yakinda);
        });
      }
    });

    const zk = konum(simdiki);
    const zipzip = new Zipzip(this, 0, 0, 0.26);
    zipzip.yerlestir(zk.x + (simdiki % 2 === 0 ? -95 : 95), zk.y - 30);
    zipzip.surekli('zipla', 1200);

    konus(M.maceraHosgeldin);
  }
}

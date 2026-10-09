import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, rozetCiz, yildizliArkaPlan } from '../arayuz';
import { durakBul, haritaSahnesi } from '../duraklar';
import { tamamla, tamamlananlar } from '../ilerleme';
import { M } from '../metinler';
import { yeniRozetleriAl } from '../rozetler';
import { bip, konus, sustur, zaferMuzigi } from '../ses';

const KONFETI_RENKLERI = [0xffc93c, 0xff8a3d, 0x3fbf5f, 0x2f80ed, 0xff6b6b, 0xffffff];

// Durak bitti: konfeti, üç yıldız ve pasaport damgası.
export class OdulScene extends Phaser.Scene {
  private durakId = '';
  private kutlamaKatmani!: Phaser.GameObjects.Container;

  constructor() {
    super('Odul');
  }

  init(veri: { durakId: string }) {
    this.durakId = veri.durakId;
  }

  create() {
    yildizliArkaPlan(this);
    const { width, height } = this.scale.gameSize;
    const x = width / 2;
    const durak = durakBul(this.durakId);
    const yeniBitti = !tamamlananlar().includes(durak.id);
    tamamla(durak.id);

    for (let i = 0; i < 90; i++) {
      const parca = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-300, -20),
        Phaser.Math.Between(12, 22),
        Phaser.Math.Between(18, 30),
        Phaser.Utils.Array.GetRandom(KONFETI_RENKLERI),
      );
      this.tweens.add({
        targets: parca,
        y: height + 40,
        x: parca.x + Phaser.Math.Between(-120, 120),
        angle: Phaser.Math.Between(-540, 540),
        duration: Phaser.Math.Between(2200, 3800),
        delay: Phaser.Math.Between(0, 900),
        ease: 'Sine.easeIn',
      });
    }

    const baslik = this.add
      .text(x, 150, 'Süpersin!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '120px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 16 })
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({ targets: baslik, scale: 1, duration: 500, ease: 'Back.easeOut' });

    [-160, 0, 160].forEach((dx, i) => {
      const yildiz = this.add.star(x + dx, 320, 5, 36, 80, RENK.sari).setStrokeStyle(6, RENK.beyaz).setScale(0);
      this.tweens.add({
        targets: yildiz,
        scale: 1,
        angle: 360,
        duration: 500,
        delay: 400 + i * 350,
        ease: 'Back.easeOut',
        onStart: () => bip(660 + i * 200, 0.2, 'triangle', 0.3),
      });
    });

    // Pasaport damgası: yukarıdan "pat" diye basılır.
    const damga = this.add.container(x, 650).setAngle(-10);
    const cember = this.add.graphics();
    cember.lineStyle(10, RENK.turuncu).strokeCircle(0, 0, 170);
    cember.lineStyle(4, RENK.turuncu).strokeCircle(0, 0, 145);
    damga.add(cember);
    damga.add(this.add.text(0, -40, durak.simge, { fontSize: '120px' }).setOrigin(0.5));
    damga.add(this.add.text(0, 70, durak.yer.toLocaleUpperCase('tr'), { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '46px', color: '#FF8A3D' }).setOrigin(0.5));
    damga.add(this.add.text(0, 115, 'ZIP ZIP DÜNYA', { fontFamily: YAZI_TIPI, fontSize: '24px', color: '#FF8A3D' }).setOrigin(0.5));
    damga.setScale(2.5).setAlpha(0);
    this.tweens.add({
      targets: damga,
      scale: 1,
      alpha: 1,
      duration: 350,
      delay: 1700,
      ease: 'Quad.easeIn',
      onComplete: () => {
        bip(110, 0.25, 'square', 0.3);
        this.cameras.main.shake(150, 0.01);
      },
    });

    zaferMuzigi();
    this.time.delayedCall(500, () => konus(M.damgaKazandin(durak.yer)));

    // Yeni rozet varsa damgadan sonra kutla (birden fazlaysa ilki gösterilir, "+2" yazar).
    const yeniler = yeniRozetleriAl();
    if (yeniler.length) this.time.delayedCall(3400, () => this.rozetKutla(yeniler[0].simge, yeniler[0].ad, yeniler.length - 1));

    this.kutlamaKatmani = this.add.container(0, 0).setDepth(10);

    buyukDugme(this, x, 1010, 'Haritaya dön ▶', RENK.turuncu, () => {
      sustur();
      this.scene.start(haritaSahnesi(durak), yeniBitti ? { yolculukDen: durak.id } : {});
    }, { genislik: 540, yukseklik: 150, yaziBoyu: 64 });

    buyukDugme(this, x, 1170, 'Bir daha ↻', RENK.mavi, () => {
      sustur();
      this.scene.start('Hareket', { durakId: durak.id, adim: 0 });
    }, { genislik: 400, yukseklik: 110, yaziBoyu: 52 });
  }

  private rozetKutla(simge: string, ad: string, digerSayisi: number) {
    const { width, height } = this.scale.gameSize;
    const x = width / 2;
    const k = this.kutlamaKatmani;
    const perde = this.add.rectangle(x, height / 2, width, height, 0x0b1430, 0.85).setInteractive();
    const baslik = this.add.text(x, 330, 'Yeni rozet!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '84px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 12 }).setOrigin(0.5);
    const rozet = rozetCiz(this, x, 600, 120, simge, true).setScale(0);
    const isim = this.add.text(x, 800, ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '56px', color: '#ffffff' }).setOrigin(0.5);
    const ek = this.add.text(x, 870, digerSayisi > 0 ? `+${digerSayisi} rozet daha! Pasaportuna bak.` : 'Pasaportunda seni bekliyor!', { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff' }).setOrigin(0.5);
    const tamam = this.add.text(x, 1000, 'Harika! ✓', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: '#ffffff', backgroundColor: '#3FBF5F', padding: { x: 40, y: 14 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    k.add([perde, baslik, rozet, isim, ek, tamam]);
    this.tweens.add({ targets: rozet, scale: 1, angle: 360, duration: 700, ease: 'Back.easeOut' });
    zaferMuzigi();
    konus(M.yeniRozet(ad));
    tamam.on('pointerdown', () => {
      bip(880, 0.08, 'square', 0.12);
      k.removeAll(true);
    });
  }
}

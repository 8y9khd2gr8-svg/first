import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { bip, konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

const KONFETI_RENKLERI = [0xffc93c, 0xff8a3d, 0x3fbf5f, 0x2f80ed, 0xff6b6b, 0xffffff];

// Ödül ekranı: konfeti, üç yıldız ve sıradaki adım için düğmeler.
export class OdulScene extends Phaser.Scene {
  private sira = 0;

  constructor() {
    super('Odul');
  }

  init(veri: { sira?: number }) {
    this.sira = veri.sira ?? 0;
  }

  create() {
    yildizliArkaPlan(this);
    const { width, height } = this.scale.gameSize;
    const x = width / 2;

    evDugmesi(this, () => {
      sustur();
      this.scene.start('Acilis');
    });

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
      .text(x, 200, 'Süpersin!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '120px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 16 })
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({ targets: baslik, scale: 1, duration: 500, ease: 'Back.easeOut' });

    [-180, 0, 180].forEach((dx, i) => {
      const yildiz = this.add.star(x + dx, 400, 5, 42, 95, RENK.sari).setStrokeStyle(7, RENK.beyaz).setScale(0);
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

    new Zipzip(this, x, 690, 1.1).surekli('acKapa', 1200);

    zaferMuzigi();
    this.time.delayedCall(500, () => konus('Süpersin! Üç yıldız kazandın!'));

    buyukDugme(this, x, 1010, 'Yeni hareket ▶', RENK.turuncu, () => {
      sustur();
      this.scene.start('Hareket', { sira: this.sira + 1 });
    }, { genislik: 540, yukseklik: 150, yaziBoyu: 66 });

    buyukDugme(this, x, 1170, 'Bir daha ↻', RENK.mavi, () => {
      sustur();
      this.scene.start('Hareket', { sira: this.sira });
    }, { genislik: 400, yukseklik: 110, yaziBoyu: 52 });
  }
}

import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, yildizliArkaPlan } from '../arayuz';
import { sesiAc } from '../ses';

// Açılış ekranı: oyunun adı, zıplayan Zıpzıp ve büyük "Oyna" düğmesi.
export class AcilisScene extends Phaser.Scene {
  constructor() {
    super('Acilis');
  }

  preload() {
    this.load.svg('maskot', 'maskot.svg', { width: 640, height: 570 });
  }

  create() {
    yildizliArkaPlan(this);
    const { width } = this.scale.gameSize;
    const x = width / 2;

    const baslikStili = { fontFamily: YAZI_TIPI, fontStyle: 'bold', stroke: '#0b1430', strokeThickness: 16 };
    this.add.text(x, 200, 'Zıp Zıp', { ...baslikStili, fontSize: '130px', color: '#FFC93C' }).setOrigin(0.5);
    this.add.text(x, 320, 'Dünya', { ...baslikStili, fontSize: '110px', color: '#ffffff' }).setOrigin(0.5);

    const golge = this.add.ellipse(x, 900, 280, 44, 0x000000, 0.35);
    const maskot = this.add.image(x, 650, 'maskot').setScale(0.85);
    this.tweens.add({ targets: maskot, y: 560, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: golge, scale: 0.7, alpha: 0.2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    buyukDugme(
      this,
      x,
      1090,
      'Oyna ▶',
      RENK.turuncu,
      () => {
        sesiAc();
        this.scene.start('Hareket', { sira: 0 });
      },
      { genislik: 480, yukseklik: 160, yaziBoyu: 80 },
    );
  }
}

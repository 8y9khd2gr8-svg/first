import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { durakBul } from '../duraklar';
import { konus, sustur } from '../ses';

// Durak girişi: yerin adı, simgesi ve "Biliyor muydun?" bilgisi.
export class DurakScene extends Phaser.Scene {
  private durakId = '';

  constructor() {
    super('Durak');
  }

  init(veri: { durakId: string }) {
    this.durakId = veri.durakId;
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const durak = durakBul(this.durakId);

    evDugmesi(this, () => {
      sustur();
      this.scene.start('Harita', {});
    });

    this.add.text(x, 170, durak.yer, { fontFamily: YAZI_TIPI, fontSize: '44px', color: '#cfe3ff' }).setOrigin(0.5);
    this.add
      .text(x, 250, durak.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '88px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 14 })
      .setOrigin(0.5);

    const simge = this.add.text(x, 470, durak.simge, { fontSize: '200px' }).setOrigin(0.5);
    this.tweens.add({ targets: simge, y: 445, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const kutu = this.add.graphics();
    kutu.fillStyle(0xffffff, 0.1).fillRoundedRect(50, 640, 620, 320, 36);
    kutu.lineStyle(4, RENK.sari, 0.8).strokeRoundedRect(50, 640, 620, 320, 36);
    this.add.text(x, 690, 'Biliyor muydun?', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#FFC93C' }).setOrigin(0.5);
    this.add
      .text(x, 820, durak.bilgi, { fontFamily: YAZI_TIPI, fontSize: '36px', color: '#ffffff', align: 'center', wordWrap: { width: 560 }, lineSpacing: 4 })
      .setOrigin(0.5);

    konus(`${durak.yer}! ${durak.ad}. Biliyor muydun? ${durak.bilgi}`);

    buyukDugme(this, x, 1110, 'Başla ▶', RENK.turuncu, () => {
      sustur();
      this.scene.start('Hareket', { durakId: durak.id, adim: 0 });
    }, { genislik: 460, yukseklik: 150, yaziBoyu: 72 });
  }
}

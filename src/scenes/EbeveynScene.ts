import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { bip, sustur } from '../ses';

// Ebeveyn kilidi: çocuğun yanlışlıkla ayarlara girmemesi için basit bir çarpma sorusu.
export class EbeveynScene extends Phaser.Scene {
  private hedef = 'PasaportAyar';
  private geri = 'Pasaport';

  constructor() {
    super('Ebeveyn');
  }

  init(veri: { hedef?: string; geri?: string }) {
    this.hedef = veri.hedef ?? 'PasaportAyar';
    this.geri = veri.geri ?? 'Pasaport';
  }

  create() {
    sustur();
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start(this.geri));

    const a = Phaser.Math.Between(3, 9);
    const b = Phaser.Math.Between(3, 9);
    const dogru = a * b;
    const secenekler = new Set([dogru]);
    while (secenekler.size < 4) secenekler.add(Math.max(4, dogru + Phaser.Math.Between(-12, 12)));
    const karisik = Phaser.Utils.Array.Shuffle([...secenekler]);

    this.add.text(x, 230, 'Ebeveyn bölümü', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '64px', color: '#FFC93C' }).setOrigin(0.5);
    this.add
      .text(x, 330, 'Devam etmek için soruyu cevaplayın.', { fontFamily: YAZI_TIPI, fontSize: '34px', color: '#cfe3ff' })
      .setOrigin(0.5);
    this.add
      .text(x, 470, `${a} × ${b} = ?`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '110px', color: '#ffffff' })
      .setOrigin(0.5);

    karisik.forEach((sayi, i) => {
      const sx = x + (i % 2 === 0 ? -150 : 150);
      const sy = 700 + Math.floor(i / 2) * 190;
      buyukDugme(this, sx, sy, String(sayi), RENK.mavi, () => {
        if (sayi === dogru) this.scene.start(this.hedef);
        else {
          bip(200, 0.2, 'square', 0.15);
          this.scene.start(this.geri);
        }
      }, { genislik: 250, yukseklik: 150, yaziBoyu: 70 });
    });
  }
}

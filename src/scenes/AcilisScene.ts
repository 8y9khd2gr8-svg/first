import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, yildizliArkaPlan } from '../arayuz';
import { sesiAc } from '../ses';
import { Zipzip } from '../zipzip';
import { pasaportOku, pasaportYaz } from '../pasaport';

// Açılış ekranı: oyunun adı, zıplayan Zıpzıp ve büyük "Oyna" düğmesi.
export class AcilisScene extends Phaser.Scene {
  constructor() {
    super('Acilis');
  }

  preload() {
    Zipzip.yukle(this);
  }

  create() {
    yildizliArkaPlan(this);
    const { width } = this.scale.gameSize;
    const x = width / 2;

    const baslikStili = { fontFamily: YAZI_TIPI, fontStyle: 'bold', stroke: '#0b1430', strokeThickness: 16 };
    this.add.text(x, 200, 'Zıp Zıp', { ...baslikStili, fontSize: '130px', color: '#FFC93C' }).setOrigin(0.5);
    this.add.text(x, 320, 'Dünya', { ...baslikStili, fontSize: '110px', color: '#ffffff' }).setOrigin(0.5);

    new Zipzip(this, x, 660, 1.6).surekli('zipla', 1300);

    buyukDugme(
      this,
      x,
      1090,
      'Oyna ▶',
      RENK.turuncu,
      () => {
        sesiAc();
        const ilkSefer = !pasaportOku().soruldu;
        if (ilkSefer) pasaportYaz({ soruldu: true });
        this.scene.start(ilkSefer ? 'Pasaport' : 'Harita', { giris: 'uzay' });
      },
      { genislik: 480, yukseklik: 160, yaziBoyu: 80 },
    );
  }
}

import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, yildizliArkaPlan, CIZILI_SIMGELER } from '../arayuz';
import { sesiAc } from '../ses';
import { Zipzip } from '../zipzip';
import { pasaportOku, pasaportYaz } from '../pasaport';
import { guvenlikNotuGoruldu } from '../guvenlik';

// Açılış ekranı: oyunun adı, zıplayan Zıpzıp ve büyük "Oyna" düğmesi.
export class AcilisScene extends Phaser.Scene {
  constructor() {
    super('Acilis');
  }

  preload() {
    Zipzip.yukle(this);
    this.load.image('ikon', 'ikon/ikon-192.png');
    CIZILI_SIMGELER.forEach((id) => this.load.svg(`simge-${id}`, `simge/${id}.svg`, { width: 256, height: 256 }));
  }

  create() {
    yildizliArkaPlan(this);
    const { width } = this.scale.gameSize;
    const x = width / 2;

    const baslikStili = { fontFamily: YAZI_TIPI, fontStyle: 'bold', stroke: '#0b1430', strokeThickness: 16 };
    this.add.text(x, 200, 'Zıp Zıp', { ...baslikStili, fontSize: '130px', color: '#FFC93C' }).setOrigin(0.5);
    this.add.text(x, 320, 'Dünya', { ...baslikStili, fontSize: '110px', color: '#ffffff' }).setOrigin(0.5);

    const zipzip = new Zipzip(this, x, 720, 1.4);
    zipzip.ifadeSec('mutlu');
    zipzip.surekli('zipla', 1300);

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
        const sonra = ilkSefer ? 'Pasaport' : 'Macera';
        // İlk açılışta önce ebeveyn güvenlik notu (bir kez).
        if (!guvenlikNotuGoruldu()) this.scene.start('Guvenlik', { sonra, sonraVeri: { giris: 'uzay' } });
        else this.scene.start(sonra, { giris: 'uzay' });
      },
      { genislik: 480, yukseklik: 160, yaziBoyu: 80 },
    );
  }
}

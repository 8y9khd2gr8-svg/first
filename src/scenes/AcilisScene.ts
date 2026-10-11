import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, yildizliArkaPlan, CIZILI_SIMGELER } from '../arayuz';
import { sesiAc } from '../ses';
import { Zipzip } from '../zipzip';
import { pasaportOku, pasaportYaz } from '../pasaport';
import { guvenlikNotuGoruldu } from '../guvenlik';

let simgelerIstendi = false;

// Açılış ekranı: oyunun adı, zıplayan Zıpzıp ve büyük "Oyna" düğmesi.
export class AcilisScene extends Phaser.Scene {
  private gidiyor = false;

  constructor() {
    super('Acilis');
  }

  preload() {
    this.load.image('ikon', 'ikon/ikon-192.png');
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
        // Durak simgeleri arkada yükleniyorsa bitmesini bekle (haritalar onları kullanır).
        if (this.load.isLoading()) this.load.once(Phaser.Loader.Events.COMPLETE, () => this.devamEt());
        else this.devamEt();
      },
      { genislik: 480, yukseklik: 160, yaziBoyu: 80 },
    );
    // Açılış hızı ölçümü için (scripts/acilis-olc.mjs): "Oyna" düğmesi ekranda.
    performance.mark('acilis-hazir');

    // Durak simgeleri açılış ekranında görünmez: ekran çizildikten sonra arkada yüklenir
    // (yavaş telefonda "Oyna" düğmesi daha erken görünür).
    // Uygulama açık kaldıkça bir kez istenir (açılışa geri dönülünce yeniden yüklenmez).
    if (!simgelerIstendi) {
      simgelerIstendi = true;
      CIZILI_SIMGELER.forEach((id) => this.load.svg(`simge-${id}`, `simge/${id}.svg`, { width: 256, height: 256 }));
      this.load.start();
    }
  }

  private devamEt() {
    if (this.gidiyor) return; // bekleme sırasında iki kez dokunulduysa
    this.gidiyor = true;
    const ilkSefer = !pasaportOku().soruldu;
    if (ilkSefer) pasaportYaz({ soruldu: true });
    const sonra = ilkSefer ? 'Pasaport' : 'Macera';
    // İlk açılışta önce ebeveyn güvenlik notu (bir kez).
    if (!guvenlikNotuGoruldu()) this.scene.start('Guvenlik', { sonra, sonraVeri: { giris: 'uzay' } });
    else this.scene.start(sonra, { giris: 'uzay' });
  }
}

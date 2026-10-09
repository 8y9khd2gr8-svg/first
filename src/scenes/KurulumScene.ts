import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { iPhoneMu, uygulamaOlarakAcik, yuklenebilir, yukle } from '../kurulum';

// Ebeveyn için: oyunu telefona uygulama gibi yükleme adımları.
export class KurulumScene extends Phaser.Scene {
  constructor() {
    super('Kurulum');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start('EbeveynMenu'));
    this.add.text(x, 190, 'Telefona yükle', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '72px', color: '#FFC93C' }).setOrigin(0.5);
    this.add.image(x, 400, 'ikon').setDisplaySize(200, 200);

    const yazi = (y: number, metin: string, boy = 36) =>
      this.add.text(x, y, metin, { fontFamily: YAZI_TIPI, fontSize: `${boy}px`, color: '#ffffff', align: 'center', lineSpacing: 10 }).setOrigin(0.5, 0);

    if (uygulamaOlarakAcik()) {
      yazi(580, 'Zıp Zıp Dünya bu telefona\nzaten yüklü. 🎉\n\nİnternet olmadan da oynanabilir.', 42);
      return;
    }
    if (iPhoneMu()) {
      yazi(560, 'iPhone / iPad için:', 40).setColor('#FFC93C');
      yazi(640, '1. Safari’nin altındaki Paylaş ⬆️\n    düğmesine dokunun\n\n2. “Ana Ekrana Ekle”yi seçin\n\n3. Sağ üstteki “Ekle”ye dokunun', 36).setAlign('left');
    } else if (yuklenebilir()) {
      const dugme = this.add.dom(x, 640, 'button', DUGME_STILI, '📲 Yükle');
      dugme.addListener('click');
      dugme.on('click', async () => {
        if (await yukle()) this.scene.restart();
      });
      yazi(760, 'Yükledikten sonra ana ekrandaki\nZıp Zıp ikonundan açabilirsiniz.', 34);
    } else {
      yazi(560, 'Android için:', 40).setColor('#FFC93C');
      yazi(640, '1. Chrome’un sağ üstündeki ⋮\n    menüsüne dokunun\n\n2. “Ana ekrana ekle” ya da\n    “Uygulamayı yükle”yi seçin', 36).setAlign('left');
    }
    yazi(1060, 'Yükledikten sonra oyun internet\nolmadan da çalışır.', 32).setColor('#9fb6d9');
  }
}

const DUGME_STILI =
  "font: 700 48px 'Baloo 2', Arial, sans-serif; padding: 18px 56px; border-radius: 44px; border: 6px solid #fff; background: #3FBF5F; color: #fff;";

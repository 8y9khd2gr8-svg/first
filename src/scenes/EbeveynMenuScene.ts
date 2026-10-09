import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { betaDunyaAc, betaDunyaAcikMi } from '../ilerleme';

// Ebeveyn köşesi (kilidin arkasında): hareket özeti ve pasaport ayarları.
export class EbeveynMenuScene extends Phaser.Scene {
  constructor() {
    super('EbeveynMenu');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start('Pasaport'));
    this.add.text(x, 220, 'Ebeveyn köşesi', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '72px', color: '#FFC93C' }).setOrigin(0.5);
    buyukDugme(this, x, 460, '📊 Hareket özeti', RENK.turuncu, () => this.scene.start('EbeveynOzet'), { genislik: 560, yukseklik: 150, yaziBoyu: 54 });
    buyukDugme(this, x, 660, '✏️ Pasaportu düzenle', RENK.mavi, () => this.scene.start('PasaportAyar'), { genislik: 560, yukseklik: 150, yaziBoyu: 54 });
    // Beta testi için: Dünya bölümünü Türkiye Turu bitmeden açar. Mağazaya çıkmadan kaldırılacak.
    const beta = betaDunyaAcikMi();
    this.add
      .text(x, 1040, beta ? '🧪 Beta: Dünya bölümü açık (kapat)' : '🧪 Beta: Dünya bölümünü aç', { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        betaDunyaAc(!beta);
        this.scene.restart();
      });
    buyukDugme(this, x, 860, '📲 Telefona yükle', RENK.yesil, () => this.scene.start('Kurulum'), { genislik: 560, yukseklik: 150, yaziBoyu: 54 });
    this.add
      .text(x, 1200, 'Reklam yok. Hesap yok.\nBütün bilgiler sadece bu telefonda saklanır.', {
        fontFamily: YAZI_TIPI,
        fontSize: '32px',
        color: '#9fb6d9',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}

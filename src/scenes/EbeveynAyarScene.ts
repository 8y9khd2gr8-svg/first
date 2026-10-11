import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { oyunAyari, oyunAyariYaz } from '../oyunAyari';

// Ebeveyn köşesi → ⚙️ Ayarlar: yaş grubu (tekrar sayısı ve tempo) ve oturarak oyna.
// Değişiklik bir sonraki durakta geçerli olur. Seçimler sadece bu telefonda saklanır.
export class EbeveynAyarScene extends Phaser.Scene {
  constructor() {
    super('EbeveynAyar');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const ayar = oyunAyari();
    evDugmesi(this, () => this.scene.start('EbeveynMenu', {}));
    this.add.text(x, 170, 'Oyun ayarları', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '68px', color: '#FFC93C' }).setOrigin(0.5);

    const aciklama = (y: number, metin: string) =>
      this.add.text(x, y, metin, { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#cfe3ff', align: 'center', lineSpacing: 4 }).setOrigin(0.5);
    const baslik = (y: number, metin: string) =>
      this.add.text(x, y, metin, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);
    const sec = (degisiklik: Parameters<typeof oyunAyariYaz>[0]) => {
      oyunAyariYaz(degisiklik);
      this.scene.restart();
    };

    // Yaş grubu
    baslik(290, 'Çocuğun yaşı');
    const kucuk = ayar.yas === 'kucuk';
    buyukDugme(this, x - 150, 400, `${kucuk ? '✓ ' : ''}4-5 yaş`, kucuk ? RENK.yesil : 0x3a4f7a, () => sec({ yas: 'kucuk' }), { genislik: 280, yukseklik: 110, yaziBoyu: 44 });
    buyukDugme(this, x + 150, 400, `${!kucuk ? '✓ ' : ''}6-9 yaş`, !kucuk ? RENK.yesil : 0x3a4f7a, () => sec({ yas: 'buyuk' }), { genislik: 280, yukseklik: 110, yaziBoyu: 44 });
    aciklama(520, '4-5 yaşta tekrarlar daha az, ritim daha yavaş\nve süreli hareketler daha kısa olur.');

    // Oturarak oyna
    baslik(680, '🪑 Oturarak oyna');
    const oturarak = ayar.oturarak;
    buyukDugme(this, x, 790, oturarak ? '✓ Açık' : 'Kapalı', oturarak ? RENK.yesil : 0x3a4f7a, () => sec({ oturarak: !oturarak }), { genislik: 360, yukseklik: 110, yaziBoyu: 44 });
    aciklama(935, 'Ayakta yapılan hareketler (zıplama, çömelme...)\nyerine oturarak yapılan kol ve gövde\nhareketleri gelir. Hareket kısıtı, yorgunluk\nya da dar alan için.');

    aciklama(1120, 'Değişiklik bir sonraki durakta geçerli olur.\nSeçimler sadece bu telefonda saklanır.').setColor('#9fb6d9').setFontSize(26);
  }
}

import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { oyunAyari, oyunAyariYaz } from '../oyunAyari';

// Ebeveyn köşesi → ⚙️ Ayarlar: hareket temposu (Sakin: daha az tekrar, daha yavaş; Hızlı: daha çok, daha hızlı) ve oturarak oyna.
// Tempo yaşla değil adıyla seçilir (yaş etiketi çocuğu damgalamasın; yeni başlayan büyük çocuk da Sakin'i seçebilir).
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

    // Hareket temposu (kayıtta yas: 'kucuk' = Sakin, 'buyuk' = Normal, 'hizli' = Hızlı)
    baslik(290, 'Hareket temposu');
    // Üç düğme yan yana: yazı iki satır (hayvan / ad), büyük kalsın diye (küçülünce yeşil üstünde zıtlık yetmez).
    const tempolar = [['kucuk', '🐢', 'Sakin'], ['buyuk', '🐇', 'Normal'], ['hizli', '🐆', 'Hızlı']] as const;
    tempolar.forEach(([yas, hayvan, ad], i) => {
      const secili = ayar.yas === yas;
      buyukDugme(this, x + (i - 1) * 222, 410, `${secili ? '✓ ' : ''}${hayvan}\n${ad}`, secili ? RENK.yesil : 0x3a4f7a, () => sec({ yas }), { genislik: 210, yukseklik: 130, yaziBoyu: 40 });
    });
    aciklama(545, 'Sakin: daha az tekrar, daha yavaş (4-5 yaş\nya da yeni başlayanlar için önerilir).\nHızlı: daha çok tekrar, daha hızlı ritim.');

    // Oturarak oyna
    baslik(680, '🪑 Oturarak oyna');
    const oturarak = ayar.oturarak;
    buyukDugme(this, x, 790, oturarak ? '✓ Açık' : 'Kapalı', oturarak ? RENK.yesil : 0x3a4f7a, () => sec({ oturarak: !oturarak }), { genislik: 360, yukseklik: 110, yaziBoyu: 44 });
    aciklama(935, 'Ayakta yapılan hareketler (zıplama, çömelme...)\nyerine oturarak yapılan kol ve gövde\nhareketleri gelir. Hareket kısıtı, yorgunluk\nya da dar alan için.');

    aciklama(1120, 'Değişiklik bir sonraki durakta geçerli olur.\nSeçimler sadece bu telefonda saklanır.').setColor('#9fb6d9').setFontSize(26);
  }
}

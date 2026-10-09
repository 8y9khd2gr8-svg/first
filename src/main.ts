import Phaser from 'phaser';
import { GENISLIK, RENK, YUKSEKLIK } from './ayarlar';
import { AcilisScene } from './scenes/AcilisScene';
import { HareketScene } from './scenes/HareketScene';
import { OdulScene } from './scenes/OdulScene';

function oyunuBaslat() {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'oyun',
    backgroundColor: RENK.uzay,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GENISLIK,
      height: YUKSEKLIK,
    },
    scene: [AcilisScene, HareketScene, OdulScene],
  });
}

// Yazı tipi inmeden başlarsak ilk ekranda yedek yazı tipi görünür; en fazla 2 sn bekle.
Promise.race([document.fonts.load("700 64px 'Baloo 2'"), new Promise((r) => setTimeout(r, 2000))]).finally(oyunuBaslat);

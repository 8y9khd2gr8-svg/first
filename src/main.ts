import Phaser from 'phaser';
import { GENISLIK, RENK, YUKSEKLIK } from './ayarlar';
import { AcilisScene } from './scenes/AcilisScene';
import { DurakScene } from './scenes/DurakScene';
import { HaritaScene } from './scenes/HaritaScene';
import { HareketScene } from './scenes/HareketScene';
import { OdulScene } from './scenes/OdulScene';

function oyunuBaslat() {
  const oyun = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'oyun',
    backgroundColor: RENK.uzay,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GENISLIK,
      height: YUKSEKLIK,
    },
    scene: [AcilisScene, HaritaScene, DurakScene, HareketScene, OdulScene],
  });
  // Geliştirme sırasında otomatik testlerin oyuna erişebilmesi için.
  if (import.meta.env.DEV) (window as unknown as { oyun: Phaser.Game }).oyun = oyun;
}

// Yazı tipi inmeden başlarsak ilk ekranda yedek yazı tipi görünür; en fazla 2 sn bekle.
Promise.race([document.fonts.load("700 64px 'Baloo 2'"), new Promise((r) => setTimeout(r, 2000))]).finally(oyunuBaslat);

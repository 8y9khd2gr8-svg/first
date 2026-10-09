import Phaser from 'phaser';
// Yazı tipi oyunun içinde: internetsiz çalışır ve açılışta Google'a bağlanılmaz.
import '@fontsource/baloo-2/latin-ext-700.css';
import '@fontsource/baloo-2/latin-ext-800.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import { kurulumuDinle } from './kurulum';
import { GENISLIK, RENK, YUKSEKLIK } from './ayarlar';
import { AcilisScene } from './scenes/AcilisScene';
import { DurakScene } from './scenes/DurakScene';
import { HaritaScene } from './scenes/HaritaScene';
import { HareketScene } from './scenes/HareketScene';
import { OdulScene } from './scenes/OdulScene';
import { AvatarScene } from './scenes/AvatarScene';
import { EbeveynMenuScene } from './scenes/EbeveynMenuScene';
import { EbeveynOzetScene } from './scenes/EbeveynOzetScene';
import { SertifikaScene } from './scenes/SertifikaScene';
import { KurulumScene } from './scenes/KurulumScene';
import { DunyaScene } from './scenes/DunyaScene';
import { GuvenlikScene } from './scenes/GuvenlikScene';
import { EbeveynScene } from './scenes/EbeveynScene';
import { PasaportAyarScene } from './scenes/PasaportAyarScene';
import { PasaportScene } from './scenes/PasaportScene';

kurulumuDinle();

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
    // Ad yazma kutusu ve fotoğraf düğmesi gibi HTML öğeleri için.
    dom: { createContainer: true },
    scene: [AcilisScene, HaritaScene, DurakScene, HareketScene, OdulScene, PasaportScene, PasaportAyarScene, EbeveynScene, AvatarScene, EbeveynMenuScene, EbeveynOzetScene, SertifikaScene, KurulumScene, DunyaScene, GuvenlikScene],
  });
  // Geliştirme sırasında otomatik testlerin oyuna erişebilmesi için.
  if (import.meta.env.DEV) (window as unknown as { oyun: Phaser.Game }).oyun = oyun;
}

// Yazı tipi inmeden başlarsak ilk ekranda yedek yazı tipi görünür; en fazla 2 sn bekle.
Promise.race([document.fonts.load("700 64px 'Baloo 2'"), new Promise((r) => setTimeout(r, 2000))]).finally(oyunuBaslat);

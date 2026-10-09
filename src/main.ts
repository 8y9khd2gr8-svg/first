import Phaser from 'phaser';
import { MerhabaScene } from './scenes/MerhabaScene';

// Telefon dik tutulduğunda (portre) en iyi görünen oyun alanı.
export const GENISLIK = 720;
export const YUKSEKLIK = 1280;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'oyun',
  backgroundColor: '#7EC8F0',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GENISLIK,
    height: YUKSEKLIK,
  },
  scene: [MerhabaScene],
});

import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from './ayarlar';
import { bip } from './ses';

// Çocuk parmağına uygun, büyük ve yuvarlak köşeli düğme.
export function buyukDugme(
  sahne: Phaser.Scene,
  x: number,
  y: number,
  yazi: string,
  renk: number,
  basinca: () => void,
  { genislik = 460, yukseklik = 140, yaziBoyu = 64 } = {},
) {
  const dugme = sahne.add.container(x, y);
  const g = sahne.add.graphics();
  g.fillStyle(0x000000, 0.3).fillRoundedRect(-genislik / 2, -yukseklik / 2 + 10, genislik, yukseklik, 40);
  g.fillStyle(renk).fillRoundedRect(-genislik / 2, -yukseklik / 2, genislik, yukseklik, 40);
  g.lineStyle(8, RENK.beyaz).strokeRoundedRect(-genislik / 2, -yukseklik / 2, genislik, yukseklik, 40);
  const t = sahne.add
    .text(0, 4, yazi, { fontFamily: YAZI_TIPI, fontSize: `${yaziBoyu}px`, color: '#ffffff', fontStyle: 'bold' })
    .setOrigin(0.5)
    .setShadow(0, 4, 'rgba(0,0,0,0.3)', 0);
  dugme.add([g, t]);
  dugme.setSize(genislik, yukseklik).setInteractive({ useHandCursor: true });

  let basildi = false;
  dugme.on('pointerdown', () => {
    if (basildi) return; // çift dokunuşları yok say
    basildi = true;
    bip(880, 0.08, 'square', 0.12);
    sahne.tweens.add({
      targets: dugme,
      scale: 0.9,
      duration: 90,
      yoyo: true,
      onComplete: () => {
        basildi = false;
        basinca();
      },
    });
  });
  return dugme;
}

// Uzay arka planı: lacivert gökyüzü ve hafifçe parıldayan yıldızlar.
export function yildizliArkaPlan(sahne: Phaser.Scene) {
  const { width, height } = sahne.scale.gameSize;
  sahne.cameras.main.setBackgroundColor(RENK.uzay);
  for (let i = 0; i < 60; i++) {
    const yildiz = sahne.add.circle(
      Phaser.Math.Between(0, width),
      Phaser.Math.Between(0, height),
      Phaser.Math.FloatBetween(1, 3.2),
      RENK.beyaz,
      Phaser.Math.FloatBetween(0.3, 0.9),
    );
    sahne.tweens.add({
      targets: yildiz,
      alpha: 0.15,
      duration: Phaser.Math.Between(900, 2400),
      yoyo: true,
      repeat: -1,
      delay: Phaser.Math.Between(0, 2000),
    });
  }
}

// Sol üstte ana ekrana dönüş düğmesi.
export function evDugmesi(sahne: Phaser.Scene, basinca: () => void) {
  const d = sahne.add.container(80, 80);
  d.add(sahne.add.circle(0, 0, 48, 0xffffff, 0.15));
  d.add(sahne.add.text(0, 0, '⌂', { fontFamily: 'Arial, sans-serif', fontSize: '56px', color: '#ffffff' }).setOrigin(0.5));
  d.setSize(96, 96).setInteractive({ useHandCursor: true });
  d.on('pointerdown', () => {
    bip(500, 0.08);
    basinca();
  });
  return d;
}

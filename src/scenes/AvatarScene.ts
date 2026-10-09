import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { AVATARLAR, pasaportOku, pasaportYaz } from '../pasaport';
import { bip, konus } from '../ses';

// Çocuk pasaport karakterini kendisi seçer (ebeveyn kilidi gerekmez).
export class AvatarScene extends Phaser.Scene {
  constructor() {
    super('Avatar');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const secili = pasaportOku().avatar;
    evDugmesi(this, () => this.scene.start('Pasaport'));

    this.add
      .text(x, 190, 'Karakterini seç!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '76px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 12 })
      .setOrigin(0.5);
    konus('Pasaportun için bir karakter seç!');

    AVATARLAR.forEach((avatar, i) => {
      const ax = x + ((i % 2) - 0.5) * 300;
      const ay = 380 + Math.floor(i / 2) * 220;
      const kart = this.add.container(ax, ay);
      const g = this.add.graphics();
      g.fillStyle(avatar.simge === secili ? RENK.sari : 0xffffff, avatar.simge === secili ? 1 : 0.12).fillRoundedRect(-130, -95, 260, 190, 36);
      kart.add(g);
      kart.add(this.add.text(-55, 0, avatar.simge, { fontSize: '100px' }).setOrigin(0.5));
      kart.add(this.add.text(55, 0, avatar.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '38px', color: avatar.simge === secili ? '#14213D' : '#ffffff' }).setOrigin(0.5));
      kart.setSize(260, 190).setInteractive({ useHandCursor: true });
      kart.on('pointerdown', () => {
        bip(880, 0.1, 'triangle', 0.2);
        pasaportYaz({ avatar: avatar.simge });
        konus(`${avatar.ad}! Harika seçim!`);
        this.tweens.add({ targets: kart, scale: 1.15, duration: 150, yoyo: true, onComplete: () => this.scene.start('Pasaport') });
      });
    });
  }
}

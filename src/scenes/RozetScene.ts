import Phaser from 'phaser';
import { YAZI_TIPI, hareketiAzalt } from '../ayarlar';
import { evDugmesi, rozetCiz, yildizliArkaPlan, genisDokunma } from '../arayuz';
import { kazanilanlar, ROZETLER } from '../rozetler';
import { bip, konus } from '../ses';
import { M } from '../metinler';

// Rozetlerim: kazanılanlar parlar, kazanılmayanlarda nasıl kazanılacağı yazar.
const SAYFA_BASI = 12; // 3 sütun × 4 satır

export class RozetScene extends Phaser.Scene {
  private sayfa = 0;

  constructor() {
    super('Rozet');
  }

  init(veri: { sayfa?: number }) {
    this.sayfa = veri?.sayfa ?? 0;
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const kazanilan = kazanilanlar();
    evDugmesi(this, () => this.scene.start('Pasaport', {}));
    this.add.text(x, 150, 'Rozetlerim', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '76px', color: '#FFC93C' }).setOrigin(0.5);
    this.add
      .text(x, 225, `${kazanilan.size} / ${ROZETLER.length}`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '36px', color: '#cfe3ff' })
      .setOrigin(0.5);

    const sayfaSayisi = Math.ceil(ROZETLER.length / SAYFA_BASI);
    ROZETLER.slice(this.sayfa * SAYFA_BASI, (this.sayfa + 1) * SAYFA_BASI).forEach((r, i) => {
      const rx = x + ((i % 3) - 1) * 215;
      const ry = 340 + Math.floor(i / 3) * 228;
      const var_ = kazanilan.has(r.id);
      const rozet = rozetCiz(this, rx, ry, 50, r.simge, var_);
      if (var_ && !hareketiAzalt()) this.tweens.add({ targets: rozet, angle: { from: -4, to: 4 }, duration: 1400 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      const ad = this.add
        .text(rx, ry + 80, r.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '26px', color: var_ ? '#ffffff' : '#9fb6d9' })
        .setOrigin(0.5);
      // Uzun ad ("Hafta Sonu Sporcusu") yan sütundakine değmesin.
      ad.setScale(Math.min(1, 200 / ad.width));
      this.add
        .text(rx, ry + 110, r.nasil, { fontFamily: YAZI_TIPI, fontSize: '22px', color: '#9fb6d9', align: 'center', wordWrap: { width: 200 } })
        .setOrigin(0.5, 0);
      rozet.setSize(110, 110).setInteractive({ useHandCursor: true });
      rozet.on('pointerdown', () => {
        bip(var_ ? 880 : 300, 0.1, 'triangle', 0.2);
        this.tweens.add({ targets: rozet, scale: 1.2, duration: 150, yoyo: true });
        konus(var_ ? M.rozetAdi(r.ad) : M.rozetNasil(r.nasil));
      });
    });
  
    // Sayfa çevir
    if (sayfaSayisi > 1) {
      this.add.text(x, 1230, `${this.sayfa + 1} / ${sayfaSayisi}`, { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff' }).setOrigin(0.5);
      const ok = (ox: number, yazi: string, hedef: number) =>
        genisDokunma(
          this.add
            .text(ox, 1230, yazi, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#14213D', backgroundColor: '#FFC93C', padding: { x: 26, y: 4 } })
            .setOrigin(0.5),
        ).on('pointerdown', () => {
            bip(700, 0.08);
            this.scene.restart({ sayfa: hedef });
          });
      if (this.sayfa > 0) ok(x - 180, '◀', this.sayfa - 1);
      if (this.sayfa < sayfaSayisi - 1) ok(x + 180, '▶', this.sayfa + 1);
    }
  }
}

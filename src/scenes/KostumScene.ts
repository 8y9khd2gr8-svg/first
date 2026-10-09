import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { KOSTUMLER, kostumSec, seciliKostum, yildizSayisi } from '../kostumler';
import { M } from '../metinler';
import { bip, konus } from '../ses';
import { Zipzip } from '../zipzip';

// Kostüm dolabı: açılan kostümlerden biri giyilir; kilitlilerde kaç yıldız gerektiği yazar.
export class KostumScene extends Phaser.Scene {
  constructor() {
    super('Kostum');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const yildiz = yildizSayisi();
    const secili = seciliKostum();
    evDugmesi(this, () => this.scene.start('Pasaport', {}));

    this.add.text(x, 90, 'Kostüm Dolabı', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '62px', color: '#FFC93C' }).setOrigin(0.5);
    this.add
      .text(x, 160, `⭐ ${yildiz} yıldız`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '36px', color: '#14213D', backgroundColor: '#FFC93C', padding: { x: 20, y: 4 } })
      .setOrigin(0.5);

    // Kostüm net görünsün diye zıplamak yerine kollarını kaldırıp indirir.
    const zipzip = new Zipzip(this, x, 370, 0.95);
    zipzip.surekli('kollar', 1600);
    this.add.text(x, 530, 'Her “Yaptım!” = 1 yıldız', { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#9fb6d9' }).setOrigin(0.5);

    // "Kostümsüz" + 9 kostüm: 5 sütun × 2 satır
    const secenekler = [{ id: undefined as string | undefined, simge: '🚫', ad: 'Kostümsüz', yildiz: 0 }, ...KOSTUMLER];
    secenekler.forEach((k, i) => {
      const kx = x + ((i % 5) - 2) * 132;
      const ky = 680 + Math.floor(i / 5) * 230;
      const acik = yildiz >= k.yildiz;
      const giyili = k.id === secili;
      const kart = this.add.container(kx, ky);
      const g = this.add.graphics();
      g.fillStyle(giyili ? RENK.sari : 0xffffff, giyili ? 1 : acik ? 0.14 : 0.06).fillRoundedRect(-60, -80, 120, 190, 24);
      kart.add(g);
      kart.add(this.add.text(0, -18, k.simge, { fontSize: '62px' }).setOrigin(0.5).setAlpha(acik ? 1 : 0.3));
      kart.add(
        this.add
          .text(0, 50, k.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '20px', color: giyili ? '#14213D' : '#ffffff', align: 'center', wordWrap: { width: 110 } })
          .setOrigin(0.5)
          .setAlpha(acik ? 1 : 0.6),
      );
      if (!acik) {
        kart.add(this.add.text(0, -18, '🔒', { fontSize: '34px' }).setOrigin(0.5));
        // Ne kadar kaldı: küçük ilerleme çubuğu
        const oran = Math.min(1, yildiz / k.yildiz);
        g.fillStyle(0xffffff, 0.15).fillRoundedRect(-46, 88, 92, 10, 5);
        g.fillStyle(RENK.sari).fillRoundedRect(-46, 88, Math.max(6, 92 * oran), 10, 5);
        kart.add(this.add.text(0, 75, `${k.yildiz} ⭐`, { fontFamily: YAZI_TIPI, fontSize: '20px', color: '#cfe3ff' }).setOrigin(0.5));
      }
      kart.setSize(120, 190).setInteractive({ useHandCursor: true });
      kart.on('pointerdown', () => {
        if (!acik) {
          bip(260, 0.12, 'square', 0.12);
          this.tweens.add({ targets: kart, angle: { from: -5, to: 5 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kart.setAngle(0) });
          konus(M.kostumKilitli(k.yildiz - yildiz));
          return;
        }
        bip(880, 0.1, 'triangle', 0.2);
        kostumSec(k.id);
        if (k.id) konus(M.kostumSecildi(k.ad));
        this.scene.restart();
      });
    });

    if (!this.registry.get('kostumAnlatildi')) {
      this.registry.set('kostumAnlatildi', true);
      konus(M.kostumDolabi);
    }
  }
}

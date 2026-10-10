import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { KOSTUMLER, Kostum, acikKostumler, kostumNasil, kostumSec, seciliKostum, yildizSayisi } from '../kostumler';
import { durakBul } from '../duraklar';
import { M } from '../metinler';
import { bip, konus } from '../ses';
import { Zipzip } from '../zipzip';

// Kostüm dolabı: açılan kostümlerden biri giyilir; kilitlilerde hangi yerden açılacağı yazar.
export class KostumScene extends Phaser.Scene {
  constructor() {
    super('Kostum');
  }

  private geri = 'Pasaport';

  init(veri: { geri?: string }) {
    this.geri = veri?.geri ?? 'Pasaport';
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const yildiz = yildizSayisi();
    const secili = seciliKostum();
    evDugmesi(this, () => this.scene.start(this.geri, {}));

    this.add.text(x, 90, 'Kostüm Dolabı', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '62px', color: '#FFC93C' }).setOrigin(0.5);
    this.add
      .text(x, 160, `⭐ ${yildiz} yıldız`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '36px', color: '#14213D', backgroundColor: '#FFC93C', padding: { x: 20, y: 4 } })
      .setOrigin(0.5);

    // Kostüm net görünsün diye zıplamak yerine kollarını kaldırıp indirir.
    const zipzip = new Zipzip(this, x, 370, 0.95);
    zipzip.surekli('kollar', 1600);
    this.add.text(x, 530, 'Gezdiğin her yerden bir hatıra!', { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#9fb6d9' }).setOrigin(0.5);

    // "Kostümsüz" + 13 kostüm: 5 sütun × 3 satır. Kilitlide nereden açılacağı yazar.
    const aciklar = new Set(acikKostumler().map((k) => k.id));
    const secenekler: (Kostum | { id: undefined; simge: string; ad: string })[] = [{ id: undefined, simge: '🚫', ad: 'Kostümsüz' }, ...KOSTUMLER];
    secenekler.forEach((k, i) => {
      const kx = x + ((i % 5) - 2) * 132;
      const ky = 660 + Math.floor(i / 5) * 205;
      const acik = !k.id || aciklar.has(k.id);
      const giyili = k.id === secili;
      const kart = this.add.container(kx, ky);
      const g = this.add.graphics();
      g.fillStyle(giyili ? RENK.sari : 0xffffff, giyili ? 1 : acik ? 0.14 : 0.06).fillRoundedRect(-60, -80, 120, 180, 24);
      kart.add(g);
      kart.add(this.add.text(0, -24, k.simge, { fontSize: '58px' }).setOrigin(0.5).setAlpha(acik ? 1 : 0.3));
      kart.add(
        this.add
          .text(0, 42, k.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '21px', color: giyili ? '#14213D' : '#ffffff', align: 'center', wordWrap: { width: 110 } })
          .setOrigin(0.5)
          .setAlpha(acik ? 1 : 0.6),
      );
      if (!acik) {
        kart.add(this.add.text(0, -24, '🔒', { fontSize: '32px' }).setOrigin(0.5));
        const yer = 'durak' in k && k.durak ? durakBul(k.durak) : undefined;
        kart.add(this.add.text(0, 84, yer ? `${yer.simge} ${yer.yer}` : '🏆 Bölüm', { fontFamily: YAZI_TIPI, fontSize: '18px', color: '#cfe3ff' }).setOrigin(0.5));
      }
      kart.setSize(120, 180).setInteractive({ useHandCursor: true });
      kart.on('pointerdown', () => {
        if (!acik && k.id) {
          bip(260, 0.12, 'square', 0.12);
          this.tweens.add({ targets: kart, angle: { from: -5, to: 5 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => kart.setAngle(0) });
          konus(M.kostumKilitli(kostumNasil(k as Kostum)));
          return;
        }
        bip(880, 0.1, 'triangle', 0.2);
        kostumSec(k.id);
        if (k.id) konus(M.kostumSecildi(k.ad));
        this.scene.restart({ geri: this.geri });
      });
    });

    if (!this.registry.get('kostumAnlatildi')) {
      this.registry.set('kostumAnlatildi', true);
      konus(M.kostumDolabi);
    }
  }
}

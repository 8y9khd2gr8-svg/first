import Phaser from 'phaser';
import { RENK, YAZI_TIPI, hareketiAzalt, uzaktanAcikMi, uzaktanAyarla } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan, durakSimgesi, genisDokunma } from '../arayuz';
import { BOLUMLER, durakBul, haritaSahnesi } from '../duraklar';
import { M } from '../metinler';
import { bip, konus, sustur } from '../ses';

// Durak girişi: yerin adı, simgesi ve "Biliyor muydun?" bilgisi.
export class DurakScene extends Phaser.Scene {
  private durakId = '';

  constructor() {
    super('Durak');
  }

  init(veri: { durakId: string }) {
    this.durakId = veri.durakId;
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const durak = durakBul(this.durakId);
    const kutuBaslik = BOLUMLER[durak.bolum].kutuBaslik ?? 'Biliyor muydun?';

    evDugmesi(this, () => {
      sustur();
      this.scene.start(haritaSahnesi(durak), {});
    });

    // Gezegenlerde ve sporlarda yer ve ad aynı ("Satürn"); iki kez yazmayalım.
    if (durak.yer !== durak.ad) this.add.text(x, 170, durak.yer, { fontFamily: YAZI_TIPI, fontSize: '44px', color: '#cfe3ff' }).setOrigin(0.5);
    this.add
      .text(x, 250, durak.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '88px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 14 })
      .setOrigin(0.5);

    const simge = durakSimgesi(this, durak, x, 470, 200);
    if (!hareketiAzalt()) this.tweens.add({ targets: simge, y: 445, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const kutu = this.add.graphics();
    kutu.fillStyle(0xffffff, 0.1).fillRoundedRect(50, 640, 620, 320, 36);
    kutu.lineStyle(4, RENK.sari, 0.8).strokeRoundedRect(50, 640, 620, 320, 36);
    this.add.text(x, 690, kutuBaslik, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#FFC93C' }).setOrigin(0.5);
    // Bilgi yazısı bir kerede, yumuşakça belirir (harf harf akınca yarım kalmış gibi görünüyordu).
    const bilgi = this.add
      .text(x, 735, durak.bilgi, { fontFamily: YAZI_TIPI, fontSize: '34px', color: '#ffffff', align: 'center', wordWrap: { width: 570 }, lineSpacing: 4 })
      .setOrigin(0.5, 0)
      .setAlpha(0);
    bilgi.setScale(Math.min(1, 210 / bilgi.height));
    this.tweens.add({ targets: bilgi, alpha: 1, duration: 500, delay: 600 });

    konus(M.durakGiris(durak.yer, durak.ad, durak.bilgi, BOLUMLER[durak.bolum].kutuBaslik));

    this.add
      .text(x, 1245, '⚠️ Etrafında eşya olmasın, bir büyüğün yakında olsun.', { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#9fb6d9' })
      .setOrigin(0.5);

    buyukDugme(this, x, 1060, 'Başla ▶', RENK.turuncu, () => {
      sustur();
      this.scene.start('Hareket', { durakId: durak.id, adim: 0 });
    }, { genislik: 460, yukseklik: 140, yaziBoyu: 72 });

    // Uzaktan oyna: telefon 2-3 metre uzaktayken "Yaptım!"a gitmeye gerek kalmaz.
    let uzaktan = uzaktanAcikMi();
    const uzaktanDugme = this.add
      .text(x, 1170, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '32px', padding: { x: 22, y: 8 } })
      .setOrigin(0.5);
    const goster = () =>
      uzaktanDugme
        .setText(uzaktan ? '📱 Uzaktan oyna: AÇIK' : '📱 Uzaktan oyna: kapalı')
        .setColor(uzaktan ? '#14213D' : '#cfe3ff')
        .setBackgroundColor(uzaktan ? '#FFC93C' : '#ffffff1f');
    goster();
    genisDokunma(uzaktanDugme, 80);
    uzaktanDugme.on('pointerdown', () => {
      uzaktan = !uzaktan;
      uzaktanAyarla(uzaktan);
      bip(uzaktan ? 880 : 500, 0.08, 'square', 0.12);
      goster();
      if (uzaktan) konus(M.uzaktanAcik);
    });
  }
}

import Phaser from 'phaser';
import { RENK, YAZI_TIPI, HAREKETI_AZALT } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { BOLUMLER, durakBul, haritaSahnesi } from '../duraklar';
import { M } from '../metinler';
import { konus, sustur } from '../ses';

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

    const simge = this.add.text(x, 470, durak.simge, { fontSize: '200px' }).setOrigin(0.5);
    if (!HAREKETI_AZALT) this.tweens.add({ targets: simge, y: 445, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const kutu = this.add.graphics();
    kutu.fillStyle(0xffffff, 0.1).fillRoundedRect(50, 640, 620, 320, 36);
    kutu.lineStyle(4, RENK.sari, 0.8).strokeRoundedRect(50, 640, 620, 320, 36);
    this.add.text(x, 690, kutuBaslik, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#FFC93C' }).setOrigin(0.5);
    // Bilgi yazısı, ses okurken harf harf ekrana akar.
    const bilgi = this.add
      .text(x, 735, durak.bilgi, { fontFamily: YAZI_TIPI, fontSize: '36px', color: '#ffffff', align: 'center', wordWrap: { width: 560 }, lineSpacing: 4 })
      .setOrigin(0.5, 0);
    const satirlar = bilgi.getWrappedText(durak.bilgi);
    bilgi.setText('');
    const harfSayisi = durak.bilgi.length;
    const sayac = { n: 0 };
    this.tweens.add({
      targets: sayac,
      n: harfSayisi,
      delay: 1300, // önce yer ve durak adı okunur
      duration: harfSayisi * 62,
      onUpdate: () => {
        let kalan = Math.floor(sayac.n);
        bilgi.setText(satirlar.map((s) => { const p = s.slice(0, Math.max(0, kalan)); kalan -= s.length + 1; return p; }).join('\n'));
      },
      onComplete: () => bilgi.setText(satirlar.join('\n')),
    });

    konus(M.durakGiris(durak.yer, durak.ad, durak.bilgi, BOLUMLER[durak.bolum].kutuBaslik));

    this.add
      .text(x, 1225, '⚠️ Etrafın boş mu? Bir büyüğün yanında mı?', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#9fb6d9' })
      .setOrigin(0.5);

    buyukDugme(this, x, 1100, 'Başla ▶', RENK.turuncu, () => {
      sustur();
      this.scene.start('Hareket', { durakId: durak.id, adim: 0 });
    }, { genislik: 460, yukseklik: 150, yaziBoyu: 72 });
  }
}

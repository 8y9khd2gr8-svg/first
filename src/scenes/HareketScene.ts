import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { durakBul, oturum } from '../duraklar';
import { Hareket } from '../hareketler';
import { bip, konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

const MASKOT_Y = 640;

// Hareket ekranı. Bir durağın 5 hareketini sırayla oynatır.
// Her hareket: Zıpzıp gösterir → 3-2-1 → çocuk yapar (sayaç) → "Yaptım!" → sıradaki.
export class HareketScene extends Phaser.Scene {
  private durakId = '';
  private adim = 0;
  private zipzip!: Zipzip;
  private sayac!: Phaser.GameObjects.Text;
  private bilgi!: Phaser.GameObjects.Text;

  constructor() {
    super('Hareket');
  }

  init(veri: { durakId: string; adim?: number }) {
    this.durakId = veri.durakId;
    this.adim = veri.adim ?? 0;
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const liste = oturum(durakBul(this.durakId));
    const hareket = liste[this.adim];

    evDugmesi(this, () => {
      sustur();
      this.scene.start('Harita', {});
    });

    // İlerleme noktaları: kaçıncı hareketteyiz?
    liste.forEach((_, i) => {
      const nx = x + (i - (liste.length - 1) / 2) * 56;
      this.add.circle(nx, 80, 16, i < this.adim ? RENK.sari : i === this.adim ? RENK.beyaz : 0xffffff, i <= this.adim ? 1 : 0.25);
    });

    if (hareket.hikaye) {
      this.add.text(x, 170, hareket.hikaye, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#cfe3ff' }).setOrigin(0.5);
    }
    const komut = this.add
      .text(x, hareket.hikaye ? 280 : 240, hareket.baslik, {
        fontFamily: YAZI_TIPI,
        fontStyle: 'bold',
        fontSize: '72px',
        color: '#FFC93C',
        align: 'center',
        stroke: '#0b1430',
        strokeThickness: 14,
        lineSpacing: -16,
      })
      .setOrigin(0.5);
    // Uzun komutlar ekrandan taşmasın.
    komut.setScale(Math.min(1, 660 / komut.width));

    this.zipzip = new Zipzip(this, x, MASKOT_Y, 1.5);
    this.sayac = this.add
      .text(x, 1060, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '150px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 14 })
      .setOrigin(0.5);
    this.bilgi = this.add
      .text(x, 1200, 'Önce Zıpzıp’ı izle!', { fontFamily: YAZI_TIPI, fontSize: '44px', color: '#cfe3ff' })
      .setOrigin(0.5);

    konus(hareket.sesli);

    // Gösterim: Zıpzıp hareketi bir iki kez yapar.
    const gosterimSuresi = 2600;
    if (hareket.tur === 'sayi') {
      this.zipzip.birKez(hareket.animasyon, hareket.tempoMs);
      if (hareket.tempoMs < gosterimSuresi) {
        this.time.delayedCall(hareket.tempoMs, () => this.zipzip.birKez(hareket.animasyon, hareket.tempoMs, 2));
      }
    } else {
      this.zipzip.surekli(hareket.animasyon);
      this.time.delayedCall(gosterimSuresi - 400, () => this.zipzip.durdur());
    }

    // Uzun cümlelerde seslendirme bitmeden geri sayım başlamasın.
    const bekleme = Math.max(gosterimSuresi + 600, hareket.sesli.length * 70);
    this.time.delayedCall(bekleme, () => this.geriSay(() => this.basla(hareket)));
  }

  private geriSay(bitince: () => void) {
    this.bilgi.setText('Hazır ol!');
    ['3', '2', '1', 'Başla!'].forEach((s, i) => {
      this.time.delayedCall(i * 900, () => {
        const basla = i === 3;
        this.sayacGoster(s, basla ? '#3FBF5F' : '#ffffff');
        bip(basla ? 880 : 520, basla ? 0.35 : 0.15, 'triangle');
        if (basla) this.time.delayedCall(600, bitince);
      });
    });
  }

  private basla(hareket: Hareket) {
    this.bilgi.setText('Sen de yap!');
    if (hareket.tur === 'sayi') {
      for (let k = 1; k <= hareket.adet; k++) {
        this.time.delayedCall((k - 1) * hareket.tempoMs, () => {
          this.zipzip.birKez(hareket.animasyon, hareket.tempoMs, k);
          this.sayacGoster(String(k));
          bip(560 + k * 40, 0.12);
        });
      }
      this.time.delayedCall(hareket.adet * hareket.tempoMs, () => this.bitir());
    } else {
      this.zipzip.surekli(hareket.animasyon);
      for (let s = hareket.saniye; s >= 1; s--) {
        this.time.delayedCall((hareket.saniye - s) * 1000, () => {
          this.sayacGoster(String(s));
          bip(600, 0.08);
        });
      }
      this.time.delayedCall(hareket.saniye * 1000, () => this.bitir());
    }
  }

  private bitir() {
    this.zipzip.durdur();
    this.sayac.setText('');
    this.bilgi.setText('');
    konus('Süper! Yaptıysan, Yaptım düğmesine bas!');

    const x = this.scale.gameSize.width / 2;
    const dugme = buyukDugme(this, x, 1080, 'Yaptım!', RENK.yesil, () => {
      sustur();
      dugme.destroy();
      this.sonraki();
    }, { genislik: 500, yukseklik: 170, yaziBoyu: 84 });
    dugme.setScale(0);
    this.tweens.add({ targets: dugme, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.tweens.add({ targets: dugme, angle: { from: -3, to: 3 }, duration: 500, yoyo: true, repeat: -1, delay: 400 });
  }

  // Kısa bir "Aferin!" kutlaması, sonra sıradaki hareket ya da ödül ekranı.
  private sonraki() {
    const sonAdim = this.adim >= oturum(durakBul(this.durakId)).length - 1;
    if (sonAdim) {
      this.scene.start('Odul', { durakId: this.durakId });
      return;
    }
    const x = this.scale.gameSize.width / 2;
    zaferMuzigi();
    const aferin = this.add
      .text(x, 1080, 'Aferin!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '120px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 16 })
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({ targets: aferin, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.zipzip.birKez('zipla', 900);
    this.time.delayedCall(1300, () => this.scene.restart({ durakId: this.durakId, adim: this.adim + 1 }));
  }

  private sayacGoster(metin: string, renk = '#ffffff') {
    this.sayac.setText(metin).setColor(renk).setScale(0.3);
    this.tweens.add({ targets: this.sayac, scale: 1, duration: 250, ease: 'Back.easeOut' });
  }
}

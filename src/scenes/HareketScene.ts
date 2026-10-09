import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { Animasyon, Hareket, HAREKETLER } from '../hareketler';
import { bip, konus, sustur } from '../ses';

const MASKOT_Y = 640;
const MASKOT_OLCEK = 0.8;

// Hareket ekranı. Akış: Zıpzıp hareketi gösterir → 3-2-1 → çocuk hareketi yapar
// (sayaç ilerler) → "Yaptım!" düğmesi çıkar → ödül ekranı.
export class HareketScene extends Phaser.Scene {
  private sira = 0;
  private maskot!: Phaser.GameObjects.Image;
  private golge!: Phaser.GameObjects.Ellipse;
  private sayac!: Phaser.GameObjects.Text;
  private bilgi!: Phaser.GameObjects.Text;

  constructor() {
    super('Hareket');
  }

  init(veri: { sira?: number }) {
    this.sira = veri.sira ?? 0;
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const hareket = HAREKETLER[this.sira % HAREKETLER.length];

    evDugmesi(this, () => {
      sustur();
      this.scene.start('Acilis');
    });

    this.add
      .text(x, 230, hareket.baslik, {
        fontFamily: YAZI_TIPI,
        fontStyle: 'bold',
        fontSize: '80px',
        color: '#FFC93C',
        align: 'center',
        stroke: '#0b1430',
        strokeThickness: 14,
        lineSpacing: -16,
      })
      .setOrigin(0.5);

    this.golge = this.add.ellipse(x, 900, 260, 40, 0x000000, 0.35);
    this.maskot = this.add.image(x, MASKOT_Y, 'maskot').setScale(MASKOT_OLCEK);
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
      this.oynat(hareket.animasyon, hareket.tempoMs);
      this.time.delayedCall(hareket.tempoMs, () => this.oynat(hareket.animasyon, hareket.tempoMs));
    } else {
      this.oynat(hareket.animasyon, 0, true);
      this.time.delayedCall(gosterimSuresi - 400, () => this.durdur());
    }

    // Uzun cümlelerde seslendirme bitmeden geri sayım başlamasın.
    const bekleme = Math.max(gosterimSuresi + 600, hareket.sesli.length * 75);
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
          this.oynat(hareket.animasyon, hareket.tempoMs);
          this.sayacGoster(String(k));
          bip(560 + k * 50, 0.12);
        });
      }
      this.time.delayedCall(hareket.adet * hareket.tempoMs, () => this.bitir());
    } else {
      this.oynat(hareket.animasyon, 0, true);
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
    this.durdur();
    this.sayac.setText('');
    this.bilgi.setText('');
    konus('Süper! Yaptıysan, Yaptım düğmesine bas!');

    const x = this.scale.gameSize.width / 2;
    const dugme = buyukDugme(
      this,
      x,
      1080,
      'Yaptım!',
      RENK.yesil,
      () => {
        sustur();
        this.scene.start('Odul', { sira: this.sira });
      },
      { genislik: 500, yukseklik: 170, yaziBoyu: 84 },
    );
    dugme.setScale(0);
    this.tweens.add({ targets: dugme, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.tweens.add({ targets: dugme, angle: { from: -3, to: 3 }, duration: 500, yoyo: true, repeat: -1, delay: 400 });
  }

  private sayacGoster(metin: string, renk = '#ffffff') {
    this.sayac.setText(metin).setColor(renk).setScale(0.3);
    this.tweens.add({ targets: this.sayac, scale: 1, duration: 250, ease: 'Back.easeOut' });
  }

  // Zıpzıp'ın her hareket için yaptığı animasyon. "sure": bir tekrarın süresi (ms).
  private oynat(animasyon: Animasyon, sure: number, surekli = false) {
    const m = this.maskot;
    const tekrar = surekli ? -1 : 0;
    const ortak = { targets: m, yoyo: true, repeat: tekrar };
    switch (animasyon) {
      case 'zipla':
        this.tweens.add({ ...ortak, y: MASKOT_Y - 220, duration: sure * 0.35, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: this.golge, scale: 0.55, duration: sure * 0.35, yoyo: true, repeat: tekrar, ease: 'Quad.easeOut' });
        break;
      case 'comel':
        this.tweens.add({ ...ortak, scaleY: MASKOT_OLCEK * 0.7, scaleX: MASKOT_OLCEK * 1.12, y: MASKOT_Y + 80, duration: sure * 0.4, ease: 'Sine.easeInOut' });
        break;
      case 'kos':
        this.tweens.add({ ...ortak, y: MASKOT_Y - 50, duration: 160, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: m, angle: { from: -6, to: 6 }, duration: 320, yoyo: true, repeat: tekrar });
        break;
      case 'denge':
        this.tweens.add({ targets: m, angle: { from: -10, to: 10 }, duration: 900, yoyo: true, repeat: tekrar, ease: 'Sine.easeInOut' });
        break;
      case 'kanat':
        this.tweens.add({ ...ortak, scaleX: MASKOT_OLCEK * 1.2, y: MASKOT_Y - 40, duration: sure * 0.3, ease: 'Sine.easeInOut' });
        break;
      case 'yildiz':
        this.tweens.add({ ...ortak, scale: MASKOT_OLCEK * 1.25, y: MASKOT_Y - 120, duration: sure * 0.35, ease: 'Quad.easeOut' });
        break;
      case 'uzan':
        this.tweens.add({ ...ortak, scaleY: MASKOT_OLCEK * 1.3, y: MASKOT_Y - 90, duration: sure * 0.4, ease: 'Sine.easeInOut' });
        break;
    }
  }

  private durdur() {
    this.tweens.killTweensOf([this.maskot, this.golge]);
    this.maskot.setPosition(this.scale.gameSize.width / 2, MASKOT_Y).setScale(MASKOT_OLCEK).setAngle(0);
    this.golge.setScale(1);
  }
}

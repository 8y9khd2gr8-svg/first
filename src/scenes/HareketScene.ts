import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { AILE_ID } from '../aile';
import { durakBul, haritaSahnesi } from '../duraklar';
import { SOGUMA_ID, hareketYapildi, oturumListesi } from '../oturum';
import { uzaktanAcikMi } from '../ayarlar';
import { Animasyon, Hareket } from '../hareketler';
import { hareketKaydet } from '../istatistik';
import { KAMERA_HAREKETLERI, KameraSayaci, kameraAcikMi } from '../kamera';
import { GERI_SAYIM, M, SAYILAR } from '../metinler';
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
  // Kamera ile sayma (ebeveyn açtıysa ve hareket destekleniyorsa).
  private kamera: KameraSayaci | null = null;
  private kameraHedefe: (() => void) | null = null;

  constructor() {
    super('Hareket');
  }

  init(veri: { durakId: string; adim?: number }) {
    this.durakId = veri.durakId;
    this.adim = veri.adim ?? 0;
  }

  create() {
    this.donuk = false;
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const liste = this.liste();
    const hareket = liste[this.adim];

    evDugmesi(this, () => {
      sustur();
      this.scene.start(this.durakId === AILE_ID || this.durakId === SOGUMA_ID ? 'Macera' : haritaSahnesi(durakBul(this.durakId)), {});
    });

    // İlerleme noktaları: kaçıncı hareketteyiz?
    liste.forEach((_, i) => {
      const nx = x + (i - (liste.length - 1) / 2) * 56;
      this.add.circle(nx, 80, 16, i < this.adim ? RENK.sari : i === this.adim ? RENK.beyaz : 0xffffff, i <= this.adim ? 1 : 0.25);
    });

    if (hareket.hikaye) {
      const hikaye = this.add
        .text(x, 170, hareket.hikaye, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: hareket.surpriz ? '#FF8A3D' : '#cfe3ff' })
        .setOrigin(0.5);
      // Uzun hikâye tek satırda kalsın, ekrana sığsın.
      hikaye.setScale(Math.min(1, 670 / hikaye.width));
    }
    // Ritim işareti: okuma bilmeyen de görsün (🐢 yavaş, ⚡ hızlı).
    if (hareket.ritim) {
      const r = this.add.container(110, 520);
      r.add(this.add.circle(0, 0, 62, 0xffffff, 0.12).setStrokeStyle(4, RENK.sari));
      r.add(this.add.text(0, -8, hareket.ritim === 'yavas' ? '🐢' : '⚡', { fontSize: '62px' }).setOrigin(0.5));
      r.add(this.add.text(0, 82, hareket.ritim === 'yavas' ? 'Yavaş' : 'Hızlı', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '30px', color: '#FFC93C' }).setOrigin(0.5));
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
    this.kameraKur(hareket);

    // Gösterim: Zıpzıp hareketi bir iki kez yapar.
    const gosterimSuresi = 2600;
    if (hareket.tur === 'sayi') {
      this.zipzip.birKez(this.tekrarHareketi(hareket, 1), hareket.tempoMs);
      if (hareket.tempoMs < gosterimSuresi) {
        this.time.delayedCall(hareket.tempoMs, () => this.zipzip.birKez(this.tekrarHareketi(hareket, 2), hareket.tempoMs, 2));
      }
    } else {
      this.zipzip.surekli(hareket.dizi?.[0] ?? hareket.animasyon, this.surekliTempo(hareket));
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
        konus(GERI_SAYIM[i]);
        if (basla) this.time.delayedCall(600, bitince);
      });
    });
  }

  private basla(hareket: Hareket) {
    this.bilgi.setText('Sen de yap!');
    if (hareket.tur === 'sayi') {
      for (let k = 1; k <= hareket.adet; k++) {
        this.time.delayedCall((k - 1) * hareket.tempoMs, () => {
          this.zipzip.birKez(this.tekrarHareketi(hareket, k), hareket.tempoMs, k);
          this.sayacGoster(String(k));
          bip(560 + k * 40, 0.12);
          konus(SAYILAR[k - 1] ?? '');
        });
      }
      this.time.delayedCall(hareket.adet * hareket.tempoMs, () => this.bitir(hareket));
    } else {
      this.zipzip.surekli(hareket.dizi?.[0] ?? hareket.animasyon, this.surekliTempo(hareket));
      for (let s = hareket.saniye; s >= 1; s--) {
        this.time.delayedCall((hareket.saniye - s) * 1000, () => {
          if (!this.donuk) this.sayacGoster(String(s));
          bip(600, 0.08);
          if (s <= 3 && !hareket.surpriz) konus(GERI_SAYIM[3 - s]);
        });
      }
      if (hareket.surpriz === 'donma') this.donmaOyunu(hareket);
      if (hareket.surpriz === 'ayna') this.aynaOyunu(hareket);
      this.time.delayedCall(hareket.saniye * 1000, () => this.bitir(hareket));
    }
  }

  private bitir(hareket: Hareket) {
    this.zipzip.durdur();
    this.sayac.setText('');
    this.bilgi.setText('');
    const uzaktan = uzaktanAcikMi();
    konus(uzaktan ? M.devamEdiyoruz : M.yaptinMi);

    const x = this.scale.gameSize.width / 2;
    let bitti = false;
    const yaptim = () => {
      if (bitti) return;
      bitti = true;
      this.kameraHedefe = null;
      sustur();
      hareketKaydet(hareket);
      hareketYapildi();
      dugme.destroy();
      this.sonraki();
    };
    const dugme = buyukDugme(this, x, 1080, 'Yaptım!', RENK.yesil, yaptim, { genislik: 500, yukseklik: 170, yaziBoyu: 84 });
    // Kamera hedef sayıyı gördüyse kendiliğinden geçer; görmediyse düğme bekler
    // (kaybetmek yok) ve kamera saymaya devam eder.
    if (this.kamera && hareket.tur === 'sayi') {
      const hedef = hareket.adet;
      this.kameraHedefe = () => {
        if (this.kamera && this.kamera.sayi >= hedef) {
          konus(M.kameraGordu);
          this.time.delayedCall(900, yaptim);
          this.kameraHedefe = null;
        }
      };
      this.kameraHedefe();
    }
    // Uzaktan oyna: telefona gitmeye gerek yok, 3 saniye sonra kendiliğinden geçer (dokunarak hemen geçilir).
    if (uzaktan) {
      const geri = this.add.text(x, 1200, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '40px', color: '#cfe3ff' }).setOrigin(0.5);
      [3, 2, 1].forEach((n, i) => this.time.delayedCall(800 + i * 1000, () => !bitti && geri.setText(`📱 ${n}…`)));
      this.time.delayedCall(3800, yaptim);
    }
    dugme.setScale(0);
    this.tweens.add({ targets: dugme, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.tweens.add({ targets: dugme, angle: { from: -3, to: 3 }, duration: 500, yoyo: true, repeat: -1, delay: 400 });
  }

  // Kısa bir "Aferin!" kutlaması, sonra sıradaki hareket ya da ödül ekranı.
  private sonraki() {
    const sonAdim = this.adim >= this.liste().length - 1;
    if (sonAdim) {
      if (this.durakId === SOGUMA_ID) {
        this.zipzip.ifadeSec('uykulu');
        konus(M.bugunlukBitti);
        this.time.delayedCall(2500, () => this.scene.start('Macera', {}));
        return;
      }
      this.scene.start('Odul', { durakId: this.durakId });
      return;
    }
    const x = this.scale.gameSize.width / 2;
    zaferMuzigi();
    konus(M.aferin);
    const aferin = this.add
      .text(x, 1080, 'Aferin!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '120px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 16 })
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({ targets: aferin, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.zipzip.ifadeSec('mutlu');
    this.zipzip.birKez('zipla', 900);
    this.time.delayedCall(1300, () => this.scene.restart({ durakId: this.durakId, adim: this.adim + 1 }));
  }

  // Sağ üstte küçük kamera önizlemesi ve sayı. Görüntü sadece ekranda gösterilir.
  private kameraKur(hareket: Hareket) {
    if (!kameraAcikMi() || hareket.tur !== 'sayi' || hareket.dizi || !KAMERA_HAREKETLERI.includes(hareket.animasyon)) return;
    const kutu = document.createElement('div');
    kutu.style.cssText = 'width:150px;height:140px;border-radius:16px;overflow:hidden;background:#0b1430;border:4px solid #FFC93C;position:relative;font-family:"Baloo 2",sans-serif;';
    const yazi = document.createElement('div');
    yazi.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:#0b1430cc;color:#fff;font-weight:700;font-size:20px;text-align:center;line-height:30px;';
    yazi.textContent = '📷 Hazırlanıyor';
    const kamera = new KameraSayaci(hareket.animasyon, (sayi, durum) => {
      yazi.textContent =
        durum === 'hata' ? '📷 Açılamadı' : durum === 'goremiyorum' ? '📷 Geri git' : durum === 'yukleniyor' ? '📷 Hazırlanıyor' : `📷 ${Math.min(sayi, hareket.adet)}/${hareket.adet}`;
      this.kameraHedefe?.();
    });
    const video = kamera.onizleme;
    video.style.cssText = 'width:100%;height:110px;object-fit:cover;transform:scaleX(-1);display:block;';
    kutu.append(video, yazi);
    this.add.dom(626, 78, kutu);
    this.kamera = kamera;
    kamera.baslat();
    this.events.once('shutdown', () => {
      kamera.durdur();
      this.kamera = null;
      this.kameraHedefe = null;
    });
  }

  // Durağın oyun sırası (ısınma, sürpriz, soğuma dahil); durak başında bir kez kurulur.
  private liste(): Hareket[] {
    return oturumListesi(this.durakId, this.adim);
  }

  // Birleşik harekette her tekrarın kendi hareketi (zıpla, zıpla, çömel...).
  private tekrarHareketi(h: Hareket, tekrarNo: number): Animasyon {
    return h.dizi ? h.dizi[(tekrarNo - 1) % h.dizi.length] : h.animasyon;
  }

  // Süreli harekette ritim: yavaşta Zıpzıp da yavaşlar, hızlıda hızlanır.
  private surekliTempo(h: Hareket): number | undefined {
    if (!h.ritim) return undefined;
    const temel = { kos: 520, horon: 380, parmakUcu: 700, kulac: 1400, kanat: 900, sallan: 1600 }[h.animasyon as string] ?? 1000;
    return Math.round(temel * (h.ritim === 'yavas' ? 1.5 : 0.7));
  }

  private donuk = false;

  // Donma oyunu: Zıpzıp dans eder; ara ara "Dur!" der ve donar, sonra "Devam!".
  private donmaOyunu(h: Hareket) {
    if (h.tur !== 'sure') return;
    // Her donma 1.8 sn sürer; son donma süre bitmeden biter.
    const anlar = [3, 6.5, 10].filter((s) => s < h.saniye - 3.2).map((s) => s + Math.random() * 1.2);
    anlar.forEach((an) => {
      this.time.delayedCall(an * 1000, () => {
        this.donuk = true;
        this.zipzip.durdur();
        this.sayac.setText('✋ DUR!').setColor('#FF8A3D');
        bip(300, 0.2, 'square', 0.2);
        konus(M.dur);
      });
      this.time.delayedCall((an + 1.8) * 1000, () => {
        this.donuk = false;
        this.sayac.setColor('#ffffff');
        konus(M.devam);
        this.zipzip.surekli(h.animasyon);
      });
    });
  }

  // Ayna oyunu: Zıpzıp sırayla farklı hareketler yapar; çocuk aynısını yapar.
  private aynaOyunu(h: Hareket) {
    if (h.tur !== 'sure' || !h.dizi) return;
    const dizi = h.dizi;
    const her = (h.saniye * 1000) / dizi.length;
    dizi.forEach((a, i) => {
      if (i === 0) return;
      this.time.delayedCall(i * her, () => {
        this.zipzip.surekli(a);
        bip(700 + i * 80, 0.15, 'triangle', 0.2);
        this.cameras.main.flash(150, 255, 201, 60);
      });
    });
  }

  private sayacGoster(metin: string, renk = '#ffffff') {
    this.sayac.setText(metin).setColor(renk).setScale(0.3);
    this.tweens.add({ targets: this.sayac, scale: 1, duration: 250, ease: 'Back.easeOut' });
  }
}

import Phaser from 'phaser';
import { RENK, YAZI_TIPI, hareketiAzalt } from './ayarlar';
import { bip } from './ses';
import type { Durak } from './duraklar';

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
    if (!hareketiAzalt()) sahne.tweens.add({
      targets: yildiz,
      alpha: 0.15,
      duration: Phaser.Math.Between(900, 2400),
      yoyo: true,
      repeat: -1,
      delay: Phaser.Math.Between(0, 2000),
    });
  }
}

// Yazı düğmesinin görünüşü küçük kalsa da dokunma alanı en az `enAz` boyunda olur (çocuk parmağı ıskalamasın).
// 88 oyun noktası telefonda yaklaşık 48 piksel eder (Android/iOS önerisi).
export function genisDokunma(yazi: Phaser.GameObjects.Text, enAz = 88) {
  const ex = Math.max(0, (enAz - yazi.width) / 2);
  const ey = Math.max(0, (enAz - yazi.height) / 2);
  // Yazı sonradan değişirse (setText) alan yeniden hesaplanır: zaten dokunulabilirse sadece alanı güncellenir.
  if (yazi.input) {
    (yazi.input.hitArea as Phaser.Geom.Rectangle).setTo(-ex, -ey, yazi.width + 2 * ex, yazi.height + 2 * ey);
    return yazi;
  }
  return yazi.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(-ex, -ey, yazi.width + 2 * ex, yazi.height + 2 * ey),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true,
  });
}

// Sol üstte ana ekrana dönüş düğmesi.
export function evDugmesi(sahne: Phaser.Scene, basinca: () => void) {
  // Belirgin ev düğmesi: renkli daire, beyaz kenar ve ev resmi (okuma bilmeyen de tanır).
  const d = sahne.add.container(80, 80);
  d.add(sahne.add.circle(0, 5, 48, 0x000000, 0.3));
  d.add(sahne.add.circle(0, 0, 48, RENK.mavi).setStrokeStyle(5, RENK.beyaz));
  d.add(sahne.add.text(0, 2, '🏠', { fontSize: '50px' }).setOrigin(0.5));
  d.setSize(96, 96).setInteractive({ useHandCursor: true });
  d.on('pointerdown', () => {
    bip(500, 0.08);
    basinca();
  });
  return d;
}

// Madalya biçiminde rozet: kurdele, altın (kazanıldıysa) ya da gri daire, ortada simge.
export function rozetCiz(sahne: Phaser.Scene, x: number, y: number, r: number, simge: string, kazanildi: boolean) {
  const rozet = sahne.add.container(x, y);
  const g = sahne.add.graphics();
  const kurdele = kazanildi ? [0xff6b6b, 0x2f80ed] : [0x6b7280, 0x6b7280];
  g.fillStyle(kurdele[0]).fillTriangle(-r * 0.7, -r * 0.2, -r * 0.05, -r * 0.2, -r * 0.55, r * 1.25);
  g.fillStyle(kurdele[1]).fillTriangle(r * 0.05, -r * 0.2, r * 0.7, -r * 0.2, r * 0.55, r * 1.25);
  g.fillStyle(kazanildi ? 0xe0a100 : 0x4b5563).fillCircle(0, 0, r);
  g.fillStyle(kazanildi ? 0xffc93c : 0x6b7280).fillCircle(0, 0, r * 0.82);
  rozet.add(g);
  rozet.add(
    sahne.add
      .text(0, 2, kazanildi ? simge : '?', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: `${Math.round(r * 0.95)}px`, color: '#ffffff' })
      .setOrigin(0.5)
      .setAlpha(kazanildi ? 1 : 0.6),
  );
  return rozet;
}

// Durak simgesi: çizilmiş görseli varsa (public/simge/<id>.svg) onu, yoksa emojiyi gösterir.
// boy: simgenin ekrandaki yaklaşık boyu (piksel).
export function durakSimgesi(sahne: Phaser.Scene, durak: Durak, x: number, y: number, boy: number): Phaser.GameObjects.Image | Phaser.GameObjects.Text {
  const anahtar = `simge-${durak.id}`;
  if (sahne.textures.exists(anahtar)) return sahne.add.image(x, y, anahtar).setDisplaySize(boy * 1.15, boy * 1.15);
  return sahne.add.text(x, y, durak.simge, { fontSize: `${boy}px` }).setOrigin(0.5);
}

// Çizilmiş simgesi olan duraklar (açılışta yüklenir).
export const CIZILI_SIMGELER = ['istanbul', 'truva', 'pamukkale', 'kapadokya', 'nemrut', 'gobeklitepe', 'karadeniz', 'efes', 'kolezyum', 'piramitler', 'petra', 'tacmahal', 'cinseddi', 'machupicchu'];

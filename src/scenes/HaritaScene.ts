import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { TURKIYE } from '../duraklar';
import { DURAK_KONUMLARI, HARITA_BOYUTU } from '../haritaKonumlar';
import { tamamlananlar } from '../ilerleme';
import { bip, konus, sustur } from '../ses';
import { Zipzip } from '../zipzip';

const HARITA_Y = 250; // haritanın üst kenarı
// Birbirine çok yakın duraklar üst üste binmesin diye küçük kaydırmalar.
const KAYDIRMA: Record<string, [number, number]> = { nemrut: [-10, -22], gobeklitepe: [14, 22] };

// Türkiye haritası: duraklar sırayla açılır, Zıpzıp sıradaki durağın üstünde zıplar.
export class HaritaScene extends Phaser.Scene {
  constructor() {
    super('Harita');
  }

  preload() {
    this.load.svg('haritaTurkiye', 'harita-turkiye.svg', { width: HARITA_BOYUTU.genislik * 2, height: HARITA_BOYUTU.yukseklik * 2 });
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => {
      sustur();
      this.scene.start('Acilis');
    });

    const pasaportDugmesi = this.add.container(640, 80);
    pasaportDugmesi.add(this.add.circle(0, 0, 50, RENK.turuncu).setStrokeStyle(5, RENK.beyaz));
    pasaportDugmesi.add(this.add.text(0, 2, '🛂', { fontSize: '50px' }).setOrigin(0.5));
    pasaportDugmesi.setSize(100, 100).setInteractive({ useHandCursor: true });
    pasaportDugmesi.on('pointerdown', () => {
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Pasaport');
    });

    this.add
      .text(x, 150, 'Türkiye Turu', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '84px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 14 })
      .setOrigin(0.5);

    this.add.image(0, HARITA_Y, 'haritaTurkiye').setOrigin(0).setScale(0.5);

    const biten = new Set(tamamlananlar());
    const siradaki = TURKIYE.findIndex((d) => !biten.has(d.id));
    const konum = (id: string) => {
      const [px, py] = DURAK_KONUMLARI[id];
      const [kx, ky] = KAYDIRMA[id] ?? [0, 0];
      return { x: px + kx, y: HARITA_Y + py + ky };
    };

    // Rota: duraklar arasında kesikli çizgi; gidilen kısım altın sarısı.
    const rota = this.add.graphics();
    TURKIYE.slice(1).forEach((d, i) => {
      const a = konum(TURKIYE[i].id);
      const b = konum(d.id);
      const gidildi = biten.has(d.id);
      rota.lineStyle(6, gidildi ? RENK.sari : RENK.beyaz, gidildi ? 1 : 0.6);
      const adim = Math.ceil(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / 18);
      for (let k = 0; k < adim; k += 2) {
        rota.lineBetween(
          Phaser.Math.Linear(a.x, b.x, k / adim),
          Phaser.Math.Linear(a.y, b.y, k / adim),
          Phaser.Math.Linear(a.x, b.x, Math.min(1, (k + 1) / adim)),
          Phaser.Math.Linear(a.y, b.y, Math.min(1, (k + 1) / adim)),
        );
      }
    });

    TURKIYE.forEach((durak, i) => {
      const { x: dx, y: dy } = konum(durak.id);
      const acik = i <= siradaki || siradaki === -1;
      const bitti = biten.has(durak.id);
      const isaret = this.add.container(dx, dy);
      isaret.add(this.add.circle(0, 0, 34, bitti ? RENK.sari : acik ? RENK.turuncu : 0x6b7280).setStrokeStyle(5, RENK.beyaz));
      isaret.add(this.add.text(0, 2, acik ? durak.simge : '🔒', { fontSize: '36px' }).setOrigin(0.5));
      isaret.add(
        this.add
          .text(0, 50, durak.yer, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '24px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 6 })
          .setOrigin(0.5),
      );
      isaret.setSize(80, 80).setInteractive({ useHandCursor: true });
      isaret.on('pointerdown', () => {
        if (!acik) {
          bip(220, 0.15, 'square', 0.12);
          this.tweens.add({ targets: isaret, x: dx + 8, duration: 50, yoyo: true, repeat: 3 });
          konus('Önce sıradaki durağı bitirelim!');
          return;
        }
        bip(880, 0.08, 'square', 0.12);
        sustur();
        this.scene.start('Durak', { durakId: durak.id });
      });
      if (i === siradaki) this.tweens.add({ targets: isaret, scale: 1.15, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    // Zıpzıp sıradaki durağın üstünde (tur bittiyse son durakta) zıplar.
    const zipzipDurak = TURKIYE[siradaki === -1 ? TURKIYE.length - 1 : siradaki];
    const zk = konum(zipzipDurak.id);
    new Zipzip(this, zk.x, zk.y - 95, 0.32).surekli('zipla', 1200);

    const altYazi =
      siradaki === -1
        ? 'Türkiye Turu’nu bitirdin! 🏆'
        : siradaki === 0
          ? 'İlk durağa dokun ve başla!'
          : `Sıradaki durak: ${TURKIYE[siradaki].yer}`;
    this.add.text(x, 900, altYazi, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#ffffff' }).setOrigin(0.5);

    // 2. bölüm şimdilik kilitli.
    const kapi = this.add.container(x, 1100);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.12).fillRoundedRect(-280, -70, 560, 140, 40);
    kapi.add(g);
    kapi.add(this.add.text(0, -10, '🔒 Dünya Harikaları', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#cfe3ff' }).setOrigin(0.5));
    kapi.add(this.add.text(0, 38, 'Türkiye Turu’ndan sonra', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#9fb6d9' }).setOrigin(0.5));

    konus(
      siradaki === -1
        ? 'Tebrikler! Türkiye turunu bitirdin!'
        : siradaki === 0
          ? 'Türkiye turuna hoş geldin! İlk durağımız İstanbul. Dokun ve başla!'
          : `Sıradaki durağımız ${TURKIYE[siradaki].yer}!`,
    );
  }
}

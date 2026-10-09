import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, yildizliArkaPlan } from '../arayuz';
import { guvenlikNotunuIsaretle } from '../guvenlik';
import { sustur } from '../ses';

const MADDELER: [string, string][] = [
  ['🧹', 'Etrafta boş bir alan açın; sert ve sivri\neşyaları uzaklaştırın.'],
  ['👀', 'Bir yetişkin yanında olsun.'],
  ['🧦', 'Kaygan zeminde çorapla değil,\nyalınayak oynayın.'],
  ['💧', 'Ara ara su içip dinlenin.'],
  ['🤕', 'Ağrı ya da rahatsızlık olursa durun.'],
];

// İlk açılışta bir kez (ve ebeveyn köşesinden) gösterilen ebeveyn güvenlik notu.
export class GuvenlikScene extends Phaser.Scene {
  private sonra = 'Harita';
  private sonraVeri: object = {};

  constructor() {
    super('Guvenlik');
  }

  init(veri: { sonra?: string; sonraVeri?: object }) {
    this.sonra = veri?.sonra ?? 'Harita';
    this.sonraVeri = veri?.sonraVeri ?? {};
  }

  create() {
    sustur();
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    this.add.text(x, 120, 'Ebeveynler için', { fontFamily: YAZI_TIPI, fontSize: '36px', color: '#cfe3ff' }).setOrigin(0.5);
    this.add.text(x, 190, 'Güvenli oyun', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '72px', color: '#FFC93C' }).setOrigin(0.5);

    MADDELER.forEach(([simge, metin], i) => {
      const y = 330 + i * 150;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.08).fillRoundedRect(40, y - 62, 640, 124, 28);
      this.add.text(100, y, simge, { fontSize: '56px' }).setOrigin(0.5);
      this.add.text(160, y, metin, { fontFamily: YAZI_TIPI, fontSize: '30px', color: '#ffffff', lineSpacing: 2 }).setOrigin(0, 0.5);
    });

    this.add
      .text(x, 1060, 'Zıp Zıp Dünya bir oyundur; tıbbi tavsiye yerine geçmez.', { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#9fb6d9' })
      .setOrigin(0.5);

    buyukDugme(this, x, 1170, 'Anladım ✓', RENK.yesil, () => {
      guvenlikNotunuIsaretle();
      this.scene.start(this.sonra, this.sonraVeri);
    }, { genislik: 440, yukseklik: 130, yaziBoyu: 60 });
  }
}

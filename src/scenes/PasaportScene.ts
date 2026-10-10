import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, rozetCiz, yildizliArkaPlan } from '../arayuz';
import { kazanilanlar, ROZETLER } from '../rozetler';
import { BOLUM_SIRASI, BOLUMLER, BolumId, TUM_DURAKLAR, bolumuAcikMi } from '../duraklar';
import { tamamlananlar } from '../ilerleme';
import { BOLUM_KISA } from './BolumScene';
import { fotoDokusuYukle, pasaportOku } from '../pasaport';
import { M } from '../metinler';
import { bip, konus, sustur } from '../ses';
import { Zipzip } from '../zipzip';

const KAGIT = 0xfff6e0;
const MUREKKEP = '#14213D';

// Çocuğun pasaportu: fotoğraf, ad ve toplanan damgalar.
export class PasaportScene extends Phaser.Scene {
  private sayfaNo: BolumId = 'turkiye';

  constructor() {
    super('Pasaport');
  }

  init(veri: { sayfa?: BolumId }) {
    this.sayfaNo = veri?.sayfa ?? 'turkiye';
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const pasaport = pasaportOku();
    const biten = new Set(tamamlananlar());
    const damgaSayisi = TUM_DURAKLAR.filter((d) => biten.has(d.id)).length;
    const bolum = BOLUMLER[this.sayfaNo];

    // Pasaport sayfası ekrana aşağıdan kayarak gelir.
    const sayfa = this.add.container(0, 0);
    const kagit = this.add.graphics();
    kagit.fillStyle(0x000000, 0.3).fillRoundedRect(44, 132, 640, 960, 36);
    kagit.fillStyle(KAGIT).fillRoundedRect(36, 120, 648, 960, 36);
    kagit.fillStyle(RENK.turuncu).fillRoundedRect(36, 120, 648, 110, { tl: 36, tr: 36, bl: 0, br: 0 });
    sayfa.add(kagit);
    sayfa.add(this.add.text(x, 155, 'ZIP ZIP DÜNYA', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#ffffff' }).setOrigin(0.5));
    sayfa.add(this.add.text(x, 198, 'PASAPORT', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: '#ffffff' }).setOrigin(0.5));

    // Fotoğraf çerçevesi (fotoğraf yoksa Zıpzıp durur).
    const cerceve = this.add.graphics();
    cerceve.fillStyle(0xdde7f5).fillRoundedRect(76, 270, 230, 270, 20);
    cerceve.lineStyle(5, 0x14213d, 0.3).strokeRoundedRect(76, 270, 230, 270, 20);
    sayfa.add(cerceve);
    if (pasaport.foto) {
      fotoDokusuYukle(this, pasaport.foto, (anahtar) => {
        const foto = this.add.image(191, 405, anahtar).setDisplaySize(230, 230);
        const maske = this.make.graphics({}).fillRoundedRect(76, 290, 230, 230, 16);
        foto.setMask(maske.createGeometryMask());
        sayfa.add(foto);
      });
    } else if (pasaport.avatar) {
      sayfa.add(this.add.text(191, 395, pasaport.avatar, { fontSize: '150px' }).setOrigin(0.5));
    } else {
      sayfa.add(new Zipzip(this, 191, 380, 0.5));
      const ipucu = this.add.text(191, 512, 'Karakterini seç!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '26px', color: '#FF8A3D' }).setOrigin(0.5);
      sayfa.add(ipucu);
      this.tweens.add({ targets: ipucu, scale: 1.12, duration: 500, yoyo: true, repeat: -1 });
    }
    // Fotoğraf yoksa çocuk çerçeveye dokunup karakterini seçer.
    if (!pasaport.foto) {
      const alan = this.add.zone(191, 405, 230, 270).setInteractive({ useHandCursor: true });
      alan.on('pointerdown', () => {
        bip(880, 0.08, 'square', 0.12);
        sustur();
        this.scene.start('Avatar');
      });
      sayfa.add(alan);
    }

    const etiket = (y: number, yazi: string) =>
      sayfa.add(this.add.text(340, y, yazi, { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#5b6b85' }));
    const deger = (y: number, yazi: string, boy = 44) =>
      sayfa.add(this.add.text(340, y, yazi, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: `${boy}px`, color: MUREKKEP }));

    etiket(280, 'Adı');
    const ad = pasaport.ad ? pasaport.ad.toLocaleUpperCase('tr') : '. . . . . . .';
    const adYazi = this.add.text(340, 310, ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: MUREKKEP });
    adYazi.setScale(Math.min(1, 320 / adYazi.width));
    sayfa.add(adYazi);
    etiket(390, 'Görevi');
    deger(418, 'Dünya Gezgini', 36);
    etiket(475, 'Damgalar');
    deger(500, `${damgaSayisi} / ${TUM_DURAKLAR.length}`, 40);

    // Damga yuvaları: 4 + 3.
    sayfa.add(this.add.text(x, 590, `${bolum.ad} Damgalarım`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '36px', color: MUREKKEP }).setOrigin(0.5));
    bolum.duraklar.forEach((durak, i) => {
      const satir = i < 4 ? 0 : 1;
      const sutunSayisi = satir === 0 ? 4 : bolum.duraklar.length - 4;
      const sutun = satir === 0 ? i : i - 4;
      const dx = x + (sutun - (sutunSayisi - 1) / 2) * 150;
      const dy = 720 + satir * 190;
      const g = this.add.graphics();
      if (biten.has(durak.id)) {
        g.lineStyle(6, RENK.turuncu).strokeCircle(dx, dy, 62);
        g.lineStyle(2, RENK.turuncu).strokeCircle(dx, dy, 52);
        sayfa.add(g);
        const simge = this.add.text(dx, dy - 8, durak.simge, { fontSize: '54px' }).setOrigin(0.5).setAngle(-8);
        sayfa.add(simge);
        sayfa.add(this.add.text(dx, dy + 82, durak.yer, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '22px', color: '#FF8A3D' }).setOrigin(0.5));
      } else {
        g.lineStyle(4, 0x14213d, 0.25);
        for (let a = 0; a < 360; a += 20) {
          const r1 = Phaser.Math.DegToRad(a);
          const r2 = Phaser.Math.DegToRad(a + 10);
          g.lineBetween(dx + 62 * Math.cos(r1), dy + 62 * Math.sin(r1), dx + 62 * Math.cos(r2), dy + 62 * Math.sin(r2));
        }
        sayfa.add(g);
        sayfa.add(this.add.text(dx, dy, '?', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '54px', color: '#14213d' }).setOrigin(0.5).setAlpha(0.25));
      }
    });

    // Sayfa çevir: her bölümün damga sayfası (sekmede bölümün simgesi; okuma bilmeyen de bulur).
    BOLUM_SIRASI.forEach((id, i) => {
      const secili = id === this.sayfaNo;
      const sekme = this.add
        .text(x + (i - (BOLUM_SIRASI.length - 1) / 2) * 100, 1040, BOLUM_KISA[id].simge, {
          fontSize: '44px',
          backgroundColor: secili ? '#FF8A3D' : '#14213D1a',
          padding: { x: 14, y: 6 },
        })
        .setOrigin(0.5)
        .setAlpha(secili || bolumuAcikMi(id) ? 1 : 0.4);
      if (!secili)
        sekme.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
          bip(700, 0.08);
          this.scene.restart({ sayfa: id });
        });
      sayfa.add(sekme);
    });

    // Bölüm rozetleri: kazanıldıysa fotoğraf çerçevesinin köşesinde parlar.
    const kazanilan = kazanilanlar();
    ROZETLER.filter((r) => r.bolum && kazanilan.has(r.id)).forEach((r, i) => sayfa.add(rozetCiz(this, 285 - i * 44, 525, 22, r.simge, true)));

    sayfa.y = 1300;

    // Rozetlerim
    const rozetDugmesi = this.add.container(80, 70);
    rozetDugmesi.add(this.add.circle(0, 0, 44, 0xffffff, 0.15));
    rozetDugmesi.add(this.add.text(0, 2, '🏅', { fontSize: '44px' }).setOrigin(0.5));
    rozetDugmesi.add(
      this.add.text(0, 0, String(kazanilan.size), { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '24px', color: '#14213D', backgroundColor: '#FFC93C', padding: { x: 8, y: 0 } }).setOrigin(-0.6, 1.4),
    );
    rozetDugmesi.setSize(88, 88).setInteractive({ useHandCursor: true });
    const kostumDugmesi = this.add.container(190, 70);
    kostumDugmesi.add(this.add.circle(0, 0, 44, 0xffffff, 0.15));
    kostumDugmesi.add(this.add.text(0, 2, '👕', { fontSize: '44px' }).setOrigin(0.5));
    kostumDugmesi.setSize(88, 88).setInteractive({ useHandCursor: true });
    kostumDugmesi.on('pointerdown', () => {
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Kostum', {});
    });
    rozetDugmesi.on('pointerdown', () => {
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Rozet', {});
    });
    this.tweens.add({ targets: sayfa, y: 0, duration: 650, ease: 'Back.easeOut' });

    // Ebeveyn düzenleme düğmesi (kilitli).
    const ayar = this.add.container(640, 70);
    ayar.add(this.add.circle(0, 0, 44, 0xffffff, 0.15));
    ayar.add(this.add.text(0, 0, '✏️', { fontSize: '40px' }).setOrigin(0.5));
    ayar.setSize(88, 88).setInteractive({ useHandCursor: true });
    ayar.on('pointerdown', () => {
      bip(500, 0.08);
      this.scene.start('Ebeveyn', { hedef: 'EbeveynMenu', geri: 'Pasaport' });
    });

    if (!pasaport.ad) {
      buyukDugme(this, x, 1180, 'Maceraya başla ▶', RENK.turuncu, () => {
        sustur();
        this.scene.start('Macera', {});
      }, { genislik: 420, yukseklik: 120, yaziBoyu: 52 });
      konus(pasaport.avatar ? M.pasaportHazir : M.pasaportIlk);
    } else {
      buyukDugme(this, x, 1180, 'Haritaya dön ▶', RENK.turuncu, () => {
        sustur();
        this.scene.start(bolumuAcikMi(this.sayfaNo) ? BOLUMLER[this.sayfaNo].sahne : 'Harita', { giris: 'uzay' });
      }, { genislik: 420, yukseklik: 120, yaziBoyu: 52 });
      konus(damgaSayisi === 0 ? M.pasaportSifir : M.pasaportDamga(damgaSayisi));
    }
  }
}

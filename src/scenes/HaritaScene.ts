import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { Durak, TURKIYE } from '../duraklar';
import { DURAK_KONUMLARI, HARITA_BOYUTU } from '../haritaKonumlar';
import { dunyaAcik, tamamlananlar } from '../ilerleme';
import { M } from '../metinler';
import { bip, konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

const HARITA_Y = 250; // haritanın üst kenarı
const MERKEZ = { x: 360, y: HARITA_Y + 280 }; // uzaydan inişte yakınlaşılan nokta
// Birbirine çok yakın duraklar üst üste binmesin diye küçük kaydırmalar.
const KAYDIRMA: Record<string, [number, number]> = { nemrut: [-10, -22], gobeklitepe: [14, 22] };
// Şehir adı işaretin altında durur; sıkışık yerlerde üstüne alınır.
const AD_USTTE = new Set(['nemrut', 'karadeniz']);
// Zıpzıp işaretin sol üstünde durur; haritanın sol kenarındaki durakta sağ üstte.
const ZIPZIP_SAGDA = new Set(['truva', 'karadeniz']);

type Veri = { giris?: 'uzay'; yolculukDen?: string };
type Nokta = { x: number; y: number };

// Türkiye haritası: duraklar sırayla açılır, Zıpzıp sıradaki durağın yanında zıplar.
// Girişte "uzaydan iniş", bir durak bitince Zıpzıp'ın yolda zıplayarak ilerlemesi oynatılır.
export class HaritaScene extends Phaser.Scene {
  private veri: Veri = {};
  private harita!: Phaser.GameObjects.Container;

  constructor() {
    super('Harita');
  }

  init(veri: Veri) {
    this.veri = veri ?? {};
  }

  preload() {
    this.load.svg('haritaTurkiye', 'harita-turkiye.svg', { width: HARITA_BOYUTU.genislik * 2, height: HARITA_BOYUTU.yukseklik * 2 });
    this.load.svg('dunya', 'dunya.svg', { width: 484, height: 484 });
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const biten = new Set(tamamlananlar());
    const siradaki = TURKIYE.findIndex((d) => !biten.has(d.id));
    const yolculukDen = this.veri.yolculukDen;
    const yolculukVar = !!yolculukDen && siradaki > 0 && TURKIYE[siradaki - 1].id === yolculukDen;

    // Haritaya ait her şey tek katmanda: uzaydan inişte birlikte büyür.
    this.harita = this.add.container(0, 0);
    this.harita.add(this.add.image(0, HARITA_Y, 'haritaTurkiye').setOrigin(0).setScale(0.5));

    // Rota: duraklar arası kesikli çizgi; Zıpzıp'ın geçtiği yollar altın sarısı.
    const rota = this.add.graphics();
    this.harita.add(rota);
    TURKIYE.slice(1).forEach((d, i) => {
      const gecildi = biten.has(TURKIYE[i].id) && !(yolculukVar && TURKIYE[i].id === yolculukDen);
      kesikliCiz(rota, konum(TURKIYE[i].id), konum(d.id), gecildi ? RENK.sari : RENK.beyaz, gecildi ? 1 : 0.6);
    });
    const iz = this.add.graphics();
    this.harita.add(iz);

    const isaretler = new Map<string, Phaser.GameObjects.Container>();
    TURKIYE.forEach((durak, i) => {
      // Yolculukta varılacak durak önce kilitli görünür, Zıpzıp varınca açılır.
      const acik = siradaki === -1 || i < siradaki || (i === siradaki && !yolculukVar);
      isaretler.set(durak.id, this.isaret(durak, acik, biten.has(durak.id), i === siradaki));
    });

    const zipzipDurak = yolculukVar ? TURKIYE[siradaki - 1] : TURKIYE[siradaki === -1 ? TURKIYE.length - 1 : siradaki];
    const zipzip = new Zipzip(this, 0, 0, 0.3);
    const zipzipYeri = (d: Durak): Nokta => {
      const k = konum(d.id);
      return { x: k.x + (ZIPZIP_SAGDA.has(d.id) ? 58 : -58), y: k.y - 60 };
    };
    const ilkYer = zipzipYeri(zipzipDurak);
    zipzip.yerlestir(ilkYer.x, ilkYer.y);
    this.harita.add([zipzip.golgesi, zipzip]);

    // Harita dışındaki her şey: başlık, pasaport, alt yazı, 2. bölüm kapısı.
    const arayuz: Phaser.GameObjects.GameObject[] = [];
    arayuz.push(
      evDugmesi(this, () => {
        sustur();
        this.scene.start('Macera', {});
      }),
    );
    const pasaportDugmesi = this.add.container(640, 80);
    pasaportDugmesi.add(this.add.circle(0, 0, 50, RENK.turuncu).setStrokeStyle(5, RENK.beyaz));
    pasaportDugmesi.add(this.add.text(0, 2, '🛂', { fontSize: '50px' }).setOrigin(0.5));
    pasaportDugmesi.setSize(100, 100).setInteractive({ useHandCursor: true });
    pasaportDugmesi.on('pointerdown', () => {
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Pasaport', {});
    });
    arayuz.push(pasaportDugmesi);
    arayuz.push(
      this.add
        .text(x, 150, 'Türkiye Turu', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '84px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 14 })
        .setOrigin(0.5),
    );
    const altYazi = this.add
      .text(x, 900, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: '#ffffff' })
      .setOrigin(0.5);
    arayuz.push(altYazi);
    const kapi = this.add.container(x, 1100);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.12).fillRoundedRect(-280, -70, 560, 140, 40);
    kapi.add(g);
    const dunyaAcilmis = dunyaAcik(TURKIYE.map((d) => d.id));
    kapi.add(
      this.add
        .text(0, -10, dunyaAcilmis ? '🌍 Dünya Harikaları ▶' : '🔒 Dünya Harikaları', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: dunyaAcilmis ? '#FFC93C' : '#cfe3ff' })
        .setOrigin(0.5),
    );
    kapi.add(this.add.text(0, 38, dunyaAcilmis ? 'Yeni bölüm seni bekliyor!' : 'Türkiye Turu’ndan sonra', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#9fb6d9' }).setOrigin(0.5));
    kapi.setSize(560, 140).setInteractive({ useHandCursor: true });
    kapi.on('pointerdown', () => {
      if (!dunyaAcilmis) {
        bip(220, 0.15, 'square', 0.12);
        this.tweens.add({ targets: kapi, x: x + 8, duration: 50, yoyo: true, repeat: 3 });
        konus(M.dunyaKilitli);
        return;
      }
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Dunya', { giris: 'uzay' });
    });
    if (dunyaAcilmis) this.tweens.add({ targets: kapi, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    arayuz.push(kapi);

    const durumuSoyle = () => {
      altYazi.setText(siradaki === -1 ? 'Türkiye Turu’nu bitirdin! 🏆' : siradaki === 0 ? 'İlk durağa dokun ve başla!' : `Sıradaki durak: ${TURKIYE[siradaki].yer}`);
      konus(siradaki === -1 ? M.turBitti : siradaki === 0 ? M.turaHosgeldin : M.siradaki(TURKIYE[siradaki].yer));
    };

    if (siradaki === -1) {
      arayuz.push(
        buyukDugme(this, x, 900, '🏆 Sertifikanı al', RENK.yesil, () => {
          sustur();
          this.scene.start('Sertifika');
        }, { genislik: 520, yukseklik: 130, yaziBoyu: 54 }),
      );
      altYazi.setVisible(false);
    }

    if (yolculukVar) {
      // Zıpzıp tamamlanan duraktan sıradakine zıplayarak gider, arkasında altın iz kalır.
      const hedef = TURKIYE[siradaki];
      const noktalar = yolNoktalari(zipzipYeri(TURKIYE[siradaki - 1]), zipzipYeri(hedef), 46);
      const izBas = konum(TURKIYE[siradaki - 1].id);
      const izSon = konum(hedef.id);
      let adimNo = 0;
      altYazi.setText('Yola çıkıyoruz!');
      konus(M.yolaCikiyoruz);
      this.time.delayedCall(700, () =>
        zipzip.yolculuk(
          noktalar,
          430,
          () => {
            adimNo++;
            bip(500 + adimNo * 30, 0.08, 'triangle', 0.15);
            iz.clear();
            kesikliCiz(iz, izBas, yolNoktasi(izBas, izSon, adimNo / noktalar.length), RENK.sari, 1);
          },
          () => {
            const eski = isaretler.get(hedef.id)!;
            const yeni = this.isaret(hedef, true, false, false);
            this.harita.addAt(yeni, this.harita.getIndex(eski));
            eski.destroy();
            yeni.setScale(0);
            this.tweens.add({ targets: yeni, scale: 1, duration: 450, ease: 'Back.easeOut', onComplete: () => this.nabiz(yeni) });
            zaferMuzigi();
            zipzip.surekli('zipla', 1200);
            this.time.delayedCall(500, durumuSoyle);
          },
        ),
      );
    } else {
      zipzip.surekli('zipla', 1200);
      if (this.veri.giris === 'uzay') this.uzaydanIn(arayuz, durumuSoyle);
      else durumuSoyle();
    }
  }

  private isaret(durak: Durak, acik: boolean, bitti: boolean, siradaki: boolean) {
    const { x: dx, y: dy } = konum(durak.id);
    const isaret = this.add.container(dx, dy);
    isaret.add(this.add.circle(0, 0, 34, bitti ? RENK.sari : acik ? RENK.turuncu : 0x6b7280).setStrokeStyle(5, RENK.beyaz));
    isaret.add(this.add.text(0, 2, acik ? durak.simge : '🔒', { fontSize: '36px' }).setOrigin(0.5));
    const ad = this.add
      .text(0, AD_USTTE.has(durak.id) ? -52 : 52, durak.yer, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '24px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 6 })
      .setOrigin(0.5);
    // Haritanın kenarında yazı kesilmesin.
    ad.x = Phaser.Math.Clamp(dx, ad.width / 2 + 6, HARITA_BOYUTU.genislik - ad.width / 2 - 6) - dx;
    isaret.add(ad);
    isaret.setSize(80, 80).setInteractive({ useHandCursor: true });
    isaret.on('pointerdown', () => {
      if (!acik) {
        bip(220, 0.15, 'square', 0.12);
        this.tweens.add({ targets: isaret, x: dx + 8, duration: 50, yoyo: true, repeat: 3 });
        konus(M.oncekiniBitir);
        return;
      }
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Durak', { durakId: durak.id });
    });
    if (siradaki && acik) this.nabiz(isaret);
    this.harita.add(isaret);
    return isaret;
  }

  private nabiz(isaret: Phaser.GameObjects.Container) {
    this.tweens.add({ targets: isaret, scale: 1.15, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // Uzayda dönen dünya büyür ve kaybolur, altından Türkiye haritası açılır. Dokununca atlanır.
  private uzaydanIn(arayuz: Phaser.GameObjects.GameObject[], bitince: () => void) {
    const kamera = this.cameras.main;
    const dunya = this.add.image(MERKEZ.x, MERKEZ.y, 'dunya').setScale(0.9);
    this.tweens.add({ targets: dunya, angle: 8, duration: 900, yoyo: true, ease: 'Sine.easeInOut' });
    const olcek = { s: 0.12 };
    const uygula = () => this.harita.setScale(olcek.s).setPosition(MERKEZ.x * (1 - olcek.s), MERKEZ.y * (1 - olcek.s));
    uygula();
    this.harita.setAlpha(0);
    arayuz.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0));

    let bitti = false;
    const bitir = () => {
      if (bitti) return;
      bitti = true;
      this.tweens.killTweensOf([dunya, olcek, this.harita]);
      dunya.destroy();
      olcek.s = 1;
      uygula();
      this.harita.setAlpha(1);
      arayuz.forEach((o) => this.tweens.add({ targets: o, alpha: 1, duration: 300 }));
      bitince();
    };
    this.input.once('pointerdown', bitir);

    bip(300, 0.6, 'sine', 0.15);
    this.time.delayedCall(900, () => {
      if (bitti) return;
      this.tweens.add({ targets: dunya, scale: 7, alpha: 0, duration: 1100, ease: 'Quad.easeIn' });
      this.tweens.add({ targets: this.harita, alpha: 1, duration: 700, delay: 350 });
      this.tweens.add({ targets: olcek, s: 1, duration: 1100, ease: 'Cubic.easeOut', delay: 250, onUpdate: uygula, onComplete: bitir });
      kamera.shake(250, 0.003);
    });
  }
}

function konum(id: string): Nokta {
  const [px, py] = DURAK_KONUMLARI[id];
  const [kx, ky] = KAYDIRMA[id] ?? [0, 0];
  return { x: px + kx, y: HARITA_Y + py + ky };
}

function yolNoktasi(a: Nokta, b: Nokta, t: number): Nokta {
  return { x: Phaser.Math.Linear(a.x, b.x, t), y: Phaser.Math.Linear(a.y, b.y, t) };
}

// İki nokta arasını yaklaşık "aralik" piksellik zıplamalara böler.
function yolNoktalari(a: Nokta, b: Nokta, aralik: number): Nokta[] {
  const adim = Math.max(2, Math.round(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / aralik));
  return Array.from({ length: adim }, (_, i) => yolNoktasi(a, b, (i + 1) / adim));
}

function kesikliCiz(g: Phaser.GameObjects.Graphics, a: Nokta, b: Nokta, renk: number, saydamlik: number) {
  g.lineStyle(6, renk, saydamlik);
  const adim = Math.ceil(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / 18);
  for (let k = 0; k < adim; k += 2) {
    const p = yolNoktasi(a, b, k / adim);
    const q = yolNoktasi(a, b, Math.min(1, (k + 1) / adim));
    g.lineBetween(p.x, p.y, q.x, q.y);
  }
}

import Phaser from 'phaser';
import type { Animasyon } from './hareketler';
import { seciliKostum } from './kostumler';

// Zıpzıp: gövde (yüzlü dünya) + iki parçalı kollar (omuz-dirsek) ve bacaklar (kalça-diz).
// Tüm ölçüler maskot çiziminin birimleriyle; "birim" bir çizim biriminin ekranda kaç piksel olduğu.

const UZUV_RENGI = 0xffb627;
const AYAKKABI_RENGI = 0xff6b6b;
const KALINLIK = 13;
const KOL = { ust: 38, alt: 36 };
const BACAK = { ust: 30, alt: 30 };

// Bir uzvun duruşu: a = üst parçanın açısı (derece, 0 sağ, 90 aşağı, 180 sol),
// b = alt parçanın üst parçaya göre bükülmesi (dirsek/diz).
// Açılar bilerek "sarmalanmaz": sol kol 90..270, sağ kol -90..90 aralığında kalır ki
// kollar gövdenin içinden değil, yandan dönerek kalkıp insin.
type Uzuv = { a: number; b: number };
type Durus = { solKol: Uzuv; sagKol: Uzuv; solBacak: Uzuv; sagBacak: Uzuv };

const u = (a: number, b = 0): Uzuv => ({ a, b });

const D = {
  normal: { solKol: u(228), sagKol: u(-48), solBacak: u(105), sagBacak: u(75) },
  hazirlan: { solKol: u(150, 20), sagKol: u(30, -20), solBacak: u(130, -40), sagBacak: u(50, 40) },
  havada: { solKol: u(258), sagKol: u(-78), solBacak: u(100), sagBacak: u(80) },
  comel: { solKol: u(180), sagKol: u(0), solBacak: u(160, -70), sagBacak: u(20, 70) },
  solDiz: { solKol: u(200, -50), sagKol: u(-20, 50), solBacak: u(215, -115), sagBacak: u(88) },
  sagDiz: { solKol: u(200, -50), sagKol: u(-20, 50), solBacak: u(92), sagBacak: u(-35, 115) },
  kollarAsagi: { solKol: u(100), sagKol: u(80), solBacak: u(100), sagBacak: u(80) },
  kollarYukari: { solKol: u(262), sagKol: u(-82), solBacak: u(100), sagBacak: u(80) },
  acik: { solKol: u(232), sagKol: u(-52), solBacak: u(135), sagBacak: u(45) },
  kapali: { solKol: u(100), sagKol: u(80), solBacak: u(97), sagBacak: u(83) },
  acikHava: { solKol: u(250), sagKol: u(-70), solBacak: u(138), sagBacak: u(42) },
  acikIn: { solKol: u(235, 15), sagKol: u(-55, -15), solBacak: u(130, -25), sagBacak: u(50, 25) },
  kapaliIn: { solKol: u(110, 10), sagKol: u(70, -10), solBacak: u(110, -25), sagBacak: u(70, 25) },
  kosA: { solKol: u(215, -70), sagKol: u(-60, 40), solBacak: u(190, -90), sagBacak: u(88) },
  kosB: { solKol: u(240, -40), sagKol: u(-35, 70), solBacak: u(92), sagBacak: u(-10, 90) },
  uzan: { solKol: u(265), sagKol: u(-85), solBacak: u(97), sagBacak: u(83) },
  balonAcik: { solKol: u(240), sagKol: u(-60), solBacak: u(97), sagBacak: u(83) },
  heykel: { solKol: u(160, -110), sagKol: u(20, 110), solBacak: u(100), sagBacak: u(80) },
  horonA: { solKol: u(215, 40), sagKol: u(-35, -40), solBacak: u(125, -35), sagBacak: u(80) },
  horonB: { solKol: u(215, 40), sagKol: u(-35, -40), solBacak: u(100), sagBacak: u(55, 35) },
  tasAl: { solKol: u(115), sagKol: u(65), solBacak: u(160, -70), sagBacak: u(20, 70) },
  piramit: { solKol: u(240, 45), sagKol: u(-60, -45), solBacak: u(130), sagBacak: u(50) },
  yanAcik: { solKol: u(185), sagKol: u(-5), solBacak: u(132), sagBacak: u(48) },
  yanKapali: { solKol: u(185), sagKol: u(-5), solBacak: u(97), sagBacak: u(83) },
  parmakA: { solKol: u(190), sagKol: u(-10), solBacak: u(150, -60), sagBacak: u(88) },
  parmakB: { solKol: u(190), sagKol: u(-10), solBacak: u(92), sagBacak: u(30, 60) },
  tirmanA: { solKol: u(258), sagKol: u(-25, 70), solBacak: u(92), sagBacak: u(-30, 110) },
  tirmanB: { solKol: u(205, -70), sagKol: u(-78), solBacak: u(210, -110), sagBacak: u(88) },
  // Spor Kampı
  sutSag: { solKol: u(200, -30), sagKol: u(-30), solBacak: u(97), sagBacak: u(15, 20) },
  sutSol: { solKol: u(210), sagKol: u(-20, 30), solBacak: u(165, -20), sagBacak: u(83) },
  kulacA: { solKol: u(265), sagKol: u(80), solBacak: u(100), sagBacak: u(80) },
  kulacB: { solKol: u(100), sagKol: u(-85), solBacak: u(100), sagBacak: u(80) },
  tekSol: { solKol: u(185), sagKol: u(-5), solBacak: u(205, -110), sagBacak: u(90) },
  tekSag: { solKol: u(185), sagKol: u(-5), solBacak: u(90), sagBacak: u(-25, 110) },
  raketA: { solKol: u(200, -20), sagKol: u(-60, -20), solBacak: u(110), sagBacak: u(70) },
  raketB: { solKol: u(200, -20), sagKol: u(40, 30), solBacak: u(110), sagBacak: u(70) },
  engelHava: { solKol: u(240, -40), sagKol: u(-60, 40), solBacak: u(160, -80), sagBacak: u(20, 80) },
  // Dinozorlar Diyarı
  trexSol: { solKol: u(120, -100), sagKol: u(60, 100), solBacak: u(130, -40), sagBacak: u(85) },
  trexSag: { solKol: u(120, -100), sagKol: u(60, 100), solBacak: u(95), sagBacak: u(50, 40) },
  kanatYukari: { solKol: u(215), sagKol: u(-35), solBacak: u(100), sagBacak: u(80) },
  kanatAsagi: { solKol: u(150), sagKol: u(30), solBacak: u(100), sagBacak: u(80) },
  tepinSol: { solKol: u(130, -40), sagKol: u(50, 40), solBacak: u(140, -60), sagBacak: u(85) },
  tepinSag: { solKol: u(130, -40), sagKol: u(50, 40), solBacak: u(95), sagBacak: u(40, 60) },
  tepinYer: { solKol: u(130, -40), sagKol: u(50, 40), solBacak: u(100), sagBacak: u(80) },
  kucul: { solKol: u(110, -60), sagKol: u(70, 60), solBacak: u(160, -70), sagBacak: u(20, 70) },
  kaziA: { solKol: u(120), sagKol: u(30, 40), solBacak: u(160, -70), sagBacak: u(20, 70) },
  kaziB: { solKol: u(150, -40), sagKol: u(60), solBacak: u(160, -70), sagBacak: u(20, 70) },
  // Evde Macera
  basUstuSol: { solKol: u(240, 45), sagKol: u(-60, -45), solBacak: u(215, -115), sagBacak: u(88) },
  basUstuSag: { solKol: u(240, 45), sagKol: u(-60, -45), solBacak: u(92), sagBacak: u(-35, 115) },
  basUstu: { solKol: u(240, 45), sagKol: u(-60, -45), solBacak: u(100), sagBacak: u(80) },
  eldenSol: { solKol: u(170, -50), sagKol: u(40, 30), solBacak: u(100), sagBacak: u(80) },
  eldenSag: { solKol: u(140, -30), sagKol: u(10, 50), solBacak: u(100), sagBacak: u(80) },
  saril: { solKol: u(130, -100), sagKol: u(50, 100), solBacak: u(100), sagBacak: u(80) },
} satisfies Record<string, Durus>;

// Bir tekrar içindeki adımlar: duruş, gövdenin yukarı/aşağı kayması (birim) ve tekrar süresine oranı.
// aci: Zıpzıp'ın bütün olarak yana eğilmesi (derece); yon: 1 öne, -1 arkasını dönmüş.
// x: yana kayma (birim), ör. yastığın üstünden yana zıplarken.
type Adim = { durus: Durus; y: number; oran: number; yumusama?: string; aci?: number; yon?: number; x?: number };

const ADIMLAR: Record<Animasyon, Adim[]> = {
  zipla: [
    { durus: D.hazirlan, y: 25, oran: 0.15 },
    { durus: D.havada, y: -130, oran: 0.3, yumusama: 'Quad.easeOut' },
    { durus: D.hazirlan, y: 25, oran: 0.3, yumusama: 'Quad.easeIn' },
    { durus: D.normal, y: 0, oran: 0.15 },
  ],
  comel: [
    { durus: D.comel, y: 50, oran: 0.4 },
    { durus: D.normal, y: 0, oran: 0.4 },
  ],
  dizler: [
    { durus: D.solDiz, y: -10, oran: 0.4, yumusama: 'Sine.easeOut' },
    { durus: D.normal, y: 0, oran: 0.4, yumusama: 'Sine.easeIn' },
  ],
  kollar: [
    { durus: D.kollarYukari, y: -15, oran: 0.45 },
    { durus: D.kollarAsagi, y: 0, oran: 0.45 },
  ],
  // Zıpla-aç-kapa: havada kollar yukarıda ve bacaklar açık; inerken dizler yumuşakça bükülür.
  acKapa: [
    { durus: D.acikHava, y: -70, oran: 0.2, yumusama: 'Quad.easeOut' },
    { durus: D.acikIn, y: 14, oran: 0.2, yumusama: 'Quad.easeIn' },
    { durus: D.kapali, y: -70, oran: 0.2, yumusama: 'Quad.easeOut' },
    { durus: D.kapaliIn, y: 14, oran: 0.2, yumusama: 'Quad.easeIn' },
    { durus: D.kapali, y: 0, oran: 0.1 },
  ],
  uzan: [
    { durus: D.uzan, y: -45, oran: 0.45 },
    { durus: D.normal, y: 0, oran: 0.4 },
  ],
  balon: [
    { durus: D.comel, y: 50, oran: 0.3 },
    { durus: D.balonAcik, y: -55, oran: 0.45, yumusama: 'Sine.easeOut' },
    { durus: D.normal, y: 0, oran: 0.2 },
  ],
  heykel: [{ durus: D.heykel, y: 0, oran: 0.3 }],
  horon: [
    { durus: D.horonA, y: -10, oran: 0.5, yumusama: 'Sine.easeOut' },
    { durus: D.horonB, y: -10, oran: 0.5, yumusama: 'Sine.easeOut' },
  ],
  tasKaldir: [
    { durus: D.tasAl, y: 50, oran: 0.3 },
    { durus: D.kollarYukari, y: -20, oran: 0.35, yumusama: 'Sine.easeOut' },
    { durus: D.normal, y: 0, oran: 0.2 },
  ],
  sutun: [{ durus: D.uzan, y: -20, oran: 0.3 }],
  // Uzay bölümü
  donus: [
    { durus: D.yanAcik, y: 0, oran: 0.4, yon: -1 },
    { durus: D.yanAcik, y: 0, oran: 0.4, yon: 1 },
  ],
  kocaman: [{ durus: D.acik, y: -10, oran: 0.3 }],
  belDondur: [
    { durus: D.heykel, y: 0, oran: 0.25, aci: -12 },
    { durus: D.heykel, y: 6, oran: 0.25, aci: 0 },
    { durus: D.heykel, y: 0, oran: 0.25, aci: 12 },
    { durus: D.heykel, y: -6, oran: 0.25, aci: 0 },
  ],
  yanaEgil: [
    { durus: D.kollarYukari, y: 0, oran: 0.3, aci: -18 },
    { durus: D.kollarYukari, y: 0, oran: 0.2, aci: 0 },
    { durus: D.kollarYukari, y: 0, oran: 0.3, aci: 18 },
    { durus: D.kollarYukari, y: 0, oran: 0.2, aci: 0 },
  ],
  kolSalla: [
    { durus: D.kollarYukari, y: 0, oran: 0.5, aci: -10 },
    { durus: D.kollarYukari, y: 0, oran: 0.5, aci: 10 },
  ],
  piramit: [{ durus: D.piramit, y: 0, oran: 0.3 }],
  tHarfi: [{ durus: D.yanKapali, y: -10, oran: 0.3 }],
  yanAdim: [
    { durus: D.yanAcik, y: -8, oran: 0.4 },
    { durus: D.yanKapali, y: 0, oran: 0.4 },
  ],
  parmakUcu: [
    { durus: D.parmakA, y: -25, oran: 0.5, yumusama: 'Sine.easeOut' },
    { durus: D.parmakB, y: -25, oran: 0.5, yumusama: 'Sine.easeOut' },
  ],
  tirman: [
    { durus: D.tirmanA, y: -15, oran: 0.45 },
    { durus: D.normal, y: 0, oran: 0.35 },
  ],
  // Spor Kampı
  sut: [
    { durus: D.sutSag, y: -5, oran: 0.4, yumusama: 'Quad.easeOut' },
    { durus: D.normal, y: 0, oran: 0.4 },
  ],
  basket: [
    { durus: D.comel, y: 50, oran: 0.3 },
    { durus: D.uzan, y: -110, oran: 0.3, yumusama: 'Quad.easeOut' },
    { durus: D.hazirlan, y: 25, oran: 0.25, yumusama: 'Quad.easeIn' },
    { durus: D.normal, y: 0, oran: 0.15 },
  ],
  kulac: [
    { durus: D.kulacA, y: 0, oran: 0.5 },
    { durus: D.kulacB, y: 0, oran: 0.5 },
  ],
  tekAyak: [{ durus: D.tekSol, y: -10, oran: 0.3 }],
  raket: [
    { durus: D.raketA, y: 0, oran: 0.45, aci: -8 },
    { durus: D.raketB, y: 0, oran: 0.35, aci: 10, yumusama: 'Quad.easeOut' },
  ],
  voleybol: [
    { durus: D.piramit, y: 10, oran: 0.4 },
    { durus: D.uzan, y: -40, oran: 0.35, yumusama: 'Quad.easeOut' },
  ],
  engel: [
    { durus: D.hazirlan, y: 25, oran: 0.15 },
    { durus: D.engelHava, y: -120, oran: 0.3, yumusama: 'Quad.easeOut' },
    { durus: D.hazirlan, y: 25, oran: 0.3, yumusama: 'Quad.easeIn' },
    { durus: D.normal, y: 0, oran: 0.15 },
  ],
  // Dinozorlar Diyarı
  trex: [
    { durus: D.trexSol, y: -10, oran: 0.45, aci: -5 },
    { durus: D.trexSol, y: 0, oran: 0.35, aci: 0 },
  ],
  kanat: [
    { durus: D.kanatYukari, y: -10, oran: 0.5 },
    { durus: D.kanatAsagi, y: 0, oran: 0.5 },
  ],
  tepin: [
    { durus: D.tepinSol, y: -15, oran: 0.45, yumusama: 'Sine.easeOut' },
    { durus: D.tepinYer, y: 5, oran: 0.35, yumusama: 'Quad.easeIn' },
  ],
  yumurta: [
    { durus: D.kucul, y: 55, oran: 0.35 },
    { durus: D.balonAcik, y: -30, oran: 0.45, yumusama: 'Sine.easeOut' },
    { durus: D.normal, y: 0, oran: 0.15 },
  ],
  kazi: [
    { durus: D.kaziA, y: 50, oran: 0.5 },
    { durus: D.kaziB, y: 50, oran: 0.5 },
  ],
  // Evde Macera
  basUstu: [
    { durus: D.basUstuSol, y: -10, oran: 0.4, yumusama: 'Sine.easeOut' },
    { durus: D.basUstu, y: 0, oran: 0.4, yumusama: 'Sine.easeIn' },
  ],
  elden: [
    { durus: D.eldenSol, y: 0, oran: 0.5 },
    { durus: D.eldenSag, y: 0, oran: 0.5 },
  ],
  yanaZipla: [
    { durus: D.hazirlan, y: 25, oran: 0.15, x: -50 },
    { durus: D.havada, y: -90, oran: 0.3, x: 0, yumusama: 'Quad.easeOut' },
    { durus: D.hazirlan, y: 25, oran: 0.3, x: 50, yumusama: 'Quad.easeIn' },
    { durus: D.normal, y: 0, oran: 0.15, x: 50 },
  ],
  sallan: [
    { durus: D.saril, y: 0, oran: 0.5, aci: -10 },
    { durus: D.saril, y: 0, oran: 0.5, aci: 10 },
  ],
  topla: [
    { durus: D.tasAl, y: 50, oran: 0.4 },
    { durus: D.kollarAsagi, y: 0, oran: 0.4 },
  ],
  kos: [
    { durus: D.kosA, y: -16, oran: 0.25, yumusama: 'Sine.easeOut' },
    { durus: D.kosA, y: 0, oran: 0.25, yumusama: 'Sine.easeIn' },
    { durus: D.kosB, y: -16, oran: 0.25, yumusama: 'Sine.easeOut' },
    { durus: D.kosB, y: 0, oran: 0.25, yumusama: 'Sine.easeIn' },
  ],
};

// Çift tekrarlarda öbür taraf çalışır (öbür diz, öbür ayak, öbür kol...).
const ilkAdimi = (a: Animasyon, durus: Durus): Adim[] => [{ ...ADIMLAR[a][0], durus }, ...ADIMLAR[a].slice(1)];
const CIFT: Partial<Record<Animasyon, Adim[]>> = {
  dizler: ilkAdimi('dizler', D.sagDiz),
  tirman: ilkAdimi('tirman', D.tirmanB),
  sut: ilkAdimi('sut', D.sutSol),
  tekAyak: ilkAdimi('tekAyak', D.tekSag),
  trex: [{ ...ADIMLAR.trex[0], durus: D.trexSag, aci: 5 }, ADIMLAR.trex[1]],
  tepin: ilkAdimi('tepin', D.tepinSag),
  basUstu: ilkAdimi('basUstu', D.basUstuSag),
  // Bir sağa, bir sola zıplar.
  yanaZipla: ADIMLAR.yanaZipla.map((a) => ({ ...a, x: -(a.x ?? 0) })),
};

// Süreli hareketlerde bir tekrarın süresi (ms).
const SUREKLI_TEMPO: Partial<Record<Animasyon, number>> = { kos: 520, horon: 380, heykel: 2000, sutun: 2000, piramit: 2000, parmakUcu: 700, kocaman: 2000, belDondur: 1600, tekAyak: 4000, tHarfi: 2000, kulac: 1400, sallan: 1600, kanat: 900 };

type UzuvParcasi = { kok: Phaser.GameObjects.Container; dirsek: Phaser.GameObjects.Container; durum: Uzuv };

export class Zipzip extends Phaser.GameObjects.Container {
  private readonly birim: number;
  private tabanX: number;
  private tabanY: number;
  private readonly uzuvlar: Record<keyof Durus, UzuvParcasi>;
  private readonly golge: Phaser.GameObjects.Container;
  private dongu?: Phaser.Time.TimerEvent;
  private bekleyenler: Phaser.Time.TimerEvent[] = [];

  static yukle(sahne: Phaser.Scene) {
    sahne.load.svg('govde', 'govde.svg', { width: 484, height: 484 });
  }

  constructor(sahne: Phaser.Scene, x: number, y: number, birim: number) {
    super(sahne, x, y);
    this.birim = birim;
    this.tabanX = x;
    this.tabanY = y;

    // Gölge ayrı durur: Zıpzıp zıplarken yerde kalır, küçülür ve soluklaşır.
    // İki katman: geniş ve çok hafif bir hale + ortada koyu bir çekirdek (yumuşak kenarlı görünür).
    this.golge = sahne.add.container(x, y + 160 * birim, [
      sahne.add.ellipse(0, 0, 175 * birim, 34 * birim, 0x000000, 0.12),
      sahne.add.ellipse(0, 0, 135 * birim, 22 * birim, 0x000000, 0.18),
      sahne.add.ellipse(0, 0, 90 * birim, 13 * birim, 0x000000, 0.22),
    ]);

    this.uzuvlar = {
      solBacak: this.uzuv(-30, 92, BACAK, true),
      sagBacak: this.uzuv(30, 92, BACAK, true),
      solKol: this.uzuv(-96, -6, KOL, false),
      sagKol: this.uzuv(96, -6, KOL, false),
    };
    // Kollar gövdenin arkasında, bacaklar önünde: diz kalkınca gövdenin önüne gelir.
    const govde = sahne.add.image(0, 0, 'govde').setScale(birim / 2);
    const { solKol, sagKol, solBacak, sagBacak } = this.uzuvlar;
    this.add([solKol.kok, sagKol.kok, govde, solBacak.kok, sagBacak.kok]);
    this.kostumGiy(seciliKostum());

    this.durusAl(D.normal, 0);
    sahne.add.existing(this);
  }

  // Uzuv eklemden sağa doğru çizilir: üst parça + ucunda dönebilen alt parça (el ya da ayakkabıyla).
  private uzuv(ex: number, ey: number, boy: { ust: number; alt: number }, bacak: boolean): UzuvParcasi {
    const b = this.birim;
    const cizgi = (uzunluk: number) => {
      const g = this.scene.add.graphics();
      g.lineStyle(KALINLIK * b, UZUV_RENGI).lineBetween(0, 0, uzunluk * b, 0);
      g.fillStyle(UZUV_RENGI).fillCircle(0, 0, (KALINLIK / 2) * b);
      return g;
    };
    const altParca = cizgi(boy.alt);
    if (bacak) altParca.fillStyle(AYAKKABI_RENGI).fillEllipse((boy.alt + 4) * b, 0, 24 * b, 38 * b);
    else altParca.fillStyle(UZUV_RENGI).fillCircle(boy.alt * b, 0, 13 * b);

    const dirsek = this.scene.add.container(boy.ust * b, 0, [altParca]);
    const kok = this.scene.add.container(ex * b, ey * b, [cizgi(boy.ust), dirsek]);
    return { kok, dirsek, durum: u(0) };
  }

  private uygula(p: UzuvParcasi) {
    p.kok.setAngle(p.durum.a);
    p.dirsek.setAngle(p.durum.b);
  }

  private durusAl(d: Durus, sure: number, yumusama = 'Sine.easeInOut') {
    for (const ad of Object.keys(this.uzuvlar) as (keyof Durus)[]) {
      const p = this.uzuvlar[ad];
      const hedef = d[ad];
      if (sure === 0) {
        p.durum = { ...hedef };
        this.uygula(p);
      } else {
        this.scene.tweens.add({ targets: p.durum, a: hedef.a, b: hedef.b, duration: sure, ease: yumusama, onUpdate: () => this.uygula(p) });
      }
    }
  }

  private kay(yBirim: number, sure: number, yumusama = 'Sine.easeInOut') {
    const y = this.tabanY + yBirim * this.birim;
    const yukseklik = Math.min(1, Math.max(0, -yBirim / 130));
    // Çömelince (aşağı) gölge biraz genişler; zıplayınca küçülür ve soluklaşır.
    const comelme = Math.min(1, Math.max(0, yBirim / 50));
    this.scene.tweens.add({ targets: this, y, duration: sure, ease: yumusama });
    this.scene.tweens.add({ targets: this.golge, scaleX: 1 - yukseklik * 0.5 + comelme * 0.12, scaleY: 1 - yukseklik * 0.4, alpha: 1 - yukseklik * 0.55, duration: sure, ease: yumusama });
  }

  // Hareketi bir kez yapar. sure: bir tekrarın süresi (ms). tekrarNo: kaçıncı tekrar (1'den başlar).
  birKez(animasyon: Animasyon, sure: number, tekrarNo = 1) {
    this.bekleyenler = this.bekleyenler.filter((o) => o.getProgress() < 1);
    const cift = tekrarNo % 2 === 0;
    const adimlar = (cift && CIFT[animasyon]) || ADIMLAR[animasyon];
    let t = 0;
    for (const adim of adimlar) {
      const adimSuresi = sure * adim.oran;
      const olay = this.scene.time.delayedCall(t, () => {
        this.durusAl(adim.durus, adimSuresi, adim.yumusama);
        this.kay(adim.y, adimSuresi, adim.yumusama);
        if (adim.aci !== undefined) this.scene.tweens.add({ targets: this, angle: adim.aci, duration: adimSuresi, ease: 'Sine.easeInOut' });
        if (adim.yon !== undefined) this.scene.tweens.add({ targets: this, scaleX: adim.yon, duration: adimSuresi, ease: 'Sine.easeInOut' });
        if (adim.x !== undefined) this.scene.tweens.add({ targets: [this, this.golge], x: this.tabanX + adim.x * this.birim, duration: adimSuresi, ease: 'Sine.easeInOut' });
      });
      this.bekleyenler.push(olay);
      t += adimSuresi;
    }
  }

  // Hareketi durdurulana kadar tekrarlar (yerinde koşu, açılıştaki neşeli zıplama).
  surekli(animasyon: Animasyon, tempo = SUREKLI_TEMPO[animasyon] ?? 1000) {
    this.durdur();
    let tekrarNo = 1;
    this.birKez(animasyon, tempo, tekrarNo);
    this.dongu = this.scene.time.addEvent({ delay: tempo, loop: true, callback: () => this.birKez(animasyon, tempo, ++tekrarNo) });
  }

  private kostumParcalari: Phaser.GameObjects.GameObject[] = [];

  // Kostümü giydirir (undefined: kostümsüz). Şapka ve gözlük başın üstünde, pelerin gövdenin arkasında.
  kostumGiy(id: string | undefined) {
    this.kostumParcalari.forEach((p) => p.destroy());
    this.kostumParcalari = [];
    if (!id) return;
    const b = this.birim;
    const cizim = (ciz: (g: Phaser.GameObjects.Graphics) => void) => {
      const g = this.scene.add.graphics();
      ciz(g);
      this.add(g);
      this.kostumParcalari.push(g);
    };
    const emoji = (simge: string, x: number, y: number, boy: number, aci = 0) => {
      const t = this.scene.add.text(x * b, y * b, simge, { fontSize: `${Math.round(boy * b)}px` }).setOrigin(0.5).setAngle(aci);
      this.add(t);
      this.kostumParcalari.push(t);
    };
    switch (id) {
      case 'gozluk': return emoji('🕶️', 0, -48, 100);
      case 'pilot': return emoji('🥽', 0, -96, 96);
      case 'atki': return emoji('🧣', 0, 80, 74);
      case 'tac': return emoji('👑', 0, -128, 82);
      case 'kasif': return emoji('🤠', 0, -126, 104);
      case 'madalya': return emoji('🏅', 0, 70, 70);
      // Çizilen kostümler (emojisi olmayanlar)
      case 'kaptan': return cizim((g) => {
        g.fillStyle(0xffffff).fillEllipse(0, -122 * b, 150 * b, 46 * b);
        g.fillStyle(0x1d3557).fillRect(-62 * b, -116 * b, 124 * b, 22 * b);
        g.fillStyle(0x14213d).fillEllipse(0, -92 * b, 140 * b, 18 * b);
        g.fillStyle(0xffc93c).fillCircle(0, -106 * b, 9 * b);
      });
      case 'terBandi': return cizim((g) => {
        g.fillStyle(0xe63946).fillRoundedRect(-92 * b, -98 * b, 184 * b, 26 * b, 12 * b);
        g.fillStyle(0xffffff).fillRect(-92 * b, -88 * b, 184 * b, 5 * b);
      });
      case 'kabuk': return cizim((g) => {
        g.fillStyle(0xfff3d6).fillEllipse(0, -108 * b, 150 * b, 70 * b);
        g.fillStyle(0xfff3d6).fillTriangle(-75 * b, -100 * b, -45 * b, -70 * b, -20 * b, -100 * b).fillTriangle(-20 * b, -100 * b, 10 * b, -70 * b, 40 * b, -100 * b).fillTriangle(40 * b, -100 * b, 60 * b, -74 * b, 75 * b, -100 * b);
        g.lineStyle(3 * b, 0xd9c49a).strokeEllipse(0, -112 * b, 150 * b, 62 * b);
        g.fillStyle(0xe8b4b8).fillCircle(-30 * b, -122 * b, 7 * b).fillCircle(25 * b, -128 * b, 5 * b);
      });
      case 'dinoSapka': return cizim((g) => {
        g.fillStyle(0x3fbf5f).fillEllipse(0, -106 * b, 170 * b, 60 * b);
        g.fillStyle(0x2c8a44);
        for (const sx of [-50, -17, 17, 50]) g.fillTriangle((sx - 16) * b, -122 * b, sx * b, -160 * b, (sx + 16) * b, -122 * b);
        g.fillStyle(0xffffff).fillCircle(-40 * b, -100 * b, 9 * b).fillCircle(40 * b, -100 * b, 9 * b);
      });
      case 'uykuSapka': return cizim((g) => {
        g.fillStyle(0x7c5cd6).fillTriangle(-70 * b, -100 * b, 70 * b, -100 * b, 95 * b, -190 * b);
        g.fillStyle(0xffffff).fillRoundedRect(-78 * b, -110 * b, 156 * b, 22 * b, 10 * b).fillCircle(95 * b, -192 * b, 16 * b);
        g.fillStyle(0xffc93c).fillCircle(-10 * b, -130 * b, 5 * b).fillCircle(30 * b, -150 * b, 4 * b);
      });
      case 'pelerin': {
        const g = this.scene.add.graphics();
        g.fillStyle(0xe63946).fillPoints([{ x: -80 * b, y: -30 * b }, { x: 80 * b, y: -30 * b }, { x: 130 * b, y: 150 * b }, { x: -130 * b, y: 150 * b }], true);
        g.fillStyle(0xb5232f).fillPoints([{ x: -80 * b, y: -30 * b }, { x: -20 * b, y: -30 * b }, { x: -60 * b, y: 150 * b }, { x: -130 * b, y: 150 * b }], true);
        this.addAt(g, 0); // en arkada
        this.kostumParcalari.push(g);
        return;
      }
      case 'astronot': {
        const g = this.scene.add.graphics();
        g.fillStyle(0xffffff, 0.14).fillCircle(0, -4 * b, 132 * b);
        g.lineStyle(7 * b, 0xe8eef7, 0.9).strokeCircle(0, -4 * b, 132 * b);
        g.fillStyle(0xffffff, 0.35).fillEllipse(-62 * b, -70 * b, 46 * b, 26 * b);
        this.add(g);
        this.kostumParcalari.push(g);
        return;
      }
    }
  }

  // Zıpzıp'ı (gölgesiyle birlikte) yeni bir yere koyar.
  yerlestir(x: number, y: number) {
    this.setPosition(x, y);
    this.tabanX = x;
    this.tabanY = y;
    this.golge.setPosition(x, y + 160 * this.birim);
  }

  get golgesi() {
    return this.golge;
  }

  // Haritada bir duraktan ötekine zıplaya zıplaya gider. Her zıplamanın sonunda adim() çağrılır
  // (ör. arkada altın iz bırakmak için).
  yolculuk(noktalar: { x: number; y: number }[], ziplamaMs: number, adim: (a: { x: number; y: number }, b: { x: number; y: number }) => void, bitince: () => void) {
    this.durdur();
    const yukseklik = 120 * this.birim;
    const golgeFarki = 160 * this.birim;
    const sonraki = (i: number) => {
      if (i >= noktalar.length) {
        this.tabanX = this.x;
        this.tabanY = this.y;
        this.durusAl(D.normal, 150);
        bitince();
        return;
      }
      const bas = { x: this.x, y: this.tabanY };
      const son = noktalar[i];
      const ilerleme = { t: 0 };
      this.durusAl(D.havada, ziplamaMs * 0.4);
      this.scene.tweens.add({
        targets: ilerleme,
        t: 1,
        duration: ziplamaMs,
        onUpdate: () => {
          const x = Phaser.Math.Linear(bas.x, son.x, ilerleme.t);
          const y = Phaser.Math.Linear(bas.y, son.y, ilerleme.t);
          this.setPosition(x, y - Math.sin(Math.PI * ilerleme.t) * yukseklik);
          this.golge.setPosition(x, y + golgeFarki).setScale(1 - Math.sin(Math.PI * ilerleme.t) * 0.4);
        },
        onComplete: () => {
          this.tabanY = son.y;
          this.durusAl(D.hazirlan, ziplamaMs * 0.3);
          adim(bas, son);
          sonraki(i + 1);
        },
      });
    };
    sonraki(0);
  }

  durdur() {
    this.dongu?.remove();
    this.dongu = undefined;
    this.bekleyenler.forEach((o) => o.remove());
    this.bekleyenler = [];
    const durumlar = Object.values(this.uzuvlar).map((p) => p.durum);
    this.scene.tweens.killTweensOf([this, this.golge, ...durumlar]);
    this.setAngle(0);
    this.setScale(1);
    this.durusAl(D.normal, 200);
    this.kay(0, 200);
    if (this.x !== this.tabanX) this.scene.tweens.add({ targets: [this, this.golge], x: this.tabanX, duration: 200 });
  }
}

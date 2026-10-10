import Phaser from 'phaser';
import { RENK, YAZI_TIPI, HAREKETI_AZALT } from '../ayarlar';
import { buyukDugme, evDugmesi, durakSimgesi } from '../arayuz';
import { BOLUM_SIRASI, BOLUMLER, BolumId, Durak, bolumuAcikMi } from '../duraklar';
import { tamamlananlar } from '../ilerleme';
import { M } from '../metinler';
import { bip, konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

// Yeni bölümlerin ortak harita ekranı (Spor Kampı, Dinozorlar Diyarı, Evde Macera).
// Her bölüm kendi arka planını, durak yerlerini ve cümlelerini AYARLAR'da verir.
// Sıralı bölümde Zıpzıp duraktan durağa zıplayarak gider (arkasında altın iz);
// serbest bölümde (Spor Kampı) çocuk istediği durakla başlar.

type Nokta = { x: number; y: number };
type Veri = { giris?: 'uzay'; yolculukDen?: string };

type BolumAyari = {
  baslik: string;
  simge: string; // bölüm geçiş düğmelerinde
  zemin: number; // arka plan rengi
  arkaPlan: (sahne: Phaser.Scene) => void;
  yerler: Nokta[]; // durakların sırasıyla ekrandaki yerleri
  hosgeldin: string;
  bitti: string;
  ilkYazi: string; // hiçbir durak bitmemişken alt yazı
  kilitli: string; // bölüm kapalıyken söylenen
  zipzipEvi?: Nokta; // serbest bölümde Zıpzıp'ın durduğu yer
};

// Bölüm geçiş düğmeleri ve Büyük Macera için kısa adlar ve kilit cümleleri.
export const BOLUM_KISA: Record<BolumId, { kisa: string; simge: string; kilitli: string }> = {
  turkiye: { kisa: 'Türkiye', simge: '🇹🇷', kilitli: M.oncekiniBitir },
  dunya: { kisa: 'Dünya', simge: '🌍', kilitli: M.dunyaKilitli },
  uzay: { kisa: 'Uzay', simge: '🪐', kilitli: M.uzayKilitli },
  spor: { kisa: 'Spor', simge: '⚽', kilitli: M.sporKilitli },
  dinozor: { kisa: 'Dinozor', simge: '🦕', kilitli: M.dinozorKilitli },
  evde: { kisa: 'Evde', simge: '🧸', kilitli: M.evdeKilitli },
};

const AYARLAR: Partial<Record<BolumId, BolumAyari>> = {
  spor: {
    baslik: 'Spor Kampı',
    simge: '⚽',
    zemin: 0x1f5e3a,
    arkaPlan: sporSahasi,
    // Koşu pistinin etrafında yedi istasyon.
    yerler: Array.from({ length: 7 }, (_, i) => {
      const aci = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
      return { x: 360 + Math.cos(aci) * 255, y: 690 + Math.sin(aci) * 380 };
    }),
    zipzipEvi: { x: 360, y: 660 },
    hosgeldin: M.sporHosgeldin,
    bitti: M.sporBitti,
    ilkYazi: 'Bir spora dokun ve başla!',
    kilitli: M.sporKilitli,
  },
  dinozor: {
    baslik: 'Dinozorlar Diyarı',
    simge: '🦕',
    zemin: 0x17331f,
    arkaPlan: dinozorOrmani,
    yerler: [
      { x: 170, y: 1040 },
      { x: 430, y: 980 },
      { x: 590, y: 830 },
      { x: 360, y: 720 },
      { x: 140, y: 590 },
      { x: 380, y: 470 },
      { x: 580, y: 340 },
    ],
    hosgeldin: M.dinozorHosgeldin,
    bitti: M.dinozorBitti,
    ilkYazi: 'Yumurtaya dokun ve başla!',
    kilitli: M.dinozorKilitli,
  },
  evde: {
    baslik: 'Evde Macera',
    simge: '🧸',
    zemin: 0x2e2347,
    arkaPlan: evIci,
    yerler: [
      { x: 160, y: 1030 },
      { x: 400, y: 1010 },
      { x: 590, y: 880 },
      { x: 400, y: 760 },
      { x: 150, y: 680 },
      { x: 300, y: 520 },
      { x: 560, y: 520 },
    ],
    hosgeldin: M.evdeHosgeldin,
    bitti: M.evdeBitti,
    ilkYazi: 'Oyuncağa dokun ve başla!',
    kilitli: M.evdeKilitli,
  },
};

const R = 58; // durak dairesinin yarıçapı

export class BolumScene extends Phaser.Scene {
  private veri: Veri = {};
  private readonly bolum: BolumId;

  constructor(bolum: BolumId) {
    super(BOLUMLER[bolum].sahne);
    this.bolum = bolum;
  }

  init(veri: Veri) {
    this.veri = veri ?? {};
  }

  create() {
    const ayar = AYARLAR[this.bolum]!;
    const { duraklar, serbest } = BOLUMLER[this.bolum];
    const x = this.scale.gameSize.width / 2;
    this.cameras.main.setBackgroundColor(ayar.zemin);
    ayar.arkaPlan(this);

    const biten = new Set(tamamlananlar());
    const hepsiBitti = duraklar.every((d) => biten.has(d.id));
    const siradaki = duraklar.findIndex((d) => !biten.has(d.id));
    const yeri = (d: Durak) => ayar.yerler[duraklar.indexOf(d)];
    // Az önce biten durak bu bölümdeyse kutlama/yolculuk yapılır.
    const azOnce = duraklar.find((d) => d.id === this.veri.yolculukDen);
    const yolculukVar = !serbest && !!azOnce && siradaki > 0 && duraklar[siradaki - 1] === azOnce;

    // Sıralı bölümde duraklar arası kesikli yol: gidilen kısım altın.
    const rota = this.add.graphics();
    const iz = this.add.graphics();
    if (!serbest) {
      ayar.yerler.slice(1).forEach((b, i) => {
        const gidildi = biten.has(duraklar[i + 1].id) || (i + 1 === siradaki && !yolculukVar);
        kesikliCiz(rota, ayar.yerler[i], b, gidildi ? RENK.sari : RENK.beyaz, gidildi ? 1 : 0.5);
      });
    }

    const isaretler = new Map<string, Phaser.GameObjects.Container>();
    duraklar.forEach((d, i) => {
      const acik = serbest || siradaki === -1 || i < siradaki || (i === siradaki && !yolculukVar);
      // Sıralı bölümde sıradaki durak parlar; serbest bölümde hiçbiri (çocuk seçer).
      const parlak = !serbest && i === siradaki;
      // Az önce biten durak (serbest bölüm) altın halkasını kutlamayla alır.
      const kutlanacak = serbest && d === azOnce;
      isaretler.set(d.id, this.durakIsareti(d, yeri(d), acik, biten.has(d.id) && !kutlanacak, parlak && acik));
    });

    // Zıpzıp: serbest bölümde ortada, sıralı bölümde son gidilen durağın yanında.
    const zipzipYeri = (d: Durak): Nokta => {
      const p = yeri(d);
      return { x: p.x + (p.x < 360 ? R + 45 : -(R + 45)), y: p.y - R + 10 };
    };
    const zipzip = new Zipzip(this, 0, 0, 0.3);
    if (serbest) {
      const ev = ayar.zipzipEvi!;
      zipzip.yerlestir(ev.x, ev.y);
    } else {
      const yanindaki = yolculukVar ? duraklar[siradaki - 1] : siradaki === -1 ? duraklar[duraklar.length - 1] : duraklar[Math.max(0, siradaki - 1)];
      const p = zipzipYeri(yanindaki);
      zipzip.yerlestir(p.x, p.y);
    }

    // Üst kısım: ev, başlık, pasaport, önceki/sonraki bölüm.
    evDugmesi(this, () => {
      sustur();
      this.scene.start('Macera', {});
    });
    this.add
      .text(x, 80, ayar.baslik, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 12 })
      .setOrigin(0.5);
    const pasaport = this.add.container(640, 80);
    pasaport.add(this.add.circle(0, 0, 50, RENK.turuncu).setStrokeStyle(5, RENK.beyaz));
    pasaport.add(this.add.text(0, 2, '🛂', { fontSize: '50px' }).setOrigin(0.5));
    pasaport.setSize(100, 100).setInteractive({ useHandCursor: true });
    pasaport.on('pointerdown', () => {
      sustur();
      this.scene.start('Pasaport', { sayfa: this.bolum });
    });
    const sira = BOLUM_SIRASI.indexOf(this.bolum);
    if (sira > 0) bolumGecisDugmesi(this, 80, 160, BOLUM_SIRASI[sira - 1], 'geri');
    if (sira < BOLUM_SIRASI.length - 1) bolumGecisDugmesi(this, 640, 160, BOLUM_SIRASI[sira + 1], 'ileri');

    const altYazi = this.add
      .text(x, 1190, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '38px', color: '#ffffff', align: 'center', stroke: '#0b1430', strokeThickness: 8 })
      .setOrigin(0.5);
    if (hepsiBitti && !yolculukVar && !(serbest && azOnce)) this.sertifikaDugmesi(altYazi);

    const durumuSoyle = () => {
      if (hepsiBitti) {
        altYazi.setText('Hepsini bitirdin! 🏆');
        konus(ayar.bitti);
      } else if (!duraklar.some((d) => biten.has(d.id))) {
        altYazi.setText(ayar.ilkYazi);
        konus(ayar.hosgeldin);
      } else if (serbest) {
        altYazi.setText(`${duraklar.filter((d) => biten.has(d.id)).length} / ${duraklar.length} spor · Sıradakini seç!`);
        konus(M.sporSec);
      } else {
        altYazi.setText(`Sıradaki durak: ${duraklar[siradaki].ad}`);
        konus(M.siradaki(duraklar[siradaki].yer));
      }
    };

    if (yolculukVar) {
      // Zıpzıp az önce biten duraktan sıradakine zıplaya zıplaya gider, arkasında altın iz kalır.
      const hedef = duraklar[siradaki];
      const bas = yeri(duraklar[siradaki - 1]);
      const son = yeri(hedef);
      const yol = yolNoktalari(zipzipYeri(duraklar[siradaki - 1]), zipzipYeri(hedef), 50);
      let adimNo = 0;
      altYazi.setText('Yola çıkıyoruz!');
      konus(M.yolaCikiyoruz);
      this.time.delayedCall(600, () =>
        zipzip.yolculuk(
          yol,
          420,
          () => {
            adimNo++;
            bip(500 + adimNo * 30, 0.08, 'triangle', 0.15);
            iz.clear();
            kesikliCiz(iz, bas, yolNoktasi(bas, son, adimNo / yol.length), RENK.sari, 1);
          },
          () => {
            isaretler.get(hedef.id)!.destroy();
            const yeni = this.durakIsareti(hedef, son, true, false, true);
            yeni.setScale(0);
            this.tweens.add({ targets: yeni, scale: 1, duration: 450, ease: 'Back.easeOut', onComplete: () => this.nabiz(yeni) });
            zaferMuzigi();
            zipzip.surekli('zipla', 1200);
            this.time.delayedCall(500, durumuSoyle);
          },
        ),
      );
    } else if (serbest && azOnce) {
      // Serbest bölüm: az önce biten istasyon altın halkasını alır, Zıpzıp sevinir.
      const eski = isaretler.get(azOnce.id)!;
      this.time.delayedCall(500, () => {
        eski.destroy();
        const yeni = this.durakIsareti(azOnce, yeri(azOnce), true, true, false);
        yeni.setScale(0);
        this.tweens.add({ targets: yeni, scale: 1, duration: 500, ease: 'Back.easeOut' });
        zaferMuzigi();
        if (hepsiBitti) this.sertifikaDugmesi(altYazi);
        durumuSoyle();
      });
      zipzip.surekli('zipla', 1200);
    } else {
      zipzip.surekli('zipla', 1200);
      if (this.veri.giris === 'uzay') {
        // Girişte duraklar sırayla belirir.
        duraklar.forEach((d, i) => {
          const g = isaretler.get(d.id)!;
          const nabizli = this.tweens.getTweensOf(g).length > 0;
          this.tweens.killTweensOf(g);
          g.setScale(0);
          this.tweens.add({ targets: g, scale: 1, duration: 350, delay: 150 + i * 110, ease: 'Back.easeOut', onComplete: () => nabizli && this.nabiz(g) });
        });
        this.time.delayedCall(1000, durumuSoyle);
      } else durumuSoyle();
    }
  }

  private sertifikaDugmesi(altYazi: Phaser.GameObjects.Text) {
    altYazi.setVisible(false);
    buyukDugme(this, this.scale.gameSize.width / 2, 1185, '🏆 Sertifikanı al', RENK.yesil, () => {
      sustur();
      this.scene.start('Sertifika', { bolum: this.bolum });
    }, { genislik: 460, yukseklik: 110, yaziBoyu: 46 });
  }

  // Durak: renkli daire, simge, ad; bittiyse altın halka ve yıldız, kapalıysa kilit.
  private durakIsareti(durak: Durak, p: Nokta, acik: boolean, bitti: boolean, parlak: boolean) {
    const kap = this.add.container(p.x, p.y);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3).fillCircle(0, 8, R);
    g.fillStyle(0xffffff, acik ? 0.95 : 0.35).fillCircle(0, 0, R);
    g.lineStyle(bitti ? 9 : 5, bitti ? RENK.sari : RENK.turuncu, acik ? 1 : 0.5).strokeCircle(0, 0, R);
    kap.add(g);
    kap.add(durakSimgesi(this, durak, 0, 2, 62).setAlpha(acik ? 1 : 0.45));
    if (bitti) kap.add(this.add.star(R * 0.7, -R * 0.7, 5, 11, 24, RENK.sari).setStrokeStyle(3, 0xffffff));
    if (!acik) kap.add(this.add.text(R * 0.6, R * 0.55, '🔒', { fontSize: '32px' }).setOrigin(0.5));
    kap.add(
      this.add
        .text(0, R + 24, durak.ad, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '28px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 7 })
        .setOrigin(0.5),
    );
    kap.setSize(R * 2 + 10, R * 2 + 10).setInteractive({ useHandCursor: true });
    kap.on('pointerdown', () => {
      if (!acik) {
        bip(220, 0.15, 'square', 0.12);
        this.tweens.add({ targets: kap, x: p.x + 8, duration: 50, yoyo: true, repeat: 3 });
        konus(M.oncekiniBitir);
        return;
      }
      bip(880, 0.08, 'square', 0.12);
      sustur();
      this.scene.start('Durak', { durakId: durak.id });
    });
    if (parlak) this.nabiz(kap);
    return kap;
  }

  private nabiz(kap: Phaser.GameObjects.Container) {
    this.tweens.add({ targets: kap, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

// Önceki/sonraki bölüme geçiş düğmesi (ör. "◀ Uzay", "Dinozor 🦕 ▶"). Kapalı bölümde kilit söylenir.
export function bolumGecisDugmesi(sahne: Phaser.Scene, x: number, y: number, hedef: BolumId, yon: 'geri' | 'ileri') {
  const { kisa, simge, kilitli } = BOLUM_KISA[hedef];
  const acik = bolumuAcikMi(hedef);
  const yazi = yon === 'geri' ? `◀ ${kisa}` : acik ? `${kisa} ${simge} ▶` : `🔒 ${kisa}`;
  const parla = yon === 'ileri' && acik;
  const d = sahne.add
    .text(x, y, yazi, {
      fontFamily: YAZI_TIPI,
      fontStyle: 'bold',
      fontSize: '30px',
      color: parla ? '#14213D' : '#cfe3ff',
      backgroundColor: parla ? '#FFC93C' : '#ffffff1f',
      padding: { x: 16, y: 8 },
    })
    .setOrigin(yon === 'geri' ? 0 : 1, 0.5)
    .setInteractive({ useHandCursor: true });
  d.on('pointerdown', () => {
    if (!acik) {
      bip(220, 0.15, 'square', 0.12);
      konus(kilitli);
      return;
    }
    bip(yon === 'geri' ? 700 : 880, 0.08, 'square', 0.12);
    sustur();
    sahne.scene.start(BOLUMLER[hedef].sahne, { giris: 'uzay' });
  });
  if (parla && !HAREKETI_AZALT) sahne.tweens.add({ targets: d, scale: 1.06, duration: 700, yoyo: true, repeat: -1 });
  return d;
}

// --- Arka planlar (sade şekiller; ileride çizerin görselleri gelecek) ---

// Yeşil saha, ortada orta saha çizgisi, etrafında kiremit rengi koşu pisti.
function sporSahasi(sahne: Phaser.Scene) {
  const g = sahne.add.graphics();
  g.fillStyle(0xc65a3a).fillEllipse(360, 690, 620, 870);
  g.fillStyle(0x3fae5a).fillEllipse(360, 690, 400, 650);
  g.lineStyle(3, 0xffffff, 0.5).strokeEllipse(360, 690, 560, 810).strokeEllipse(360, 690, 480, 730);
  g.lineStyle(5, 0xffffff, 0.8).lineBetween(160, 690, 560, 690).strokeCircle(360, 690, 70);
}

// Koyu yeşil orman: arkada yanardağ, altta tepeler ve büyük yapraklar.
function dinozorOrmani(sahne: Phaser.Scene) {
  const g = sahne.add.graphics();
  g.fillStyle(0x6b4b3a).fillTriangle(420, 330, 720, 330, 600, 150);
  g.fillStyle(0xff8a3d).fillTriangle(578, 180, 622, 180, 600, 150);
  g.fillStyle(0x24502f).fillEllipse(120, 330, 500, 200).fillEllipse(560, 360, 520, 160);
  g.fillStyle(0x2c5e38).fillEllipse(360, 1250, 900, 380).fillEllipse(80, 820, 420, 300).fillEllipse(680, 640, 360, 300);
  g.fillStyle(0x3c7a47);
  for (const [px, py, aci] of [[40, 1150, -20], [690, 1110, 25], [660, 480, 10], [60, 420, -10]] as const) {
    sahne.add.ellipse(px, py, 160, 50, 0x3c7a47).setAngle(aci);
    sahne.add.ellipse(px + 10, py - 40, 140, 44, 0x4a8c55).setAngle(aci - 30);
  }
}

// Akşam odası: pencerede ay, ahşap zemin ve yuvarlak halı.
function evIci(sahne: Phaser.Scene) {
  const g = sahne.add.graphics();
  g.fillStyle(0x8a5a36).fillRect(0, 600, 720, 680);
  g.lineStyle(3, 0x6e4529, 0.7);
  for (let y = 660; y < 1280; y += 60) g.lineBetween(0, y, 720, y);
  g.fillStyle(0xd9534f, 0.55).fillEllipse(380, 900, 600, 340);
  g.lineStyle(6, 0xffc93c, 0.5).strokeEllipse(380, 900, 540, 290);
  // Pencere
  g.fillStyle(0x14213d).fillRoundedRect(70, 250, 200, 220, 16);
  g.fillStyle(0xfff3c4).fillCircle(200, 310, 26);
  g.fillStyle(0x14213d).fillCircle(212, 302, 22);
  g.lineStyle(8, 0xf3d9b1).strokeRoundedRect(70, 250, 200, 220, 16).lineBetween(170, 250, 170, 470).lineBetween(70, 360, 270, 360);
  // Raf
  g.fillStyle(0xb07d4f).fillRect(440, 300, 220, 14);
  sahne.add.text(470, 270, '📚', { fontSize: '40px' }).setOrigin(0.5);
  sahne.add.text(610, 270, '🪴', { fontSize: '40px' }).setOrigin(0.5);
}

function yolNoktasi(a: Nokta, b: Nokta, t: number): Nokta {
  return { x: Phaser.Math.Linear(a.x, b.x, t), y: Phaser.Math.Linear(a.y, b.y, t) };
}

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

import Phaser from 'phaser';
import { RENK, YAZI_TIPI, hareketiAzalt } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { KameraSayaci, kameraDesteklenir, type KameraDurumu } from '../kamera';
import { M } from '../metinler';
import { bip, konus, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

// "Zıpzıp da zıplasın" (zıplama prototipi, kamera denemesinden açılır): Zıpzıp'ın önünde bir kütük bekler (K22: bekleyen
// tek engel). Çocuk zıplayınca Zıpzıp da bir kez zıplar, kütük altından geçer, bir yıldız yanar ve sıradaki kütük gelip
// yine bekler; 10 yıldızda "Aferin!". Kütük acele ettirmez, çarpmak/kaybetmek yok.
// Kameralı yol: kamera her zıplamayı (inişte, 400 ms çift tetik korumasıyla) görünce Zıpzıp zıplar.
// Kamerasız yol: Zıpzıp ritimle zıplar (çocuk onunla zıplar); ekrana dokunan çocuk Zıpzıp'ı hemen zıplatır.
// Görüntü kaydedilmez, gönderilmez; sayılar özete eklenmez. Ölçüm satırı ebeveyn içindir.
const HEDEF = 10;
const RITIM_MS = 1300;
const ZIPLAMA_MS = 600;
const ZEMIN_Y = 712; // Zıpzıp'ın ayaklarının bastığı yer
const ENGEL_X = 530; // kütüğün beklediği yer (Zıpzıp'ın önü)

const DURUM_YAZISI: Record<KameraDurumu, string> = {
  yukleniyor: 'Kamera hazırlanıyor…',
  goremiyorum: '📷 Baştan ayağa görünmeli: biraz geri gidin',
  goruyorum: '✅ Görüyorum: zıpla!',
  hata: 'Kamera açılamadı (izin verilmedi mi?)',
};

export class ZiplaDenemeScene extends Phaser.Scene {
  private kamera: KameraSayaci | null = null;
  private zipzip!: Zipzip;
  private yildizlar: Phaser.GameObjects.Text[] = [];
  private ritim?: Phaser.Time.TimerEvent;
  private kutlaniyor = false;
  private engel?: Phaser.GameObjects.Container;
  // Testler okur: toplam zıplama ve kaçının kameradan geldiği.
  ziplamaSayisi = 0;
  kameraZiplamasi = 0;
  yanan = 0;
  gecilenEngel = 0;

  constructor() {
    super('ZiplaDeneme');
  }

  create() {
    this.kamera = null;
    this.yildizlar = [];
    this.ritim = undefined;
    this.kutlaniyor = false;
    this.engel = undefined;
    this.ziplamaSayisi = this.kameraZiplamasi = this.yanan = this.gecilenEngel = 0;
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const geri = () => this.scene.start('EbeveynKamera', {});
    evDugmesi(this, geri);
    this.add.text(x + 40, 80, 'Zıpzıp da zıplasın', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: '#FFC93C' }).setOrigin(0.5);

    // Yıldızlar: boş ☆, yanınca ★ (renk körlüğü: şekil de değişir).
    for (let i = 0; i < HEDEF; i++) {
      this.yildizlar.push(
        this.add.text(x + (i - (HEDEF - 1) / 2) * 64, 190, '☆', { fontFamily: YAZI_TIPI, fontSize: '58px', color: '#9fb6d9' }).setOrigin(0.5),
      );
    }

    // Zemin: kütüklerin yuvarlandığı yol.
    this.add.rectangle(x, ZEMIN_Y + 14, 720, 28, 0x2f7d3b);
    this.add.rectangle(x, ZEMIN_Y + 2, 720, 6, 0x4caf50);
    this.zipzip = new Zipzip(this, x, 520, 1.2);
    this.engelGetir();

    // Dokunma: Zıpzıp'ın olduğu geniş alan (düğmeler hariç).
    this.add
      .zone(x, 490, 720, 500)
      .setInteractive()
      .on('pointerdown', () => this.zipla(false));

    const durum = this.add.text(x, 785, '', { fontFamily: YAZI_TIPI, fontSize: '30px', color: '#cfe3ff', align: 'center' }).setOrigin(0.5);
    const olcum = this.add.text(x, 1052, '', { fontFamily: YAZI_TIPI, fontSize: '22px', color: '#9fb6d9', align: 'center' }).setOrigin(0.5);

    // Kamera önizlemesi (küçük; ayna gibi ters). Sadece kamera açılınca görünür, "Kamerayla zıpla" düğmesinin yerinde.
    const kutu = document.createElement('div');
    kutu.style.cssText = 'width:200px;height:150px;border-radius:14px;overflow:hidden;background:#0b1430;border:3px solid #FFC93C;position:relative;';
    const ayna = document.createElement('div');
    ayna.style.cssText = 'position:absolute;inset:0;transform:scaleX(-1);';
    kutu.append(ayna);
    const onizleme = this.add.dom(x, 925, kutu).setVisible(false);

    const kameraAc = () => {
      this.ritmiDurdur();
      onizleme.setVisible(true);
      let sonSayi = 0;
      const kamera = new KameraSayaci('zipla', (n, d) => {
        durum.setText(DURUM_YAZISI[d]);
        // Kamera açılamazsa kamerasız yola dönülür (oyun durmaz).
        if (d === 'hata') ritimBaslat();
        if (n > sonSayi) this.zipla(true);
        sonSayi = n;
      });
      const video = kamera.onizleme;
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      ayna.append(video);
      this.kamera = kamera;
      void kamera.baslat();
      konus(M.ziplaKamera);
    };

    const ritimBaslat = () => {
      this.ritmiDurdur();
      this.ritim = this.time.addEvent({ delay: RITIM_MS, loop: true, callback: () => this.zipla(false) });
      if (!this.kamera) durum.setText('🎵 Zıpzıp ritimle zıplıyor. Dokununca da zıplar.');
    };

    // Yol seçimi: kamera kendiliğinden açılmaz (ebeveyn dokununca açılır). Kamerasız yol hep var.
    if (kameraDesteklenir()) {
      const kameraDugmesi = buyukDugme(this, x, 925, '📷 Kamerayla zıpla', RENK.yesil, () => {
        kameraDugmesi.destroy();
        kameraAc();
      }, { genislik: 460, yukseklik: 100, yaziBoyu: 40 });
    }
    ritimBaslat();
    konus(M.ziplaRitim);

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!this.kamera || this.kamera.durum === 'yukleniyor' || this.kamera.durum === 'hata') return;
        const o = this.kamera.olcum;
        const ms = (v: number) => `${Math.round(v)} ms`;
        olcum.setText(
          `Tanıma ${ms(o.tanimaOrtMs)} (en uzun ${ms(o.tanimaEnKotuMs)}) · ${o.saniyedeTanima.toFixed(1)} tanıma/sn\n` +
            `Oyun ${Math.round(this.game.loop.actualFps)} kare/sn · Son zıplama ${o.sonSayimMs === null ? '–' : ms(o.sonSayimMs)} · Kamera gördü: ${this.kameraZiplamasi}`,
        );
      },
    });

    this.add
      .text(x, 1130, 'Görüntü kaydedilmez, hiçbir yere gönderilmez.', { fontFamily: YAZI_TIPI, fontSize: '25px', color: '#9fb6d9', align: 'center' })
      .setOrigin(0.5);
    buyukDugme(this, x, 1210, 'Tamam', RENK.mavi, geri, { genislik: 360, yukseklik: 100, yaziBoyu: 44 });

    this.events.once('shutdown', () => {
      this.ritmiDurdur();
      this.kamera?.durdur();
      this.kamera = null;
    });
  }

  // Kütük: kahverengi gövde, sağ ucunda açık renkli yıllık halkaları.
  private kutuk(x: number) {
    const k = this.add.container(x, ZEMIN_Y - 30);
    const g = this.add.graphics();
    g.fillStyle(0x8b5a2b).fillRoundedRect(-55, -28, 110, 56, 14);
    g.fillStyle(0x6f4520).fillRect(-40, -18, 50, 5).fillRect(-30, 6, 44, 5);
    g.fillStyle(0xd9a066).fillEllipse(50, 0, 26, 52);
    g.lineStyle(3, 0x8b5a2b).strokeEllipse(50, 0, 14, 30);
    k.add(g);
    return k;
  }

  // Sıradaki kütük sağdan gelir ve Zıpzıp'ın önünde bekler.
  private engelGetir() {
    const engel = this.kutuk(870);
    this.engel = engel;
    this.tweens.add({ targets: engel, x: ENGEL_X, duration: 500, ease: 'Quad.easeOut' });
  }

  // Zıpzıp havadayken kütük altından geçip arkada kaybolur; sonra yenisi gelir.
  private engeliGecir() {
    const engel = this.engel;
    if (!engel) return;
    this.tweens.killTweensOf(engel);
    this.gecilenEngel++;
    this.tweens.add({
      targets: engel,
      x: 190,
      delay: ZIPLAMA_MS * 0.2,
      duration: ZIPLAMA_MS * 0.5,
      onComplete: () => this.tweens.add({ targets: engel, x: -150, duration: 300, onComplete: () => engel.destroy() }),
    });
    // Sıradaki kütük hemen yola çıkar: arka arkaya zıplamada da her zıplama bir kütük geçer.
    this.engelGetir();
  }

  private ritmiDurdur() {
    this.ritim?.remove();
    this.ritim = undefined;
  }

  // Bir zıplama: Zıpzıp bir kez zıplar, bir yıldız yanar. Dokunmada ritim baştan başlar (üst üste binmesin).
  private zipla(kameradan: boolean) {
    // Kameranın gördüğü her zıplama sayılır, Aferin anında gelen de (ölçüm satırı fazla sayımı gizlemesin; Yağız testi K23).
    if (kameradan) this.kameraZiplamasi++;
    if (this.kutlaniyor) return;
    this.ziplamaSayisi++;
    if (!kameradan && this.ritim) this.ritim.reset({ delay: RITIM_MS, loop: true, callback: () => this.zipla(false) });
    this.zipzip.durdur();
    this.zipzip.birKez('zipla', ZIPLAMA_MS);
    this.engeliGecir();
    const yildiz = this.yildizlar[this.yanan++];
    yildiz.setText('★').setColor('#FFC93C');
    if (!hareketiAzalt()) this.tweens.add({ targets: yildiz, scale: { from: 1.6, to: 1 }, duration: 300, ease: 'Back.easeOut' });
    bip(660 + this.yanan * 40, 0.1);
    if (this.yanan < HEDEF) return;
    // 10 yıldız: Aferin! sonra yıldızlar söner, yeniden başlar.
    this.kutlaniyor = true;
    zaferMuzigi();
    konus(M.aferin);
    this.zipzip.ifadeSec('mutlu', 1800);
    const aferin = this.add
      .text(this.scale.gameSize.width / 2, 300, 'Aferin!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '96px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 14 })
      .setOrigin(0.5);
    this.time.delayedCall(2000, () => {
      aferin.destroy();
      this.yildizlar.forEach((y) => y.setText('☆').setColor('#9fb6d9'));
      this.yanan = 0;
      this.kutlaniyor = false;
    });
  }
}

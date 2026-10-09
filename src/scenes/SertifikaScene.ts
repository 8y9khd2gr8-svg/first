import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { TURKIYE } from '../duraklar';
import { haftalikOzet } from '../istatistik';
import { M } from '../metinler';
import { fotoDokusuYukle, pasaportOku } from '../pasaport';
import { konus, sustur, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';

const KAGIT = 0xfff6e0;
const ALTIN = 0xe0a100;
const MUREKKEP = '#14213D';
const ALAN = { x: 36, y: 100, g: 648, y2: 960 }; // sertifikanın kaydedilen kısmı

// Türkiye Turu bitince: çocuğun adı ve karakteriyle Türkiye Gezgini Sertifikası.
export class SertifikaScene extends Phaser.Scene {
  constructor() {
    super('Sertifika');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const pasaport = pasaportOku();
    evDugmesi(this, () => {
      sustur();
      this.scene.start('Harita', {});
    });

    const g = this.add.graphics();
    g.fillStyle(KAGIT).fillRoundedRect(ALAN.x, ALAN.y, ALAN.g, ALAN.y2, 28);
    g.lineStyle(10, ALTIN).strokeRoundedRect(ALAN.x + 16, ALAN.y + 16, ALAN.g - 32, ALAN.y2 - 32, 20);
    g.lineStyle(3, ALTIN).strokeRoundedRect(ALAN.x + 32, ALAN.y + 32, ALAN.g - 64, ALAN.y2 - 64, 14);

    this.add.text(x, 185, 'S E R T İ F İ K A', { fontFamily: YAZI_TIPI, fontSize: '30px', color: '#B07D00' }).setOrigin(0.5);
    this.add.text(x, 250, 'Türkiye Gezgini', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '76px', color: '#FF8A3D' }).setOrigin(0.5);

    // Görünüm: fotoğraf, yoksa seçilen karakter, o da yoksa Zıpzıp.
    g.fillStyle(0xdde7f5).fillCircle(x, 410, 95);
    g.lineStyle(6, ALTIN).strokeCircle(x, 410, 95);
    if (pasaport.foto) {
      fotoDokusuYukle(this, pasaport.foto, (anahtar) => {
        const foto = this.add.image(x, 410, anahtar).setDisplaySize(184, 184);
        foto.setMask(this.make.graphics({}).fillCircle(x, 410, 92).createGeometryMask());
      });
    } else if (pasaport.avatar) {
      this.add.text(x, 415, pasaport.avatar, { fontSize: '120px' }).setOrigin(0.5);
    } else {
      new Zipzip(this, x, 395, 0.45);
    }

    const ad = this.add
      .text(x, 565, pasaport.ad ? pasaport.ad.toLocaleUpperCase('tr') : 'MİNİK GEZGİN', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '68px', color: MUREKKEP })
      .setOrigin(0.5);
    ad.setScale(Math.min(1, 540 / ad.width));
    this.add
      .text(x, 650, 'Zıp Zıp Dünya Türkiye Turu’nu\nhareket ederek tamamladı!', { fontFamily: YAZI_TIPI, fontSize: '34px', color: MUREKKEP, align: 'center' })
      .setOrigin(0.5);

    TURKIYE.forEach((d, i) => {
      const dx = x + (i - 3) * 76;
      g.lineStyle(4, RENK.turuncu).strokeCircle(dx, 770, 31);
      this.add.text(dx, 770, d.simge, { fontSize: '32px' }).setOrigin(0.5);
    });
    const ozet = haftalikOzet();
    this.add
      .text(x, 840, `${TURKIYE.length} şehir  ·  ${ozet.toplamHareket} hareket  ·  ${Math.round(ozet.toplamSaniye / 60)} dakika`, {
        fontFamily: YAZI_TIPI,
        fontStyle: 'bold',
        fontSize: '30px',
        color: '#B07D00',
      })
      .setOrigin(0.5);

    const tarih = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    this.add.text(110, 935, tarih, { fontFamily: YAZI_TIPI, fontSize: '28px', color: MUREKKEP }).setOrigin(0, 0.5);
    this.add.text(110, 970, 'Tarih', { fontFamily: YAZI_TIPI, fontSize: '22px', color: '#7a6a4a' }).setOrigin(0, 0.5);
    new Zipzip(this, 560, 905, 0.22);
    this.add.text(560, 970, 'Zıpzıp', { fontFamily: YAZI_TIPI, fontStyle: 'bold italic', fontSize: '30px', color: MUREKKEP }).setOrigin(0.5);

    zaferMuzigi();
    this.time.delayedCall(400, () => konus(M.sertifika));

    // Kaydet / paylaş: sertifikanın resmini çekip telefonun paylaşma menüsünü açar
    // (yoksa resmi indirir). Gerçek HTML düğmesi, çünkü bu işlemler doğrudan dokunuş ister.
    const dugme = this.add.dom(x, 1150, 'button', DUGME_STILI, 'Kaydet / Paylaş 📤');
    dugme.addListener('click');
    dugme.on('click', () => this.kaydet());
  }

  private kaydet() {
    this.game.renderer.snapshotArea(ALAN.x, ALAN.y, ALAN.g, ALAN.y2, async (resim) => {
      const tuval = document.createElement('canvas');
      const r = resim as HTMLImageElement;
      tuval.width = r.width;
      tuval.height = r.height;
      tuval.getContext('2d')!.drawImage(r, 0, 0);
      const blob = await new Promise<Blob | null>((ok) => tuval.toBlob(ok, 'image/png'));
      if (!blob) return;
      const dosya = new File([blob], 'zipzip-turkiye-gezgini.png', { type: 'image/png' });
      try {
        if (navigator.canShare?.({ files: [dosya] })) {
          await navigator.share({ files: [dosya], title: 'Türkiye Gezgini Sertifikası' });
          return;
        }
      } catch {
        return; // paylaşmaktan vazgeçildi
      }
      const baglanti = document.createElement('a');
      baglanti.href = URL.createObjectURL(blob);
      baglanti.download = dosya.name;
      baglanti.click();
      setTimeout(() => URL.revokeObjectURL(baglanti.href), 5000);
    });
  }
}

const DUGME_STILI =
  "font: 700 40px 'Baloo 2', Arial, sans-serif; padding: 16px 44px; border-radius: 40px; border: 6px solid #fff; background: #FF8A3D; color: #fff;";

import Phaser from 'phaser';
import { RENK, YAZI_TIPI, uzaktanAcikMi } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { tamamlananlar } from '../ilerleme';
import { haftalikOzet } from '../istatistik';
import { kameraAcikMi } from '../kamera';
import { KOSTUMLER, seciliKostum } from '../kostumler';
import { pasaportOku } from '../pasaport';
import { kazanilanlar } from '../rozetler';

// "Bu telefonda neler var?": oyunun bu telefonda sakladığı her şey, ebeveynin kendi gözüyle görmesi için.
// "Bilgiler sadece bu telefonda" sözünü kanıta çevirir: liste + uçak moduyla kendin dene.
export class EbeveynVeriScene extends Phaser.Scene {
  constructor() {
    super('EbeveynVeri');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start('EbeveynMenu', {}));
    this.add.text(x, 165, 'Bu telefonda neler var?', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '52px', color: '#FFC93C' }).setOrigin(0.5);

    const pasaport = pasaportOku();
    const ozet = haftalikOzet();
    const kostum = KOSTUMLER.find((k) => k.id === seciliKostum());
    const satirlar: [string, string][] = [
      ['Çocuğun adı', pasaport.ad || 'yazılmadı'],
      ['Fotoğraf', pasaport.foto ? 'var (sadece burada)' : 'yok'],
      ['Karakter', pasaport.avatar ?? 'seçilmedi'],
      ['Biten duraklar', String(tamamlananlar().length)],
      ['Rozetler', String(kazanilanlar().size)],
      ['Giyilen kostüm', kostum ? `${kostum.simge} ${kostum.ad}` : 'yok'],
      ['Hareket kaydı', `${ozet.gunSayisi} gün, ${ozet.toplamHareket} hareket`],
      ['Kamerayla sayma', kameraAcikMi() ? 'açık (görüntü kaydedilmez)' : 'kapalı'],
      ['Uzaktan oyna', uzaktanAcikMi() ? 'açık' : 'kapalı'],
    ];
    const kutuY = 250;
    const satirBoyu = 62;
    this.add.rectangle(x, kutuY + (satirlar.length * satirBoyu) / 2, 640, satirlar.length * satirBoyu + 30, 0xffffff, 0.08).setStrokeStyle(2, 0xffffff, 0.2);
    satirlar.forEach(([ad, deger], i) => {
      const y = kutuY + 15 + satirBoyu * i + satirBoyu / 2;
      this.add.text(70, y, ad, { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#9fb6d9' }).setOrigin(0, 0.5);
      this.add.text(650, y, deger, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '28px', color: '#ffffff' }).setOrigin(1, 0.5);
    });

    const altY = kutuY + satirlar.length * satirBoyu + 50;
    this.add
      .text(
        x,
        altY + 70,
        `Hepsi bu kadar: toplam ${kayitBoyutu()}.\nOyun hiçbir yere bilgi göndermez; hesap, reklam\nve sohbet yoktur. İnternet olmadan da çalışır.`,
        { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#cfe3ff', align: 'center' },
      )
      .setOrigin(0.5);

    // Kanıtı ebeveyn kendisi görsün: internet olmadan da oyun aynen çalışır.
    this.add
      .text(x, altY + 205, '✈️ Kendiniz deneyin: uçak modunu açın,\noyun aynen çalışmaya devam eder.', {
        fontFamily: YAZI_TIPI,
        fontStyle: 'bold',
        fontSize: '30px',
        color: '#FFC93C',
        align: 'center',
      })
      .setOrigin(0.5);

    buyukDugme(this, x, 1190, 'Tamam', RENK.mavi, () => this.scene.start('EbeveynMenu', {}), { genislik: 360, yukseklik: 100, yaziBoyu: 44 });
  }
}

// Oyunun kayıtlarının toplam boyu (anahtarı zipzip- ile başlayanlar; tarayıcı her harfi 2 bayt tutar).
function kayitBoyutu(): string {
  let bayt = 0;
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('zipzip-')) bayt += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2;
  } catch {
    // erişilemiyorsa kayıt da yoktur
  }
  return bayt < 1024 ? `${bayt} bayt` : `${Math.round(bayt / 1024)} KB`;
}

import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { evDugmesi, yildizliArkaPlan } from '../arayuz';
import { TURKIYE } from '../duraklar';
import { tamamlananlar } from '../ilerleme';
import { haftalikOzet } from '../istatistik';
import { pasaportOku } from '../pasaport';

const GUN_ADLARI = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// Ebeveyn için haftalık hareket özeti ve paylaşma.
export class EbeveynOzetScene extends Phaser.Scene {
  constructor() {
    super('EbeveynOzet');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const ozet = haftalikOzet();
    const sehir = TURKIYE.filter((d) => tamamlananlar().includes(d.id)).length;
    const dakika = Math.round(ozet.saniye / 60);
    evDugmesi(this, () => this.scene.start('EbeveynMenu'));

    this.add.text(x, 160, 'Bu hafta', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '72px', color: '#FFC93C' }).setOrigin(0.5);

    // Dört kutu: dakika, hareket, zıplama, şehir.
    const kutular: [string, string][] = [
      [`${dakika}`, 'dakika hareket'],
      [`${ozet.hareket}`, 'hareket'],
      [`${ozet.ziplama}`, 'zıplama'],
      [`${sehir} / ${TURKIYE.length}`, 'şehir gezildi'],
    ];
    kutular.forEach(([deger, etiket], i) => {
      const kx = x + ((i % 2) - 0.5) * 320;
      const ky = 330 + Math.floor(i / 2) * 180;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.1).fillRoundedRect(kx - 145, ky - 75, 290, 150, 28);
      this.add.text(kx, ky - 18, deger, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '64px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(kx, ky + 42, etiket, { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#cfe3ff' }).setOrigin(0.5);
    });

    // Son 7 günün grafiği (dakika).
    const enCok = Math.max(5 * 60, ...ozet.gunler.map((g) => g.saniye));
    const tabanY = 880;
    const yukseklik = 170;
    const grafik = this.add.graphics();
    grafik.lineStyle(2, 0xffffff, 0.2).lineBetween(70, tabanY, 650, tabanY);
    ozet.gunler.forEach((g, i) => {
      const gx = 110 + i * 83;
      const h = (g.saniye / enCok) * yukseklik;
      const bugun = i === 6;
      if (h > 0) grafik.fillStyle(bugun ? RENK.sari : RENK.turuncu).fillRoundedRect(gx - 26, tabanY - h, 52, h, { tl: 10, tr: 10, bl: 0, br: 0 });
      if (g.saniye > 0)
        this.add.text(gx, tabanY - h - 22, `${Math.round(g.saniye / 60)}`, { fontFamily: YAZI_TIPI, fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
      const [yil, ay, gun] = g.gun.split('-').map(Number);
      this.add
        .text(gx, tabanY + 26, bugun ? 'Bugün' : GUN_ADLARI[new Date(yil, ay - 1, gun).getDay()], { fontFamily: YAZI_TIPI, fontSize: '24px', color: bugun ? '#FFC93C' : '#9fb6d9' })
        .setOrigin(0.5);
    });
    this.add.text(x, tabanY - yukseklik - 50, 'Günlük dakika', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#cfe3ff' }).setOrigin(0.5);

    this.add
      .text(
        x,
        1010,
        'Sayılar, çocuğun "Yaptım!" dediği hareketlerdir; oyun\nhareketin gerçekten yapıldığını şimdilik algılayamaz.\nDünya Sağlık Örgütü 5-17 yaş için günde ortalama\n60 dakika orta-yüksek tempolu hareket önerir.',
        { fontFamily: YAZI_TIPI, fontSize: '25px', color: '#9fb6d9', align: 'center' },
      )
      .setOrigin(0.5);

    // Paylaş: telefonun kendi paylaşma menüsü (WhatsApp vb.). Gerçek HTML düğmesi, çünkü
    // telefonlar paylaşma menüsünü sadece doğrudan dokunuşla açar.
    const ad = pasaportOku().ad;
    const metin = `🌍 Zıp Zıp Dünya'da bu hafta${ad ? ` ${ad}` : ''} ${dakika} dakikalık hareket tamamladı, ${ozet.ziplama} kez zıpladı ve Türkiye'de ${sehir} şehir gezdi! 🏃‍♂️`;
    const paylas = this.add.dom(x, 1180, 'button', PAYLAS_STILI, 'Paylaş 📤');
    paylas.addListener('click');
    paylas.on('click', async () => {
      try {
        if (navigator.share) await navigator.share({ text: metin });
        else {
          await navigator.clipboard.writeText(metin);
          (paylas.node as HTMLButtonElement).textContent = 'Kopyalandı ✓';
        }
      } catch {
        // Kullanıcı paylaşmaktan vazgeçti.
      }
    });
  }
}

const PAYLAS_STILI =
  "font: 700 40px 'Baloo 2', Arial, sans-serif; padding: 16px 48px; border-radius: 40px; border: 6px solid #fff; background: #3FBF5F; color: #fff;";

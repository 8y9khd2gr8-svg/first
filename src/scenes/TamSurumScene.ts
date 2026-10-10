import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, genisDokunma, yildizliArkaPlan } from '../arayuz';
import { M } from '../metinler';
import { fiyatGetir, geriYukle, odemeKipi, satinAl, tamSurumVarMi } from '../satinAlma';
import { konus, sustur } from '../ses';

// Tam sürüm (ödeme ekranı): sadece ebeveyn kilidinden sonra açılır (ebeveyn köşesi ya da kapalı bölüme dokunma).
// Ödeme mağazanın kendi penceresinde yapılır; bu ekran sadece ne alındığını dürüstçe anlatır.
export class TamSurumScene extends Phaser.Scene {
  private geri = 'EbeveynMenu';
  private kutla = false;

  constructor() {
    super('TamSurum');
  }

  init(veri: { geri?: string; kutla?: boolean }) {
    this.geri = veri.geri ?? 'EbeveynMenu';
    this.kutla = veri.kutla ?? false;
  }

  create() {
    sustur();
    if (this.kutla) konus(M.tamSurumAcildi);
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start(this.geri, {}));
    this.add.text(x, 170, '⭐ Tam sürüm', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '68px', color: '#FFC93C' }).setOrigin(0.5);

    const yazi = (y: number, metin: string, boy = 32, renk = '#ffffff') =>
      this.add.text(x, y, metin, { fontFamily: YAZI_TIPI, fontSize: `${boy}px`, color: renk, align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0);

    if (tamSurumVarMi()) {
      yazi(300, odemeKipi() === 'web' ? 'Bu test sürümünde bütün bölümler\nücretsiz açık.' : '✅ Tam sürüm bu telefonda açık.\nTeşekkür ederiz!', 38);
      yazi(450, BOLUMLER_YAZISI, 30, '#cfe3ff');
      if (odemeKipi() === 'web') yazi(760, 'Ödeme, mağazadan indirilen\nuygulamada yapılır.', 30, '#9fb6d9');
      buyukDugme(this, x, 1150, 'Oyuna dön', RENK.yesil, () => this.scene.start(this.geri, {}), { genislik: 420, yukseklik: 110, yaziBoyu: 48 });
      return;
    }

    yazi(270, 'Türkiye Turu ücretsiz.\nTek ödemeyle bütün bölümler açılır:', 34);
    yazi(380, BOLUMLER_YAZISI, 30, '#cfe3ff');
    yazi(600, 'Abonelik yok · Reklam yok\nOyun içinde başka satış yok', 30, '#FFC93C');

    const durum = yazi(1010, '', 28, '#cfe3ff');
    let calisiyor = false;
    const sahneAcik = () => this.sys.isActive();

    const al = buyukDugme(this, x, 790, 'Satın al', RENK.yesil, async () => {
      if (calisiyor) return;
      calisiyor = true;
      durum.setText('Mağaza açılıyor…');
      const sonuc = await satinAl();
      calisiyor = false;
      if (!sahneAcik()) return;
      if (sonuc === 'tamam') return this.acildi();
      durum.setText(
        sonuc === 'bekliyor'
          ? 'Ödeme onay bekliyor. Onaylanınca bölümler\nkendiliğinden açılır (oyunu yeniden açın).'
          : 'Satın alma tamamlanmadı.\nİnternet bağlantısını kontrol edip yeniden deneyin.',
      );
    }, { genislik: 520, yukseklik: 120, yaziBoyu: 48 });
    const alYazi = al.list[1] as Phaser.GameObjects.Text;
    fiyatGetir().then((fiyat) => {
      if (sahneAcik() && fiyat) alYazi.setText(`Satın al · ${fiyat}`);
    });

    const geriYukleDugmesi = genisDokunma(
      this.add
        .text(x, 920, '↩️ Satın alımı geri yükle', { fontFamily: YAZI_TIPI, fontSize: '30px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 14 } })
        .setOrigin(0.5),
    );
    geriYukleDugmesi.on('pointerdown', async () => {
      if (calisiyor) return;
      calisiyor = true;
      durum.setText('Mağazaya soruluyor…');
      const bulundu = await geriYukle();
      calisiyor = false;
      if (!sahneAcik()) return;
      if (bulundu) return this.acildi();
      durum.setText('Bu hesapta tam sürüm bulunamadı.\nSatın alırken kullandığınız hesapla deneyin.');
    });

    yazi(
      1130,
      'Ödeme Google Play / App Store hesabınızla yapılır;\nkart bilgisi oyuna gelmez. Yeni telefonda aynı\nhesapla “geri yükle”ye dokunmanız yeter.',
      24,
      '#9fb6d9',
    );
  }

  // Satın alım tamam: ekran "açık" hâliyle yeniden çizilir, kutlama cümlesi söylenir.
  private acildi() {
    this.scene.restart({ geri: this.geri, kutla: true });
  }
}

const BOLUMLER_YAZISI = '🌍 Dünya Harikaları   🪐 Uzay Yolculuğu\n⚽ Spor Kampı   🦕 Dinozorlar Diyarı\n🧸 Evde Macera\nve ileride gelecek bütün yeni bölümler';

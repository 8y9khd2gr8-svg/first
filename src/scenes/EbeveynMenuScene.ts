import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, genisDokunma, yildizliArkaPlan } from '../arayuz';
import { tumVerileriSil } from '../guvenlik';
import { geriBildirimAdresi, ILETISIM_EPOSTA } from '../iletisim';
import { betaDunyaAc, betaDunyaAcikMi } from '../ilerleme';
import { kameraAcikMi, kameraAyarla, kameraDesteklenir } from '../kamera';
import { odemeKipi } from '../satinAlma';

// Ebeveyn köşesi (kilidin arkasında): özet, pasaport, kurulum, güvenlik, gizlilik, veri silme.
export class EbeveynMenuScene extends Phaser.Scene {
  constructor() {
    super('EbeveynMenu');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start('Pasaport', {}));
    this.add.text(x, 170, 'Ebeveyn köşesi', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '68px', color: '#FFC93C' }).setOrigin(0.5);

    const dugme = (y: number, yazi: string, renk: number, sahne: string, veri: object = {}, dx = 0, genislik = 560) =>
      buyukDugme(this, x + dx, y, yazi, renk, () => this.scene.start(sahne, veri), { genislik, yukseklik: 100, yaziBoyu: genislik < 560 ? 38 : 44 });
    dugme(290, '📊 Hareket özeti', RENK.turuncu, 'EbeveynOzet');
    dugme(400, '✏️ Pasaport', RENK.mavi, 'PasaportAyar', {}, -142, 276);
    dugme(400, '⚙️ Ayarlar', 0x7c5cd6, 'EbeveynAyar', {}, 142, 276);
    // Mağaza uygulamasında "Telefona yükle" gereksiz (zaten yüklü): yerinde tam sürüm (ödeme / geri yükleme) durur.
    if (odemeKipi() === 'web') dugme(510, '📲 Telefona yükle', RENK.yesil, 'Kurulum');
    else dugme(510, '⭐ Tam sürüm', RENK.yesil, 'TamSurum', { geri: 'EbeveynMenu' });
    // Yan yana iki yarım düğme: nasıl oynanır (güvenlik notu da oradan açılır) ve ses denemesi (telefonda Türkçe ses var mı?).
    dugme(620, '❓ Nasıl oynanır', 0x7c5cd6, 'EbeveynRehber', {}, -142, 276);
    dugme(620, '🔊 Sesi dene', RENK.mavi, 'EbeveynSes', {}, 142, 276);

    // Küçük görünen ayar düğmeleri: yazı sade kalır, dokunma alanı en az 88 nokta (parmak ıskalamasın).
    const baglanti = (y: number, yazi: string) =>
      genisDokunma(
        this.add
          .text(x, y, yazi, { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 14 } })
          .setOrigin(0.5),
      );

    // Kamerayla sayma (deneme): açıkken kamera zıplama, çömelme, kol, diz, ayak aç-kapa ve yana adım hareketlerini sayar.
    // Görüntü telefonun içinde işlenir; kaydedilmez, gönderilmez.
    // Yanında "Dene": kameranın neyi gördüğünü ve nasıl saydığını canlı gösteren deneme ekranı.
    if (kameraDesteklenir()) {
      const acik = kameraAcikMi();
      baglanti(720, acik ? '📷 Kamerayla sayma: AÇIK' : '📷 Kamerayla sayma: kapalı').setX(x - 95).on('pointerdown', () => {
        kameraAyarla(!acik);
        this.scene.restart();
      });
      baglanti(720, '🔍 Dene').setX(x + 235).on('pointerdown', () => this.scene.start('EbeveynKamera', {}));
    }

    // Gizlilik ve koşullar ayrı web sayfaları; gerçek bağlantı (yeni sekmede açılır).
    const sayfalar = this.add.dom(x, 825, 'div', 'display:flex;gap:14px;justify-content:center;width:640px;', '');
    (sayfalar.node as HTMLDivElement).innerHTML = ['gizlilik.html|Gizlilik politikası', 'kosullar.html|Kullanım koşulları']
      .map((s) => s.split('|'))
      .map(([adres, ad]) => `<a href="${adres}" target="_blank" rel="noopener" style="${BAGLANTI_STILI}">${ad}</a>`)
      .join('');
    sayfalar.updateSize(); // İçerik sonradan eklendi: ortalama için boyut yeniden ölçülür.

    // Tüm verileri sil: iki adımlı onay (yanlışlıkla silinmesin).
    let onay = false;
    const sil = baglanti(920, '🗑️ Tüm verileri sil').setColor('#ff9b9b');
    sil.on('pointerdown', () => {
      if (!onay) {
        onay = true;
        genisDokunma(sil.setText('Emin misiniz? Silmek için tekrar dokunun.'));
        return;
      }
      tumVerileriSil();
      this.scene.start('Acilis');
    });

    // Beta testi için: Dünya bölümünü Türkiye Turu bitmeden açar. Mağazaya çıkmadan kaldırılacak.
    const beta = betaDunyaAcikMi();
    baglanti(1020, beta ? '🧪 Beta: bütün bölümler açık (kapat)' : '🧪 Beta: bütün bölümleri aç').on('pointerdown', () => {
      betaDunyaAc(!beta);
      this.scene.restart();
    });

    // Geri bildirim: adres varsa e-posta uygulamasını açan bağlantı, yoksa beta notu.
    const geri = this.add.dom(x, 1115, 'div', 'width:640px;text-align:center;', '');
    (geri.node as HTMLDivElement).innerHTML = ILETISIM_EPOSTA
      ? `<a href="${geriBildirimAdresi()}" style="${BAGLANTI_STILI}">✉️ Geri bildirim yaz</a>`
      : `<span style="font: 400 26px 'Baloo 2', Arial, sans-serif; color: #cfe3ff;">✉️ Görüşlerinizi beta grubuna yazabilirsiniz.</span>`;
    geri.updateSize();

    // "Bilgiler sadece bu telefonda" sözü kanıtıyla: dokununca telefonda saklanan her şey listelenir.
    baglanti(1190, '🔒 Bilgiler sadece bu telefonda: göster').on('pointerdown', () => this.scene.start('EbeveynVeri', {}));
    this.add.text(x, 1256, `Sürüm ${__SURUM__}`, { fontFamily: YAZI_TIPI, fontSize: '24px', color: '#8299bf' }).setOrigin(0.5);
  }
}

const BAGLANTI_STILI =
  "font: 400 27px 'Baloo 2', Arial, sans-serif; display: inline-block; white-space: nowrap; color: #cfe3ff; background: rgba(255,255,255,0.12); padding: 24px 22px; border-radius: 14px; text-decoration: underline;";

import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, genisDokunma, yildizliArkaPlan } from '../arayuz';
import { tumVerileriSil } from '../guvenlik';
import { geriBildirimAdresi, ILETISIM_EPOSTA } from '../iletisim';
import { betaDunyaAc, betaDunyaAcikMi } from '../ilerleme';
import { kameraAcikMi, kameraAyarla, kameraDesteklenir } from '../kamera';

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

    const dugme = (y: number, yazi: string, renk: number, sahne: string, veri?: object) =>
      buyukDugme(this, x, y, yazi, renk, () => this.scene.start(sahne, veri), { genislik: 560, yukseklik: 100, yaziBoyu: 44 });
    dugme(290, '📊 Hareket özeti', RENK.turuncu, 'EbeveynOzet');
    dugme(400, '✏️ Pasaportu düzenle', RENK.mavi, 'PasaportAyar');
    dugme(510, '📲 Telefona yükle', RENK.yesil, 'Kurulum');
    dugme(620, '🛡️ Güvenlik notu', 0x7c5cd6, 'Guvenlik', { sonra: 'EbeveynMenu' });

    // Küçük görünen ayar düğmeleri: yazı sade kalır, dokunma alanı en az 88 nokta (parmak ıskalamasın).
    const baglanti = (y: number, yazi: string) =>
      genisDokunma(
        this.add
          .text(x, y, yazi, { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 14 } })
          .setOrigin(0.5),
      );

    // Kamerayla sayma (deneme): açıkken zıplama, çömelme ve kol hareketlerini kamera sayar.
    // Görüntü telefonun içinde işlenir; kaydedilmez, gönderilmez.
    if (kameraDesteklenir()) {
      const acik = kameraAcikMi();
      baglanti(720, acik ? '📷 Kamerayla sayma: AÇIK (deneme)' : '📷 Kamerayla sayma: kapalı (deneme)').on('pointerdown', () => {
        kameraAyarla(!acik);
        this.scene.restart();
      });
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

    this.add
      .text(x, 1198, 'Reklam yok. Hesap yok.\nBütün bilgiler sadece bu telefonda saklanır.', { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#9fb6d9', align: 'center' })
      .setOrigin(0.5);
    this.add.text(x, 1256, `Sürüm ${__SURUM__}`, { fontFamily: YAZI_TIPI, fontSize: '24px', color: '#6f86ad' }).setOrigin(0.5);
  }
}

const BAGLANTI_STILI =
  "font: 400 27px 'Baloo 2', Arial, sans-serif; display: inline-block; white-space: nowrap; color: #cfe3ff; background: rgba(255,255,255,0.12); padding: 24px 22px; border-radius: 14px; text-decoration: underline;";

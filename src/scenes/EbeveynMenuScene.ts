import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { tumVerileriSil } from '../guvenlik';
import { betaDunyaAc, betaDunyaAcikMi } from '../ilerleme';

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
      buyukDugme(this, x, y, yazi, renk, () => this.scene.start(sahne, veri), { genislik: 560, yukseklik: 115, yaziBoyu: 46 });
    dugme(320, '📊 Hareket özeti', RENK.turuncu, 'EbeveynOzet');
    dugme(460, '✏️ Pasaportu düzenle', RENK.mavi, 'PasaportAyar');
    dugme(600, '📲 Telefona yükle', RENK.yesil, 'Kurulum');
    dugme(740, '🛡️ Güvenlik notu', 0x7c5cd6, 'Guvenlik', { sonra: 'EbeveynMenu' });

    const baglanti = (y: number, yazi: string) =>
      this.add
        .text(x, y, yazi, { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 10 } })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    // Gizlilik ve koşullar ayrı web sayfaları; gerçek bağlantı (yeni sekmede açılır).
    const sayfalar = this.add.dom(x, 870, 'div', 'display:flex;gap:14px;justify-content:center;width:640px;', '');
    (sayfalar.node as HTMLDivElement).innerHTML = ['gizlilik.html|Gizlilik politikası', 'kosullar.html|Kullanım koşulları']
      .map((s) => s.split('|'))
      .map(([adres, ad]) => `<a href="${adres}" target="_blank" rel="noopener" style="${BAGLANTI_STILI}">${ad}</a>`)
      .join('');

    // Tüm verileri sil: iki adımlı onay (yanlışlıkla silinmesin).
    let onay = false;
    const sil = baglanti(970, '🗑️ Tüm verileri sil').setColor('#ff9b9b');
    sil.on('pointerdown', () => {
      if (!onay) {
        onay = true;
        sil.setText('Emin misiniz? Silmek için tekrar dokunun.');
        return;
      }
      tumVerileriSil();
      this.scene.start('Acilis');
    });

    // Beta testi için: Dünya bölümünü Türkiye Turu bitmeden açar. Mağazaya çıkmadan kaldırılacak.
    const beta = betaDunyaAcikMi();
    baglanti(1070, beta ? '🧪 Beta: Dünya bölümü açık (kapat)' : '🧪 Beta: Dünya bölümünü aç').on('pointerdown', () => {
      betaDunyaAc(!beta);
      this.scene.restart();
    });

    this.add
      .text(x, 1190, 'Reklam yok. Hesap yok.\nBütün bilgiler sadece bu telefonda saklanır.', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#9fb6d9', align: 'center' })
      .setOrigin(0.5);
  }
}

const BAGLANTI_STILI =
  "font: 400 27px 'Baloo 2', Arial, sans-serif; white-space: nowrap; color: #cfe3ff; background: rgba(255,255,255,0.12); padding: 10px 20px; border-radius: 14px; text-decoration: underline;";

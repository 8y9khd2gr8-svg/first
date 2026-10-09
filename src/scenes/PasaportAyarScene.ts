import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { fotoDokusuYukle, fotoyuHazirla, pasaportOku, pasaportYaz } from '../pasaport';

// Ebeveyn için: çocuğun adını yazma ve fotoğrafını çekme. Telefonun kendi kamera
// ekranı açılır; fotoğraf küçültülüp sadece bu cihazda saklanır.
export class PasaportAyarScene extends Phaser.Scene {
  private foto?: string;
  private onizleme?: Phaser.GameObjects.Image;

  constructor() {
    super('PasaportAyar');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const pasaport = pasaportOku();
    this.foto = pasaport.foto;

    evDugmesi(this, () => this.scene.start('EbeveynMenu'));
    this.add.text(x, 150, 'Pasaportu hazırla', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '64px', color: '#FFC93C' }).setOrigin(0.5);

    const cerceve = this.add.graphics();
    cerceve.fillStyle(0xffffff, 0.12).fillRoundedRect(x - 140, 250, 280, 280, 28);
    cerceve.lineStyle(4, RENK.sari, 0.8).strokeRoundedRect(x - 140, 250, 280, 280, 28);
    // Fotoğraf yoksa çocuğun seçtiği karakter görünür; fotoğraf tamamen isteğe bağlı.
    const bos = this.add.text(x, 390, pasaport.avatar ?? '📷', { fontSize: '120px' }).setOrigin(0.5);
    const goster = (foto: string) =>
      fotoDokusuYukle(this, foto, (anahtar) => {
        bos.setVisible(false);
        this.onizleme?.destroy();
        this.onizleme = this.add.image(x, 390, anahtar).setDisplaySize(260, 260);
        this.onizleme.setMask(this.make.graphics({}).fillRoundedRect(x - 130, 260, 260, 260, 22).createGeometryMask());
      });
    if (this.foto) goster(this.foto);

    // Fotoğraf düğmesi gerçek bir HTML düğmesi: telefonlar kamerayı sadece doğrudan dokunuşla açar.
    const dosyaSecici = document.createElement('input');
    dosyaSecici.type = 'file';
    dosyaSecici.accept = 'image/*';
    dosyaSecici.setAttribute('capture', 'user');
    dosyaSecici.addEventListener('change', async () => {
      const dosya = dosyaSecici.files?.[0];
      if (!dosya) return;
      this.foto = await fotoyuHazirla(dosya);
      goster(this.foto);
    });
    const fotoDugmesi = this.add.dom(x, 610, 'button', DUGME_STILI, '📷 Fotoğraf ekle (isteğe bağlı)');
    fotoDugmesi.addListener('click');
    fotoDugmesi.on('click', () => dosyaSecici.click());

    this.add.text(x, 720, 'Çocuğun adı', { fontFamily: YAZI_TIPI, fontSize: '36px', color: '#cfe3ff' }).setOrigin(0.5);
    const adKutusu = this.add.dom(x, 800, 'input', GIRIS_STILI);
    const giris = adKutusu.node as HTMLInputElement;
    giris.value = pasaport.ad;
    giris.maxLength = 14;
    giris.placeholder = 'ör. Yağız';
    giris.autocomplete = 'off';

    this.add
      .text(x, 920, 'Fotoğraf eklemek zorunlu değil; eklenmezse çocuğun\nseçtiği karakter görünür. Ad ve fotoğraf sadece bu\ntelefonda saklanır, hiçbir yere gönderilmez.', {
        fontFamily: YAZI_TIPI,
        fontSize: '28px',
        color: '#9fb6d9',
        align: 'center',
      })
      .setOrigin(0.5);

    buyukDugme(this, x, 1060, 'Kaydet ✓', RENK.yesil, () => {
      pasaportYaz({ ad: giris.value.trim(), foto: this.foto, soruldu: true });
      this.scene.start('Pasaport', {});
    }, { genislik: 420, yukseklik: 140, yaziBoyu: 64 });

    if (this.foto || pasaport.ad) {
      const sil = this.add.text(x, 1190, 'Fotoğrafı ve adı sil', { fontFamily: YAZI_TIPI, fontSize: '30px', color: '#ff9b9b' }).setOrigin(0.5);
      sil.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        pasaportYaz({ ad: '', foto: undefined, soruldu: true });
        this.scene.restart();
      });
    }
  }
}

const DUGME_STILI =
  "font: 700 34px 'Baloo 2', Arial, sans-serif; padding: 18px 36px; border-radius: 40px; border: 6px solid #fff; background: #2F80ED; color: #fff;";
const GIRIS_STILI =
  "font: 700 44px 'Baloo 2', Arial, sans-serif; width: 440px; padding: 14px 24px; border-radius: 28px; border: 5px solid #FFC93C; text-align: center; color: #14213D; background: #FFF6E0; outline: none;";

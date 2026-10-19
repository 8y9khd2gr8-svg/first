import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';

// Oyun dört adımda: ebeveyn ilk kez açtığında "ne yapacağız?" sorusunun cevabı.
const ADIMLAR: [string, string, string][] = [
  ['🗺️', 'Durağa dokunun', 'Haritada sıradaki durağa dokunun;\nkısa bilgiyi dinleyip "Başla" deyin.'],
  ['👀', 'Önce Zıpzıp gösterir', 'Zıpzıp hareketi yapar ve söyler;\nçocuk sayaçla birlikte yapar.'],
  ['✅', '"Yaptım!" düğmesi', 'Sayaç bitince düğme çıkar, çocuk dokunur.\nUzaktan oyna açıksa kendiliğinden geçer.'],
  ['⭐', 'Damga ve ödül', 'Durak bitince damga ve yıldız; bazen\nrozet ve kostüm. Kaybetmek yok.'],
];

const IPUCLARI = [
  '⏱️ 10-15 dakikayla başlayın; "🌙 Bitirelim" ile soğuyup bitirin.',
  '⚙️ Ayarlar: 🐢 Sakin / 🐆 Hızlı tempo, Oturarak oyna.',
  '📱 Telefonu sağlam bir yere koyun; çocuk biraz geride dursun.',
  // K46 (18 Ekim, kullanıcı kararı): çocuk ekranlarında VoiceOver desteği yok; oyun kendi sesiyle yönlendirir.
  '🔈 VoiceOver açıksa kapatın; oyun kendisi konuşur.',
];

// Ebeveyn köşesi → "Nasıl oynanır": dört adım ve birkaç ipucu.
export class EbeveynRehberScene extends Phaser.Scene {
  constructor() {
    super('EbeveynRehber');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    evDugmesi(this, () => this.scene.start('EbeveynMenu', {}));
    this.add.text(x, 170, 'Nasıl oynanır?', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '68px', color: '#FFC93C' }).setOrigin(0.5);

    ADIMLAR.forEach(([simge, baslik, metin], i) => {
      const y = 330 + i * 160;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.08).fillRoundedRect(30, y - 70, 660, 140, 28);
      g.fillStyle(RENK.sari).fillCircle(70, y - 40, 22);
      this.add.text(70, y - 40, `${i + 1}`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '30px', color: '#0b1430' }).setOrigin(0.5);
      this.add.text(130, y, simge, { fontSize: '60px' }).setOrigin(0.5);
      this.add.text(200, y - 34, baslik, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '34px', color: '#FFC93C' }).setOrigin(0, 0.5);
      this.add.text(200, y + 22, metin, { fontFamily: YAZI_TIPI, fontSize: '26px', color: '#ffffff', lineSpacing: 0 }).setOrigin(0, 0.5);
    });

    IPUCLARI.forEach((ipucu, i) => {
      this.add.text(x, 975 + i * 46, ipucu, { fontFamily: YAZI_TIPI, fontSize: '25px', color: '#cfe3ff' }).setOrigin(0.5);
    });

    buyukDugme(this, x, 1190, '🛡️ Güvenlik notu', 0x7c5cd6, () => this.scene.start('Guvenlik', { sonra: 'EbeveynRehber' }), {
      genislik: 460,
      yukseklik: 100,
      yaziBoyu: 44,
    });
  }
}

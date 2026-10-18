import Phaser from 'phaser';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { bip, konus, sustur } from '../ses';

// Ebeveyn kilidi: çocuğun yanlışlıkla ayarlara girmemesi için basit bir çarpma sorusu.
export class EbeveynScene extends Phaser.Scene {
  private hedef = 'PasaportAyar';
  private geri = 'Pasaport';
  private hedefVeri: object = {};
  private geriVeri: object = {};
  private cocugaSoz?: string;

  constructor() {
    super('Ebeveyn');
  }

  // cocugaSoz: kilide neden gelindiğini çocuğa söyleyen cümle (ör. "Bu macerayı açmak için bir büyüğüne göster!").
  // geriVeri: vazgeçilince dönülen ekranın verisi (ör. hangi bölümün sertifikası).
  init(veri: { hedef?: string; geri?: string; hedefVeri?: object; geriVeri?: object; cocugaSoz?: string }) {
    this.hedef = veri.hedef ?? 'PasaportAyar';
    this.geri = veri.geri ?? 'Pasaport';
    this.hedefVeri = veri.hedefVeri ?? {};
    this.geriVeri = veri.geriVeri ?? {};
    this.cocugaSoz = veri.cocugaSoz;
  }

  create() {
    sustur();
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    // Tek karar: yavaş telefonda (kare ~200 ms) yanlış ve doğru cevaba aynı karede dokunulursa iki düğmenin de işi
    // çalışıyordu; kilit açılıp arkasındaki ekran ile geri dönülen ekran birlikte başlıyordu (18 Ekim). İlk dokunuş geçerli.
    let karar = false;
    const git = (anahtar: string, veri: object) => {
      if (karar) return;
      karar = true;
      this.scene.start(anahtar, veri);
    };
    evDugmesi(this, () => git(this.geri, this.geriVeri));

    const a = Phaser.Math.Between(3, 9);
    const b = Phaser.Math.Between(3, 9);
    const dogru = a * b;
    const secenekler = new Set([dogru]);
    while (secenekler.size < 4) secenekler.add(Math.max(4, dogru + Phaser.Math.Between(-12, 12)));
    const karisik = Phaser.Utils.Array.Shuffle([...secenekler]);

    this.add.text(x, 230, 'Ebeveyn bölümü', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '64px', color: '#FFC93C' }).setOrigin(0.5);
    this.add
      .text(x, 330, 'Devam etmek için soruyu cevaplayın.', { fontFamily: YAZI_TIPI, fontSize: '34px', color: '#cfe3ff' })
      .setOrigin(0.5);
    if (this.cocugaSoz) konus(this.cocugaSoz);
    this.add
      .text(x, 470, `${a} × ${b} = ?`, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '110px', color: '#ffffff' })
      .setOrigin(0.5);

    karisik.forEach((sayi, i) => {
      const sx = x + (i % 2 === 0 ? -150 : 150);
      const sy = 700 + Math.floor(i / 2) * 190;
      buyukDugme(this, sx, sy, String(sayi), RENK.mavi, () => {
        if (sayi === dogru) git(this.hedef, this.hedefVeri);
        else {
          if (!karar) bip(200, 0.2, 'square', 0.15);
          git(this.geri, this.geriVeri);
        }
      }, { genislik: 250, yukseklik: 150, yaziBoyu: 70 });
    });
  }
}

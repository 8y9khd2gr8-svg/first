import Phaser from 'phaser';
import { Capacitor } from '@capacitor/core';
import { RENK, YAZI_TIPI } from '../ayarlar';
import { buyukDugme, evDugmesi, genisDokunma, yildizliArkaPlan } from '../arayuz';
import { M } from '../metinler';
import { konus, sesDurumu, sesYuklemeAcilir, sesYuklemeEkraniniAc, sustur } from '../ses';

// "Sesi dene" (ebeveyn köşesi): oyun bu telefonda hangi sesle konuşuyor, örnek cümleyi dinle.
// Telefonda Türkçe ses yoksa nasıl yükleneceği yazar (okuma bilmeyen çocuk sesli yönlendirmeye muhtaç).
export class EbeveynSesScene extends Phaser.Scene {
  constructor() {
    super('EbeveynSes');
  }

  create() {
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    const geri = () => {
      sustur();
      this.scene.start('EbeveynMenu', {});
    };
    evDugmesi(this, geri);
    this.add.text(x, 165, 'Sesi dene', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '68px', color: '#FFC93C' }).setOrigin(0.5);

    this.add.rectangle(x, 320, 640, 170, 0xffffff, 0.08).setStrokeStyle(2, 0xffffff, 0.2);
    const durumYazisi = this.add
      .text(x, 320, 'Telefonun sesleri denetleniyor…', { fontFamily: YAZI_TIPI, fontSize: '28px', color: '#ffffff', align: 'center', lineSpacing: 6 })
      .setOrigin(0.5);

    buyukDugme(this, x, 500, '🔊 Dinle', RENK.yesil, () => konus(M.sesDeneme), { genislik: 420, yukseklik: 120, yaziBoyu: 52 });

    const yonerge = this.add
      .text(x, 600, '', { fontFamily: YAZI_TIPI, fontSize: '27px', color: '#cfe3ff', align: 'left', lineSpacing: 4, wordWrap: { width: 620 } })
      .setOrigin(0.5, 0);

    void sesDurumu().then((durum) => {
      if (!this.scene.isActive()) return;
      const kayit = durum.kayitli > 0 ? `✅ Doğal ses kaydı: ${durum.kayitli} cümle` : 'Doğal ses kaydı: henüz yok';
      const telefon = durum.turkce
        ? `✅ Telefonun Türkçe sesi: ${kisalt(durum.sesAdi ?? 'var')}`
        : '⚠️ Telefonda Türkçe ses bulunamadı';
      durumYazisi.setText(`${kayit}\n${telefon}`);
      yonerge.setText(yonergeMetni(durum.turkce, durum.kayitli > 0));
      if (!durum.turkce && sesYuklemeAcilir()) {
        genisDokunma(
          this.add
            .text(x, 1080, '⚙️ Türkçe sesi yükle', { fontFamily: YAZI_TIPI, fontSize: '32px', color: '#cfe3ff', backgroundColor: '#ffffff1f', padding: { x: 20, y: 14 } })
            .setOrigin(0.5),
        ).on('pointerdown', sesYuklemeEkraniniAc);
      }
    });

    buyukDugme(this, x, 1190, 'Tamam', RENK.mavi, geri, { genislik: 360, yukseklik: 100, yaziBoyu: 44 });
  }
}

const kisalt = (ad: string) => (ad.length > 26 ? `${ad.slice(0, 25)}…` : ad);

function telefonTuru(): 'android' | 'ios' | 'diger' {
  const p = Capacitor.getPlatform();
  if (p === 'android' || p === 'ios') return p;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'diger';
}

function yonergeMetni(turkce: boolean, kayitVar: boolean): string {
  const tur = telefonTuru();
  const sessiz =
    tur === 'ios'
      ? 'Hiç ses gelmiyorsa: telefonun yanındaki sessiz düğmesini kapatın ve sesi açın.'
      : 'Hiç ses gelmiyorsa: telefonun medya sesini açın.';
  if (turkce) return `Dinle'ye dokunun; Zıpzıp'ın sesini duymalısınız.\n\n${sessiz}`;
  const nasil =
    tur === 'android'
      ? 'Türkçe ses yüklemek için:\nAyarlar → Sistem → Diller ve giriş → Metin okuma çıkışı → Google ⚙️ → Ses verilerini yükle → Türkçe.'
      : tur === 'ios'
        ? 'Türkçe ses yüklemek için:\nAyarlar → Erişilebilirlik → Seslendirilen İçerik → Sesler → Türkçe → bir ses indirin (Gelişmiş olanı daha doğal).'
        : 'Türkçe ses yüklemek için telefonun ayarlarında "metin okuma" ya da "seslendirilen içerik" bölümüne bakın.';
  const etkisi = kayitVar
    ? 'Kaydı olmayan cümleler Türkçe ses yüklenene kadar okunamaz.'
    : 'Türkçe ses olmadan Zıpzıp konuşamaz; yazı okumayan çocuk yönlendirmeyi duyamaz.';
  return `${etkisi}\n\n${nasil}\nSonra oyunu kapatıp yeniden açın.\n\n${sessiz}`;
}

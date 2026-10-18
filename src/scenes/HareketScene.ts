import Phaser from 'phaser';
import { RENK, YAZI_TIPI, hareketiAzalt } from '../ayarlar';
import { buyukDugme, evDugmesi, yildizliArkaPlan } from '../arayuz';
import { AILE_ID } from '../aile';
import { durakBul, haritaSahnesi } from '../duraklar';
import { SOGUMA_ID, hareketYapildi, oturumListesi } from '../oturum';
import { uzaktanAcikMi } from '../ayarlar';
import { AYNA, Animasyon, DONMA, Hareket } from '../hareketler';
import { hareketKaydet } from '../istatistik';
import { EksikYer, KAMERA_HAREKETLERI, KameraDurumu, KameraSayaci, eksikYeri, kameraAcikMi, kameraDesteklenir } from '../kamera';
import { oyunAyari } from '../oyunAyari';
import { GERI_SAYIM, M, SAYILAR } from '../metinler';
import { bip, konus, sustur, yarimKalaniAl, zaferMuzigi } from '../ses';
import { Zipzip } from '../zipzip';
import { durakYonu, zipzipYonunuAyarla } from '../zipzipKure';

const MASKOT_Y = 640;

// Kamera kutusunun üç hâli (tuval noktası; K40 "önce büyük ayna"):
// ayna: geri sayımdan önce ekranın yarısına yakın canlı görüntü, çocuk 2-3 m uzaktan kendini görüp kadraja yerleşir.
// hareket: gösterim ve hareket boyunca sağ altta (eski küçük kutunun ~3 katı), sayı büyük; sayı ve yazı biraz sola kayar.
// kucuk: "Yaptım!" düğmesi çıkınca sağ üst köşede (düğmeyi örtmesin).
type KutuHali = 'ayna' | 'hareket' | 'kucuk';
const KUTU: Record<KutuHali, { x: number; y: number; g: number; y2: number; yazi: number }> = {
  ayna: { x: 60, y: 380, g: 600, y2: 620, yazi: 34 },
  hareket: { x: 470, y: 910, g: 234, y2: 260, yazi: 40 },
  kucuk: { x: 551, y: 6, g: 150, y2: 126, yazi: 20 }, // hikâye satırının (y 170) üstünde kalır
};
// Kamera açıkken sayı ve alt yazı kutunun solunda ortalanır.
const KAMERALI_YAZI_X = 250;
// Ayna en çok bu kadar bekler (görmese de oyun bekletmez, kaybettirmez); Sakin tempoda biraz daha uzun.
const AYNA_EN_COK_MS = 6000;
const AYNA_SAKIN_MS = 8000;

// Kamera çocuğu tam göremiyorsa kutudaki yazı neyin eksik olduğunu söyler (K41 c). Ayna büyük, uzun yazı sığar;
// hareket boyunca kutu küçük, kısa yazı (biraz küçük harfle). Neyin eksik olduğu henüz bilinmiyorsa (ilk kare) genel yazı.
const AYNA_IPUCU: Record<EksikYer, string> = {
  kimse: '🧍 Seni göremiyorum: kameranın önüne gel',
  ayaklar: '🦶 Ayakların görünmüyor: biraz geri git',
  omuzlar: '🙋 Çok yakınsın: biraz geri git',
  kenar: '↔️ Ortaya gel, biraz geri git',
};
const KUTU_IPUCU: Record<EksikYer, string> = {
  kimse: '📷 Seni göremiyorum',
  ayaklar: '🦶 Ayakların görünmüyor',
  omuzlar: '📷 Çok yakınsın',
  kenar: '📷 Ortaya gel',
};
const SESLI_IPUCU: Record<EksikYer, string> = { kimse: M.ipucuKimse, ayaklar: M.ipucuAyaklar, omuzlar: M.ipucuOmuzlar, kenar: M.ipucuKenar };
// Sesli ipucu sadece aynada söylenir (hareket sırasında Zıpzıp sayıları söylüyor), "Ekranda kendine bak!"tan sonra.
// Aynı ipucu bu süre geçmeden yinelenmez (her harekette aynı cümle bıktırmasın); farklı eksikse söylenir.
const IPUCU_ILK_MS = 3000;
const IPUCU_TEKRAR_MS = 60_000;
let sonIpucu: { yer: EksikYer; zaman: number } | null = null;

// Hareket ekranı. Bir durağın 5 hareketini sırayla oynatır.
// Her hareket: Zıpzıp gösterir → 3-2-1 → çocuk yapar (sayaç) → "Yaptım!" → sıradaki.
export class HareketScene extends Phaser.Scene {
  private durakId = '';
  private adim = 0;
  private zipzip!: Zipzip;
  private sayac!: Phaser.GameObjects.Text;
  private bilgi!: Phaser.GameObjects.Text;
  // Kamera ile sayma (ebeveyn açtıysa ve hareket destekleniyorsa).
  private kamera: KameraSayaci | null = null;
  private kameraHedefe: (() => void) | null = null;
  // Büyük ayna açıkken kamera durumu değişince haber alır.
  private aynaDinle: (() => void) | null = null;
  private kutuHali: (hal: KutuHali) => void = () => {};
  // Ayna "Hazırsın!" dedikten sonra çerçeve yeşil kalır (tanıma bir an kaçırsa da yanıp sönmesin).
  private kutuHazir: () => void = () => {};
  // Bu adımda kullanılan oturum listesi (create'te bir kez alınır).
  private oturum: Hareket[] = [];

  constructor() {
    super('Hareket');
  }

  init(veri: { durakId: string; adim?: number }) {
    this.durakId = veri.durakId;
    this.adim = veri.adim ?? 0;
  }

  create() {
    this.donuk = false;
    yildizliArkaPlan(this);
    const x = this.scale.gameSize.width / 2;
    // Liste adım başında bir kez alınır: "Yaptım!"dan sonra yeniden kurulursa ısınma düşer ve sıradaki (özel) hareket atlanırdı.
    this.oturum = oturumListesi(this.durakId, this.adim);
    const liste = this.oturum;
    const hareket = liste[this.adim];

    evDugmesi(this, () => {
      sustur();
      this.scene.start(this.durakId === AILE_ID || this.durakId === SOGUMA_ID ? 'Macera' : haritaSahnesi(durakBul(this.durakId)), {});
    });

    // İlerleme noktaları: kaçıncı hareketteyiz?
    liste.forEach((_, i) => {
      const nx = x + (i - (liste.length - 1) / 2) * 56;
      this.add.circle(nx, 80, 16, i < this.adim ? RENK.sari : i === this.adim ? RENK.beyaz : 0xffffff, i <= this.adim ? 1 : 0.25);
    });

    if (hareket.hikaye) {
      const hikaye = this.add
        .text(x, 170, hareket.hikaye, { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '44px', color: hareket.surpriz ? '#FF8A3D' : '#cfe3ff' })
        .setOrigin(0.5);
      // Uzun hikâye tek satırda kalsın, ekrana sığsın.
      hikaye.setScale(Math.min(1, 670 / hikaye.width));
    }
    // Ritim işareti: okuma bilmeyen de görsün (🐢 yavaş, ⚡ hızlı).
    if (hareket.ritim) {
      const r = this.add.container(110, 520);
      r.add(this.add.circle(0, 0, 62, 0xffffff, 0.12).setStrokeStyle(4, RENK.sari));
      r.add(this.add.text(0, -8, hareket.ritim === 'yavas' ? '🐢' : '⚡', { fontSize: '62px' }).setOrigin(0.5));
      r.add(this.add.text(0, 82, hareket.ritim === 'yavas' ? 'Yavaş' : 'Hızlı', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '30px', color: '#FFC93C' }).setOrigin(0.5));
    }
    const komut = this.add
      .text(x, hareket.hikaye ? 280 : 240, hareket.baslik, {
        fontFamily: YAZI_TIPI,
        fontStyle: 'bold',
        fontSize: '72px',
        color: '#FFC93C',
        align: 'center',
        stroke: '#0b1430',
        strokeThickness: 14,
        lineSpacing: -16,
      })
      .setOrigin(0.5);
    // Uzun komutlar ekrandan taşmasın.
    komut.setScale(Math.min(1, 660 / komut.width));

    // Zıpzıp durağın olduğu tarafa bakar (Ailece ve soğumada son baktığı yerde kalır).
    if (this.durakId !== AILE_ID && this.durakId !== SOGUMA_ID) zipzipYonunuAyarla(durakYonu(durakBul(this.durakId)));
    this.zipzip = new Zipzip(this, x, MASKOT_Y, 1.5);
    this.sayac = this.add
      .text(x, 1060, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '150px', color: '#ffffff', stroke: '#0b1430', strokeThickness: 14 })
      .setOrigin(0.5);
    this.bilgi = this.add
      .text(x, 1200, 'Önce Zıpzıp’ı izle!', { fontFamily: YAZI_TIPI, fontSize: '44px', color: '#cfe3ff' })
      .setOrigin(0.5);

    konus(hareket.sesli);
    this.kameraKur(hareket);
    // Sürpriz oyunlarda Zıpzıp da şaşırır.
    if (hareket.hikaye === DONMA.hikaye || hareket.hikaye === AYNA.hikaye) this.zipzip.ifadeSec('saskin', 1800);

    // Gösterim: Zıpzıp hareketi bir iki kez yapar.
    const gosterimSuresi = 2600;
    if (hareket.tur === 'sayi') {
      this.zipzip.birKez(this.tekrarHareketi(hareket, 1), hareket.tempoMs);
      if (hareket.tempoMs < gosterimSuresi) {
        this.time.delayedCall(hareket.tempoMs, () => this.zipzip.birKez(this.tekrarHareketi(hareket, 2), hareket.tempoMs, 2));
      }
    } else {
      this.zipzip.surekli(hareket.dizi?.[0] ?? hareket.animasyon, this.surekliTempo(hareket));
      this.time.delayedCall(gosterimSuresi - 400, () => this.zipzip.durdur());
    }

    // Uzun cümlelerde seslendirme bitmeden geri sayım başlamasın.
    const bekleme = Math.max(gosterimSuresi + 600, hareket.sesli.length * 70);
    const sonraki = () => this.aynaEvresi(() => this.geriSay(() => this.basla(hareket)));
    let gosterimBitti = this.time.delayedCall(bekleme, sonraki);

    // Arama/kilit/başka uygulama komutu yarıda kestiyse (K39 b, 17 Ekim): dönüşte komut bir kez yeniden söylenir
    // (okuma bilmeyen çocuk ne yapacağını duysun) ve geri sayım cümle bitecek kadar ertelenir. Sayılar yinelenmez.
    const donus = () => {
      if (document.hidden) return;
      const yarim = yarimKalaniAl();
      if (yarim !== hareket.sesli || gosterimBitti.hasDispatched) return;
      konus(yarim);
      const kalan = gosterimBitti.getRemaining();
      gosterimBitti.remove();
      gosterimBitti = this.time.delayedCall(Math.max(kalan, yarim.length * 70), sonraki);
    };
    document.addEventListener('visibilitychange', donus);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', donus));
  }

  // Önce büyük ayna (K40): kamerayla sayılan harekette geri sayımdan önce çocuk kendini büyük görür ve "baştan ayağa"
  // çerçeveye yerleşir. Kamera görünce çerçeve yeşil olur, "Hazırsın!" denir. Görmezse en çok birkaç saniye sonra
  // normal geri sayım başlar (oyun beklemez, kaybettirmez). Kamera yoksa, açılamadıysa ya da durduysa hemen geçilir.
  private aynaEvresi(devam: () => void) {
    const kamera = this.kamera;
    if (!kamera || kamera.durum === 'hata' || kamera.durum === 'durdu') return devam();
    let bitti = false;
    let gordu = false;
    const bitir = () => {
      if (bitti) return;
      bitti = true;
      this.aynaDinle = null;
      sure.remove();
      document.removeEventListener('visibilitychange', gorunurluk);
      this.kutuHali('hareket');
      devam();
    };
    // Süre gerçek saatle sayılır: yavaş telefonda (kare 200 ms'yi aşınca) Phaser'ın saati geri kalır, ayna uzamasın (T7).
    // Sayfa gizliyken (arama, kilit) geçen süre sayılmaz. Eskiden her ölçümde en çok 1,5 sn ekleniyordu: sayfa daha uzun
    // donunca (yük, modelin ilk hazırlanışı) süre eksik sayılıp ayna 6 sn yerine 8-9 sn sürüyordu.
    const enCok = oyunAyari().yas === 'kucuk' ? AYNA_SAKIN_MS : AYNA_EN_COK_MS;
    const bas = performance.now();
    let gizliBas: number | null = document.hidden ? bas : null;
    let gizliToplam = 0;
    const gorunurluk = () => {
      if (document.hidden) gizliBas ??= performance.now();
      else if (gizliBas !== null) {
        gizliToplam += performance.now() - gizliBas;
        gizliBas = null;
      }
    };
    document.addEventListener('visibilitychange', gorunurluk);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', gorunurluk));
    let ipucuSoylendi = false;
    const sure = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (gizliBas !== null) return;
        const simdi = performance.now();
        const gecen = simdi - bas - gizliToplam;
        if (gecen >= enCok) return bitir();
        // Hâlâ göremiyorsa bir kez neyin eksik olduğunu söyler (sık tekrar etmez).
        const yer = kamera.durum === 'goremiyorum' ? eksikYeri(kamera.eksik) : null;
        if (!ipucuSoylendi && yer && gecen >= IPUCU_ILK_MS && (sonIpucu?.yer !== yer || simdi - sonIpucu.zaman > IPUCU_TEKRAR_MS)) {
          ipucuSoylendi = true;
          sonIpucu = { yer, zaman: simdi };
          konus(SESLI_IPUCU[yer]);
        }
      },
    });
    this.kutuHali('ayna');
    this.bilgi.setText('Ekranda kendine bak!');
    const hazir = (sesli: boolean) => {
      gordu = true;
      sure.remove();
      this.kutuHazir();
      this.bilgi.setText('Hazırsın!');
      if (sesli) konus(M.hazirsin);
      this.time.delayedCall(sesli ? 1600 : 900, bitir);
    };
    this.aynaDinle = () => {
      if (bitti || gordu) return;
      if (kamera.durum === 'hata' || kamera.durum === 'durdu') bitir();
      else if (kamera.durum === 'goruyorum') hazir(true);
    };
    // Önceki harekette de görünüyorduysa (aynı durak) kısa geçilir, uzun yönlendirme söylenmez.
    if (kamera.durum === 'goruyorum') hazir(false);
    else konus(M.aynaBak);
  }

  private geriSay(bitince: () => void) {
    this.bilgi.setText('Hazır ol!');
    ['3', '2', '1', 'Başla!'].forEach((s, i) => {
      this.time.delayedCall(i * 900, () => {
        const basla = i === 3;
        this.sayacGoster(s, basla ? '#3FBF5F' : '#ffffff');
        bip(basla ? 880 : 520, basla ? 0.35 : 0.15, 'triangle');
        konus(GERI_SAYIM[i]);
        if (basla) this.time.delayedCall(600, bitince);
      });
    });
  }

  private basla(hareket: Hareket) {
    this.bilgi.setText('Sen de yap!');
    // Aynada yerleşirken yapılan hareketler sayılmasın: kamera sayımı hareketle birlikte baştan başlar.
    this.kamera?.yolDegistir(hareket.animasyon);
    if (hareket.tur === 'sayi') {
      for (let k = 1; k <= hareket.adet; k++) {
        this.time.delayedCall((k - 1) * hareket.tempoMs, () => {
          this.zipzip.birKez(this.tekrarHareketi(hareket, k), hareket.tempoMs, k);
          this.sayacGoster(String(k));
          bip(560 + k * 40, 0.12);
          konus(SAYILAR[k - 1] ?? '');
        });
      }
      this.time.delayedCall(hareket.adet * hareket.tempoMs, () => this.bitir(hareket));
    } else {
      this.zipzip.surekli(hareket.dizi?.[0] ?? hareket.animasyon, this.surekliTempo(hareket));
      for (let s = hareket.saniye; s >= 1; s--) {
        this.time.delayedCall((hareket.saniye - s) * 1000, () => {
          if (!this.donuk) this.sayacGoster(String(s));
          bip(600, 0.08);
          if (s <= 3 && !hareket.surpriz) konus(GERI_SAYIM[3 - s]);
        });
      }
      if (hareket.surpriz === 'donma') this.donmaOyunu(hareket);
      if (hareket.surpriz === 'ayna') this.aynaOyunu(hareket);
      this.time.delayedCall(hareket.saniye * 1000, () => this.bitir(hareket));
    }
  }

  private bitir(hareket: Hareket) {
    this.zipzip.durdur();
    this.sayac.setText('');
    this.bilgi.setText('');
    // Ailece'de hep uzaktan: iki kişi 2-3 metre gerideyken telefona yürümesinler (14 Ekim kararı; dokunarak hemen geçilir).
    const uzaktan = uzaktanAcikMi() || this.durakId === AILE_ID;
    konus(uzaktan ? M.devamEdiyoruz : M.yaptinMi);

    const x = this.scale.gameSize.width / 2;
    let bitti = false;
    const yaptim = () => {
      if (bitti) return;
      bitti = true;
      this.kameraHedefe = null;
      sustur();
      // Kamera açılamadıysa (izin yok, model yüklenemedi) o hareket "kamera açıkken" sayılmaz: özet dürüst kalsın.
      const kameraCalisti = this.kamera && this.kamera.durum !== 'hata';
      hareketKaydet(hareket, kameraCalisti && hareket.tur === 'sayi' ? { gordu: this.kamera!.sayi >= hareket.adet } : undefined);
      hareketYapildi();
      dugme.destroy();
      this.sonraki();
    };
    // Kamera kutusu "Yaptım!" düğmesini örtmesin: sağ üst köşeye küçülür (sayı görünmeye devam eder).
    this.kutuHali('kucuk');
    const dugme = buyukDugme(this, x, 1080, 'Yaptım!', RENK.yesil, yaptim, { genislik: 500, yukseklik: 170, yaziBoyu: 84 });
    // Kamera hedef sayıyı gördüyse kendiliğinden geçer; görmediyse düğme bekler
    // (kaybetmek yok) ve kamera saymaya devam eder.
    if (this.kamera && hareket.tur === 'sayi') {
      const hedef = hareket.adet;
      this.kameraHedefe = () => {
        if (this.kamera && this.kamera.sayi >= hedef) {
          konus(M.kameraGordu);
          this.time.delayedCall(900, yaptim);
          this.kameraHedefe = null;
        }
      };
      this.kameraHedefe();
    }
    // Uzaktan oyna: telefona gitmeye gerek yok, 3 saniye sonra kendiliğinden geçer (dokunarak hemen geçilir).
    if (uzaktan) {
      const geri = this.add.text(x, 1200, '', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '40px', color: '#cfe3ff' }).setOrigin(0.5);
      [3, 2, 1].forEach((n, i) => this.time.delayedCall(800 + i * 1000, () => !bitti && geri.setText(`📱 ${n}…`)));
      this.time.delayedCall(3800, yaptim);
    }
    dugme.setScale(0);
    this.tweens.add({ targets: dugme, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.tweens.add({ targets: dugme, angle: { from: -3, to: 3 }, duration: 500, yoyo: true, repeat: -1, delay: 400 });
  }

  // Kısa bir "Aferin!" kutlaması, sonra sıradaki hareket ya da ödül ekranı.
  private sonraki() {
    const sonAdim = this.adim >= this.liste().length - 1;
    if (sonAdim) {
      if (this.durakId === SOGUMA_ID) {
        this.zipzip.ifadeSec('uykulu');
        konus(M.bugunlukBitti);
        this.time.delayedCall(2500, () => this.scene.start('Macera', {}));
        return;
      }
      this.scene.start('Odul', { durakId: this.durakId });
      return;
    }
    const x = this.scale.gameSize.width / 2;
    zaferMuzigi();
    konus(M.aferin);
    const aferin = this.add
      .text(x, 1080, 'Aferin!', { fontFamily: YAZI_TIPI, fontStyle: 'bold', fontSize: '120px', color: '#FFC93C', stroke: '#0b1430', strokeThickness: 16 })
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({ targets: aferin, scale: 1, duration: 350, ease: 'Back.easeOut' });
    // Aferin'de sırayla gülen gözler ve göz kırpma (hep aynı olmasın).
    this.zipzip.ifadeSec(this.adim % 2 === 0 ? 'mutlu' : 'kirpan');
    this.zipzip.birKez('zipla', 900);
    this.time.delayedCall(1300, () => this.scene.restart({ durakId: this.durakId, adim: this.adim + 1 }));
  }

  // Kamera önizlemesi ve sayı (üç hâli: KUTU). Görüntü sadece ekranda gösterilir; kaydedilmez, gönderilmez.
  private kameraKur(hareket: Hareket) {
    // Ailece'de kamera açılmaz: iki kişiyi saymak güvenilir değil (karar, 14 Ekim'de yeniden onaylandı).
    if (this.durakId === AILE_ID || !kameraAcikMi() || !kameraDesteklenir() || hareket.tur !== 'sayi' || hareket.dizi || !KAMERA_HAREKETLERI.includes(hareket.animasyon)) return;
    const kutu = document.createElement('div');
    kutu.className = 'kamera-kutusu';
    kutu.style.cssText = 'border-radius:16px;overflow:hidden;background:#0b1430;border:4px solid #FFC93C;position:relative;box-sizing:border-box;font-family:"Baloo 2",sans-serif;';
    // "Baştan ayağa" çerçevesi (sadece büyük aynada): sarı kesik çizgi, kamera görünce yeşil.
    const cerceve = document.createElement('div');
    cerceve.style.cssText = 'position:absolute;left:12%;right:12%;top:4%;bottom:15%;border:6px dashed #FFC93C;border-radius:24px;pointer-events:none;';
    const yazi = document.createElement('div');
    yazi.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:#0b1430cc;color:#fff;font-weight:700;text-align:center;';
    yazi.textContent = '📷 Hazırlanıyor';
    let hal: KutuHali = 'hareket';
    let durum: KameraDurumu = 'yukleniyor';
    let sayi = 0;
    let hazir = false;
    let ipucuYazisi = false;
    const yaziBoyu = () => Math.round(boyut.yazi * (ipucuYazisi ? 0.7 : 1));
    const yaz = () => {
      const goruyor = durum === 'goruyorum' || (hal === 'ayna' && hazir && durum !== 'durdu' && durum !== 'hata');
      const yer = durum === 'goremiyorum' ? eksikYeri(kamera.eksik) : null;
      // Görüntü kesilince (ekran kilidi, başka uygulama) son sayı kalmasın: ebeveyn kameranın saydığını sanmasın.
      // Oynanış aynı: "Yaptım!" yine çıkar (K27).
      yazi.textContent =
        durum === 'hata' ? '📷 Açılamadı'
        : durum === 'durdu' ? '📷 Durdu'
        : durum === 'yukleniyor' ? '📷 Hazırlanıyor'
        : hal === 'ayna' ? (goruyor ? '✅ Hazırsın!' : yer ? AYNA_IPUCU[yer] : '🧍 Baştan ayağa görün: biraz geri git')
        : durum === 'goremiyorum' ? (yer ? KUTU_IPUCU[yer] : '📷 Geri git')
        : `📷 ${Math.min(sayi, hareket.adet)}/${hareket.adet}`;
      // Küçük kutudaki ipucu iki satıra sığsın diye biraz küçük harfle.
      ipucuYazisi = hal !== 'ayna' && !!yer;
      yazi.style.fontSize = `${yaziBoyu()}px`;
      yazi.style.lineHeight = `${Math.round(yaziBoyu() * 1.5)}px`;
      const renk = goruyor ? '#3FBF5F' : '#FFC93C';
      kutu.style.borderColor = renk;
      cerceve.style.borderColor = renk;
      cerceve.style.borderStyle = goruyor ? 'solid' : 'dashed';
      cerceve.style.display = hal === 'ayna' ? 'block' : 'none';
    };
    const kamera = new KameraSayaci(hareket.animasyon, (s, d) => {
      sayi = s;
      durum = d;
      yaz();
      this.aynaDinle?.();
      this.kameraHedefe?.();
    }, undefined, true);
    const video = kamera.onizleme;
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:block;';
    kutu.append(video, cerceve, yazi);
    const boyut = { ...KUTU.hareket };
    // İlk hâl hemen yazılır: kamera hazırlanırken küçük kutuda aynanın çerçevesi görünmesin.
    yaz();
    const dom = this.add.dom(0, 0, kutu).setOrigin(0, 0);
    const uygula = () => {
      dom.setPosition(boyut.x, boyut.y);
      kutu.style.width = `${boyut.g}px`;
      kutu.style.height = `${boyut.y2}px`;
      yazi.style.fontSize = `${yaziBoyu()}px`;
      yazi.style.lineHeight = `${Math.round(yaziBoyu() * 1.5)}px`;
    };
    uygula();
    this.kutuHali = (yeni) => {
      if (yeni === hal) return;
      hal = yeni;
      yaz();
      this.tweens.killTweensOf(boyut);
      // Büyüme/küçülme bir işe yarar (çocuk nereye bakacağını görür); hareketi azalt'ta hemen.
      if (hareketiAzalt()) {
        Object.assign(boyut, KUTU[yeni]);
        uygula();
      } else this.tweens.add({ targets: boyut, ...KUTU[yeni], duration: 350, ease: 'Sine.easeInOut', onUpdate: uygula, onComplete: uygula });
    };
    this.kutuHazir = () => {
      hazir = true;
      yaz();
    };
    // Sayı ve alt yazı kutunun solunda (kutu onları örtmesin).
    this.sayac.setX(KAMERALI_YAZI_X);
    this.bilgi.setX(KAMERALI_YAZI_X);
    this.kamera = kamera;
    kamera.baslat();
    this.events.once('shutdown', () => {
      kamera.durdur();
      this.kamera = null;
      this.kameraHedefe = null;
      this.aynaDinle = null;
      this.kutuHali = () => {};
      this.kutuHazir = () => {};
    });
  }

  // Durağın oyun sırası (ısınma, sürpriz, soğuma dahil); durak başında bir kez kurulur.
  private liste(): Hareket[] {
    return this.oturum;
  }

  // Birleşik harekette her tekrarın kendi hareketi (zıpla, zıpla, çömel...).
  private tekrarHareketi(h: Hareket, tekrarNo: number): Animasyon {
    return h.dizi ? h.dizi[(tekrarNo - 1) % h.dizi.length] : h.animasyon;
  }

  // Süreli harekette ritim: yavaşta Zıpzıp da yavaşlar, hızlıda hızlanır.
  private surekliTempo(h: Hareket): number | undefined {
    if (!h.ritim) return undefined;
    const temel = { kos: 520, horon: 380, parmakUcu: 700, kulac: 1400, kanat: 900, sallan: 1600 }[h.animasyon as string] ?? 1000;
    return Math.round(temel * (h.ritim === 'yavas' ? 1.5 : 0.7));
  }

  private donuk = false;

  // Donma oyunu: Zıpzıp dans eder; ara ara "Dur!" der ve donar, sonra "Devam!".
  private donmaOyunu(h: Hareket) {
    if (h.tur !== 'sure') return;
    // Her donma 1.8 sn sürer; son donma süre bitmeden biter.
    const anlar = [3, 6.5, 10].filter((s) => s < h.saniye - 3.2).map((s) => s + Math.random() * 1.2);
    anlar.forEach((an) => {
      this.time.delayedCall(an * 1000, () => {
        this.donuk = true;
        this.zipzip.durdur();
        this.sayac.setText('✋ DUR!').setColor('#FF8A3D');
        bip(300, 0.2, 'square', 0.2);
        konus(M.dur);
      });
      this.time.delayedCall((an + 1.8) * 1000, () => {
        this.donuk = false;
        this.sayac.setColor('#ffffff');
        konus(M.devam);
        this.zipzip.surekli(h.animasyon);
      });
    });
  }

  // Ayna oyunu: Zıpzıp sırayla farklı hareketler yapar; çocuk aynısını yapar.
  private aynaOyunu(h: Hareket) {
    if (h.tur !== 'sure' || !h.dizi) return;
    const dizi = h.dizi;
    const her = (h.saniye * 1000) / dizi.length;
    dizi.forEach((a, i) => {
      if (i === 0) return;
      this.time.delayedCall(i * her, () => {
        this.zipzip.surekli(a);
        bip(700 + i * 80, 0.15, 'triangle', 0.2);
        this.cameras.main.flash(150, 255, 201, 60);
      });
    });
  }

  private sayacGoster(metin: string, renk = '#ffffff') {
    this.sayac.setText(metin).setColor(renk).setScale(1);
    // Kamera açıkken sayı kutunun solundaki alana sığar ("Başla!" kutunun altına girmesin; büyüme animasyonu ~%10 taşar, pay bırakılır).
    const olcek = this.kamera ? Math.min(1, (2 * (KUTU.hareket.x - KAMERALI_YAZI_X) - 60) / this.sayac.width) : 1;
    this.sayac.setScale(0.3 * olcek);
    this.tweens.add({ targets: this.sayac, scale: olcek, duration: 250, ease: 'Back.easeOut' });
  }
}

import Phaser from 'phaser';

// Yavaş telefon: oyun boyunca kare hızı ölçülür (180 karelik ya da 4 saniyelik pencerelerle; hafif ekranlar akıcı,
// ağır ekranlar yavaş olabileceği için sürekli). Bir pencerede saniyede 40 karenin altına düşerse
// oyun sadeleşir: süs animasyonları kapanır ("hareketi azalt" gibi) ve kare hızı
// 30'a sabitlenir (sabit 30 kare, inip çıkan hızdan daha akıcı görünür, telefonu daha az ısıtır).
// Sonuç cihaza kaydedilmez; her açılışta yeniden ölçülür. Sadeleşme sonraki ekrandan itibaren görünür.
const ISINMA_MS = 3000; // açılıştaki yükleme takılmaları ölçüme girmesin
const ORNEK_SAYISI = 180;
// Çok yavaş telefonda 180 kare çok uzun sürer: 4 saniye dolunca en az 20 kareyle de karar verilir.
const PENCERE_MS = 4000;
const EN_AZ_ORNEK = 20;
// Bundan uzun aralık "sekme arkadaydı" sayılır (çok yavaş telefonun karesi de 250 ms'yi geçebilir).
const EN_UZUN_ARALIK_MS = 1000;
const ESIK_FPS = 40;
const SINIR_FPS = 30;

let yavas = false;
export const telefonYavas = () => yavas;

export function hiziIzle(oyun: Phaser.Game) {
  const araliklar: number[] = [];
  const baslangic = performance.now();
  let onceki = baslangic;
  let pencereBasi = baslangic;
  // Phaser'ın verdiği aralık yumuşatılmış (yavaş telefonda da ~16 ms görünür); gerçek saat ölçülür.
  const adim = () => {
    const simdi = performance.now();
    const delta = simdi - onceki;
    onceki = simdi;
    if (simdi - baslangic < ISINMA_MS || document.hidden) {
      pencereBasi = simdi;
      return;
    }
    // Sekme arkaya alınınca gelen dev aralıklar ölçüme girmesin.
    if (delta < EN_UZUN_ARALIK_MS) araliklar.push(delta);
    const doldu = araliklar.length >= ORNEK_SAYISI || (simdi - pencereBasi >= PENCERE_MS && araliklar.length >= EN_AZ_ORNEK);
    if (!doldu) return;
    pencereBasi = simdi;
    // Ortanca aralık: tek tük takılmalar (ekran geçişi, ses yükleme) sonucu bozmasın.
    araliklar.sort((a, b) => a - b);
    const fps = 1000 / araliklar[araliklar.length >> 1];
    araliklar.length = 0;
    if (fps >= ESIK_FPS) return;
    oyun.events.off(Phaser.Core.Events.STEP, adim);
    yavasModaGec(oyun);
  };
  oyun.events.on(Phaser.Core.Events.STEP, adim);
}

export function yavasModaGec(oyun: Phaser.Game) {
  yavas = true;
  // Phaser kare sınırını yalnızca döngü başlarken okur; uyutup uyandırınca yeni sınır geçerli olur.
  const dongu = oyun.loop as Phaser.Core.TimeStep & { _limitRate: number };
  dongu.fpsLimit = SINIR_FPS;
  dongu.hasFpsLimit = true;
  dongu._limitRate = 1000 / SINIR_FPS;
  dongu.sleep();
  dongu.wake();
}

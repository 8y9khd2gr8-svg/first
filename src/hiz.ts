import Phaser from 'phaser';

// Yavaş telefon: oyun boyunca kare hızı ölçülür (180 karelik pencerelerle; hafif ekranlar akıcı,
// ağır ekranlar yavaş olabileceği için sürekli). Bir pencerede saniyede 40 karenin altına düşerse
// oyun sadeleşir: süs animasyonları kapanır ("hareketi azalt" gibi) ve kare hızı
// 30'a sabitlenir (sabit 30 kare, inip çıkan hızdan daha akıcı görünür, telefonu daha az ısıtır).
// Sonuç cihaza kaydedilmez; her açılışta yeniden ölçülür. Sadeleşme sonraki ekrandan itibaren görünür.
const ISINMA_MS = 3000; // açılıştaki yükleme takılmaları ölçüme girmesin
const ORNEK_SAYISI = 180;
const ESIK_FPS = 40;
const SINIR_FPS = 30;

let yavas = false;
export const telefonYavas = () => yavas;

export function hiziIzle(oyun: Phaser.Game) {
  const araliklar: number[] = [];
  const baslangic = performance.now();
  let onceki = baslangic;
  // Phaser'ın verdiği aralık yumuşatılmış (yavaş telefonda da ~16 ms görünür); gerçek saat ölçülür.
  const adim = () => {
    const simdi = performance.now();
    const delta = simdi - onceki;
    onceki = simdi;
    if (simdi - baslangic < ISINMA_MS) return;
    // Sekme arkaya alınınca gelen dev aralıklar ölçüme girmesin.
    if (delta < 250) araliklar.push(delta);
    if (araliklar.length < ORNEK_SAYISI) return;
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

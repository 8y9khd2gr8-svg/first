import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GORULEN_ZIPLAMA_SINIRI, gorulenZiplamalar, olcumBitti, ziplaDonmaHatalari, type ZiplaKaresi } from './ziplaDonmaKurali';

// Sahte kayıt: 600 ms havada, 600 ms yerde, 300 ms'de bir tanıma; iki donma (2,5 sn) çocuk havadayken başlar.
// sayimGecikmesi: ikinci donmadan sonra kaçıncı tam zıplamada sayılır (null: hiç).
function kayit(sayimGecikmesi: number | null, ikinciDonmadanSonraMs = 20_000) {
  const kareler: ZiplaKaresi[] = [];
  const donmalar = [{ bas: 3_050, son: 5_550 }, { bas: 7_700, son: 10_200 }];
  let sayi = 2, gorulen = 0;
  for (let t = 50; t < donmalar[1].son + ikinciDonmadanSonraMs; t += 300) {
    if (donmalar.some((d) => t > d.bas && t < d.son)) continue;
    const havada = (t % 1200 < 600 ? 1 : 0) as 0 | 1;
    const onceki = kareler[kareler.length - 1];
    kareler.push([t, havada, sayi]);
    if (t > donmalar[1].son && onceki?.[1] === 1 && havada === 0 && ++gorulen === sayimGecikmesi) sayi++;
  }
  return { kareler, donmalar };
}

test('zıplama donma kuralı: yeni oyun (1-2 zıplamada sayar) geçer', () => {
  for (const g of [1, 2, GORULEN_ZIPLAMA_SINIRI]) {
    const { kareler, donmalar } = kayit(g);
    assert.deepEqual(ziplaDonmaHatalari(kareler, donmalar), [], `${g}. zıplamada sayım`);
    assert.equal(olcumBitti(kareler, donmalar[1]), true);
  }
});

test('zıplama donma kuralı: eski hata (sayım takılır) kırmızı', () => {
  const hic = kayit(null);
  assert.match(ziplaDonmaHatalari(hic.kareler, hic.donmalar).join(), /hiçbiri sayılmadı/);
  const gec = kayit(GORULEN_ZIPLAMA_SINIRI + 2);
  assert.match(ziplaDonmaHatalari(gec.kareler, gec.donmalar).join(), /ilk sayım geç/);
});

test('zıplama donma kuralı: model az zıplama gördüyse beklenir, sonuç verilmez (yavaş makine kırmızıya düşmez)', () => {
  const { kareler, donmalar } = kayit(null, 1_500);
  assert.ok(gorulenZiplamalar(kareler, kareler.findIndex((k) => k[0] >= donmalar[1].son)) <= GORULEN_ZIPLAMA_SINIRI);
  assert.equal(olcumBitti(kareler, donmalar[1]), false);
});

test('zıplama donma kuralı: donma çocuk yerdeyken başladıysa (denenen yol yok) kırmızı', () => {
  const { kareler, donmalar } = kayit(1);
  const yerde = donmalar.map((d) => ({ bas: d.bas + 600, son: d.son + 600 }));
  assert.match(ziplaDonmaHatalari(kareler, yerde).join(), /havada değil/);
});

test('zıplama donma kuralı: kısa, eksik ya da binen donma kırmızı', () => {
  const { kareler, donmalar } = kayit(1);
  assert.match(ziplaDonmaHatalari(kareler, [donmalar[0]]).join(), /iki donma/);
  assert.match(ziplaDonmaHatalari(kareler, [donmalar[0], { ...donmalar[1], son: donmalar[1].bas + 1_000 }]).join(), /en az 2500/);
  assert.match(ziplaDonmaHatalari(kareler, [donmalar[1], donmalar[0]]).join(), /birincisi bitmeden/);
});

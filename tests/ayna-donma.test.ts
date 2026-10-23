// Ayna donma testinin karar kuralı (tests/aynaDonmaKurali.ts), sahte kayıtlarla. npm test
// Kayıtlar 23 Ekim'deki gerçek ölçümlerden (ms, aynaBas = 0): makineden bağımsız, her çalıştırmada aynı sonuç.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aynaDonmaHatalari, type AynaDonmaOlcumu } from './aynaDonmaKurali';

const olcum = (aynaSon: number, d1: [number, number], d2: [number, number]): AynaDonmaOlcumu => ({
  aynaBas: 0,
  aynaSon,
  donmalar: [
    { bas: d1[0], son: d1[1] },
    { bas: d2[0], son: d2[1] },
  ],
});
// Eski sabit kural: toplam süre 7,2 sn'den kısa.
const eskiKural = (o: AynaDonmaOlcumu) => o.aynaSon - o.aynaBas < 7_200;

test('doğru çalışan oyun geçer: boş makine, yüklü makine, en yavaş kare', () => {
  assert.deepEqual(aynaDonmaHatalari(olcum(6_110, [1_000, 3_500], [3_600, 6_100])), []);
  assert.deepEqual(aynaDonmaHatalari(olcum(7_276, [1_600, 4_100], [4_766, 7_266])), []);
  assert.deepEqual(aynaDonmaHatalari(olcum(7_437, [1_500, 4_000], [4_628, 7_128])), []);
});

test('kırmızının kaynağı: eski sabit 7,2 sn kuralı yüklü makinede doğru oyunu da kırmızı sayıyordu', () => {
  // Oyun donma bitince 10 ms içinde kapattı; ikinci donmayı geç bitiren testin kendi sayacıydı.
  const yuklu = olcum(7_276, [1_600, 4_100], [4_766, 7_266]);
  assert.equal(eskiKural(yuklu), false);
  assert.deepEqual(aynaDonmaHatalari(yuklu), []);
});

test('eski hata (her ölçüme en çok 1,5 sn, ayna ~8 sn) yakalanır', () => {
  // Eski davranış taklidinden (23 Ekim, 4/4 kırmızı) ve boş makinedeki beklenen değerden.
  for (const o of [olcum(8_578, [1_300, 3_800], [4_291, 6_791]), olcum(8_891, [1_400, 3_900], [4_505, 7_005]), olcum(8_000, [1_000, 3_500], [3_600, 6_100])]) {
    const h = aynaDonmaHatalari(o);
    assert.equal(h.length, 1, h.join('; '));
    assert.match(h[0], /hemen kapanmalı/);
  }
});

test('donma hiç olmazsa ya da biri atlanırsa kırmızı', () => {
  assert.match(aynaDonmaHatalari({ aynaBas: 0, aynaSon: 6_010, donmalar: [] })[0], /iki donma olmalı, 0/);
  assert.match(aynaDonmaHatalari({ aynaBas: 0, aynaSon: 6_010, donmalar: [{ bas: 1_000, son: 3_500 }] })[0], /iki donma olmalı, 1/);
});

test('kısa (erken biten) donma kırmızı', () => {
  assert.ok(aynaDonmaHatalari(olcum(6_110, [1_000, 2_999], [3_600, 6_100])).some((h) => /1\. donma 1999 ms/.test(h)));
  assert.ok(aynaDonmaHatalari(olcum(6_110, [1_000, 3_500], [3_700, 6_100])).some((h) => /2\. donma 2400 ms/.test(h)));
});

test('ikinci donma birincisi bitmeden başlarsa kırmızı', () => {
  assert.ok(aynaDonmaHatalari(olcum(6_310, [1_000, 3_500], [3_400, 6_300])).includes('ikinci donma birincisi bitmeden başladı'));
});

test('ilk donma ayna başlamadan olursa ya da süre donma dışında dolarsa kırmızı (denenen yol yok)', () => {
  assert.ok(aynaDonmaHatalari(olcum(6_110, [-500, 2_000], [3_600, 6_100])).includes('ilk donma ayna başlamadan oldu'));
  assert.ok(aynaDonmaHatalari(olcum(6_010, [500, 3_000], [3_100, 5_600])).includes('ikinci donma 6 sn dolmadan bitti (denenen yol yok)'));
});

test('ayna erken kapanırsa (donma bitmeden ya da 5,5 sn dolmadan) kırmızı', () => {
  assert.ok(aynaDonmaHatalari(olcum(6_050, [1_000, 3_500], [3_600, 6_100])).includes('ayna donma bitmeden kapandı'));
  const h = aynaDonmaHatalari(olcum(5_400, [100, 2_600], [2_700, 5_200]));
  assert.ok(h.some((x) => /ayna erken kapandı \(5400 ms\)/.test(x)), h.join('; '));
});

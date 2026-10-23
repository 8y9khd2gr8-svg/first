// Sürpriz donma oyunu (src/donma.ts): her turda başka dans, her "Dur!"da söylenen poz. npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DONMA, DONMA_OTURARAK } from '../src/hareketler';
import { DONMA_TEMPO, dansCumlesi, donmaCumleleri, donmaPlani, pozCumlesi } from '../src/donma';
import { tumMetinler } from '../src/metinler';
import { kesfedilecekHareketler } from '../src/rozetler';
import { uyarla } from '../src/uyarla';
import type { OyunAyari } from '../src/oyunAyari';

const AYARLAR: OyunAyari[] = (['kucuk', 'buyuk', 'hizli'] as const).flatMap((yas) => [false, true].map((oturarak) => ({ yas, oturarak })));
// Oturarak oyunda geçmemesi gereken ayakta sözler (veri.test.ts'teki listeyle aynı) ve oturarak yapılamayan pozlar/danslar.
const AYAKTA_SOZ = /zıpla|çömel|\bkoş|yürü|adım|ayağını|ayaklarını|tek ayak|parmak uc|parmak uç|dizini|dizlerini|dimdik dur|arkanı dön|yere vur|yere değ|bacak/i;
const AYAKTA_DANS = new Set(['horon', 'kos', 'dizler']);
const AYAKTA_POZ = new Set(['comel', 'acik', 'tekAyak']);

// Tekrarlanabilir rastgele sayı (her denemede başka karışım).
const tohumlu = (tohum: number) => () => ((tohum = (tohum * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

test('donma: "Dur!" sayısı tempoya göre (Sakin 2, Normal 3, Hızlı 4); oyunun süresi uyarla ile aynı', () => {
  const beklenen = { kucuk: 2, buyuk: 3, hizli: 4 };
  for (const ayar of AYARLAR) {
    const plan = donmaPlani(ayar, tohumlu(7));
    assert.equal(plan.pozlar.length, beklenen[ayar.yas], `${ayar.yas}`);
    assert.equal(plan.anlar.length, beklenen[ayar.yas]);
    assert.equal(plan.danslar.length, beklenen[ayar.yas] + 1);
    const [h] = uyarla([DONMA], ayar);
    assert.ok(h.tur === 'sure' && h.saniye === DONMA_TEMPO[ayar.yas].saniye, `${ayar.yas}: süre`);
    assert.equal(h.surpriz, 'donma');
  }
  assert.ok(DONMA_TEMPO.kucuk.donmaSn > DONMA_TEMPO.buyuk.donmaSn, 'Sakin tempoda donma daha uzun');
  assert.ok(DONMA_TEMPO.kucuk.dansHizi > 1, 'Sakin tempoda danslar yavaş');
});

test('donma: aynı oyunda aynı dans/poz iki kez yok; oturarakta ayakta komut yok; Sakin\'de tek ayak yok; donmalar üst üste binmez', () => {
  for (const ayar of AYARLAR)
    for (let tohum = 1; tohum <= 300; tohum++) {
      const plan = donmaPlani(ayar, tohumlu(tohum));
      const yer = `${ayar.yas}/${ayar.oturarak ? 'oturarak' : 'ayakta'}/${tohum}`;
      assert.equal(new Set(plan.danslar.map((d) => d.animasyon)).size, plan.danslar.length, `${yer}: dans tekrar`);
      assert.equal(new Set(plan.pozlar.map((p) => p.poz)).size, plan.pozlar.length, `${yer}: poz tekrar`);
      if (ayar.yas === 'kucuk') assert.ok(!plan.pozlar.some((p) => p.poz === 'tekAyak'), `${yer}: Sakin'de tek ayak`);
      if (ayar.oturarak) {
        for (const d of plan.danslar) assert.ok(!AYAKTA_DANS.has(d.animasyon), `${yer}: oturarakta ayakta dans ${d.animasyon}`);
        for (const p of plan.pozlar) assert.ok(!AYAKTA_POZ.has(p.poz), `${yer}: oturarakta ayakta poz ${p.poz}`);
        const cumleler = [...plan.danslar.map((d, i) => dansCumlesi(d, true, i === 0)), ...plan.pozlar.map((p) => pozCumlesi(p, true))];
        for (const c of cumleler) {
          assert.ok(!AYAKTA_SOZ.test(c), `${yer}: oturarak cümlede ayakta söz: ${c}`);
          assert.ok(c.includes('Oturduğun yerde'), `${yer}: ${c}`);
        }
      }
      const { saniye } = DONMA_TEMPO[ayar.yas];
      plan.anlar.forEach((an, i) => {
        const onceki = i === 0 ? 0 : plan.anlar[i - 1] + plan.donmaSn;
        assert.ok(an - onceki >= 1.6, `${yer}: dans çok kısa (${(an - onceki).toFixed(2)} sn)`);
      });
      assert.ok(saniye - (plan.anlar.at(-1)! + plan.donmaSn) >= 1.6, `${yer}: son dans çok kısa`);
    }
});

test('donma: her cümle seslendirme listesinde; "gibi" yok; Ayakta oyunun cümleleri değişmedi', () => {
  const liste = new Set(tumMetinler());
  for (const c of donmaCumleleri()) {
    assert.ok(liste.has(c), `seslendirme listesinde yok: ${c}`);
    assert.ok(!/\bgibi\b/i.test(c), c);
  }
  assert.ok(liste.has(DONMA.sesli) && liste.has(DONMA_OTURARAK.sesli));
  assert.equal(pozCumlesi({ poz: 'saril', ad: 'Kendine sarıl!', oturarak: true, sakin: true }, false), 'Dur! Kendine sarıl!');
  assert.equal(pozCumlesi({ poz: 'saril', ad: 'Kendine sarıl!', oturarak: true, sakin: true }, true), 'Dur! Oturduğun yerde kendine sarıl!');
});

test('donma: Hareket Kâşifi hesabı aynı kalır (donma kayıtta yine horon / oturarakta kolSalla)', () => {
  assert.equal(DONMA.animasyon, 'horon');
  assert.equal(DONMA_OTURARAK.animasyon, 'kolSalla');
  for (const ayar of AYARLAR) assert.ok(kesfedilecekHareketler(ayar).length > 0);
});

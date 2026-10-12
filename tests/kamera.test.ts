// Kamerayla sayma: yapay vücut noktalarıyla (gerçek kamera olmadan) her sayma yolunu dener.
// Değerler MediaPipe'ın verdiği gibi 0-1 arası; y aşağı doğru büyür.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { BURUN, KAMERA_HAREKETLERI, ZIPLAMA_EN_AZ_ARA_MS, SAG_BILEK, SAG_DIZ, SAG_KALCA, SAG_OMUZ, SAG_TOPUK, SOL_BILEK, SOL_DIZ, SOL_KALCA, SOL_OMUZ, SOL_TOPUK, Sayici, simdVarMi } from '../src/kamera';
import { K } from '../src/hareketler';

type Durus = { x?: number; omuzY?: number; kalcaY?: number; bilekY?: number; solDizY?: number; sagDizY?: number; ayakAciklik?: number; topukY?: number };

function nokta(d: Durus): NormalizedLandmark[] {
  const x = d.x ?? 0.5;
  const omuz = d.omuzY ?? 0.3;
  const kalca = d.kalcaY ?? 0.55;
  const topuk = d.topukY ?? 0.9;
  const n: NormalizedLandmark[] = Array.from({ length: 33 }, () => ({ x, y: 0.5, z: 0, visibility: 1 }));
  const koy = (i: number, px: number, py: number) => (n[i] = { x: px, y: py, z: 0, visibility: 1 });
  const ayak = (d.ayakAciklik ?? 0.1) / 2;
  koy(BURUN, x, omuz - 0.08);
  koy(SOL_OMUZ, x - 0.08, omuz);
  koy(SAG_OMUZ, x + 0.08, omuz);
  koy(SOL_BILEK, x - 0.1, d.bilekY ?? kalca);
  koy(SAG_BILEK, x + 0.1, d.bilekY ?? kalca);
  koy(SOL_KALCA, x - 0.05, kalca);
  koy(SAG_KALCA, x + 0.05, kalca);
  koy(SOL_DIZ, x - 0.05, d.solDizY ?? (kalca + topuk) / 2);
  koy(SAG_DIZ, x + 0.05, d.sagDizY ?? (kalca + topuk) / 2);
  koy(SOL_TOPUK, x - ayak, topuk);
  koy(SAG_TOPUK, x + ayak, topuk);
  return n;
}

// Her tekrar: birkaç kare "ayakta", birkaç kare hareketin içinde. Kareler arası 50 ms (saniyede 20 tanıma).
function say(animasyon: string, tekrar: (i: number) => Durus[], adet: number, kareBasina = 6, kareMs = 50): number {
  const s = new Sayici(animasyon as never);
  let zaman = 0;
  const besle = (d: Durus) => s.besle(nokta(d), (zaman += kareMs));
  for (let k = 0; k < 10; k++) besle({});
  for (let i = 0; i < adet; i++) for (const d of tekrar(i)) for (let k = 0; k < kareBasina; k++) besle(d);
  return s.sayi;
}

const HAVADA: Durus = { omuzY: 0.22, kalcaY: 0.47, topukY: 0.82 };

test('kamera: her sayma yolu tekrarları doğru sayar', () => {
  const ayakta: Durus = {};
  assert.equal(say('kollar', () => [{ bilekY: 0.1 }, ayakta], 6), 6);
  assert.equal(say('comel', () => [{ omuzY: 0.55, kalcaY: 0.8 }, ayakta], 5), 5);
  assert.equal(say('zipla', () => [{ omuzY: 0.22, kalcaY: 0.47, topukY: 0.82 }, ayakta], 5), 5);
  assert.equal(say('dizler', (i) => [i % 2 ? { sagDizY: 0.56, topukY: 0.9 } : { solDizY: 0.56 }, ayakta], 10), 10);
  assert.equal(say('acKapa', () => [{ ayakAciklik: 0.35 }, ayakta], 5), 5);
  assert.equal(say('yanAdim', (i) => [{ x: i % 2 ? 0.42 : 0.58 }], 8), 8);
});

test('kamera: kıpırdamadan durmak sayılmaz; listede olmayan harekette sayaç çalışmaz', () => {
  for (const a of KAMERA_HAREKETLERI) assert.equal(say(a, () => [{}], 10), 0, a);
  assert.equal(say('kanat', () => [{ bilekY: 0.1 }, {}], 5), 0);
  // Kameranın saydığı her hareket oyunda gerçekten var.
  const oyundakiler = new Set(Object.values(K).map((h) => h.animasyon));
  for (const a of KAMERA_HAREKETLERI) assert.ok(oyundakiler.has(a), a);
});

test('kamera: görüntüdeki küçük titreme tekrar sayılmaz', () => {
  let tohum = 1;
  const rastgele = () => ((tohum = (tohum * 16807) % 2147483647) / 2147483647 - 0.5) * 0.02; // ±0,01
  for (const a of KAMERA_HAREKETLERI) {
    const s = new Sayici(a);
    for (let k = 0; k < 300; k++) s.besle(nokta({}).map((p) => ({ ...p, x: p.x + rastgele(), y: p.y + rastgele() })));
    assert.equal(s.sayi, 0, a);
  }
});

test('kamera zıplama: 1 zıplama = 1 olay; titreme ve yarım zıplama sayılmaz', () => {
  assert.equal(say('zipla', () => [HAVADA, {}], 1), 1);
  assert.equal(say('zipla', () => [HAVADA, {}], 10), 10);
  // Yarım zıplama / topuk kaldırma (omuz boyun %4'ü kadar yükselir): sayılmaz.
  assert.equal(say('zipla', () => [{ omuzY: 0.276, kalcaY: 0.526, topukY: 0.876 }, {}], 10), 0);
  // Kararsız eşikte titreme (omuz ±%3 oynar): sayılmaz.
  assert.equal(say('zipla', (i) => [{ omuzY: i % 2 ? 0.282 : 0.318 }], 40, 1), 0);
});

test('kamera zıplama: 400 ms içinde iki iniş tek zıplama sayılır', () => {
  // İnişte sarsıntı: 100 ms havada, 100 ms yerde, yine 100 ms havada → ikinci iniş ilkinden ~200 ms sonra.
  assert.equal(say('zipla', () => [HAVADA, {}, HAVADA, {}], 1, 2), 1);
  // Arka arkaya hızlı ama gerçek zıplamalar (her biri 600 ms) hepsi sayılır.
  assert.equal(say('zipla', () => [HAVADA, {}], 5, 6), 5);
  // Sınır: inişler arası tam 400 ms sayılır, 350 ms sayılmaz.
  assert.equal(say('zipla', () => [HAVADA, {}], 4, 4, ZIPLAMA_EN_AZ_ARA_MS / 8), 4);
  assert.equal(say('zipla', () => [HAVADA, {}], 4, 4, 350 / 8), 2);
});

test('pakette MediaPipe sadece SIMD hâliyle durur; SIMD denetimi çalışır', () => {
  assert.equal(simdVarMi(), true);
  assert.deepEqual(fs.readdirSync('public/mediapipe').filter((d) => d.includes('nosimd')), []);
});

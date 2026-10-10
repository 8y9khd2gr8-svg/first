// Kamerayla sayma: yapay vücut noktalarıyla (gerçek kamera olmadan) her sayma yolunu dener.
// Değerler MediaPipe'ın verdiği gibi 0-1 arası; y aşağı doğru büyür.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { BURUN, KAMERA_HAREKETLERI, SAG_BILEK, SAG_DIZ, SAG_KALCA, SAG_OMUZ, SAG_TOPUK, SOL_BILEK, SOL_DIZ, SOL_KALCA, SOL_OMUZ, SOL_TOPUK, Sayici } from '../src/kamera';
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

// Her tekrar: birkaç kare "ayakta", birkaç kare hareketin içinde.
function say(animasyon: string, tekrar: (i: number) => Durus[], adet: number): number {
  const s = new Sayici(animasyon as never);
  for (let k = 0; k < 10; k++) s.besle(nokta({}));
  for (let i = 0; i < adet; i++) for (const d of tekrar(i)) for (let k = 0; k < 6; k++) s.besle(nokta(d));
  return s.sayi;
}

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

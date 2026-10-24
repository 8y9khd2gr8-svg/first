// Kamerayla sayma: yapay vücut noktalarıyla (gerçek kamera olmadan) her sayma yolunu dener.
// Değerler MediaPipe'ın verdiği gibi 0-1 arası; y aşağı doğru büyür.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { BURUN, eksikNoktalar, eksikTaniYazisi, eksikYeri, GEREKEN_NOKTALAR, KAMERA_HAREKETLERI, kameraDurumYazisi, saymaYolu, kameraHatasi, ZIPLAMA_EN_AZ_ARA_MS, SAG_BILEK, SAG_DIZ, SAG_KALCA, SAG_OMUZ, SAG_TOPUK, SOL_BILEK, SOL_DIZ, SOL_KALCA, SOL_OMUZ, SOL_TOPUK, Sayici, simdVarMi } from '../src/kamera';
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

// Yağız testi (K23) öncesi: gerçek çocuk gerektirmeyen zıplama senaryoları. Eşikler (%7, 400 ms) değişmez; mevcut davranışı belgeler.
test('kamera zıplama: zıplamadan yapılan hareketler sayılmaz (yanlış pozitif)', () => {
  // Kolları yukarı kaldırıp indirmek, omuzlar yerinde.
  assert.equal(say('zipla', () => [{ bilekY: 0.1 }, {}], 10), 0);
  // Kollar kalkarken omuzlar da biraz kalkar (boyun %3'ü): sayılmaz.
  assert.equal(say('zipla', () => [{ bilekY: 0.1, omuzY: 0.282 }, {}], 10), 0);
  // Yerinde sağa sola sallanmak.
  assert.equal(say('zipla', (i) => [{ x: i % 2 ? 0.45 : 0.55 }], 20), 0);
});

test('kamera zıplama: yavaş telefonda (saniyede 5 tanıma) havada tek kare görülse de sayılır', () => {
  assert.equal(say('zipla', () => [HAVADA, {}, {}], 10, 1, 200), 10);
});

test('kamera zıplama: art arda 10 zıplama (her biri ~450 ms) hepsi sayılır', () => {
  assert.equal(say('zipla', () => [HAVADA, {}, {}], 10, 3, 50), 10);
});

// 14 Ekim'de çocuksuz denemede bulunan sorun: çömelip kalkınca sayaç "havada" takılıyor, sonraki zıplamalar sayılmıyordu.
// Artık 1 sn'den uzun "havada" kalma sayılmadan bırakılır (kamera.ts ZIPLAMA_EN_UZUN_HAVA_MS); eşikler aynı.
test('kamera zıplama: çömelip kalkmak sayılmaz, sonraki zıplamalar yine sayılır', () => {
  const s = new Sayici('zipla');
  let zaman = 0;
  const besle = (d: Durus) => s.besle(nokta(d), (zaman += 66));
  for (let k = 0; k < 20; k++) besle({});
  for (let k = 0; k < 10; k++) besle({ omuzY: 0.5, kalcaY: 0.75 });
  for (let k = 0; k < 20; k++) besle({});
  assert.equal(s.sayi, 0);
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k < 4; k++) besle(HAVADA);
    for (let k = 0; k < 8; k++) besle({});
  }
  assert.equal(s.sayi, 5);
});

test('kamera zıplama: gerçek zıplamanın havası (yarım saniye) takılma korumasına takılmaz', () => {
  // 600 ms havada (uzun bir zıplama) yine sayılır; takılma koruması ancak ZIPLAMA_EN_UZUN_HAVA_MS sonra devreye girer.
  assert.equal(say('zipla', () => [HAVADA, {}], 5, 12, 50), 5);
});

// 24 Ekim (benzetim testi ara sıra kırmızıydı): sayfa çocuk havadayken donunca ya da kamera çocuk havadayken açılınca taban
// havadaki omuzdan alınıyordu; zıplamayı sürdüren çocuk uzun süre, seyrek tanımada hiç sayılmıyordu (eski kodda 120 sn'de 0).
// [havaOrani, kareMs, periyotMs]: zıplamanın ne kadarı havada, tanıma aralığı (yavaş telefonda seyrek), bir zıplamanın süresi.
// Her zıplamada en az bir "havada" karesi düşer (yoksa zıplama görülemez). Son durum benzetim testinin yüklü makinede ölçülen
// hâli (1,2 sn'lik zıplama, ~575 ms'de bir tanıma).
const ZIPLAMA_DURUMLARI = [[0.5, 150, 1000], [0.35, 100, 1000], [0.35, 250, 1000], [0.25, 200, 1000], [0.5, 575, 1200]] as const;
function surekliZipla([havaOrani, kareMs, periyot]: readonly number[], donmaMs: number | null) {
  const s = new Sayici('zipla');
  const havada = (t: number) => (t % periyot) / periyot < havaOrani;
  const besle = (t: number) => s.besle(nokta(havada(t) ? HAVADA : {}), t);
  let t = 0; // ilk kare havada (kamera çocuk havadayken açılır)
  if (donmaMs !== null) {
    for (; t < 5 * periyot; t += kareMs) besle(t);
    while (!havada(t)) t += 10;
    besle(t); // son kare havada, sonra sayfa donar
    t += donmaMs;
    while (!havada(t)) t += 10; // dönüşteki ilk kare yine havada
  }
  const bas = t, once = s.sayi;
  let ilk = -1;
  for (; t < bas + 20_000; t += kareMs) {
    besle(t);
    if (ilk < 0 && s.sayi > once) ilk = t - bas;
  }
  return { ilk, sayi: s.sayi - once };
}

test('kamera zıplama: sayfa çocuk havadayken donsa da zıplamayı sürdüren çocuk hemen yine sayılır', () => {
  for (const d of ZIPLAMA_DURUMLARI) {
    const r = surekliZipla(d, 2500);
    const beklenen = Math.round(20_000 / d[2]);
    const ad = `havada %${d[0] * 100}, ${d[1]} ms'de bir tanıma`;
    assert.ok(r.ilk >= 0 && r.ilk <= 2 * d[2] + d[1], `${ad}: donmadan sonra ilk sayım ${r.ilk} ms`);
    assert.ok(r.sayi >= beklenen - 2 && r.sayi <= beklenen, `${ad}: ${beklenen} zıplamada ${r.sayi} sayıldı`);
  }
});

test('kamera zıplama: kamera çocuk havadayken açılsa da sayar', () => {
  for (const d of ZIPLAMA_DURUMLARI) {
    const r = surekliZipla(d, null);
    const beklenen = Math.round(20_000 / d[2]);
    const ad = `havada %${d[0] * 100}, ${d[1]} ms'de bir tanıma`;
    assert.ok(r.ilk >= 0 && r.ilk <= 2 * d[2] + d[1], `${ad}: ilk sayım ${r.ilk} ms`);
    assert.ok(r.sayi >= beklenen - 2 && r.sayi <= beklenen, `${ad}: ${beklenen} zıplamada ${r.sayi} sayıldı`);
  }
});

test('kamera açılamayınca nedeni ayrılır: kamera yok / izin yok / başka', () => {
  assert.equal(kameraHatasi(new DOMException('', 'NotFoundError')), 'kameraYok');
  assert.equal(kameraHatasi(new DOMException('', 'OverconstrainedError')), 'kameraYok');
  assert.equal(kameraHatasi(new DOMException('', 'NotAllowedError')), 'izinYok');
  assert.equal(kameraHatasi(new Error('model')), 'diger');
  assert.equal(kameraHatasi(undefined), 'diger');
  assert.match(kameraDurumYazisi('hata', 'kameraYok', ''), /bulunamadı/);
  assert.match(kameraDurumYazisi('hata', 'izinYok', ''), /izin verilmedi/);
  assert.match(kameraDurumYazisi('durdu', null, ''), /durdu/);
});

// K41: hangi vücut noktaları görünmezse sayım durur? Kamera her karede Sayici.kare'yi çağırır (oyundaki yol aynen).
// Mevcut davranışı belgeler; eşikler ve "omuzlar + topuklar" şartı değişmedi.
const gizle = (n: NormalizedLandmark[], ...noktalar: number[]) => n.map((p, i) => (noktalar.includes(i) ? { ...p, visibility: 0.1 } : p));
// Kollar hareketi: iki bilek başın üstüne çıkar, iner (her tekrar 6+6 kare). donustur her karede noktaları değiştirir.
function kollarSay(donustur: (n: NormalizedLandmark[], kareNo: number) => NormalizedLandmark[] | undefined, adet = 5) {
  const s = new Sayici('kollar');
  const durumlar = new Set<string>();
  let zaman = 0;
  let kareNo = 0;
  const besle = (d: Durus) => durumlar.add(s.kare(donustur(nokta(d), kareNo++), (zaman += 50)));
  for (let k = 0; k < 10; k++) besle({});
  for (let i = 0; i < adet; i++) for (const d of [{ bilekY: 0.1 }, {}]) for (let k = 0; k < 6; k++) besle(d);
  return { sayi: s.sayi, durumlar: [...durumlar] };
}

test('K41: sayım için iki omuz ve iki topuk görünmeli (kollar hareketinde de)', () => {
  assert.deepEqual(kollarSay((n) => n), { sayi: 5, durumlar: ['goruyorum'] });
  // Telefon masada: baş, omuzlar ve kollar görünüyor, topuklar kadraj dışında → hiç sayılmaz, kutu "Geri git".
  assert.deepEqual(kollarSay((n) => gizle(n, SOL_TOPUK, SAG_TOPUK)), { sayi: 0, durumlar: ['goremiyorum'] });
  assert.deepEqual(kollarSay((n) => gizle(n, SAG_TOPUK)), { sayi: 0, durumlar: ['goremiyorum'] });
  assert.deepEqual(kollarSay((n) => gizle(n, SOL_TOPUK)), { sayi: 0, durumlar: ['goremiyorum'] });
  assert.deepEqual(kollarSay((n) => gizle(n, SOL_OMUZ, SAG_OMUZ)), { sayi: 0, durumlar: ['goremiyorum'] });
  assert.deepEqual(kollarSay((n) => gizle(n, SOL_OMUZ)), { sayi: 0, durumlar: ['goremiyorum'] });
  // Kimse yok (model kişi bulamadı).
  assert.deepEqual(kollarSay(() => undefined), { sayi: 0, durumlar: ['goremiyorum'] });
  // Dizler, kalçalar, burun görünmese de "görüyorum" denir (şart sadece omuzlar + topuklar).
  assert.deepEqual(kollarSay((n) => gizle(n, SOL_DIZ, SAG_DIZ, SOL_KALCA, SAG_KALCA)).durumlar, ['goruyorum']);
});

test('K41: gerekli noktalar ve görünürlük sınırı (0,5)', () => {
  const tam = nokta({});
  assert.deepEqual(eksikNoktalar(tam), []);
  assert.deepEqual(eksikNoktalar(undefined), [...GEREKEN_NOKTALAR]);
  assert.deepEqual(eksikNoktalar(gizle(tam, SOL_TOPUK, SAG_TOPUK)), [SOL_TOPUK, SAG_TOPUK]);
  const gorunurluk = (v: number) => tam.map((p, i) => (i === SAG_TOPUK ? { ...p, visibility: v } : p));
  assert.deepEqual(eksikNoktalar(gorunurluk(0.5)), [SAG_TOPUK]); // tam 0,5 yetmez
  assert.deepEqual(eksikNoktalar(gorunurluk(0.51)), []);
  // Görünürlük değeri olmayan nokta görünmez sayılır.
  assert.deepEqual(eksikNoktalar(tam.map((p, i) => (i === SOL_OMUZ ? { x: p.x, y: p.y, z: 0 } : p))), [SOL_OMUZ]);
});

test('K41 (c): eksik yere göre yön: kimse / ayaklar / çok yakın (omuzlar) / kenar; tanı satırı sol-sağ söyler', () => {
  const tam = nokta({});
  const yer = (...g: number[]) => eksikYeri(eksikNoktalar(gizle(tam, ...g)));
  assert.equal(yer(), null);
  assert.equal(eksikYeri(eksikNoktalar(undefined)), 'kimse');
  assert.equal(yer(SOL_OMUZ, SAG_OMUZ, SOL_TOPUK, SAG_TOPUK), 'kimse');
  assert.equal(yer(SOL_TOPUK, SAG_TOPUK), 'ayaklar');
  assert.equal(yer(SAG_TOPUK), 'ayaklar');
  assert.equal(yer(SOL_OMUZ, SAG_OMUZ), 'omuzlar');
  assert.equal(yer(SOL_OMUZ), 'omuzlar');
  assert.equal(yer(SOL_OMUZ, SOL_TOPUK), 'kenar');
  assert.equal(yer(SAG_OMUZ, SOL_TOPUK, SAG_TOPUK), 'kenar');
  const tani = (...g: number[]) => eksikTaniYazisi(eksikNoktalar(gizle(tam, ...g)));
  assert.equal(tani(), '');
  assert.equal(eksikTaniYazisi(eksikNoktalar(undefined)), 'Kimse görünmüyor');
  assert.equal(tani(SOL_TOPUK, SAG_TOPUK), 'Topuklar görünmüyor: biraz geri gidin');
  assert.equal(tani(SAG_TOPUK), 'Sağ topuk görünmüyor: biraz geri gidin');
  assert.equal(tani(SOL_OMUZ, SAG_OMUZ), 'Omuzlar görünmüyor: biraz geri gidin');
  assert.equal(tani(SOL_OMUZ, SOL_TOPUK), 'Sol omuz ve sol topuk görünmüyor: ortaya gelin');
  assert.equal(tani(SAG_OMUZ, SOL_TOPUK, SAG_TOPUK), 'Sağ omuz ve topuklar görünmüyor: ortaya gelin');
  // Sayma şartı değişmedi: eksik ne olursa olsun sayılmaz (yukarıdaki testler).
});

test('K41: kadraj kenarı: sadece görünürlüğe bakılır, koordinat kadraj dışında olsa da görünür sayılırsa sayılır', () => {
  // Çocuk sağ kenarda (x ~0,95): hepsi görünür → sayılır.
  assert.equal(kollarSay((n) => n.map((p) => ({ ...p, x: p.x + 0.45 }))).sayi, 5);
  // Topuklar kadrajın altında (y > 1) ama model onları yine "görünür" sayarsa sayım sürer (mevcut davranış;
  // gerçek modelin kadraj dışı noktaya ne görünürlük verdiği gerçek kamerayla bakılmalı).
  assert.equal(kollarSay((n) => n.map((p, i) => (i === SOL_TOPUK || i === SAG_TOPUK ? { ...p, y: 1.08 } : p))).sayi, 5);
});

test('K41: vücut kısmen görünür, güven değeri titrer: görünmeyen kareler sayılmaz ama sayım durumu korunur', () => {
  // Her üç kareden biri kaçar (topuklar o karede görünmez): 5 tekrar yine 5.
  assert.equal(kollarSay((n, k) => (k % 3 === 2 ? gizle(n, SOL_TOPUK, SAG_TOPUK) : n)).sayi, 5);
  // Her üç kareden biri hiç kişi bulmaz (gecikmiş/boş sonuç): yine 5.
  assert.equal(kollarSay((n, k) => (k % 3 === 2 ? undefined : n)).sayi, 5);
  // Topukların güveni 0,45-0,55 arasında oynar: sadece görünür karelerde sayılır, tekrarlar kaybolmaz.
  assert.equal(kollarSay((n, k) => n.map((p, i) => (i === SOL_TOPUK ? { ...p, visibility: k % 2 ? 0.45 : 0.55 } : p))).sayi, 5);
  // Kollar hareketinde bir bilek görünmez: o kareler sayılmaz → hiç sayılmaz.
  assert.equal(kollarSay((n) => gizle(n, SOL_BILEK)).sayi, 0);
});

test('K41: hatalı hareket: kollar beklenirken zıplamak, zıplama beklenirken kol kaldırmak sayılmaz', () => {
  assert.equal(say('kollar', () => [HAVADA, {}], 5), 0);
  assert.equal(say('comel', () => [{ bilekY: 0.1 }, {}], 5), 0);
  // Eksik hareket: kollar başın üstüne değil omuz hizasına kalkar → sayılmaz (iki bilek burnun üstüne çıkmalı).
  assert.equal(say('kollar', () => [{ bilekY: 0.3 }, {}], 5), 0);
  // Tek kol kalkar → sayılmaz (iki bilek de yukarıda olmalı).
  const tekKol = (d: Durus) => nokta(d).map((p, i) => (i === SAG_BILEK ? { ...p, y: 0.55 } : p));
  const s = new Sayici('kollar');
  for (let i = 0; i < 5; i++) for (const d of [{ bilekY: 0.1 }, {}]) for (let k = 0; k < 6; k++) s.kare(tekKol(d));
  assert.equal(s.sayi, 0);
});

test('K41: her kameralı hareketin bir sayma yolu var; çok yakın (omuz-topuk çok kısa) görüntü sayılmaz', () => {
  for (const a of KAMERA_HAREKETLERI) assert.ok(saymaYolu(a), a);
  assert.equal(saymaYolu('kanat' as never), undefined);
  // Boy (omuz-topuk) görüntünün %5'inden kısa: sayılmaz ama "görüyorum" denir.
  const s = new Sayici('kollar');
  for (let i = 0; i < 5; i++) for (const d of [{ bilekY: 0.1, omuzY: 0.3, topukY: 0.34 }, { omuzY: 0.3, topukY: 0.34 }]) for (let k = 0; k < 6; k++) assert.equal(s.kare(nokta(d)), 'goruyorum');
  assert.equal(s.sayi, 0);
});

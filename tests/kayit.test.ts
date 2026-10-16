// Bozuk cihaz kaydı (yanlış elle düzenleme, eski sürüm, yarım yazılmış kayıt) oyunu çökertmemeli:
// bozuk kısım yok sayılır, sağlam ilerleme kalır. Tarayıcı gerekmez: npm test
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

const depo = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => depo.get(k) ?? null,
  setItem: (k: string, v: string) => void depo.set(k, String(v)),
  removeItem: (k: string) => void depo.delete(k),
  clear: () => depo.clear(),
};

const { tamamlananlar, tamamla } = await import('../src/ilerleme');
const { pasaportOku } = await import('../src/pasaport');
const { oyunAyari } = await import('../src/oyunAyari');
const { haftalikOzet, gunAnahtari } = await import('../src/istatistik');
const { kazanilanlar, kesfedilecekHareketler, rozetleriKutla, yeniRozetler } = await import('../src/rozetler');
const { acikKostumler, seciliKostum, yeniKostumler } = await import('../src/kostumler');

const BOZUKLAR = ['{bozuk', 'null', '42', '"metin"', '[]', '{}', 'true', '[1,null,{},"x"]', '{"gunler":[1],"ad":5,"foto":"javascript:x","avatar":"x","secili":7,"kutlanan":"a","yas":3,"oturarak":"evet"}'];
const ANAHTARLAR = ['zipzip-ilerleme-v1', 'zipzip-pasaport-v1', 'zipzip-oyun-ayar-v1', 'zipzip-istatistik-v1', 'zipzip-rozetler-v1', 'zipzip-kostum-v1'];

beforeEach(() => depo.clear());

test('her kayıt her bozuk değerde okunur, çökmez ve varsayılana döner', () => {
  for (const deger of BOZUKLAR) {
    for (const a of ANAHTARLAR) depo.set(a, deger);
    const biten = tamamlananlar();
    assert.ok(Array.isArray(biten) && biten.every((d) => typeof d === 'string'), deger);
    const p = pasaportOku();
    assert.equal(typeof p.ad, 'string', deger);
    assert.equal(p.foto, undefined, deger);
    assert.equal(p.avatar, undefined, deger);
    assert.deepEqual(oyunAyari(), { yas: 'buyuk', oturarak: false }, deger);
    const o = haftalikOzet();
    assert.ok([o.saniye, o.hareket, o.ziplama, o.toplamSaniye, o.toplamHareket].every(Number.isFinite), deger);
    assert.ok(kazanilanlar() instanceof Set, deger);
    yeniRozetler();
    assert.equal(seciliKostum(), undefined, deger);
    yeniKostumler();
  }
});

test('bozuk kayıtta sağlam ilerleme kaybolmaz', () => {
  depo.set('zipzip-ilerleme-v1', '["istanbul", 5, null, "truva"]');
  assert.deepEqual(tamamlananlar(), ['istanbul', 'truva']);
  tamamla('pamukkale');
  assert.deepEqual(JSON.parse(depo.get('zipzip-ilerleme-v1')!), ['istanbul', 'truva', 'pamukkale']);

  const bugun = gunAnahtari();
  depo.set('zipzip-istatistik-v1', JSON.stringify({ gunler: { [bugun]: { saniye: 60, hareket: 3, ziplama: 'çok', sayac: { zipla: 10, kol: 'x' } }, 'bozuk-gün': { hareket: 5 }, '2026-01-01': null } }));
  const o = haftalikOzet();
  assert.equal(o.saniye, 60);
  assert.equal(o.hareket, 3);
  assert.equal(o.ziplama, 0);
  assert.equal(o.toplamHareket, 3);
  assert.deepEqual(o.animasyonSayac, { zipla: 10 });

  depo.set('zipzip-pasaport-v1', JSON.stringify({ ad: 'Yağız', avatar: '🦊', foto: 42, soruldu: 'evet' }));
  assert.deepEqual(pasaportOku(), { ad: 'Yağız', foto: undefined, avatar: '🦊', soruldu: false });

  depo.set('zipzip-ilerleme-v1', JSON.stringify(['istanbul', 'truva', 'pamukkale', 'kapadokya']));
  depo.set('zipzip-kostum-v1', JSON.stringify({ secili: 'yok-boyle-kostum', kutlanan: [1, null] }));
  assert.equal(seciliKostum(), undefined);
  assert.equal(yeniKostumler().length, acikKostumler().length);
});

// K26: "Hareket Kâşifi" betada kazanılabilir: sadece açık bölümlerin (ve ısınma/soğuma/Ailece'nin) hareketleri sayılır.
test('Hareket Kâşifi: betada açık bölümlerin bütün hareketlerini deneyen rozeti kazanır, biri eksikse kazanmaz', () => {
  const liste = kesfedilecekHareketler();
  assert.ok(liste.length >= 20 && liste.length < 37, `betada ${liste.length} hareket türü`);
  const sayac = (eksik?: string) => Object.fromEntries(liste.filter((a) => a !== eksik).map((a) => [a, 1]));
  const kaydet = (s: Record<string, number>) =>
    depo.set('zipzip-istatistik-v1', JSON.stringify({ gunler: { [gunAnahtari()]: { saniye: 60, hareket: liste.length, ziplama: 0, sayac: s } } }));
  kaydet(sayac(liste[liste.length - 1]));
  assert.equal(kazanilanlar().has('kasif'), false);
  kaydet(sayac());
  assert.equal(kazanilanlar().has('kasif'), true);
});

// K37: oturarak oyna açıkken ayakta yapılan hareketler hiç gelmez; Hareket Kâşifi sadece oturarak gelebilenleri sayar.
test('Hareket Kâşifi: oturarak oynayan çocuk, oturarak gelebilen bütün hareketleri deneyince rozeti kazanır', async () => {
  const { oturumListesi } = await import('../src/oturum');
  const { acikDuraklar } = await import('../src/duraklar');
  depo.set('zipzip-oyun-ayar-v1', JSON.stringify({ yas: 'buyuk', oturarak: true }));
  const liste = kesfedilecekHareketler();
  // Oyunun gerçekten kurduğu listeler (rastgele ısınma/sürpriz/soğuma, çok kez): sayılan her hareket bunlarda gelmeli.
  const gelen = new Set<string>();
  for (let i = 0; i < 150; i++) for (const d of acikDuraklar()) oturumListesi(d.id, 0).forEach((h) => gelen.add(h.animasyon));
  for (let i = 0; i < 20; i++) oturumListesi('soguma', 0).forEach((h) => gelen.add(h.animasyon));
  assert.ok(liste.length > 0);
  assert.deepEqual(liste.filter((a) => !gelen.has(a)), [], 'oturarak hâlde hiç gelmeyen hareket sayılıyor');
  assert.deepEqual([...gelen].filter((a) => !liste.includes(a)), [], 'oturarak gelen hareket listede yok');
  assert.ok(!liste.includes('zipla') && !liste.includes('comel'));

  const kaydet = (s: Record<string, number>) =>
    depo.set('zipzip-istatistik-v1', JSON.stringify({ gunler: { [gunAnahtari()]: { saniye: 60, hareket: liste.length, ziplama: 0, sayac: s } } }));
  kaydet(Object.fromEntries(liste.slice(1).map((a) => [a, 1])));
  assert.equal(kazanilanlar().has('kasif'), false);
  kaydet(Object.fromEntries(liste.map((a) => [a, 1])));
  assert.equal(kazanilanlar().has('kasif'), true);
  // Kazanılan (kutlanan) rozet, oturarak kapatılınca liste uzasa da kaybolmaz.
  rozetleriKutla(yeniRozetler());
  depo.set('zipzip-oyun-ayar-v1', JSON.stringify({ yas: 'buyuk', oturarak: false }));
  assert.ok(kesfedilecekHareketler().length > liste.length);
  assert.equal(kazanilanlar().has('kasif'), true);
});

// K36: ebeveyn özetindeki "toplam durak" açık bölümlerin durakları üzerinden (betada 14, ?bolumler=hepsi ile 50).
test('açık duraklar: betada 14, bütün bölümler açılınca 50', async () => {
  const { acikDuraklar, TUM_DURAKLAR } = await import('../src/duraklar');
  assert.equal(acikDuraklar().length, 14);
  (globalThis as any).location = { search: '?bolumler=hepsi' };
  try {
    assert.equal(acikDuraklar().length, TUM_DURAKLAR.length);
    assert.equal(TUM_DURAKLAR.length, 50);
  } finally {
    delete (globalThis as any).location;
  }
});

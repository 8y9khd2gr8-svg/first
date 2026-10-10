// Oyun verisinin kurallara uyduğunu denetler (tarayıcı gerekmez): npm test
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { AILE_OTURUMU } from '../src/aile';
import { BOLUM_SIRASI, BOLUMLER, TUM_DURAKLAR, oturum } from '../src/duraklar';
import { AYNA, DONMA, ISINMALAR, SOGUMALAR } from '../src/hareketler';
import { H, Hareket } from '../src/hareketler';
import { kostumNasil } from '../src/kostumler';
import { KOSTUMLER } from '../src/kostumler';
import { M, SAYILAR, SERTIFIKA_UNVANLARI, tumMetinler } from '../src/metinler';
import { ROZETLER } from '../src/rozetler';

const tumHareketler: Hareket[] = [...Object.values(H), ...AILE_OTURUMU, ...ISINMALAR, ...SOGUMALAR, DONMA, AYNA, ...TUM_DURAKLAR.flatMap(oturum)];

test('durak, rozet ve kostüm kimlikleri tekil', () => {
  for (const liste of [TUM_DURAKLAR.map((d) => d.id), ROZETLER.map((r) => r.id), KOSTUMLER.map((k) => k.id)]) {
    assert.deepEqual(liste.filter((id, i) => liste.indexOf(id) !== i), []);
  }
});

test('hareketler tekrara düşmez: sıralı bölümde önceki iki durağın hareket türü tekrar kullanılmaz', () => {
  for (const id of BOLUM_SIRASI) {
    const { duraklar, serbest } = BOLUMLER[id];
    duraklar.forEach((d, i) => {
      const turler = oturum(d).map((h) => h.dizi?.join('+') ?? h.animasyon);
      assert.equal(new Set(turler).size, turler.length, `${d.id}: aynı durakta tekrar`);
      if (serbest) return;
      const onceki = new Set(duraklar.slice(Math.max(0, i - 2), i).flatMap((o) => oturum(o).map((h) => h.dizi?.join('+') ?? h.animasyon)));
      for (const t of turler) assert.ok(!onceki.has(t), `${d.id}: "${t}" önceki iki durakta da var`);
    });
  }
});

test('hareketler yerinde yapılır (kamera için): yürü/koş komutu "yerinde" der', () => {
  for (const h of tumHareketler) {
    const k = h.baslik.replace(/\n/g, ' ');
    if (/\b(yürü|koş)\b/i.test(k)) assert.ok(/yerinde|olduğun yerde/i.test(k), `yerinde değil: ${k}`);
  }
});

test('her durağın bir merak sorusu var (Evde Macera hariç); kostümlerin açılma yeri tanımlı', () => {
  for (const d of TUM_DURAKLAR) if (d.bolum !== 'evde') assert.ok(d.soru?.startsWith('Evde birine sor:'), d.id);
  for (const k of KOSTUMLER) assert.ok(kostumNasil(k).length > 0, k.id);
});

test('her bölümde 7 durak; her durak 5 hareketlik antrenman', () => {
  for (const id of BOLUM_SIRASI) {
    const b = BOLUMLER[id];
    if (id !== 'uzay') assert.equal(b.duraklar.length, 7, b.ad);
    for (const d of b.duraklar) {
      assert.equal(d.bolum, id, d.id);
      assert.equal(oturum(d).length, 4, d.id); // + sürpriz = 5 (ısınma/soğuma ayrıca)
    }
  }
});

test('bölümler zincir hâlinde açılır (her bölümün öncesi kendinden önce gelir)', () => {
  BOLUM_SIRASI.forEach((id, i) => {
    const onceki = BOLUMLER[id].onceki;
    assert.equal(onceki, i === 0 ? null : BOLUM_SIRASI[i - 1], id);
  });
  assert.equal(SERTIFIKA_UNVANLARI.length, BOLUM_SIRASI.length);
});

test('komutlar benzetme değil, net eylem ("gibi" yok); sesli komut boş değil', () => {
  for (const h of tumHareketler) {
    assert.ok(!/\bgibi\b/i.test(h.baslik), `benzetme: ${h.baslik}`);
    assert.ok(!/\bgibi\b/i.test(h.sesli), `benzetme: ${h.sesli}`);
    assert.ok(h.baslik.trim() && h.sesli.trim());
    assert.ok(h.tur === 'sayi' ? h.adet > 0 && h.adet <= SAYILAR.length && h.tempoMs >= 600 : h.saniye > 0 && h.saniye <= 15, h.baslik);
  }
});

test('seslendirilen her cümle seslendirme listesinde', () => {
  const liste = new Set(tumMetinler());
  for (const h of tumHareketler) assert.ok(liste.has(h.sesli), h.sesli);
  for (const d of TUM_DURAKLAR) {
    assert.ok(liste.has(M.durakGiris(d.yer, d.ad, d.bilgi, BOLUMLER[d.bolum].kutuBaslik)), d.id);
    assert.ok(liste.has(M.damgaKazandin(d.yer)), d.id);
  }
  for (const r of ROZETLER) assert.ok(liste.has(M.yeniRozet(r.ad)), r.id);
  for (const u of SERTIFIKA_UNVANLARI) assert.ok(liste.has(M.sertifikaBolum(u)), u);
});

test('konus() ile söylenen M cümleleri seslendirme listesinde', () => {
  // Kaynak koddaki konus(M.xxx) kullanımlarını bulur; sabit cümlelerin hepsi listede olmalı.
  const liste = new Set(tumMetinler());
  const kod = dosyalar('src').map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const adlar = new Set([...kod.matchAll(/\bM\.([a-zA-Z]+)\b(?!\s*\()/g)].map((m) => m[1]));
  for (const ad of adlar) {
    const deger = (M as Record<string, unknown>)[ad];
    if (typeof deger === 'string') assert.ok(liste.has(deger), `M.${ad} seslendirme listesinde yok`);
  }
});

test('cihaz kayıt anahtarları "zipzip-" ile başlar ("Tüm verileri sil" hepsini bulsun)', () => {
  for (const f of dosyalar('src')) {
    const kod = fs.readFileSync(f, 'utf8');
    for (const m of kod.matchAll(/localStorage\.(?:setItem|getItem|removeItem)\(\s*(['"`])([^'"`]+)\1/g)) {
      assert.ok(m[2].startsWith('zipzip-'), `${f}: ${m[2]}`);
    }
    for (const m of kod.matchAll(/const \w*ANAHTAR\w* = (['"`])([^'"`]+)\1/g)) {
      if (f.endsWith('sesAnahtari.ts')) continue;
      assert.ok(m[2].startsWith('zipzip-'), `${f}: ${m[2]}`);
    }
  }
});

test('cihazdaki her kayıt gizlilik.html sayfasında yazılı', () => {
  const gizlilik = fs.readFileSync('public/gizlilik.html', 'utf8');
  const anahtarlar = new Set(dosyalar('src').flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(/'(zipzip-[a-z0-9-]+)'/g)].map((m) => m[1])));
  assert.ok(anahtarlar.size > 0);
  for (const a of anahtarlar) assert.ok(gizlilik.includes(a), `gizlilik.html'de yok: ${a}`);
});

test('oyun kodunda dış sunucu adresi yok', () => {
  for (const f of dosyalar('src')) {
    const kod = fs.readFileSync(f, 'utf8');
    assert.deepEqual([...kod.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]), [], f);
  }
});

function dosyalar(klasor: string): string[] {
  return fs.readdirSync(klasor, { withFileTypes: true }).flatMap((e) => {
    const yol = path.join(klasor, e.name);
    return e.isDirectory() ? dosyalar(yol) : /\.ts$/.test(e.name) ? [yol] : [];
  });
}

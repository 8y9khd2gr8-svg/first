// Oyun verisinin kurallara uyduğunu denetler (tarayıcı gerekmez): npm test
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { AILE_OTURUMU } from '../src/aile';
import { BOLUM_SIRASI, BOLUMLER, TUM_DURAKLAR, oturum } from '../src/duraklar';
import { AYNA, AYNA_ADLARI, AYNA_HAVUZU, DONMA, ISINMALAR, OTURARAK, SOGUMALAR } from '../src/hareketler';
import { H, Hareket } from '../src/hareketler';
import { kostumNasil } from '../src/kostumler';
import { KOSTUMLER } from '../src/kostumler';
import { M, SAYILAR, SERTIFIKA_UNVANLARI, tumMetinler } from '../src/metinler';
import { ROZETLER } from '../src/rozetler';
import { enIyiSes } from '../src/sesSecimi';
import { TEPELER } from '../src/tepeler';

// Oyunda söylenen hareketler (H sadece Ailece'nin temeli; kendi sesli cümlesi söylenmez).
const soylenenHareketler: Hareket[] = [...AILE_OTURUMU, ...ISINMALAR, ...SOGUMALAR, DONMA, AYNA, ...TUM_DURAKLAR.flatMap(oturum)];
const tumHareketler: Hareket[] = [...Object.values(H), ...soylenenHareketler];

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

// K30: Uzay ve ortak bölüm haritası (BolumScene) alt yazıda durağın adını yazar, sesle yerini söyler ("Sıradaki durağımız …").
// İkisi farklıysa çocuk ekranda başka, seste başka duyar (Evde Macera'da "Oyuncak Dansı" / "Dans" böyleydi).
test('sıralı bölüm haritasında sıradaki durağın yazısı ile sesi aynı (ad = yer)', () => {
  for (const id of ['uzay', 'dinozor', 'evde', 'okyanus'] as const) {
    const { duraklar, serbest } = BOLUMLER[id];
    if (serbest) continue;
    for (const d of duraklar) assert.equal(d.yer, d.ad, `${d.id}: ekranda "${d.ad}", seste "${d.yer}"`);
  }
  assert.equal(M.siradaki(BOLUMLER.evde.duraklar.find((d) => d.id === 'dans')!.yer), 'Sıradaki durağımız Oyuncak Dansı!');
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
  for (const h of soylenenHareketler) assert.ok(liste.has(h.sesli), h.sesli);
  for (const d of TUM_DURAKLAR) {
    assert.ok(liste.has(M.durakGiris(d.yer, d.ad, d.bilgi, BOLUMLER[d.bolum].kutuBaslik)), d.id);
    assert.ok(liste.has(M.damgaKazandin(d.yer)), d.id);
  }
  for (const r of ROZETLER) assert.ok(liste.has(M.yeniRozet(r.ad)), r.id);
  for (const u of SERTIFIKA_UNVANLARI) assert.ok(liste.has(M.sertifikaBolum(u)), u);
});

test('okunuş sözlüğü: ekrandaki yazı değişmez, sese okunuşu gider', async () => {
  const { okunus } = await import('../src/okunus');
  assert.equal(okunus('T-Rex yürüyor!'), 'Ti Reks yürüyor!');
  assert.equal(okunus('Kollarını kaldır!'), 'Kollarını kaldır!');
  // Sözlükte olmayan, motorun yanlış okuyabileceği tire ya da büyük harf kısaltması yeni cümlelerde uyarı verir.
  for (const c of tumMetinler()) assert.ok(!/[A-ZÇĞİÖŞÜ]{2,}|\b[A-Z]-[A-Z]/.test(okunus(c)), `okunuşu belirsiz: ${c}`);
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

// CLAUDE.md: Phaser veri verilmezse önceki geçişin verisini yeniden kullanır; sahne geçişinde hep veri nesnesi verilir.
test('sahne geçişlerinde veri nesnesi verilir (scene.start/launch/switch)', () => {
  const eksik: string[] = [];
  for (const f of dosyalar('src')) {
    const kod = fs.readFileSync(f, 'utf8');
    // Başka sahneye geçiş: start/launch/switch('Ad', veri). restart() sahneyi kendi verisiyle yeniden açar (kasıtlı), bakılmaz.
    for (const m of kod.matchAll(/scene\.(?:start|launch|switch)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) {
      if (!/,/.test(m[1])) eksik.push(`${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(eksik, []);
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

test('iPhone ve Android sürüm numarası package.json ile aynı (npm run magaza eşitler)', () => {
  const surum = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  const ios = fs.readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8').match(/MARKETING_VERSION = ([^;]+);/g) ?? [];
  assert.ok(ios.length > 0);
  for (const satir of ios) assert.equal(satir, `MARKETING_VERSION = ${surum};`, 'node scripts/surum-esitle.mjs çalıştırın');
  assert.match(fs.readFileSync('android/app/build.gradle', 'utf8'), /package\.json"\)\)\.version/);
});

test('mağaza paketleri ödeme kilitli derlenir (K50), test sitesi ödemesiz', () => {
  const betikler = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;
  assert.match(betikler.magaza, /npm run build -- --mode magaza/, 'npm run magaza mağaza işaretiyle derlemeli');
  assert.match(fs.readFileSync('.github/workflows/ios-derleme.yml', 'utf8'), /npm run (build -- --mode magaza|magaza)/);
  for (const f of ['android-apk.yml', 'android-play.yml']) assert.match(fs.readFileSync(`.github/workflows/${f}`, 'utf8'), /npm run magaza/, f);
  assert.doesNotMatch(fs.readFileSync('.github/workflows/yayinla.yml', 'utf8'), /--mode magaza|npm run magaza/);
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

test('telefon sesi: internetsiz çalışan Türkçe ses seçilir, Türkçe yoksa hiçbiri', () => {
  const ses = (lang: string, name: string, localService: boolean) => ({ lang, name, voiceURI: name, localService, default: false });
  const sesler = [ses('en-US', 'Samantha', true), ses('tr-TR', 'Google Türkçe', false), ses('tr-TR', 'Yelda (Kompakt)', true), ses('tr-TR', 'Yelda (Gelişmiş)', true)];
  assert.equal(enIyiSes(sesler), 3);
  assert.equal(enIyiSes([ses('tr_TR', 'tr-tr-x-cfs-local', true), ses('tr-TR', 'tr-tr-x-cfs-network', false)]), 0);
  assert.equal(enIyiSes([ses('en-US', 'Samantha', true)]), -1);
});

test('İstanbul’un 7 Tepesi (hazırlık): 7 durak, kimlikler tekil, sıralı bölüm kuralları, bilgi en çok 2 cümle', () => {
  assert.equal(TEPELER.length, 7);
  const kimlikler = new Set(TUM_DURAKLAR.map((d) => d.id));
  const turu = (d: (typeof TEPELER)[number]) => [d.ozel, ...d.ekler].map((h) => h.animasyon);
  TEPELER.forEach((d, i) => {
    assert.ok(!kimlikler.has(d.id), `kimlik başka bölümde de var: ${d.id}`);
    assert.equal(d.ekler.length, 3, d.id);
    assert.ok(d.soru?.startsWith('Evde birine sor:'), d.id);
    assert.ok(!/\bgibi\b/i.test(d.bilgi), d.id);
    assert.ok((d.bilgi.match(/[.!?](\s|$)/g) ?? []).length <= 2, `bilgi 2 cümleden uzun: ${d.id}`);
    for (const h of [d.ozel, ...d.ekler]) {
      assert.ok(!/\bgibi\b/i.test(h.baslik + h.sesli), `benzetme: ${h.sesli}`);
      const k = h.baslik.replace(/\n/g, ' ');
      if (/\b(yürü|koş)\b/i.test(k)) assert.ok(/yerinde|olduğun yerde/i.test(k), `yerinde değil: ${k}`);
    }
    // Cümleler bölüm açılınca metinler.ts'e eklenir (şimdi seslendirme listesinde değil).
    const turler = turu(d);
    assert.equal(new Set(turler).size, turler.length, `${d.id}: aynı durakta tekrar`);
    const onceki = new Set(TEPELER.slice(Math.max(0, i - 2), i).flatMap(turu));
    for (const t of turler) assert.ok(!onceki.has(t), `${d.id}: "${t}" önceki iki durakta da var`);
  });
});

test('ebeveyn ayarları: oturarak listede ayakta hareket yok, aynı durakta tekrar yok; küçükte tekrar azalır; cümleler seslendirme listesinde', async () => {
  const { uyarla } = await import('../src/uyarla');
  const { oturumKur } = await import('../src/oturum');
  const liste = new Set(tumMetinler());
  const AYAKTA = new Set(['zipla', 'kos', 'dizler', 'acKapa', 'engel', 'tepin', 'basket', 'parmakUcu', 'tekAyak', 'yanAdim', 'tirman', 'trex', 'sut', 'comel', 'balon', 'yumurta', 'tasKaldir', 'kazi', 'uzan', 'donus', 'kocaman', 'piramit', 'sutun', 'tHarfi']);
  for (const d of TUM_DURAKLAR) {
    const temel = [...oturum(d), ...ISINMALAR, ...SOGUMALAR, DONMA];
    const oturarak = uyarla(oturum(d), { yas: 'buyuk', oturarak: true });
    const turler = oturarak.map((h) => h.animasyon);
    assert.equal(new Set(turler).size, turler.length, `${d.id}: oturarakta tekrar`);
    for (const h of oturarak) assert.ok(!AYAKTA.has(h.animasyon), `${d.id}: oturarakta ayakta hareket: ${h.animasyon}`);
    for (const ayar of [{ yas: 'kucuk', oturarak: false }, { yas: 'kucuk', oturarak: true }, { yas: 'buyuk', oturarak: true }, { yas: 'hizli', oturarak: false }, { yas: 'hizli', oturarak: true }] as const)
      for (const h of uyarla(temel, ayar)) {
        assert.ok(liste.has(h.sesli), `seslendirme listesinde yok: ${h.sesli}`);
        assert.ok(!/\bgibi\b/i.test(h.sesli));
      }
    const kucuk = uyarla(oturum(d), { yas: 'kucuk', oturarak: false });
    kucuk.forEach((h, i) => {
      const o = oturum(d)[i];
      if (h.tur === 'sayi' && o.tur === 'sayi') assert.ok(h.adet <= o.adet && h.tempoMs > o.tempoMs, d.id);
    });
    // Hızlı tempo: tekrar azalmaz, ritim yavaşlamaz, süre kısalmaz; en az bir hareket gerçekten zorlaşır.
    const hizli = uyarla(oturum(d), { yas: 'hizli', oturarak: false });
    hizli.forEach((h, i) => {
      const o = oturum(d)[i];
      if (h.tur === 'sayi' && o.tur === 'sayi') assert.ok(h.adet >= o.adet && h.adet <= 12 && h.tempoMs <= o.tempoMs, `${d.id}: ${h.baslik}`);
      if (h.tur === 'sure' && o.tur === 'sure') assert.ok(h.saniye >= o.saniye, `${d.id}: ${h.baslik}`);
    });
    assert.ok(hizli.some((h, i) => JSON.stringify(h) !== JSON.stringify(oturum(d)[i])), `${d.id}: hızlı tempo bir şey değiştirmedi`);
  }
  // Oturum kurulurken (ısınma, sürpriz, soğuma dahil) ayar uygulanır.
  assert.ok(oturumKur(TUM_DURAKLAR[0]).length >= 5);
});

test('Sakin tempoda kısa komut: çok adımlı komut tek eyleme iner, listedeki her komut oyunda var', async () => {
  const { uyarla, KISA_KOMUT } = await import('../src/uyarla');
  const hepsi = [...TUM_DURAKLAR.flatMap((d) => [d.ozel, ...d.ekler]), ...ISINMALAR, ...SOGUMALAR];
  const yazilar = new Set(hepsi.map((h) => h.baslik.replace(/\n/g, ' ')));
  for (const [uzun, kisa] of Object.entries(KISA_KOMUT)) {
    assert.ok(yazilar.has(uzun), `kısa komut listesinde oyunda olmayan komut: ${uzun}`);
    const duz = kisa.replace(/\n/g, ' ');
    assert.ok(duz.split(' ').length <= 5 && !/sonra/.test(duz), `kısa komut uzun: ${duz}`);
  }
  for (const h of hepsi) {
    const [k] = uyarla([h], { yas: 'kucuk', oturarak: false });
    const kisa = KISA_KOMUT[h.baslik.replace(/\n/g, ' ')];
    if (kisa && !h.dizi) {
      assert.equal(k.baslik, kisa);
      assert.ok(k.sesli.includes(kisa.replace(/\n/g, ' ')) && (!h.hikaye || k.sesli.startsWith(h.hikaye)), k.sesli);
    }
    // Normal tempoda komut değişmez.
    assert.equal(uyarla([h], { yas: 'buyuk', oturarak: false })[0].baslik, h.baslik);
  }
});

// iPhone denemesi (20 Ekim): ayna oyununda hareket değişince ne yapılacağı belli değildi; her hareketin adı altta yazar.
test('ayna oyunu: gelebilecek her hareketin (oturarak dahil) ekranda yazan bir adı var', async () => {
  const { uyarla } = await import('../src/uyarla');
  const oturarakAyna = (dizi: typeof AYNA_HAVUZU) => uyarla([{ ...AYNA, dizi }], { yas: 'buyuk', oturarak: true })[0].dizi ?? [];
  const gelebilen = new Set([...AYNA_HAVUZU, ...oturarakAyna(AYNA_HAVUZU), ...oturarakAyna(['zipla', 'comel', 'dizler', 'kocaman'])]);
  for (const a of gelebilen) {
    const ad = AYNA_ADLARI[a];
    assert.ok(ad, `ayna hareketinin adı yok: ${a}`);
    assert.ok(!/gibi/i.test(ad), `ayna adında benzetme: ${ad}`);
  }
  // Oturarak oynarken gelen hareketlerin adı ayakta yapılan bir şey söylemez.
  for (const a of oturarakAyna(AYNA_HAVUZU)) assert.ok(!/zıpla|çömel|ayağını|bacaklarını|dizlerini/i.test(AYNA_ADLARI[a]!), `oturarak ayna adı: ${AYNA_ADLARI[a]}`);
});

test('oturarak oyna: her durağın her hareketi (ısınma, sürpriz, soğuma dahil) oturarak yapılabilir; Sakin tempo kısaltır', async () => {
  const { uyarla } = await import('../src/uyarla');
  // Oturarak hâlde Zıpzıp'ın yapabileceği hareketler sadece OTURARAK listesindekiler (kol/gövde).
  const SERBEST = new Set(Object.values(OTURARAK).map((h) => h.animasyon));
  const AYAKTA_SOZ = /zıpla|çömel|\bkoş|yürü|adım|ayağını|ayaklarını|tek ayak|parmak uc|parmak uç|dizini|dizlerini|dimdik dur|arkanı dön|yere vur|yere değ/i;
  const ayna = { ...AYNA, dizi: AYNA_HAVUZU };
  const denetle = (yer: string, h: Hareket) => {
    for (const a of h.dizi ?? [h.animasyon]) assert.ok(SERBEST.has(a), `${yer}: oturarakta ayakta hareket: ${a} (${h.baslik})`);
    const metin = `${h.hikaye ?? ''} ${h.baslik} ${h.sesli}`.replace(/\n/g, ' ');
    assert.ok(!AYAKTA_SOZ.test(metin), `${yer}: oturarak cümlede ayakta söz: ${metin}`);
  };
  for (const d of TUM_DURAKLAR) {
    const liste = uyarla([...oturum(d), DONMA, ayna], { yas: 'buyuk', oturarak: true });
    liste.forEach((h) => denetle(d.id, h));
  }
  for (const h of [...ISINMALAR, ...SOGUMALAR]) uyarla([h], { yas: 'buyuk', oturarak: true }).forEach((o) => denetle('ısınma/soğuma', o));
  // Sakin tempo: süreli hareket kısalır (en az 5 sn), 5+ tekrar azalır, her tekrar yavaşlar.
  for (const d of TUM_DURAKLAR)
    for (const ayar of [{ yas: 'kucuk', oturarak: false }, { yas: 'kucuk', oturarak: true }] as const) {
      const normal = uyarla([...oturum(d), DONMA, ayna], { ...ayar, yas: 'buyuk' });
      uyarla([...oturum(d), DONMA, ayna], ayar).forEach((h, i) => {
        const o = normal[i];
        if (h.tur === 'sure' && o.tur === 'sure') assert.ok(h.saniye < o.saniye || h.saniye === 5, `${d.id}: süre kısalmadı: ${h.baslik}`);
        if (h.tur === 'sayi' && o.tur === 'sayi') {
          assert.ok(h.tempoMs > o.tempoMs, `${d.id}: yavaşlamadı: ${h.baslik}`);
          assert.ok(h.adet <= o.adet, `${d.id}: tekrar arttı: ${h.baslik}`);
        }
      });
    }
});

test('derlemedeki hafif Phaser, kodda kullanılan her oyun nesnesini içerir (src/phaserNesneleri.cjs)', () => {
  // Testler tam Phaser'la çalışır; hafif hâlde olmayan bir nesne (ör. this.add.particles) sadece mağaza paketinde bozulurdu.
  const liste = fs.readFileSync('src/phaserNesneleri.cjs', 'utf8');
  const blok = (ad: string) => new Set([...(liste.split(`${ad}: {`)[1].split('}')[0].matchAll(/^\s+(\w+):/gm))].map((m) => m[1].toLowerCase()));
  const fabrika = blok('Factories');
  const yapici = blok('Creators');
  const kod = dosyalar('src').map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const ad = (m: string) => ({ dom: 'domelement', circle: 'arc' } as Record<string, string>)[m.toLowerCase()] ?? m.toLowerCase();
  for (const [, tur, m] of kod.matchAll(/\.(add|make)\.(\w+)\(/g)) {
    if (m === 'existing') continue;
    assert.ok((tur === 'add' ? fabrika : yapici).has(ad(m)), `hafif Phaser'da yok: this.${tur}.${m} → src/phaserNesneleri.cjs'e ekleyin`);
  }
});

test('CI her oyun testi dosyasını çalıştırır (.github/workflows/test.yml parçaları)', () => {
  // Oyun testleri CI'da elle dengelenmiş parçalarda koşar; yeni dosya parçalara eklenmezse hiç çalışmazdı.
  const is = fs.readFileSync('.github/workflows/test.yml', 'utf8');
  for (const f of fs.readdirSync('tests').filter((f) => f.endsWith('.spec.ts'))) assert.ok(is.includes(`tests/${f}`), `${f} CI parçalarında yok`);
});

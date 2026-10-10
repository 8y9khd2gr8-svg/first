// Hareketler. Yeni hareket eklemek için buraya bir satır eklemek yeterli.
// Komut kuralı: benzetme değil, vücut parçasının adını söyleyen tek ve net bir eylem.
// Hikâye (ör. "Truva Atı'na yetiş!") ayrı alanda durur; komutun yerine geçmez.
//  - 'sayi': belli sayıda tekrar (her tekrarda bip sesi ve sayaç)
//  - 'sure': belli saniye boyunca devam eden hareket (geri sayan saat)

export type Animasyon =
  | 'zipla' | 'comel' | 'kos' | 'dizler' | 'kollar' | 'acKapa' | 'uzan'
  | 'balon' | 'heykel' | 'horon' | 'tasKaldir'
  | 'sutun' | 'piramit' | 'yanAdim' | 'parmakUcu' | 'tirman'
  | 'donus' | 'kocaman' | 'belDondur' | 'yanaEgil' | 'kolSalla'
  // Spor Kampı
  | 'sut' | 'basket' | 'kulac' | 'tekAyak' | 'raket' | 'voleybol' | 'engel'
  // Dinozorlar Diyarı
  | 'trex' | 'kanat' | 'tepin' | 'yumurta' | 'kazi'
  // Evde Macera
  | 'basUstu' | 'elden' | 'yanaZipla' | 'sallan' | 'topla'
  | 'tHarfi';

export type Ritim = 'yavas' | 'hizli';

export type Hareket = {
  baslik: string; // ekranda büyük yazan komut
  sesli: string; // seslendirilen komut
  hikaye?: string; // komutun üstünde küçük yazan, durağa özel hikâye
  animasyon: Animasyon;
  ritim?: Ritim; // 🐢 yavaş / ⚡ hızlı: aynı hareket farklı ritimle başka bir şey gibi gelir
  dizi?: Animasyon[]; // birleşik hareket: her tekrarda sıradaki (ör. zıpla, zıpla, çömel)
  surpriz?: 'donma' | 'ayna'; // sürpriz an (oturum.ts ekler)
} & ({ tur: 'sayi'; adet: number; tempoMs: number } | { tur: 'sure'; saniye: number });

export const H = {
  zipla: { baslik: '5 kere zıpla!', sesli: 'Hadi bakalım! Beş kere zıpla!', animasyon: 'zipla', tur: 'sayi', adet: 5, tempoMs: 1100 },
  comel: { baslik: 'Çömel ve kalk!', sesli: 'Şimdi çömel ve kalk. Beş kere!', animasyon: 'comel', tur: 'sayi', adet: 5, tempoMs: 1600 },
  kos: { baslik: 'Yerinde koş!', sesli: 'Yerinde koş! On saniye!', animasyon: 'kos', tur: 'sure', saniye: 10 },
  dizler: { baslik: 'Dizlerini\nsırayla kaldır!', sesli: 'Dizlerini sırayla yukarı kaldır! Bir bu dizin, bir öbür dizin!', animasyon: 'dizler', tur: 'sayi', adet: 10, tempoMs: 850 },
  kollar: { baslik: 'Kollarını\nkaldır, indir!', sesli: 'Kollarını yukarı kaldır, sonra aşağı indir! Altı kere!', animasyon: 'kollar', tur: 'sayi', adet: 6, tempoMs: 1400 },
  acKapa: { baslik: 'Zıpla,\nayaklarını aç, kapa!', sesli: 'Zıpla, ayaklarını aç! Zıpla, kapa! Beş kere!', animasyon: 'acKapa', tur: 'sayi', adet: 5, tempoMs: 1500 },
  uzan: { baslik: 'Gökyüzüne uzan!', sesli: 'Parmak uçlarında yüksel, ellerinle gökyüzüne uzan! Üç kere!', animasyon: 'uzan', tur: 'sayi', adet: 3, tempoMs: 2200 },
} satisfies Record<string, Hareket>;

// --- Komut kütüphanesi ---
// Bütün komutlar YERİNDE yapılır (kamera için çocuk yerinden ayrılmaz) ve vücut parçasını söyler.
// Duraklar bu komutları kendi hikâyesiyle kullanır: hikayeli(K.zipla, 'Vapur kalkıyor!').
const SAYI_YAZI = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz', 'On', 'On bir', 'On iki'];
const k = (animasyon: Animasyon, baslik: string, miktar: { adet: number; tempoMs: number } | { saniye: number }): Hareket => {
  const duz = baslik.replace(/\n/g, ' ');
  if ('adet' in miktar) {
    const sesli = /^\d/.test(duz) ? duz.replace(/^\d+/, SAYI_YAZI[miktar.adet]) : `${duz} ${SAYI_YAZI[miktar.adet]} kere!`;
    return { baslik, sesli, animasyon, tur: 'sayi', ...miktar };
  }
  return { baslik, sesli: duz, animasyon, tur: 'sure', ...miktar };
};

export const K = {
  zipla: k('zipla', '5 kere zıpla!', { adet: 5, tempoMs: 1100 }),
  comel: k('comel', 'Çömel ve kalk!', { adet: 5, tempoMs: 1600 }),
  kos: k('kos', 'Yerinde hızlı koş!', { saniye: 8 }),
  yuru: k('dizler', 'Olduğun yerde\ndizlerini kaldırarak yürü!', { adet: 10, tempoMs: 1000 }),
  dizler: k('dizler', 'Dizlerini\nsırayla kaldır!', { adet: 10, tempoMs: 850 }),
  kollar: k('kollar', 'Kollarını\nkaldır, indir!', { adet: 6, tempoMs: 1400 }),
  kolSalla: k('kolSalla', 'Kollarını kaldır,\nsağa sola salla!', { adet: 8, tempoMs: 1200 }),
  acKapa: k('acKapa', 'Zıpla,\nayaklarını aç, kapa!', { adet: 5, tempoMs: 1500 }),
  uzan: k('uzan', 'Parmak ucunda yüksel,\nkollarını uzat!', { adet: 4, tempoMs: 2200 }),
  balon: k('balon', 'Çömel, sonra yavaşça\nyüksel, kollarını aç!', { adet: 4, tempoMs: 3000 }),
  tasKaldir: k('tasKaldir', 'Çömel, ellerini yere değdir,\nkollarını yukarı kaldır!', { adet: 5, tempoMs: 2200 }),
  sutun: k('sutun', 'Dimdik dur,\nkollarını yukarı uzat!', { saniye: 6 }),
  piramit: k('piramit', 'Ayaklarını aç, ellerini\nbaşının üstünde birleştir!', { saniye: 6 }),
  tHarfi: k('tHarfi', 'Kollarını yana aç,\ndimdik dur!', { saniye: 6 }),
  yanAdim: k('yanAdim', 'Bir sağa, bir sola\nadım at!', { adet: 8, tempoMs: 1000 }),
  parmakUcu: k('parmakUcu', 'Parmak uçlarında\nyerinde yürü!', { saniye: 8 }),
  tirman: k('tirman', 'Dizini kaldır,\nöbür kolunu uzat!', { adet: 8, tempoMs: 1200 }),
  donus: k('donus', 'Kollarını aç, arkanı dön,\ngeri dön!', { adet: 4, tempoMs: 2400 }),
  kocaman: k('kocaman', 'Kollarını ve bacaklarını\naç, kocaman ol!', { saniye: 5 }),
  belDondur: k('belDondur', 'Ellerini beline koy,\nbelini döndür!', { adet: 4, tempoMs: 2000 }),
  yanaEgil: k('yanaEgil', 'Kollarını kaldır, bir yana\neğil, sonra öbür yana!', { adet: 4, tempoMs: 2400 }),
  kulac: k('kulac', 'Kollarını sırayla\nöne doğru çevir!', { saniye: 8 }),
  tekAyak: k('tekAyak', 'Tek ayağını kaldır,\nkollarını yana aç!', { saniye: 8 }),
  engel: k('engel', 'Zıpla, dizlerini\nyukarı çek!', { adet: 5, tempoMs: 1600 }),
  kanat: k('kanat', 'Kollarını yana aç,\nyukarı aşağı salla!', { saniye: 8 }),
  tepin: k('tepin', 'Ayaklarını sırayla\nyere vur!', { adet: 10, tempoMs: 900 }),
  horon: k('horon', 'Ayaklarını hızlı hızlı\nyere vur!', { saniye: 8 }),
  kazi: k('kazi', 'Çömel, ellerinle\nyeri sırayla kaz!', { adet: 8, tempoMs: 1000 }),
  basket: k('basket', 'Çömel, zıpla,\nkollarını yukarı uzat!', { adet: 5, tempoMs: 2000 }),
  sut: k('sut', 'Ayağını öne doğru\nsalla!', { adet: 8, tempoMs: 1200 }),
  raket: k('raket', 'Kolunu yukarıdan\naşağı doğru salla!', { adet: 8, tempoMs: 1300 }),
  voleybol: k('voleybol', 'Ellerini başının üstünde\nbirleştir, yukarı it!', { adet: 6, tempoMs: 1600 }),
  trex: k('trex', 'Dirseklerini bük,\nyerinde büyük adımlar at!', { adet: 8, tempoMs: 1300 }),
  yumurta: k('yumurta', 'Çömel, küçül, sonra\nkalk ve kollarını aç!', { adet: 4, tempoMs: 3000 }),
  sallan: k('sallan', 'Kendine sarıl,\nsağa sola sallan!', { saniye: 8 }),
} satisfies Record<string, Hareket>;

type Ek = { adet?: number; saniye?: number; tempoMs?: number; ritim?: Ritim; baslik?: string; sesli?: string };

// Komuta durağın hikâyesini (ve istenirse ritim/miktar) ekler. Sesli: "hikâye + komut".
export function hikayeli(komut: Hareket, hikaye: string, ek: Ek = {}): Hareket {
  const h = { ...komut } as Hareket;
  if (h.tur === 'sayi') {
    if (ek.adet) h.adet = ek.adet;
    // Hızlıda bile bir tekrar 0,65 saniyeden kısa olmaz (çocuk yetişebilsin).
    h.tempoMs = Math.max(650, Math.round((ek.tempoMs ?? h.tempoMs) * (ek.ritim === 'yavas' ? 1.5 : ek.ritim === 'hizli' ? 0.7 : 1)));
  } else if (ek.saniye) h.saniye = ek.saniye;
  if (ek.baslik) h.baslik = ek.baslik;
  let komutSesli = ek.sesli ?? (ek.baslik ? ek.baslik.replace(/\n/g, ' ') : h.sesli);
  // Miktar değiştiyse ve sesli sayıyı içeriyorsa yeniden yaz.
  if (!ek.sesli && h.tur === 'sayi' && ek.adet && komut.tur === 'sayi') komutSesli = komutSesli.replace(SAYI_YAZI[komut.adet], SAYI_YAZI[h.adet]);
  if (!ek.baslik && h.tur === 'sayi' && ek.adet && komut.tur === 'sayi') h.baslik = h.baslik.replace(String(komut.adet), String(h.adet));
  const ritimSozu = ek.ritim === 'yavas' ? 'Yavaş yavaş! ' : ek.ritim === 'hizli' ? 'Hızlı hızlı! ' : '';
  return { ...h, hikaye, ritim: ek.ritim, sesli: `${hikaye} ${ritimSozu}${komutSesli}` };
}

// Birleşik hareket: her tekrarda dizideki sıradaki hareket (ör. zıpla, zıpla, çömel).
export function birlesik(hikaye: string, baslik: string, dizi: Animasyon[], adet: number, tempoMs: number): Hareket {
  return { hikaye, baslik, sesli: `${hikaye} ${baslik.replace(/\n/g, ' ')}`, animasyon: dizi[0], dizi, tur: 'sayi', adet, tempoMs };
}

// Isınma: oturumun ilk durağında (ya da uzun aradan sonra) havuzdan biri; her seferinde farklı.
export const ISINMALAR: Hareket[] = [
  hikayeli(K.uzan, 'Isınma: Zıpzıp uyanıyor, gerin!', { adet: 3 }),
  hikayeli(K.kulac, 'Isınma: Omuzlar uyansın!', { saniye: 6 }),
  hikayeli(K.dizler, 'Isınma: Bacaklar uyansın!', { ritim: 'yavas', adet: 8 }),
  hikayeli(K.belDondur, 'Isınma: Belini ısıt!', { adet: 3 }),
  hikayeli(K.yanaEgil, 'Isınma: Yanlarını esnet!', { adet: 3 }),
  hikayeli(K.yanAdim, 'Isınma: Yavaş yavaş başla!', { ritim: 'yavas', adet: 6 }),
  hikayeli(K.kos, 'Isınma: Hafif bir koşu!', { saniye: 6 }),
  hikayeli(K.kolSalla, 'Isınma: Kolların uyansın!', { adet: 6 }),
];

// Soğuma: bölümün son durağında ya da "Bugünlük bitirelim" denince; sakin ve yavaş.
export const SOGUMALAR: Hareket[] = [
  { hikaye: 'Derin nefes zamanı!', baslik: 'Kollarını kaldır,\nderin nefes al!', sesli: 'Derin nefes zamanı! Yavaşça kollarını kaldır ve derin bir nefes al. Sonra indir.', animasyon: 'kollar', tur: 'sayi', adet: 3, tempoMs: 3600 },
  { hikaye: 'Yavaşla, sakinleş!', baslik: 'Yavaşça çömel,\nyavaşça kalk!', sesli: 'Yavaşla, sakinleş! Yavaşça çömel, yavaşça kalk. Üç kere!', animasyon: 'comel', tur: 'sayi', adet: 3, tempoMs: 3600 },
  { hikaye: 'Kendine teşekkür et!', baslik: 'Kendine sarıl,\nyavaşça sallan!', sesli: 'Çok güzel hareket ettin, kendine teşekkür et! Kendine sarıl ve yavaşça sallan!', animasyon: 'sallan', tur: 'sure', saniye: 8 },
  { hikaye: 'Gökyüzüne uzan!', baslik: 'Yavaşça yüksel,\nkollarını uzat!', sesli: 'Gökyüzüne uzan! Yavaşça parmak uçlarında yüksel, kollarını uzat. Üç kere!', animasyon: 'uzan', tur: 'sayi', adet: 3, tempoMs: 3600 },
];

// Sürpriz anlar: her durakta bir tane, durağın ortasında.
export const DONMA: Hareket = {
  hikaye: 'Sürpriz! Donma oyunu!',
  baslik: 'Dans et! “Dur!”\ndeyince kıpırdama!',
  sesli: 'Sürpriz! Donma oyunu! Zıpzıp’la dans et. Dur deyince hiç kıpırdama!',
  animasyon: 'horon',
  tur: 'sure',
  saniye: 14,
  surpriz: 'donma',
};
export const AYNA: Hareket = {
  hikaye: 'Sürpriz! Ayna oyunu!',
  baslik: 'Zıpzıp ne yaparsa\naynısını yap!',
  sesli: 'Sürpriz! Ayna oyunu! Zıpzıp ne yaparsa, sen de aynısını yap!',
  animasyon: 'kollar',
  tur: 'sure',
  saniye: 15,
  surpriz: 'ayna',
};
// Ayna oyununda Zıpzıp'ın sırayla yaptığı hareketler (dördü seçilir).
export const AYNA_HAVUZU: Animasyon[] = ['zipla', 'kollar', 'comel', 'yanaEgil', 'tekAyak', 'acKapa', 'kanat', 'belDondur', 'dizler', 'kocaman'];

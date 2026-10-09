import { H, Hareket, ISINMA, SOGUMA } from './hareketler';

// Türkiye Turu durakları (batıdan doğuya). Kural: ibadet yeri olarak kullanılan yapılar yok.
export type BolumId = 'turkiye' | 'dunya';

export type Durak = {
  id: string;
  bolum: BolumId;
  konum?: [number, number]; // [boylam, enlem]; Dünya küresinde kullanılır
  ad: string;
  yer: string; // şehir / bölge
  simge: string;
  bilgi: string; // "Biliyor muydun?" kutusu (aynı zamanda seslendirilir)
  ozel: Hareket; // durağa özel hareket
  ekler: [Hareket, Hareket];
};

export const TURKIYE: Durak[] = [
  {
    id: 'istanbul',
    bolum: 'turkiye',
    ad: 'Boğaz ve Galata',
    yer: 'İstanbul',
    simge: '🌉',
    bilgi: 'İstanbul iki kıtada birden kurulu bir şehir: Avrupa ve Asya! Boğaz’daki köprüler iki kıtayı birleştirir. Galata Kulesi ise neredeyse yedi yüz yaşında.',
    ozel: { hikaye: 'Kulenin tepesine bak!', baslik: 'Parmak ucunda yüksel,\nkollarını uzat!', sesli: 'Kulenin tepesine bakalım! Parmak uçlarında yüksel, kollarını yukarı uzat!', animasyon: 'uzan', tur: 'sayi', adet: 4, tempoMs: 2200 },
    ekler: [H.zipla, H.comel],
  },
  {
    id: 'truva',
    bolum: 'turkiye',
    ad: 'Truva Atı',
    yer: 'Çanakkale',
    simge: '🐴',
    bilgi: 'Truva Antik Kenti Çanakkale’de. Masala göre insanlar kocaman tahta bir atın içine saklanmış!',
    ozel: { hikaye: 'Truva Atı’na yetiş!', baslik: 'Yerinde hızlı koş!', sesli: 'Truva Atı’na yetişelim! Yerinde hızlı hızlı koş!', animasyon: 'kos', tur: 'sure', saniye: 8 },
    ekler: [H.dizler, H.acKapa],
  },
  {
    id: 'pamukkale',
    bolum: 'turkiye',
    ad: 'Pamukkale',
    yer: 'Denizli',
    simge: '🏞️',
    bilgi: 'Pamukkale’nin bembeyaz basamakları kar gibi görünür ama kar değildir. Sıcak sudan oluşan taşlardır!',
    ozel: { hikaye: 'Beyaz basamaklardan in!', baslik: 'Dizlerini kaldırarak\nyürü!', sesli: 'Beyaz basamaklardan inelim! Dizlerini kaldırarak yerinde yürü!', animasyon: 'dizler', tur: 'sayi', adet: 10, tempoMs: 1000 },
    ekler: [H.kollar, H.zipla],
  },
  {
    id: 'kapadokya',
    bolum: 'turkiye',
    ad: 'Kapadokya',
    yer: 'Nevşehir',
    simge: '🎈',
    bilgi: 'Kapadokya’da peri bacaları denen sivri kayalar var. Sabahları gökyüzü rengârenk sıcak hava balonlarıyla dolar!',
    ozel: { hikaye: 'Balonlar havalanıyor!', baslik: 'Çömel, sonra\nyavaşça yüksel!', sesli: 'Balonlar havalanıyor! Önce çömel, sonra yavaşça yüksel ve kollarını aç!', animasyon: 'balon', tur: 'sayi', adet: 4, tempoMs: 3000 },
    ekler: [H.acKapa, H.comel],
  },
  {
    id: 'nemrut',
    bolum: 'turkiye',
    ad: 'Nemrut Dağı',
    yer: 'Adıyaman',
    simge: '🗿',
    bilgi: 'Nemrut Dağı’nın tepesinde kocaman taş heykel başları var. Bazıları senin boyundan bile büyük!',
    ozel: { hikaye: 'Taş heykeller seni izliyor!', baslik: 'Ellerini beline koy,\nkıpırdamadan dur!', sesli: 'Taş heykeller gibi olalım! Ellerini beline koy ve hiç kıpırdamadan dur!', animasyon: 'heykel', tur: 'sure', saniye: 6 },
    ekler: [H.kos, H.dizler],
  },
  {
    id: 'gobeklitepe',
    bolum: 'turkiye',
    ad: 'Göbeklitepe',
    yer: 'Şanlıurfa',
    simge: '🪨',
    bilgi: 'Göbeklitepe dünyanın bilinen en eski yapılarından biri. On bir bin yıldan daha yaşlı, piramitlerden bile çok daha eski!',
    ozel: { hikaye: 'Kocaman taşları kaldıralım!', baslik: 'Çömel, taşı al,\nyukarı kaldır!', sesli: 'Kocaman taşları kaldıralım! Çömel, taşı al ve yukarı kaldır!', animasyon: 'tasKaldir', tur: 'sayi', adet: 5, tempoMs: 2200 },
    ekler: [H.zipla, H.kollar],
  },
  {
    id: 'karadeniz',
    bolum: 'turkiye',
    ad: 'Karadeniz',
    yer: 'Trabzon',
    simge: '🌲',
    bilgi: 'Karadeniz’de insanlar el ele tutuşup horon oynar. Horonda ayaklar çok hızlı hareket eder!',
    ozel: { hikaye: 'Horon zamanı!', baslik: 'Ayaklarını\nhızlı hızlı vur!', sesli: 'Horon zamanı! Kollarını kaldır, ayaklarını hızlı hızlı yere vur!', animasyon: 'horon', tur: 'sure', saniye: 8 },
    ekler: [H.acKapa, H.kos],
  },
];

// 2. bölüm: Dünya Harikaları (ücretli kısım). Efes'ten başlar; dini figür/ibadet odaklı yapı yok.
export const DUNYA: Durak[] = [
  {
    id: 'efes',
    bolum: 'dunya',
    konum: [27.36, 37.95],
    ad: 'Artemis Tapınağı',
    yer: 'Efes',
    simge: '🏛️',
    bilgi: 'Efes’teki Artemis Tapınağı antik dünyanın yedi harikasından biriydi. Bugün sadece tek bir sütunu ayakta!',
    ozel: { hikaye: 'Tek sütun hâlâ ayakta!', baslik: 'Dimdik dur,\nkollarını yukarı uzat!', sesli: 'Tek sütun gibi olalım! Dimdik dur ve kollarını yukarı uzat!', animasyon: 'sutun', tur: 'sure', saniye: 6 },
    ekler: [H.zipla, H.kollar],
  },
  {
    id: 'kolezyum',
    bolum: 'dunya',
    konum: [12.49, 41.89],
    ad: 'Kolezyum',
    yer: 'Roma',
    simge: '🏟️',
    bilgi: 'Kolezyum neredeyse iki bin yaşında kocaman bir stadyum. İçine elli bin kişi sığarmış!',
    ozel: { hikaye: 'Dev stadyumda koşalım!', baslik: 'Yerinde hızlı koş!', sesli: 'Dev stadyumda koşalım! Yerinde hızlı hızlı koş!', animasyon: 'kos', tur: 'sure', saniye: 8 },
    ekler: [H.comel, H.acKapa],
  },
  {
    id: 'piramitler',
    bolum: 'dunya',
    konum: [31.13, 29.98],
    ad: 'Piramitler',
    yer: 'Mısır',
    simge: '🔺',
    bilgi: 'Büyük Piramit dört bin beş yüz yıl önce yapıldı. Milyonlarca kocaman taştan oluşuyor!',
    ozel: { hikaye: 'Piramit olalım!', baslik: 'Ayaklarını aç, ellerini\nbaşının üstünde birleştir!', sesli: 'Piramit olalım! Ayaklarını aç ve ellerini başının üstünde birleştir!', animasyon: 'piramit', tur: 'sure', saniye: 6 },
    ekler: [H.zipla, H.dizler],
  },
  {
    id: 'petra',
    bolum: 'dunya',
    konum: [35.44, 30.33],
    ad: 'Petra',
    yer: 'Ürdün',
    simge: '🏜️',
    bilgi: 'Petra’nın binaları pembe kayaların içine oyulmuş. Şehre dar bir kanyondan yürüyerek girilir!',
    ozel: { hikaye: 'Dar kanyondan geçelim!', baslik: 'Yana adım at,\nayaklarını birleştir!', sesli: 'Dar kanyondan geçelim! Yana adım at, sonra ayaklarını birleştir!', animasyon: 'yanAdim', tur: 'sayi', adet: 8, tempoMs: 1000 },
    ekler: [H.kollar, H.comel],
  },
  {
    id: 'tacmahal',
    bolum: 'dunya',
    konum: [78.04, 27.17],
    ad: 'Tac Mahal',
    yer: 'Hindistan',
    simge: '🌷',
    bilgi: 'Tac Mahal bembeyaz mermerden yapılmış. Güneş batarken rengi pembeye döner!',
    ozel: { hikaye: 'Bahçede sessizce yürüyelim!', baslik: 'Parmak uçlarında yürü!', sesli: 'Bahçede sessizce yürüyelim! Parmak uçlarında yürü!', animasyon: 'parmakUcu', tur: 'sure', saniye: 8 },
    ekler: [H.acKapa, H.kos],
  },
  {
    id: 'cinseddi',
    bolum: 'dunya',
    konum: [116.57, 40.43],
    ad: 'Çin Seddi',
    yer: 'Çin',
    simge: '🧱',
    bilgi: 'Çin Seddi o kadar uzun ki baştan sona yürümek aylar sürer!',
    ozel: { hikaye: 'Uzun duvarda yürüyelim!', baslik: 'Dizlerini kaldırarak\nyürü!', sesli: 'Uzun duvarda yürüyelim! Dizlerini kaldırarak yerinde yürü!', animasyon: 'dizler', tur: 'sayi', adet: 12, tempoMs: 900 },
    ekler: [H.zipla, H.kollar],
  },
  {
    id: 'machupicchu',
    bolum: 'dunya',
    konum: [-72.55, -13.16],
    ad: 'Machu Picchu',
    yer: 'Peru',
    simge: '⛰️',
    bilgi: 'Machu Picchu bulutların arasında, yüksek bir dağın tepesindeki bir şehir. Orada lamalar dolaşır!',
    ozel: { hikaye: 'Dağa tırmanalım!', baslik: 'Dizini kaldır,\nkolunu uzat!', sesli: 'Dağa tırmanalım! Bir dizini kaldır, öbür kolunu yukarı uzat! Sırayla!', animasyon: 'tirman', tur: 'sayi', adet: 8, tempoMs: 1200 },
    ekler: [H.acKapa, H.comel],
  },
];

export const BOLUMLER: Record<BolumId, { ad: string; duraklar: Durak[]; sahne: string }> = {
  turkiye: { ad: 'Türkiye Turu', duraklar: TURKIYE, sahne: 'Harita' },
  dunya: { ad: 'Dünya Harikaları', duraklar: DUNYA, sahne: 'Dunya' },
};

export function durakBul(id: string): Durak {
  return [...TURKIYE, ...DUNYA].find((d) => d.id === id) ?? TURKIYE[0];
}

// Durağın bölümünün harita sahnesi ('Harita' ya da 'Dunya').
export const haritaSahnesi = (d: Durak) => BOLUMLER[d.bolum].sahne;

// Bir duraktaki 5 hareketlik kısa antrenman.
export function oturum(durak: Durak): Hareket[] {
  return [ISINMA, durak.ozel, ...durak.ekler, SOGUMA];
}

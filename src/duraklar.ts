import { H, Hareket, ISINMA, SOGUMA } from './hareketler';

// Türkiye Turu durakları (batıdan doğuya). Kural: ibadet yeri olarak kullanılan yapılar yok.
export type BolumId = 'turkiye' | 'dunya' | 'uzay';

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

// 3. bölüm: Uzay Yolculuğu. Gerçek sırayla, Güneş'ten dışarı doğru: Merkür, Venüs, (Dünya) Ay, Mars...
export const UZAY: Durak[] = [
  {
    id: 'merkur',
    bolum: 'uzay',
    ad: 'Merkür',
    yer: 'Merkür',
    simge: '☀️',
    bilgi: 'Merkür Güneş’e en yakın ve en hızlı gezegen. Güneş’in etrafını sadece 88 günde dolaşır!',
    ozel: { hikaye: 'En hızlı gezegen!', baslik: 'Yerinde hızlı koş!', sesli: 'En hızlı gezegen Merkür! Yerinde hızlı hızlı koş!', animasyon: 'kos', tur: 'sure', saniye: 8 },
    ekler: [H.acKapa, H.kollar],
  },
  {
    id: 'venus',
    bolum: 'uzay',
    ad: 'Venüs',
    yer: 'Venüs',
    simge: '✨',
    bilgi: 'Venüs gökyüzündeki en parlak gezegen. Kendi etrafında ters yöne döner!',
    ozel: { hikaye: 'Venüs ters dönüyor!', baslik: 'Kollarını aç, arkanı dön,\ngeri dön!', sesli: 'Venüs ters dönüyor! Kollarını aç, arkanı dön, sonra geri dön!', animasyon: 'donus', tur: 'sayi', adet: 4, tempoMs: 2400 },
    ekler: [H.zipla, H.comel],
  },
  {
    id: 'ay',
    bolum: 'uzay',
    ad: 'Ay',
    yer: 'Ay',
    simge: '🌙',
    bilgi: 'Ay’da yerçekimi Dünya’dakinden altı kat azdır. Orada çok yükseğe zıplayabilirsin!',
    ozel: { hikaye: 'Ay’da her şey yavaş!', baslik: 'Yavaş yavaş zıpla!', sesli: 'Ay’da her şey yavaş! Yavaş yavaş zıpla!', animasyon: 'zipla', tur: 'sayi', adet: 5, tempoMs: 2200 },
    ekler: [H.kollar, H.dizler],
  },
  {
    id: 'mars',
    bolum: 'uzay',
    ad: 'Mars',
    yer: 'Mars',
    simge: '🔴',
    bilgi: 'Mars’a kırmızı gezegen denir. Güneş Sistemi’nin en yüksek dağı Olimpos, Mars’tadır!',
    ozel: { hikaye: 'Dev dağa tırmanalım!', baslik: 'Dizini kaldır,\nkolunu uzat!', sesli: 'Mars’taki dev dağa tırmanalım! Bir dizini kaldır, öbür kolunu uzat!', animasyon: 'tirman', tur: 'sayi', adet: 8, tempoMs: 1200 },
    ekler: [H.zipla, H.comel],
  },
  {
    id: 'jupiter',
    bolum: 'uzay',
    ad: 'Jüpiter',
    yer: 'Jüpiter',
    simge: '🟠',
    bilgi: 'Jüpiter en büyük gezegen. İçine binden fazla Dünya sığar!',
    ozel: { hikaye: 'En büyük gezegen!', baslik: 'Kollarını ve bacaklarını\naç, kocaman ol!', sesli: 'En büyük gezegen Jüpiter! Kollarını ve bacaklarını aç, kocaman ol!', animasyon: 'kocaman', tur: 'sure', saniye: 6 },
    ekler: [H.dizler, H.acKapa],
  },
  {
    id: 'saturn',
    bolum: 'uzay',
    ad: 'Satürn',
    yer: 'Satürn',
    simge: '🪐',
    bilgi: 'Satürn’ün buzdan ve kayadan yapılmış kocaman halkaları var!',
    ozel: { hikaye: 'Halkalar dönüyor!', baslik: 'Ellerini beline koy,\nbelini döndür!', sesli: 'Satürn’ün halkaları dönüyor! Ellerini beline koy, belini döndür!', animasyon: 'belDondur', tur: 'sayi', adet: 4, tempoMs: 2000 },
    ekler: [H.kos, H.kollar],
  },
  {
    id: 'uranus',
    bolum: 'uzay',
    ad: 'Uranüs',
    yer: 'Uranüs',
    simge: '🔵',
    bilgi: 'Uranüs yan yatmış hâlde döner, sanki yuvarlanan bir top gibi!',
    ozel: { hikaye: 'Yan yatan gezegen!', baslik: 'Kollarını kaldır,\nyana eğil!', sesli: 'Yan yatan gezegen Uranüs! Kollarını kaldır, bir yana eğil, sonra öbür yana!', animasyon: 'yanaEgil', tur: 'sayi', adet: 4, tempoMs: 2400 },
    ekler: [H.zipla, H.dizler],
  },
  {
    id: 'neptun',
    bolum: 'uzay',
    ad: 'Neptün',
    yer: 'Neptün',
    simge: '🌀',
    bilgi: 'Neptün en uzak gezegen. Orada çok güçlü rüzgârlar eser!',
    ozel: { hikaye: 'Rüzgâr esiyor!', baslik: 'Kollarını kaldır,\nsağa sola salla!', sesli: 'Neptün’de rüzgâr esiyor! Kollarını kaldır, sağa sola salla!', animasyon: 'kolSalla', tur: 'sayi', adet: 8, tempoMs: 1200 },
    ekler: [H.acKapa, H.comel],
  },
];

export const BOLUMLER: Record<BolumId, { ad: string; duraklar: Durak[]; sahne: string }> = {
  turkiye: { ad: 'Türkiye Turu', duraklar: TURKIYE, sahne: 'Harita' },
  dunya: { ad: 'Dünya Harikaları', duraklar: DUNYA, sahne: 'Dunya' },
  uzay: { ad: 'Uzay Yolculuğu', duraklar: UZAY, sahne: 'Uzay' },
};

export function durakBul(id: string): Durak {
  return [...TURKIYE, ...DUNYA, ...UZAY].find((d) => d.id === id) ?? TURKIYE[0];
}

// Durağın bölümünün harita sahnesi ('Harita' ya da 'Dunya').
export const haritaSahnesi = (d: Durak) => BOLUMLER[d.bolum].sahne;

// Bir duraktaki 5 hareketlik kısa antrenman.
export function oturum(durak: Durak): Hareket[] {
  return [ISINMA, durak.ozel, ...durak.ekler, SOGUMA];
}

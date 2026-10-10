import { H, Hareket, ISINMA, SOGUMA } from './hareketler';
import { bolumAcik } from './ilerleme';

// Türkiye Turu durakları (batıdan doğuya). Kural: ibadet yeri olarak kullanılan yapılar yok.
export type BolumId = 'turkiye' | 'dunya' | 'uzay' | 'spor' | 'dinozor' | 'evde';

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
    ozel: { hikaye: 'Taş heykeller seni izliyor!', baslik: 'Ellerini beline koy,\nkıpırdamadan dur!', sesli: 'Taş heykeller seni izliyor! Ellerini beline koy ve hiç kıpırdamadan dur!', animasyon: 'heykel', tur: 'sure', saniye: 6 },
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
    ozel: { hikaye: 'Tek sütun hâlâ ayakta!', baslik: 'Dimdik dur,\nkollarını yukarı uzat!', sesli: 'Tek sütun hâlâ ayakta! Dimdik dur ve kollarını yukarı uzat!', animasyon: 'sutun', tur: 'sure', saniye: 6 },
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

// 4. bölüm: Spor Kampı. Sıra zorunlu değil: çocuk istediği sporla başlar ("herkes kendini bulsun").
export const SPOR: Durak[] = [
  {
    id: 'futbol',
    bolum: 'spor',
    ad: 'Futbol',
    yer: 'Futbol',
    simge: '⚽',
    bilgi: 'Futbol dünyada en çok oynanan oyun. Bir maçta oyuncular neredeyse on kilometre koşar!',
    ozel: { hikaye: 'Gol atalım!', baslik: 'Ayağını öne doğru\nsalla, topa vur!', sesli: 'Gol atalım! Bir ayağını öne doğru salla, sonra öbür ayağını! Sekiz kere!', animasyon: 'sut', tur: 'sayi', adet: 8, tempoMs: 1200 },
    ekler: [H.kos, H.zipla],
  },
  {
    id: 'basketbol',
    bolum: 'spor',
    ad: 'Basketbol',
    yer: 'Basketbol',
    simge: '🏀',
    bilgi: 'Basketbol potası yerden üç metre yüksekte. Bu, neredeyse iki büyüğün boyu kadar!',
    ozel: { hikaye: 'Smaç zamanı!', baslik: 'Çömel, zıpla,\nkollarını yukarı uzat!', sesli: 'Smaç zamanı! Çömel, sonra zıpla ve kollarını yukarı uzat! Beş kere!', animasyon: 'basket', tur: 'sayi', adet: 5, tempoMs: 2000 },
    ekler: [H.dizler, H.kollar],
  },
  {
    id: 'yuzme',
    bolum: 'spor',
    ad: 'Yüzme',
    yer: 'Yüzme',
    simge: '🏊',
    bilgi: 'Yüzerken kollarımız sırayla suyu iter. Suyun içinde vücudumuz çok daha hafif gelir!',
    ozel: { hikaye: 'Havuzda yüzelim!', baslik: 'Kollarını sırayla\nöne doğru çevir!', sesli: 'Havuzda yüzelim! Kollarını sırayla öne doğru çevir! Bir bu kolun, bir öbür kolun!', animasyon: 'kulac', tur: 'sure', saniye: 10 },
    ekler: [H.comel, H.acKapa],
  },
  {
    id: 'jimnastik',
    bolum: 'spor',
    ad: 'Jimnastik',
    yer: 'Jimnastik',
    simge: '🤸',
    bilgi: 'Jimnastikçiler denge aletinde, avuç içi kadar ince bir tahtanın üstünde yürür, döner, hatta zıplar!',
    ozel: { hikaye: 'Denge zamanı!', baslik: 'Tek ayağını kaldır,\nkollarını yana aç!', sesli: 'Denge zamanı! Tek ayağını kaldır, kollarını yana aç! Sonra öbür ayağını kaldır!', animasyon: 'tekAyak', tur: 'sure', saniye: 8 },
    ekler: [H.zipla, H.kollar],
  },
  {
    id: 'tenis',
    bolum: 'spor',
    ad: 'Tenis',
    yer: 'Tenis',
    simge: '🎾',
    bilgi: 'Tenis topu çok hızlı gider. En hızlı servisler otoyoldaki bir arabadan bile hızlıdır!',
    ozel: { hikaye: 'Topa vur!', baslik: 'Kolunu yukarıdan\naşağı doğru salla!', sesli: 'Tenis zamanı! Kolunu yukarıdan aşağı doğru salla ve topa vur! Sekiz kere!', animasyon: 'raket', tur: 'sayi', adet: 8, tempoMs: 1300 },
    ekler: [H.kos, H.comel],
  },
  {
    id: 'voleybol',
    bolum: 'spor',
    ad: 'Voleybol',
    yer: 'Voleybol',
    simge: '🏐',
    bilgi: 'Voleybolda top yere düşmeden takım arkadaşları üç kez vurabilir. Herkes birbirine yardım eder!',
    ozel: { hikaye: 'Topu ağın üstünden at!', baslik: 'Ellerini başının üstünde\nbirleştir, yukarı it!', sesli: 'Topu ağın üstünden atalım! Ellerini başının üstünde birleştir ve yukarı it! Altı kere!', animasyon: 'voleybol', tur: 'sayi', adet: 6, tempoMs: 1600 },
    ekler: [H.dizler, H.acKapa],
  },
  {
    id: 'atletizm',
    bolum: 'spor',
    ad: 'Atletizm',
    yer: 'Atletizm',
    simge: '🏃',
    bilgi: 'Atletizmde koşucular yarışırken engellerin üstünden atlar. Engeller bir çocuğun belinden bile yüksektir!',
    ozel: { hikaye: 'Engelin üstünden atla!', baslik: 'Zıpla, dizlerini\nyukarı çek!', sesli: 'Engelin üstünden atlayalım! Zıpla ve dizlerini yukarı çek! Beş kere!', animasyon: 'engel', tur: 'sayi', adet: 5, tempoMs: 1600 },
    ekler: [H.kollar, H.kos],
  },
];

// 5. bölüm: Dinozorlar Diyarı. Yumurtadan çıkıştan fosil kazısına.
export const DINOZOR: Durak[] = [
  {
    id: 'yumurta',
    bolum: 'dinozor',
    ad: 'Yumurta',
    yer: 'Yumurta',
    simge: '🥚',
    bilgi: 'Bütün dinozorlar yumurtadan çıkardı. Bazı dinozor yumurtaları bir futbol topu kadar büyüktü!',
    ozel: { hikaye: 'Yumurta çatlıyor!', baslik: 'Çömel, küçül, sonra\nkalk ve kollarını aç!', sesli: 'Yumurta çatlıyor! Çömel ve küçül, sonra yavaşça kalk ve kollarını aç! Dört kere!', animasyon: 'yumurta', tur: 'sayi', adet: 4, tempoMs: 3000 },
    ekler: [H.kollar, H.zipla],
  },
  {
    id: 'trex',
    bolum: 'dinozor',
    ad: 'T-Rex',
    yer: 'T-Rex',
    simge: '🦖',
    bilgi: 'T-Rex’in dişleri bir muz kadar büyüktü ama kolları çok kısaydı!',
    ozel: { hikaye: 'T-Rex yürüyor!', baslik: 'Dirseklerini bük,\nbüyük adımlarla yürü!', sesli: 'T-Rex yürüyor! Dirseklerini bük, kollarını göğsüne yaklaştır ve büyük adımlarla yürü!', animasyon: 'trex', tur: 'sayi', adet: 8, tempoMs: 1300 },
    ekler: [H.comel, H.acKapa],
  },
  {
    id: 'brakiyozor',
    bolum: 'dinozor',
    ad: 'Brakiyozor',
    yer: 'Brakiyozor',
    simge: '🦕',
    bilgi: 'Brakiyozorun boynu o kadar uzundu ki ağaçların en tepesindeki yaprakları yiyebilirdi!',
    ozel: { hikaye: 'En tepedeki yapraklar!', baslik: 'Parmak ucunda yüksel,\nkollarını uzat!', sesli: 'En tepedeki yapraklara uzanalım! Parmak uçlarında yüksel, kollarını yukarı uzat! Dört kere!', animasyon: 'uzan', tur: 'sayi', adet: 4, tempoMs: 2200 },
    ekler: [H.dizler, H.kollar],
  },
  {
    id: 'pterozor',
    bolum: 'dinozor',
    ad: 'Pterozor',
    yer: 'Pterozor',
    simge: '🪶',
    bilgi: 'Pterozorlar dinozorların uçabilen akrabalarıydı. Bazılarının kanatları küçük bir uçak kadar genişti!',
    ozel: { hikaye: 'Gökyüzünde süzül!', baslik: 'Kollarını yana aç,\nyukarı aşağı salla!', sesli: 'Gökyüzünde süzülelim! Kollarını yana aç, yukarı aşağı salla!', animasyon: 'kanat', tur: 'sure', saniye: 10 },
    ekler: [H.comel, H.zipla],
  },
  {
    id: 'ayakizi',
    bolum: 'dinozor',
    ad: 'Ayak İzleri',
    yer: 'Ayak İzleri',
    simge: '👣',
    bilgi: 'Dinozorların ayak izleri taşa dönüşüp milyonlarca yıl kalmış. Bazı ayak izleri bir küvet kadar büyük!',
    ozel: { hikaye: 'Dev ayak izleri bırakalım!', baslik: 'Ayaklarını sırayla\nyere vur!', sesli: 'Dev ayak izleri bırakalım! Ayaklarını sırayla güm güm yere vur! On kere!', animasyon: 'tepin', tur: 'sayi', adet: 10, tempoMs: 900 },
    ekler: [H.kos, H.kollar],
  },
  {
    id: 'raptor',
    bolum: 'dinozor',
    ad: 'Raptor',
    yer: 'Raptor',
    simge: '🌿',
    bilgi: 'Raptorlar küçük ama çok hızlı dinozorlardı. Bir hindi kadar büyüklerdi ve tüyleri vardı!',
    ozel: { hikaye: 'Ormanda sessizce yürü!', baslik: 'Parmak uçlarında yürü!', sesli: 'Ormanda sessizce yürüyelim! Parmak uçlarında yürü!', animasyon: 'parmakUcu', tur: 'sure', saniye: 8 },
    ekler: [H.acKapa, H.dizler],
  },
  {
    id: 'fosil',
    bolum: 'dinozor',
    ad: 'Fosil Kazısı',
    yer: 'Fosil Kazısı',
    simge: '🦴',
    bilgi: 'Dinozor kemiklerini bulan bilim insanlarına paleontolog denir. Kemikleri fırçayla yavaş yavaş temizlerler!',
    ozel: { hikaye: 'Dinozor kemiği bulalım!', baslik: 'Çömel, ellerinle\nyeri sırayla kaz!', sesli: 'Dinozor kemiği bulalım! Çömel ve ellerinle yeri sırayla kaz!', animasyon: 'kazi', tur: 'sayi', adet: 8, tempoMs: 1000 },
    ekler: [H.zipla, H.kollar],
  },
];

// 6. bölüm: Evde Macera. Evdeki yumuşak eşyalarla (oyuncak, yastık, çorap topu) hareket.
// Durak girişindeki kutu "Biliyor muydun?" yerine "Hazırla!" der: ne hazırlanacağını ve güvenlik notunu söyler.
// Balon bilerek yok: patlayan balon parçası küçük çocuklar için boğulma tehlikesi.
export const EVDE: Durak[] = [
  {
    id: 'oyuncak',
    bolum: 'evde',
    ad: 'Oyuncak',
    yer: 'Oyuncak',
    simge: '🧸',
    bilgi: 'En sevdiğin oyuncağı yanına al. Yumuşak bir oyuncak olursa daha iyi!',
    ozel: { hikaye: 'Oyuncağını kurtar!', baslik: 'Çömel, oyuncağını al,\nyukarı kaldır!', sesli: 'Oyuncağını kurtaralım! Çömel, oyuncağını al ve başının üstüne kaldır! Beş kere!', animasyon: 'tasKaldir', tur: 'sayi', adet: 5, tempoMs: 2200 },
    ekler: [H.zipla, H.kollar],
  },
  {
    id: 'yastik',
    bolum: 'evde',
    ad: 'Yastık',
    yer: 'Yastık',
    simge: '🛏️',
    bilgi: 'Bir yastık hazırla. Etrafında eşya olmayan, boş bir yer seç!',
    ozel: { hikaye: 'Yastık taşıyalım!', baslik: 'Yastığı başının üstünde\ntut, yerinde yürü!', sesli: 'Yastık taşıyalım! Yastığı başının üstünde tut ve dizlerini kaldırarak yerinde yürü!', animasyon: 'basUstu', tur: 'sayi', adet: 10, tempoMs: 1000 },
    ekler: [H.comel, H.acKapa],
  },
  {
    id: 'corap',
    bolum: 'evde',
    ad: 'Çorap Topu',
    yer: 'Çorap Topu',
    simge: '🧦',
    bilgi: 'Bir çift çorabı yuvarlayıp top yap. Çorap topu yumuşaktır, kimseyi acıtmaz!',
    ozel: { hikaye: 'Topu yakala!', baslik: 'Topu bir elinden\nöbür eline at!', sesli: 'Çorap topunu yakalayalım! Topu bir elinden öbür eline at! On kere!', animasyon: 'elden', tur: 'sayi', adet: 10, tempoMs: 1100 },
    ekler: [H.dizler, H.kollar],
  },
  {
    id: 'yastikada',
    bolum: 'evde',
    ad: 'Yastık Adası',
    yer: 'Yastık Adası',
    simge: '🏝️',
    bilgi: 'Yastığı yere koy. Üstüne basma, yanından atla. Kaygan yerde değil, halının üstünde oyna!',
    ozel: { hikaye: 'Adanın üstünden atla!', baslik: 'Yastığın üstünden\nyana zıpla!', sesli: 'Yastığı yere koy. Yastığın üstünden bir sağa, bir sola zıpla! Altı kere!', animasyon: 'yanaZipla', tur: 'sayi', adet: 6, tempoMs: 1600 },
    ekler: [H.kos, H.comel],
  },
  {
    id: 'dans',
    bolum: 'evde',
    ad: 'Oyuncak Dansı',
    yer: 'Dans',
    simge: '🎶',
    bilgi: 'Oyuncağın da dans etmek istiyor! Müzik yoksa bir şarkı mırıldanabilirsin.',
    ozel: { hikaye: 'Oyuncağınla dans et!', baslik: 'Oyuncağına sarıl,\nsağa sola sallan!', sesli: 'Oyuncağınla dans edelim! Oyuncağına sarıl ve sağa sola sallan!', animasyon: 'sallan', tur: 'sure', saniye: 10 },
    ekler: [H.zipla, H.acKapa],
  },
  {
    id: 'kanguru',
    bolum: 'evde',
    ad: 'Kanguru',
    yer: 'Kanguru',
    simge: '🦘',
    bilgi: 'Çorap topunu yine hazırla. Kangurular zıplayarak ilerler ve yavrularını karınlarındaki cepte taşır!',
    ozel: { hikaye: 'Topu düşürmeden zıpla!', baslik: 'Topu dizlerinin\narasında tut, zıpla!', sesli: 'Çorap topunu dizlerinin arasında tut ve düşürmeden zıpla! Dört kere!', animasyon: 'zipla', tur: 'sayi', adet: 4, tempoMs: 1600 },
    ekler: [H.kollar, H.dizler],
  },
  {
    id: 'toplama',
    bolum: 'evde',
    ad: 'Toplama',
    yer: 'Toplama',
    simge: '🧺',
    bilgi: 'Oyun bitince eşyaları toplamak da bir harekettir. Hadi her şeyi yerine koyalım!',
    ozel: { hikaye: 'Her şeyi yerine koy!', baslik: 'Çömel, eşyayı al,\nyerine koy!', sesli: 'Toplama zamanı! Çömel, eşyayı al ve yerine koy! Altı kere!', animasyon: 'topla', tur: 'sayi', adet: 6, tempoMs: 2000 },
    ekler: [H.zipla, H.kollar],
  },
];

type Bolum = {
  ad: string;
  duraklar: Durak[];
  sahne: string; // haritanın sahnesi
  onceki: BolumId | null; // bu bölüm, önceki bölüm bitince açılır
  serbest?: boolean; // duraklar istenen sırayla oynanır (Spor Kampı)
  kutuBaslik?: string; // durak girişindeki bilgi kutusunun başlığı (varsayılan "Biliyor muydun?")
};

export const BOLUMLER: Record<BolumId, Bolum> = {
  turkiye: { ad: 'Türkiye Turu', duraklar: TURKIYE, sahne: 'Harita', onceki: null },
  dunya: { ad: 'Dünya Harikaları', duraklar: DUNYA, sahne: 'Dunya', onceki: 'turkiye' },
  uzay: { ad: 'Uzay Yolculuğu', duraklar: UZAY, sahne: 'Uzay', onceki: 'dunya' },
  spor: { ad: 'Spor Kampı', duraklar: SPOR, sahne: 'Spor', onceki: 'uzay', serbest: true },
  dinozor: { ad: 'Dinozorlar Diyarı', duraklar: DINOZOR, sahne: 'Dinozor', onceki: 'spor' },
  evde: { ad: 'Evde Macera', duraklar: EVDE, sahne: 'Evde', onceki: 'dinozor', kutuBaslik: 'Hazırla!' },
};

// Bölümlerin oyundaki sırası.
export const BOLUM_SIRASI = Object.keys(BOLUMLER) as BolumId[];
export const TUM_DURAKLAR: Durak[] = BOLUM_SIRASI.flatMap((id) => BOLUMLER[id].duraklar);

// Bölüm açık mı? (önceki bölüm bittiyse ya da beta için hepsi açıldıysa)
export function bolumuAcikMi(id: BolumId): boolean {
  const onceki = BOLUMLER[id].onceki;
  return !onceki || bolumAcik(BOLUMLER[onceki].duraklar.map((d) => d.id));
}

export function durakBul(id: string): Durak {
  return TUM_DURAKLAR.find((d) => d.id === id) ?? TURKIYE[0];
}

// Durağın bölümünün harita sahnesi ('Harita', 'Dunya', 'Uzay', ...).
export const haritaSahnesi = (d: Durak) => BOLUMLER[d.bolum].sahne;

// Bir duraktaki 5 hareketlik kısa antrenman.
export function oturum(durak: Durak): Hareket[] {
  return [ISINMA, durak.ozel, ...durak.ekler, SOGUMA];
}

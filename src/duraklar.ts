import { Hareket, K, birlesik, hikayeli } from './hareketler';
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
  soru?: string; // durak sonunda "Evde birine sor: ..." (merak ve pekiştirme)
  ozel: Hareket; // durağa özel hareket
  ekler: Hareket[]; // durağa ait 3 hikâyeli hareket
};

// Her durak: özel hareket + 3 hikâyeli hareket; hepsi o yerle bağlantılı ve YERİNDE yapılır.
// Kural (testte): sıralı bölümde bir hareket türü, önceki iki durakta kullanıldıysa tekrar kullanılmaz.
// Isınma, sürpriz an ve soğuma oturum.ts'de eklenir.
export const TURKIYE: Durak[] = [
  {
    id: 'istanbul',
    bolum: 'turkiye',
    ad: 'Boğaz ve Galata',
    yer: 'İstanbul',
    simge: '🌉',
    bilgi: 'İstanbul’un bir yarısı Avrupa’da, öbür yarısı Asya’da! Köprüden geçince bir kıtadan öbür kıtaya geçersin.',
    soru: 'Evde birine sor: Hangi şehir iki kıtadadır?',
    ozel: hikayeli(K.uzan, 'Galata Kulesi’nin tepesine bak!'),
    ekler: [
      hikayeli(K.yanAdim, 'Köprüden Asya’ya geç, Avrupa’ya dön!'),
      hikayeli(K.kulac, 'Boğaz’da yüzme yarışı var!'),
      hikayeli(K.zipla, 'Vapur düdüğü çaldı!', { ritim: 'hizli' }),
    ],
  },
  {
    id: 'truva',
    bolum: 'turkiye',
    ad: 'Truva Atı',
    yer: 'Çanakkale',
    simge: '🐴',
    bilgi: 'Truva çok eski bir şehir; kalıntıları bugün Çanakkale’de. Efsaneye göre insanlar kocaman tahta bir atın içine saklanmış!',
    soru: 'Evde birine sor: Truva Atı’nın içinde kimler saklanmış?',
    ozel: hikayeli(K.kos, 'Truva Atı’na yetiş!'),
    ekler: [
      hikayeli(K.comel, 'Atın içine saklan, sonra dışarı bak!'),
      hikayeli(K.tirman, 'Kalın surlara tırmanalım!'),
      hikayeli(K.kolSalla, 'Surların üstünden el salla!'),
    ],
  },
  {
    id: 'pamukkale',
    bolum: 'turkiye',
    ad: 'Pamukkale',
    yer: 'Denizli',
    simge: '🏞️',
    bilgi: 'Pamukkale’nin bembeyaz basamakları kara benzer ama kar değildir! Sıcak su taşları beyaza boyamıştır; orada ayakkabısız yürünür.',
    soru: 'Evde birine sor: Pamukkale neden bembeyaz?',
    ozel: hikayeli(K.yuru, 'Beyaz basamaklardan inelim!'),
    ekler: [
      hikayeli(K.tekAyak, 'Sıcak suya önce tek ayağını sok!'),
      hikayeli(K.kollar, 'Sıcak sudan buhar yükseliyor!', { ritim: 'yavas', adet: 4 }),
      hikayeli(K.acKapa, 'Su birikintilerinin üstünden atla!'),
    ],
  },
  {
    id: 'kapadokya',
    bolum: 'turkiye',
    ad: 'Kapadokya',
    yer: 'Nevşehir',
    simge: '🎈',
    bilgi: 'Kapadokya’da şapkalı kocaman kayalar var, adları peri bacası! Sabahları gökyüzü rengârenk sıcak hava balonlarıyla dolar.',
    soru: 'Evde birine sor: Peri bacası nedir?',
    ozel: hikayeli(K.balon, 'Balonlar havalanıyor!'),
    ekler: [
      hikayeli(K.kocaman, 'Balon şişiyor, kocaman oluyor!'),
      hikayeli(K.yanaEgil, 'Balon rüzgârda sallanıyor!'),
      hikayeli(K.parmakUcu, 'Yeraltı şehrinde sessizce yürüyelim!'),
    ],
  },
  {
    id: 'nemrut',
    bolum: 'turkiye',
    ad: 'Nemrut Dağı',
    yer: 'Adıyaman',
    simge: '⛰️',
    bilgi: 'Nemrut Dağı’nın tepesinde çok eskiden yapılmış kocaman taş heykeller var. İnsanlar güneşin doğuşunu izlemek için gece yola çıkar!',
    soru: 'Evde birine sor: Güneş hangi yönden doğar?',
    ozel: hikayeli(K.tasKaldir, 'Nemrut’ta güneş doğuyor, güneşi selamla!'),
    ekler: [
      hikayeli(K.tirman, 'Nemrut Dağı’na tırmanalım!', { ritim: 'yavas', adet: 6 }),
      hikayeli(K.piramit, 'Dağın tepesi üçgen!'),
      hikayeli(K.engel, 'Yoldaki taşların üstünden atla!'),
    ],
  },
  {
    id: 'gobeklitepe',
    bolum: 'turkiye',
    ad: 'Göbeklitepe',
    yer: 'Şanlıurfa',
    simge: '🪨',
    bilgi: 'Göbeklitepe on bir bin yaşında, dünyanın en eski yapılarından biri! Kocaman taşlarına tilki, yaban domuzu ve kuş resimleri oyulmuş.',
    soru: 'Evde birine sor: Göbeklitepe’nin taşlarında hangi hayvanlar var?',
    ozel: hikayeli(K.belDondur, 'Göbeklitepe’de göbeğini çevir!', { baslik: 'Ellerini beline koy,\ngöbeğini çevir!' }),
    ekler: [
      hikayeli(K.tHarfi, 'Kocaman taşlar T harfine benziyor! Sen de T harfi ol!'),
      hikayeli(K.donus, 'Taşların etrafına bak!'),
      hikayeli(K.kazi, 'Bilim insanları burayı kazarak buldu!'),
    ],
  },
  {
    id: 'karadeniz',
    bolum: 'turkiye',
    ad: 'Karadeniz',
    yer: 'Trabzon',
    simge: '🌲',
    bilgi: 'Karadeniz’de çok yağmur yağar, bu yüzden her yer yemyeşildir! Çay bahçeleri ve yüksek yaylalar buradadır.',
    soru: 'Evde birine sor: Çay hangi bölgemizde yetişir?',
    ozel: hikayeli(K.horon, 'Karadeniz müziği çalıyor!'),
    ekler: [
      hikayeli(K.zipla, 'Yağmur damlalarının üstünden zıpla!'),
      hikayeli(K.uzan, 'Uzun ağaçların tepesine uzan!'),
      hikayeli(K.kanat, 'Yaylada kartallar süzülüyor!'),
    ],
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
    bilgi: 'Efes’teki Artemis Tapınağı eskiden dünyanın yedi harikasından biriydi. Bugün yerinde tek bir sütun kaldı!',
    soru: 'Evde birine sor: Dünyanın yedi harikasından birini biliyor musun?',
    ozel: hikayeli(K.sutun, 'Tek sütun hâlâ ayakta!'),
    ekler: [
      hikayeli(K.kulac, 'Efes eskiden deniz kıyısındaydı, yüzelim!'),
      hikayeli(K.comel, 'Antik tiyatroda otur, alkış için kalk!'),
      hikayeli(K.acKapa, 'Kütüphanenin önünde zıpla!'),
    ],
  },
  {
    id: 'kolezyum',
    bolum: 'dunya',
    konum: [12.49, 41.89],
    ad: 'Kolezyum',
    yer: 'Roma',
    simge: '🏟️',
    bilgi: 'Kolezyum iki bin yaşında kocaman bir yapı. İçine elli bin kişi sığarmış, bugün bir müze!',
    soru: 'Evde birine sor: Kolezyum hangi ülkede?',
    ozel: hikayeli(K.kos, 'Kolezyum’da koşalım!'),
    ekler: [
      hikayeli(K.dizler, 'Kolezyum’un basamaklarını çık!'),
      hikayeli(K.kocaman, 'Kolezyum çok büyük, sen de kocaman ol!'),
      hikayeli(K.kolSalla, 'Herkese el salla!'),
    ],
  },
  {
    id: 'piramitler',
    bolum: 'dunya',
    konum: [31.13, 29.98],
    ad: 'Piramitler',
    yer: 'Mısır',
    simge: '🔺',
    bilgi: 'Büyük Piramit dört bin beş yüz yıl önce yapıldı. Milyonlarca kocaman taşı insanlar birlikte taşıdı!',
    soru: 'Evde birine sor: Piramitler hangi ülkede?',
    ozel: hikayeli(K.piramit, 'Piramit olalım!'),
    ekler: [
      hikayeli(K.parmakUcu, 'Kum çok sıcak, dikkat!'),
      hikayeli(K.kazi, 'Kumda gizli hazine ara!'),
      hikayeli(K.yanaEgil, 'Nil kıyısında palmiyeler rüzgârda eğiliyor!'),
    ],
  },
  {
    id: 'petra',
    bolum: 'dunya',
    konum: [35.44, 30.33],
    ad: 'Petra',
    yer: 'Ürdün',
    simge: '🏜️',
    bilgi: 'Petra, kayaların içine oyulmuş pembe bir şehir. Evler duvar örülerek değil, kaya oyularak yapılmış!',
    soru: 'Evde birine sor: Kayanın içine ev yapılır mı?',
    ozel: hikayeli(K.yanAdim, 'Dar kanyondan yan yan geçelim!'),
    ekler: [
      hikayeli(K.tirman, 'Kayadaki sekiz yüz basamağı çık!'),
      hikayeli(K.zipla, 'Pembe kayaların arasında zıpla!', { ritim: 'yavas' }),
      hikayeli(K.kollar, 'Pembe kayaları selamla!'),
    ],
  },
  {
    id: 'tacmahal',
    bolum: 'dunya',
    konum: [78.04, 27.17],
    ad: 'Tac Mahal',
    yer: 'Hindistan',
    simge: '🌷',
    bilgi: 'Tac Mahal bembeyaz mermerden yapılmış. Güneş batarken rengi pembeye döner!',
    soru: 'Evde birine sor: Mermer ne renktir?',
    ozel: hikayeli(K.donus, 'Tac Mahal’in bahçesinde dönelim!'),
    ekler: [
      hikayeli(K.uzan, 'Beyaz kubbenin tepesine bak!'),
      hikayeli(K.tekAyak, 'Havuzun kenarında dengede dur!'),
      hikayeli(K.kanat, 'Bahçede tavus kuşları var!'),
    ],
  },
  {
    id: 'cinseddi',
    bolum: 'dunya',
    konum: [116.57, 40.43],
    ad: 'Çin Seddi',
    yer: 'Çin',
    simge: '🧱',
    bilgi: 'Çin Seddi o kadar uzun ki baştan sona yürümek aylar sürer! Uzaydan görünür diye bilinir ama aslında uzaydan gözle görülmez.',
    soru: 'Evde birine sor: Çin Seddi uzaydan görünür mü?',
    ozel: hikayeli(K.yuru, 'Uzun duvarda yürüyelim!', { adet: 12, tempoMs: 900 }),
    ekler: [
      hikayeli(K.kos, 'Duvar çok uzun, hızlanalım!'),
      hikayeli(K.comel, 'Kulelerden dışarı bak!', { ritim: 'hizli' }),
      hikayeli(K.yanaEgil, 'Panda bambuya uzanıyor!'),
    ],
  },
  {
    id: 'machupicchu',
    bolum: 'dunya',
    konum: [-72.55, -13.16],
    ad: 'Machu Picchu',
    yer: 'Peru',
    simge: '⛰️',
    bilgi: 'Machu Picchu bulutların arasında, yüksek bir dağın tepesinde kurulmuş bir şehir. Orada lamalar dolaşır!',
    soru: 'Evde birine sor: Lama nasıl bir hayvandır?',
    ozel: hikayeli(K.tirman, 'Machu Picchu’ya tırmanalım!'),
    ekler: [
      hikayeli(K.balon, 'Dağın tepesinde güneş doğuyor!'),
      hikayeli(K.acKapa, 'Lamalarla dans et!'),
      hikayeli(K.zipla, 'Bulutların üstünden zıpla!', { ritim: 'hizli' }),
    ],
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
    soru: 'Evde birine sor: Güneş’e en yakın gezegen hangisi?',
    ozel: hikayeli(K.kos, 'En hızlı gezegen Merkür!'),
    ekler: [
      hikayeli(K.engel, 'Kraterlerin üstünden atla!'),
      hikayeli(K.kollar, 'Güneş’e merhaba de!'),
      hikayeli(K.comel, 'Güneş çok parlak, gölgeye saklan!'),
    ],
  },
  {
    id: 'venus',
    bolum: 'uzay',
    ad: 'Venüs',
    yer: 'Venüs',
    simge: '✨',
    bilgi: 'Venüs gökyüzündeki en parlak gezegen. Kendi etrafında ters yöne döner!',
    soru: 'Evde birine sor: Akşam gökyüzündeki en parlak gezegen hangisi?',
    ozel: hikayeli(K.donus, 'Venüs ters dönüyor!'),
    ekler: [
      hikayeli(K.tekAyak, 'Kalın bulutların üstünde dengede dur!'),
      hikayeli(K.uzan, 'Parlayan Venüs’e uzan!'),
      hikayeli(K.dizler, 'Uzay aracından in!'),
    ],
  },
  {
    id: 'ay',
    bolum: 'uzay',
    ad: 'Ay',
    yer: 'Ay',
    simge: '🌙',
    bilgi: 'Ay’da yerçekimi Dünya’dakinden altı kat azdır. Orada çok yükseğe zıplayabilirsin!',
    soru: 'Evde birine sor: Ay’a giden ilk insan kim?',
    ozel: hikayeli(K.zipla, 'Ay’da her şey yavaş!', { ritim: 'yavas' }),
    ekler: [
      hikayeli(K.parmakUcu, 'Ay’da ayak izi bırak!'),
      hikayeli(K.kazi, 'Ay tozunu incele!'),
      hikayeli(K.kolSalla, 'Dünya’ya el salla!'),
    ],
  },
  {
    id: 'mars',
    bolum: 'uzay',
    ad: 'Mars',
    yer: 'Mars',
    simge: '🔴',
    bilgi: 'Mars’a kırmızı gezegen denir. Güneş Sistemi’nin en yüksek dağı Olimpos, Mars’tadır!',
    soru: 'Evde birine sor: Mars neden kırmızı?',
    ozel: hikayeli(K.tirman, 'Mars’taki dev dağa tırmanalım!'),
    ekler: [
      hikayeli(K.tepin, 'Kırmızı tozu havaya kaldır!'),
      hikayeli(K.kulac, 'Mars robotu kollarını çeviriyor!'),
      hikayeli(K.acKapa, 'Kırmızı gezegende zıpla!'),
    ],
  },
  {
    id: 'jupiter',
    bolum: 'uzay',
    ad: 'Jüpiter',
    yer: 'Jüpiter',
    simge: '🟠',
    bilgi: 'Jüpiter en büyük gezegen. İçine binden fazla Dünya sığar!',
    soru: 'Evde birine sor: En büyük gezegen hangisi?',
    ozel: hikayeli(K.kocaman, 'En büyük gezegen Jüpiter!'),
    ekler: [
      hikayeli(K.donus, 'Kırmızı fırtına dönüyor!', { ritim: 'hizli' }),
      hikayeli(K.comel, 'Jüpiter’in yerçekimi çok güçlü!', { ritim: 'yavas', adet: 4 }),
      hikayeli(K.basket, 'Jüpiter’in aylarına uzan!'),
    ],
  },
  {
    id: 'saturn',
    bolum: 'uzay',
    ad: 'Satürn',
    yer: 'Satürn',
    simge: '🪐',
    bilgi: 'Satürn’ün buzdan ve kayadan yapılmış kocaman halkaları var!',
    soru: 'Evde birine sor: Halkaları olan gezegen hangisi?',
    ozel: hikayeli(K.belDondur, 'Satürn’ün halkaları dönüyor!'),
    ekler: [
      hikayeli(K.yanAdim, 'Halkaların üstünde kayalım!'),
      hikayeli(K.kollar, 'Buz parçaları parlıyor!', { ritim: 'hizli' }),
      hikayeli(K.dizler, 'Halkanın etrafında yürüyelim!', { ritim: 'yavas', adet: 8 }),
    ],
  },
  {
    id: 'uranus',
    bolum: 'uzay',
    ad: 'Uranüs',
    yer: 'Uranüs',
    simge: '🔵',
    bilgi: 'Uranüs yan yatmış hâlde döner, sanki yuvarlanan bir top!',
    soru: 'Evde birine sor: Yan yatarak dönen gezegen hangisi?',
    ozel: hikayeli(K.yanaEgil, 'Yan yatan gezegen Uranüs!'),
    ekler: [
      hikayeli(K.tekAyak, 'Sen de dengede dur!'),
      hikayeli(K.zipla, 'Buz gezegeninde zıpla!'),
      hikayeli(K.parmakUcu, 'Buzun üstünde dikkatli yürü!'),
    ],
  },
  {
    id: 'neptun',
    bolum: 'uzay',
    ad: 'Neptün',
    yer: 'Neptün',
    simge: '🌀',
    bilgi: 'Neptün en uzak gezegen. Orada çok güçlü rüzgârlar eser!',
    soru: 'Evde birine sor: Güneş’e en uzak gezegen hangisi?',
    ozel: hikayeli(K.kolSalla, 'Neptün’de rüzgâr esiyor!'),
    ekler: [
      hikayeli(K.kos, 'Rüzgâr çok hızlı, sen de hızlan!'),
      hikayeli(K.kanat, 'Rüzgârda süzül!'),
      hikayeli(K.balon, 'Eve dönüş vakti!'),
    ],
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
    soru: 'Evde birine sor: Bir futbol takımında kaç oyuncu var?',
    ozel: hikayeli(K.sut, 'Topa vur!'),
    ekler: [
      hikayeli(K.dizler, 'Topu dizinle sektir!'),
      hikayeli(K.yanAdim, 'Topla yana kaç!', { ritim: 'hizli' }),
      birlesik('Gol oldu, sevin!', 'Zıpla, zıpla,\nkollarını kaldır!', ['zipla', 'zipla', 'kollar'], 6, 1200),
    ],
  },
  {
    id: 'basketbol',
    bolum: 'spor',
    ad: 'Basketbol',
    yer: 'Basketbol',
    simge: '🏀',
    bilgi: 'Basketbol potası yerden üç metre yüksekte. Bu, neredeyse iki büyüğün boyu kadar!',
    soru: 'Evde birine sor: Basket potası ne kadar yüksek?',
    ozel: hikayeli(K.basket, 'Smaç zamanı!'),
    ekler: [
      hikayeli(K.kolSalla, 'Savunma yap!', { ritim: 'hizli' }),
      hikayeli(K.uzan, 'Pota çok yüksek!'),
      hikayeli(K.kos, 'Sahada koş!'),
    ],
  },
  {
    id: 'yuzme',
    bolum: 'spor',
    ad: 'Yüzme',
    yer: 'Yüzme',
    simge: '🏊',
    bilgi: 'Yüzerken kollarımız sırayla suyu iter. Suyun içinde vücudumuz çok daha hafif gelir!',
    soru: 'Evde birine sor: Sen yüzmeyi biliyor musun?',
    ozel: hikayeli(K.kulac, 'Havuzda yüzelim!', { saniye: 10 }),
    ekler: [
      hikayeli(K.sutun, 'Suya atlamaya hazırlan!', { saniye: 4 }),
      hikayeli(K.tepin, 'Ayaklarınla suyu çırp!', { ritim: 'hizli' }),
      hikayeli(K.yanaEgil, 'Havuzdan çık, havlunla kurulan!'),
    ],
  },
  {
    id: 'jimnastik',
    bolum: 'spor',
    ad: 'Jimnastik',
    yer: 'Jimnastik',
    simge: '🤸',
    bilgi: 'Jimnastikçiler denge aletinde, avuç içi kadar ince bir tahtanın üstünde yürür, döner, hatta zıplar!',
    soru: 'Evde birine sor: Tek ayak üstünde ne kadar durabiliyorsun?',
    ozel: hikayeli(K.tekAyak, 'Denge zamanı!'),
    ekler: [
      hikayeli(K.acKapa, 'Yıldız atlayışı!'),
      hikayeli(K.kocaman, 'Kocaman bir açılış yap!'),
      hikayeli(K.belDondur, 'Esnek ol!'),
    ],
  },
  {
    id: 'tenis',
    bolum: 'spor',
    ad: 'Tenis',
    yer: 'Tenis',
    simge: '🎾',
    bilgi: 'Tenis topu çok hızlı gider. En hızlı servisler otoyoldaki bir arabadan bile hızlıdır!',
    soru: 'Evde birine sor: Tenis topu ne renktir?',
    ozel: hikayeli(K.raket, 'Topa vur!'),
    ekler: [
      hikayeli(K.comel, 'Alçak topu karşıla!'),
      hikayeli(K.yanAdim, 'Topa yetiş!'),
      hikayeli(K.engel, 'Fileden atla!'),
    ],
  },
  {
    id: 'voleybol',
    bolum: 'spor',
    ad: 'Voleybol',
    yer: 'Voleybol',
    simge: '🏐',
    bilgi: 'Voleybolda top yere düşmeden takım arkadaşları üç kez vurabilir. Herkes birbirine yardım eder!',
    soru: 'Evde birine sor: Voleybol kaç kişiyle oynanır?',
    ozel: hikayeli(K.voleybol, 'Topu ağın üstünden at!'),
    ekler: [
      hikayeli(K.dizler, 'Sahaya koşarak gir!', { ritim: 'hizli' }),
      hikayeli(K.zipla, 'Blok için zıpla!'),
      hikayeli(K.yanaEgil, 'Topa uzan!'),
    ],
  },
  {
    id: 'atletizm',
    bolum: 'spor',
    ad: 'Atletizm',
    yer: 'Atletizm',
    simge: '🏃',
    bilgi: 'Atletizmde koşucular yarışırken engellerin üstünden atlar. Engeller bir çocuğun belinden bile yüksektir!',
    soru: 'Evde birine sor: En hızlı koşan hayvan hangisi?',
    ozel: hikayeli(K.engel, 'Engelin üstünden atla!'),
    ekler: [
      hikayeli(K.kollar, 'Yarıştan önce kollarını hazırla!'),
      hikayeli(K.basket, 'Uzun atlama!'),
      hikayeli(K.kos, 'Bitiş çizgisine koş!', { saniye: 10 }),
    ],
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
    soru: 'Evde birine sor: Yumurtadan çıkan başka hangi hayvanlar var?',
    ozel: hikayeli(K.yumurta, 'Yumurta çatlıyor!'),
    ekler: [
      hikayeli(K.kollar, 'Yumurtadan yeni çıktın, gerin!', { ritim: 'yavas', adet: 4 }),
      hikayeli(K.zipla, 'Yavru dinozor sevinçten zıplıyor!'),
      hikayeli(K.comel, 'Annenin yanına sokul!'),
    ],
  },
  {
    id: 'trex',
    bolum: 'dinozor',
    ad: 'T-Rex',
    yer: 'T-Rex',
    simge: '🦖',
    bilgi: 'T-Rex’in dişleri bir muz kadar büyüktü ama kolları çok kısaydı! Kısa kollarıyla yüzünü bile kaşıyamazdı.',
    soru: 'Evde birine sor: T-Rex’in kolları neden kısaydı?',
    ozel: hikayeli(K.trex, 'T-Rex yürüyor!'),
    ekler: [
      hikayeli(K.kocaman, 'T-Rex çok büyük!'),
      hikayeli(K.kos, 'Sen T-Rex’ten hızlısın!'),
      hikayeli(K.acKapa, 'Toprak titriyor!'),
    ],
  },
  {
    id: 'brakiyozor',
    bolum: 'dinozor',
    ad: 'Brakiyozor',
    yer: 'Brakiyozor',
    simge: '🦕',
    bilgi: 'Brakiyozorun boynu o kadar uzundu ki ağaçların en tepesindeki yaprakları yiyebilirdi! Boyu dört katlı bir ev kadardı.',
    soru: 'Evde birine sor: Bitki yiyen bir dinozor biliyor musun?',
    ozel: hikayeli(K.uzan, 'En tepedeki yapraklara uzan!'),
    ekler: [
      hikayeli(K.yanaEgil, 'Uzun boynunla yan yapraklara uzan!'),
      hikayeli(K.dizler, 'Brakiyozor ağır ağır yürüyor!', { ritim: 'yavas', adet: 8 }),
      hikayeli(K.belDondur, 'Uzun kuyruğunu salla!'),
    ],
  },
  {
    id: 'pterozor',
    bolum: 'dinozor',
    ad: 'Pterozor',
    yer: 'Pterozor',
    simge: '🪶',
    bilgi: 'Pterozorlar dinozorların uçabilen akrabalarıydı. Bazılarının kanatları küçük bir uçak kadar genişti!',
    soru: 'Evde birine sor: Uçabilen hangi hayvanları biliyorsun?',
    ozel: hikayeli(K.kanat, 'Gökyüzünde süzül!', { saniye: 10 }),
    ekler: [
      hikayeli(K.tekAyak, 'Kayanın üstüne kon!', { saniye: 6 }),
      hikayeli(K.balon, 'Sıcak rüzgârla yüksel!'),
      hikayeli(K.comel, 'Balık yakalamak için alçal!', { ritim: 'hizli' }),
    ],
  },
  {
    id: 'ayakizi',
    bolum: 'dinozor',
    ad: 'Ayak İzleri',
    yer: 'Ayak İzleri',
    simge: '👣',
    bilgi: 'Dinozorların ayak izleri taşa dönüşüp milyonlarca yıl kalmış. Bazı ayak izleri bir küvet kadar büyük!',
    soru: 'Evde birine sor: Senin ayağın kaç numara?',
    ozel: hikayeli(K.tepin, 'Dev ayak izleri bırakalım!'),
    ekler: [
      hikayeli(K.yanAdim, 'Ayak izlerini takip et!'),
      hikayeli(K.zipla, 'İzden ize zıpla!', { ritim: 'yavas' }),
      hikayeli(K.kocaman, 'Bu iz ne kadar büyük!'),
    ],
  },
  {
    id: 'raptor',
    bolum: 'dinozor',
    ad: 'Raptor',
    yer: 'Raptor',
    simge: '🌿',
    bilgi: 'Raptorlar küçük ama çok hızlı dinozorlardı. Bir hindi kadar büyüklerdi ve tüyleri vardı!',
    soru: 'Evde birine sor: Tüylü dinozorlar var mıydı?',
    ozel: hikayeli(K.parmakUcu, 'Ormanda sessizce yürü!'),
    ekler: [
      hikayeli(K.kos, 'Raptor çok hızlı!', { saniye: 6 }),
      hikayeli(K.donus, 'Etrafına bak!'),
      hikayeli(K.engel, 'Ağaç köklerinin üstünden atla!'),
    ],
  },
  {
    id: 'fosil',
    bolum: 'dinozor',
    ad: 'Fosil Kazısı',
    yer: 'Fosil Kazısı',
    simge: '🦴',
    bilgi: 'Dinozor kemiklerini bulan bilim insanlarına paleontolog denir. Kemikleri fırçayla yavaş yavaş temizlerler!',
    soru: 'Evde birine sor: Dinozor kemiklerini nerede görebiliriz?',
    ozel: hikayeli(K.kazi, 'Dinozor kemiği bulalım!'),
    ekler: [
      hikayeli(K.tasKaldir, 'Buldun! Hayali kemiği havaya kaldır!'),
      hikayeli(K.kolSalla, 'Kemik müzeye gidiyor, el salla!'),
      hikayeli(K.acKapa, 'Dinozor kâşifi oldun!', { ritim: 'hizli' }),
    ],
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
    ozel: hikayeli(K.tasKaldir, 'Oyuncağını kurtar!', { baslik: 'Çömel, oyuncağını al,\nyukarı kaldır!' }),
    ekler: [
      hikayeli(K.yanaEgil, 'Oyuncağını başının üstünde tut!'),
      hikayeli(K.zipla, 'Oyuncağın da zıplamak istiyor!'),
      hikayeli(K.donus, 'Oyuncağına odayı göster!'),
    ],
  },
  {
    id: 'yastik',
    bolum: 'evde',
    ad: 'Yastık',
    yer: 'Yastık',
    simge: '🛏️',
    bilgi: 'Bir yastık hazırla. Etrafında eşya olmayan, boş bir yer seç!',
    ozel: { hikaye: 'Yastık taşıyalım!', baslik: 'Yastığı başının üstünde\ntut, yerinde yürü!', sesli: 'Yastık taşıyalım! Yastığı başının üstünde tut ve dizlerini kaldırarak yerinde yürü!', animasyon: 'basUstu', tur: 'sayi', adet: 10, tempoMs: 1000 },
    ekler: [
      hikayeli(K.comel, 'Yastığı yere koy, sonra al!', { baslik: 'Çömel, yastığı yere koy,\nsonra al ve kalk!' }),
      hikayeli(K.kocaman, 'Yastığı bırak, kocaman ol!'),
      hikayeli(K.tekAyak, 'Yastığa sarıl, dengede dur!', { saniye: 6 }),
    ],
  },
  {
    id: 'corap',
    bolum: 'evde',
    ad: 'Çorap Topu',
    yer: 'Çorap Topu',
    simge: '🧦',
    bilgi: 'Bir çift çorabı yuvarlayıp top yap. Çorap topu yumuşaktır, kimseyi acıtmaz!',
    ozel: { hikaye: 'Topu yakala!', baslik: 'Topu bir elinden\nöbür eline at!', sesli: 'Çorap topunu yakalayalım! Topu bir elinden öbür eline at! On kere!', animasyon: 'elden', tur: 'sayi', adet: 10, tempoMs: 1100 },
    ekler: [
      hikayeli(K.uzan, 'Topu tavana doğru tut!'),
      hikayeli(K.basket, 'Topla smaç yap!', { baslik: 'Topu tut, çömel, zıpla,\nkollarını yukarı uzat!' }),
      hikayeli(K.kollar, 'Topu yukarı kaldır, indir!', { ritim: 'hizli' }),
    ],
  },
  {
    id: 'yastikada',
    bolum: 'evde',
    ad: 'Yastık Adası',
    yer: 'Yastık Adası',
    simge: '🏝️',
    bilgi: 'Yastığı yere koy. Üstüne basma, yanından atla. Kaygan yerde değil, halının üstünde oyna!',
    ozel: { hikaye: 'Adanın üstünden atla!', baslik: 'Yastığın üstünden\nyana zıpla!', sesli: 'Yastığı yere koy. Yastığın üstünden bir sağa, bir sola zıpla! Altı kere!', animasyon: 'yanaZipla', tur: 'sayi', adet: 6, tempoMs: 1600 },
    ekler: [
      hikayeli(K.kos, 'Ada kaçıyor, hızlan!'),
      hikayeli(K.dizler, 'Adanın yanında dur!'),
      hikayeli(K.acKapa, 'Adaya bayrak dik!'),
    ],
  },
  {
    id: 'dans',
    bolum: 'evde',
    ad: 'Oyuncak Dansı',
    yer: 'Dans',
    simge: '🎶',
    bilgi: 'Oyuncağın da dans etmek istiyor! Müzik yoksa bir şarkı mırıldanabilirsin.',
    ozel: { hikaye: 'Oyuncağınla dans et!', baslik: 'Oyuncağına sarıl,\nsağa sola sallan!', sesli: 'Oyuncağınla dans edelim! Oyuncağına sarıl ve sağa sola sallan!', animasyon: 'sallan', tur: 'sure', saniye: 10 },
    ekler: [
      hikayeli(K.belDondur, 'Belini döndürerek dans et!'),
      hikayeli(K.kolSalla, 'Herkes dansa!'),
      hikayeli(K.horon, 'Ritim tut!', { saniye: 6 }),
    ],
  },
  {
    id: 'kanguru',
    bolum: 'evde',
    ad: 'Kanguru',
    yer: 'Kanguru',
    simge: '🦘',
    bilgi: 'Çorap topunu yine hazırla. Kangurular zıplayarak ilerler ve yavrularını karınlarındaki cepte taşır!',
    ozel: { hikaye: 'Topu düşürmeden zıpla!', baslik: 'Topu dizlerinin\narasında tut, zıpla!', sesli: 'Çorap topunu dizlerinin arasında tut ve düşürmeden zıpla! Dört kere!', animasyon: 'zipla', tur: 'sayi', adet: 4, tempoMs: 1600 },
    ekler: [
      hikayeli(K.comel, 'Topu yerden al!'),
      hikayeli(K.tirman, 'Ağaç kangurusu ağaca tırmanıyor, sen de tırman!'),
      hikayeli(K.parmakUcu, 'Yavru kanguru uyuyor, sessiz ol!'),
    ],
  },
  {
    id: 'toplama',
    bolum: 'evde',
    ad: 'Toplama',
    yer: 'Toplama',
    simge: '🧺',
    bilgi: 'Oyun bitince eşyaları toplamak da bir harekettir. Hadi her şeyi yerine koyalım!',
    ozel: { hikaye: 'Her şeyi yerine koy!', baslik: 'Çömel, eşyayı al,\nyerine koy!', sesli: 'Toplama zamanı! Çömel, eşyayı al ve yerine koy! Altı kere!', animasyon: 'topla', tur: 'sayi', adet: 6, tempoMs: 2000 },
    ekler: [
      hikayeli(K.yanaEgil, 'Raftaki yerine uzan!'),
      { hikaye: 'Yastığı yerine götür!', baslik: 'Yastığı başının üstünde\ntut, yerinde yürü!', sesli: 'Yastığı yerine götür! Yastığı başının üstünde tut, yerinde yürü!', animasyon: 'basUstu', tur: 'sayi', adet: 8, tempoMs: 1000 },
      hikayeli(K.kocaman, 'Oda tertemiz oldu!'),
    ],
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

// Durağın kendi 4 hareketi (özel + 3). Isınma, sürpriz ve soğuma oturum.ts'de eklenir.
export function oturum(durak: Durak): Hareket[] {
  return [durak.ozel, ...durak.ekler];
}

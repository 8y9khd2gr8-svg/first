import { K, hikayeli } from './hareketler';
import type { Durak } from './duraklar';

// İstanbul'un 7 Tepesi (Şehir Turları): HAZIRLIK. Çizer haritayı ve durak resimlerini çizince bölüm olarak açılır;
// o zamana kadar Büyük Macera'da "Yakında" görünür. Açarken: BolumId'ye 'tepeler', BOLUMLER satırı, BolumScene AYARLAR,
// metinler.ts cümleleri, rozet, sertifika unvanı, BOLUM_YONU (CLAUDE.md "Yeni bölüm eklemek").
// Kural: ibadet yeri olarak kullanılan yapılar durak olmaz; her tepe ibadet dışı bir yapıyla anlatılır.
// Bilgiler taslak: yayından önce bir kez daha doğrulanmalı (docs/yedi-tepe.md).

export type TepeDurak = Omit<Durak, 'bolum'>;

export const TEPELER: TepeDurak[] = [
  {
    id: 'topkapi',
    konum: [28.983, 41.011],
    ad: 'Topkapı Sarayı',
    yer: '1. Tepe',
    simge: '🏰',
    bilgi: 'Birinci tepede Topkapı Sarayı var. Padişahlar yüzlerce yıl burada yaşadı; bahçesinden hem Boğaz hem Marmara Denizi görünür!',
    soru: 'Evde birine sor: Bir sarayda yaşasaydın en çok hangi odayı isterdin?',
    ozel: hikayeli(K.tHarfi, 'Saray nöbetçisi dimdik bekliyor!'),
    ekler: [
      hikayeli(K.kolSalla, 'Denizdeki gemilere el salla!'),
      hikayeli(K.parmakUcu, 'Saray bahçesinde sessizce yürü!'),
      hikayeli(K.uzan, 'Saray kapısındaki süslere uzan!'),
    ],
  },
  {
    id: 'cemberlitas',
    konum: [28.971, 41.008],
    ad: 'Çemberlitaş',
    yer: '2. Tepe',
    simge: '🗿',
    bilgi: 'İkinci tepedeki Çemberlitaş, yaklaşık 1700 yıllık kocaman bir taş sütun. Çatlamasın diye etrafı demir çemberlerle sarılmış, adı da buradan geliyor!',
    soru: 'Evde birine sor: Evimizde çember biçiminde neler var?',
    ozel: hikayeli(K.sutun, 'Çemberlitaş dimdik duruyor!'),
    ekler: [
      hikayeli(K.belDondur, 'Belinle çemberi çevir!'),
      hikayeli(K.zipla, 'Sütunun tepesini görmek için zıpla!'),
      hikayeli(K.comel, 'Kapalıçarşı’da yere düşen boncukları topla!'),
    ],
  },
  {
    id: 'beyazit',
    konum: [28.964, 41.012],
    ad: 'Beyazıt Kulesi',
    yer: '3. Tepe',
    simge: '🗼',
    bilgi: 'Üçüncü tepedeki Beyazıt Kulesi’nden eskiden bütün şehre bakılır, yangın görülünce hemen haber verilirdi. Kule bugün İstanbul Üniversitesi’nin bahçesinde duruyor!',
    soru: 'Evde birine sor: Yangın olunca kimi ararız?',
    ozel: hikayeli(K.tirman, 'Kulenin merdivenlerini çık!'),
    ekler: [
      hikayeli(K.kollar, 'Kuleden kollarınla işaret ver!'),
      hikayeli(K.acKapa, 'Üniversite bahçesinde oyna!', { ritim: 'hizli' }),
      hikayeli(K.tekAyak, 'Kulenin tepesinden şehre bak, dengede dur!'),
    ],
  },
  {
    id: 'bozdogan',
    konum: [28.955, 41.016],
    ad: 'Bozdoğan Kemeri',
    yer: '4. Tepe',
    simge: '🌉',
    bilgi: 'Dördüncü tepenin yanından Bozdoğan Kemeri geçer. Romalılar 1600 yıldan uzun zaman önce şehre su taşımak için bu taş kemerleri yaptı!',
    soru: 'Evde birine sor: Musluktan akan su evimize nereden geliyor?',
    ozel: hikayeli(K.piramit, 'Kollarınla kocaman bir kemer yap!'),
    ekler: [
      hikayeli(K.yuru, 'Kemerin altından geç!'),
      hikayeli(K.yanaEgil, 'Kemerin bir ucuna, sonra öbür ucuna bak!'),
      hikayeli(K.yanAdim, 'Kemerin ayakları arasında adım at!'),
    ],
  },
  {
    id: 'cukurbostan',
    konum: [28.949, 41.026],
    ad: 'Çukurbostan',
    yer: '5. Tepe',
    simge: '🥕',
    bilgi: 'Beşinci tepede eskiden kocaman, açık bir su deposu vardı. Sonra içine bostan, yani sebze bahçesi yapıldı; adı Çukurbostan kaldı!',
    soru: 'Evde birine sor: Sen en çok hangi sebzeyi seversin?',
    ozel: hikayeli(K.kazi, 'Bostanda toprağı kaz!'),
    ekler: [
      hikayeli(K.tasKaldir, 'Hayali sebze sepetini yerden kaldır!'),
      hikayeli(K.uzan, 'Ağaçtaki elmalara uzan!'),
      hikayeli(K.kanat, 'Bostandaki kuşlara selam ver!', { saniye: 6 }),
    ],
  },
  {
    id: 'tekfur',
    konum: [28.94, 41.034],
    ad: 'Tekfur Sarayı',
    yer: '6. Tepe',
    simge: '🧱',
    bilgi: 'Altıncı tepede şehrin eski surları ve Tekfur Sarayı var. Bu sarayda bir zamanlar rengârenk çiniler yapılırdı!',
    soru: 'Evde birine sor: Evimizde çini ya da fayans nerede var?',
    ozel: hikayeli(K.tepin, 'Surlarda nöbet değişiyor!'),
    ekler: [
      hikayeli(K.donus, 'Surların üstünden şehre bak!'),
      hikayeli(K.engel, 'Hayali taşların üstünden zıpla!'),
      hikayeli(K.kollar, 'Çinileri boyamak için fırçanı kaldır, indir!', { ritim: 'yavas' }),
    ],
  },
  {
    id: 'yedikule',
    konum: [28.923, 40.994],
    ad: 'Yedikule',
    yer: '7. Tepe',
    simge: '🏯',
    bilgi: 'Yedinci tepenin yakınında Yedikule Hisarı var. Adı yedi kulesinden geliyor; sen de say: bir, iki, üç… yedi!',
    soru: 'Evde birine sor: İstanbul’un yedi tepesinden hangisini görmek istersin?',
    ozel: hikayeli(K.zipla, 'Yedi kuleyi say, her kulede zıpla!', { adet: 7 }),
    ekler: [
      hikayeli(K.kolSalla, 'Hisardan denizdeki gemilere el salla!'),
      hikayeli(K.comel, 'Kule kapısından geçmek için çömel!'),
      hikayeli(K.kocaman, 'Yedi tepeyi gezdin, kocaman ol!'),
    ],
  },
];

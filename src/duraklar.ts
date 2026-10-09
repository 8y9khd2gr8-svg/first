import { H, Hareket, ISINMA, SOGUMA } from './hareketler';

// Türkiye Turu durakları (batıdan doğuya). Kural: ibadet yeri olarak kullanılan yapılar yok.
export type Durak = {
  id: string;
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
    ad: 'Boğaz ve Galata',
    yer: 'İstanbul',
    simge: '🌉',
    bilgi: 'İstanbul iki kıtada birden kurulu bir şehir: Avrupa ve Asya! Boğaz’daki köprüler iki kıtayı birleştirir. Galata Kulesi ise neredeyse yedi yüz yaşında.',
    ozel: { hikaye: 'Kulenin tepesine bak!', baslik: 'Parmak ucunda yüksel,\nkollarını uzat!', sesli: 'Kulenin tepesine bakalım! Parmak uçlarında yüksel, kollarını yukarı uzat!', animasyon: 'uzan', tur: 'sayi', adet: 4, tempoMs: 2200 },
    ekler: [H.zipla, H.comel],
  },
  {
    id: 'truva',
    ad: 'Truva Atı',
    yer: 'Çanakkale',
    simge: '🐴',
    bilgi: 'Truva Antik Kenti Çanakkale’de. Masala göre insanlar kocaman tahta bir atın içine saklanmış!',
    ozel: { hikaye: 'Truva Atı’na yetiş!', baslik: 'Yerinde hızlı koş!', sesli: 'Truva Atı’na yetişelim! Yerinde hızlı hızlı koş!', animasyon: 'kos', tur: 'sure', saniye: 8 },
    ekler: [H.dizler, H.acKapa],
  },
  {
    id: 'pamukkale',
    ad: 'Pamukkale',
    yer: 'Denizli',
    simge: '🏞️',
    bilgi: 'Pamukkale’nin bembeyaz basamakları kar gibi görünür ama kar değildir. Sıcak sudan oluşan taşlardır!',
    ozel: { hikaye: 'Beyaz basamaklardan in!', baslik: 'Dizlerini kaldırarak\nyürü!', sesli: 'Beyaz basamaklardan inelim! Dizlerini kaldırarak yerinde yürü!', animasyon: 'dizler', tur: 'sayi', adet: 10, tempoMs: 1000 },
    ekler: [H.kollar, H.zipla],
  },
  {
    id: 'kapadokya',
    ad: 'Kapadokya',
    yer: 'Nevşehir',
    simge: '🎈',
    bilgi: 'Kapadokya’da peri bacaları denen sivri kayalar var. Sabahları gökyüzü rengârenk sıcak hava balonlarıyla dolar!',
    ozel: { hikaye: 'Balonlar havalanıyor!', baslik: 'Çömel, sonra\nyavaşça yüksel!', sesli: 'Balonlar havalanıyor! Önce çömel, sonra yavaşça yüksel ve kollarını aç!', animasyon: 'balon', tur: 'sayi', adet: 4, tempoMs: 3000 },
    ekler: [H.acKapa, H.comel],
  },
  {
    id: 'nemrut',
    ad: 'Nemrut Dağı',
    yer: 'Adıyaman',
    simge: '🗿',
    bilgi: 'Nemrut Dağı’nın tepesinde kocaman taş heykel başları var. Bazıları senin boyundan bile büyük!',
    ozel: { hikaye: 'Taş heykeller seni izliyor!', baslik: 'Ellerini beline koy,\nkıpırdamadan dur!', sesli: 'Taş heykeller gibi olalım! Ellerini beline koy ve hiç kıpırdamadan dur!', animasyon: 'heykel', tur: 'sure', saniye: 6 },
    ekler: [H.kos, H.dizler],
  },
  {
    id: 'gobeklitepe',
    ad: 'Göbeklitepe',
    yer: 'Şanlıurfa',
    simge: '🪨',
    bilgi: 'Göbeklitepe dünyanın bilinen en eski yapılarından biri. On bir bin yıldan daha yaşlı, piramitlerden bile çok daha eski!',
    ozel: { hikaye: 'Kocaman taşları kaldıralım!', baslik: 'Çömel, taşı al,\nyukarı kaldır!', sesli: 'Kocaman taşları kaldıralım! Çömel, taşı al ve yukarı kaldır!', animasyon: 'tasKaldir', tur: 'sayi', adet: 5, tempoMs: 2200 },
    ekler: [H.zipla, H.kollar],
  },
  {
    id: 'karadeniz',
    ad: 'Karadeniz',
    yer: 'Trabzon',
    simge: '🌲',
    bilgi: 'Karadeniz’de insanlar el ele tutuşup horon oynar. Horonda ayaklar çok hızlı hareket eder!',
    ozel: { hikaye: 'Horon zamanı!', baslik: 'Ayaklarını\nhızlı hızlı vur!', sesli: 'Horon zamanı! Kollarını kaldır, ayaklarını hızlı hızlı yere vur!', animasyon: 'horon', tur: 'sure', saniye: 8 },
    ekler: [H.acKapa, H.kos],
  },
];

export function durakBul(id: string): Durak {
  return TURKIYE.find((d) => d.id === id) ?? TURKIYE[0];
}

// Bir duraktaki 5 hareketlik kısa antrenman.
export function oturum(durak: Durak): Hareket[] {
  return [ISINMA, durak.ozel, ...durak.ekler, SOGUMA];
}

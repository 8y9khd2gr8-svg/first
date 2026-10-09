// Oyundaki hareketlerin listesi. Yeni hareket eklemek için buraya bir satır eklemek yeterli.
//  - 'sayi': belli sayıda tekrar (her tekrarda bip sesi ve sayaç)
//  - 'sure': belli saniye boyunca devam eden hareket (geri sayan saat)

export type Animasyon = 'zipla' | 'comel' | 'kos' | 'denge' | 'kanat' | 'yildiz' | 'uzan';

export type Hareket = {
  baslik: string; // ekranda yazan komut
  sesli: string; // seslendirilen komut
  animasyon: Animasyon;
} & ({ tur: 'sayi'; adet: number; tempoMs: number } | { tur: 'sure'; saniye: number });

export const HAREKETLER: Hareket[] = [
  { baslik: '5 kere zıpla!', sesli: 'Hadi bakalım! Beş kere zıpla!', animasyon: 'zipla', tur: 'sayi', adet: 5, tempoMs: 1100 },
  { baslik: 'Çömel ve kalk!', sesli: 'Şimdi çömel ve kalk. Beş kere!', animasyon: 'comel', tur: 'sayi', adet: 5, tempoMs: 1600 },
  { baslik: 'Yerinde koş!', sesli: 'Yerinde koş! On saniye!', animasyon: 'kos', tur: 'sure', saniye: 10 },
  { baslik: 'Leylek gibi\ntek ayakta dur!', sesli: 'Leylek gibi tek ayağının üstünde dur!', animasyon: 'denge', tur: 'sure', saniye: 8 },
  { baslik: 'Kuş gibi\nkanat çırp!', sesli: 'Kuş gibi kollarını çırp! Sekiz kere!', animasyon: 'kanat', tur: 'sayi', adet: 8, tempoMs: 900 },
  { baslik: 'Yıldız gibi\naçıl, kapan!', sesli: 'Yıldız gibi açıl, kapan! Beş kere!', animasyon: 'yildiz', tur: 'sayi', adet: 5, tempoMs: 1300 },
  { baslik: 'Gökyüzüne uzan!', sesli: 'Parmak uçlarında yüksel, ellerinle gökyüzüne uzan! Üç kere!', animasyon: 'uzan', tur: 'sayi', adet: 3, tempoMs: 2200 },
];

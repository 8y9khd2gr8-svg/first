// Oyundaki hareketlerin listesi. Yeni hareket eklemek için buraya bir satır eklemek yeterli.
// Komut kuralı: benzetme değil, vücut parçasının adını söyleyen tek ve net bir eylem.
//  - 'sayi': belli sayıda tekrar (her tekrarda bip sesi ve sayaç)
//  - 'sure': belli saniye boyunca devam eden hareket (geri sayan saat)

export type Animasyon = 'zipla' | 'comel' | 'kos' | 'dizler' | 'kollar' | 'acKapa' | 'uzan';

export type Hareket = {
  baslik: string; // ekranda yazan komut
  sesli: string; // seslendirilen komut
  animasyon: Animasyon;
} & ({ tur: 'sayi'; adet: number; tempoMs: number } | { tur: 'sure'; saniye: number });

export const HAREKETLER: Hareket[] = [
  { baslik: '5 kere zıpla!', sesli: 'Hadi bakalım! Beş kere zıpla!', animasyon: 'zipla', tur: 'sayi', adet: 5, tempoMs: 1100 },
  { baslik: 'Çömel ve kalk!', sesli: 'Şimdi çömel ve kalk. Beş kere!', animasyon: 'comel', tur: 'sayi', adet: 5, tempoMs: 1600 },
  { baslik: 'Yerinde koş!', sesli: 'Yerinde koş! On saniye!', animasyon: 'kos', tur: 'sure', saniye: 10 },
  { baslik: 'Dizlerini\nsırayla kaldır!', sesli: 'Dizlerini sırayla yukarı kaldır! Bir bu dizin, bir öbür dizin!', animasyon: 'dizler', tur: 'sayi', adet: 10, tempoMs: 850 },
  { baslik: 'Kollarını\nkaldır, indir!', sesli: 'Kollarını yukarı kaldır, sonra aşağı indir! Altı kere!', animasyon: 'kollar', tur: 'sayi', adet: 6, tempoMs: 1400 },
  { baslik: 'Zıpla,\nayaklarını aç, kapa!', sesli: 'Zıpla, ayaklarını aç! Zıpla, kapa! Beş kere!', animasyon: 'acKapa', tur: 'sayi', adet: 5, tempoMs: 1500 },
  { baslik: 'Gökyüzüne uzan!', sesli: 'Parmak uçlarında yüksel, ellerinle gökyüzüne uzan! Üç kere!', animasyon: 'uzan', tur: 'sayi', adet: 3, tempoMs: 2200 },
];

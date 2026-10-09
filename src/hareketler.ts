// Hareketler. Yeni hareket eklemek için buraya bir satır eklemek yeterli.
// Komut kuralı: benzetme değil, vücut parçasının adını söyleyen tek ve net bir eylem.
// Hikâye (ör. "Truva Atı'na yetiş!") ayrı alanda durur; komutun yerine geçmez.
//  - 'sayi': belli sayıda tekrar (her tekrarda bip sesi ve sayaç)
//  - 'sure': belli saniye boyunca devam eden hareket (geri sayan saat)

export type Animasyon =
  | 'zipla' | 'comel' | 'kos' | 'dizler' | 'kollar' | 'acKapa' | 'uzan'
  | 'balon' | 'heykel' | 'horon' | 'tasKaldir'
  | 'sutun' | 'piramit' | 'yanAdim' | 'parmakUcu' | 'tirman';

export type Hareket = {
  baslik: string; // ekranda büyük yazan komut
  sesli: string; // seslendirilen komut
  hikaye?: string; // komutun üstünde küçük yazan, durağa özel hikâye
  animasyon: Animasyon;
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

// Her durağın başında ve sonunda.
export const ISINMA: Hareket = { ...H.kollar, baslik: 'Isınalım!\nKollarını kaldır, indir!', sesli: 'Önce ısınalım! Kollarını yukarı kaldır, aşağı indir!', adet: 4 };
export const SOGUMA: Hareket = {
  baslik: 'Kollarını kaldır,\nderin nefes al!',
  sesli: 'Harika gidiyorsun! Şimdi yavaşça kollarını kaldır ve derin bir nefes al. Sonra indir.',
  animasyon: 'kollar',
  tur: 'sayi',
  adet: 3,
  tempoMs: 3600,
};

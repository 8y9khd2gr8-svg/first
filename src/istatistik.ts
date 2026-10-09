import type { Hareket } from './hareketler';

// Ebeveyn özeti için hareket kayıtları. Sadece bu cihazda saklanır; hiçbir yere gönderilmez.
// Sadece çocuğun "Yaptım!" dediği hareketler sayılır.
const ANAHTAR = 'zipzip-istatistik-v1';

type Gun = { saniye: number; hareket: number; ziplama: number };
type Kayit = { gunler: Record<string, Gun>; ilkGun?: string };

function oku(): Kayit {
  try {
    const k = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    return { gunler: typeof k.gunler === 'object' && k.gunler ? k.gunler : {}, ilkGun: k.ilkGun };
  } catch {
    return { gunler: {} };
  }
}

// Yerel saatle "YYYY-AA-GG".
export function gunAnahtari(tarih = new Date()): string {
  const iki = (n: number) => String(n).padStart(2, '0');
  return `${tarih.getFullYear()}-${iki(tarih.getMonth() + 1)}-${iki(tarih.getDate())}`;
}

export function hareketKaydet(h: Hareket) {
  const kayit = oku();
  const bugun = gunAnahtari();
  const gun = kayit.gunler[bugun] ?? { saniye: 0, hareket: 0, ziplama: 0 };
  gun.saniye += Math.round(h.tur === 'sayi' ? (h.adet * h.tempoMs) / 1000 : h.saniye);
  gun.hareket += 1;
  if (h.tur === 'sayi' && (h.animasyon === 'zipla' || h.animasyon === 'acKapa')) gun.ziplama += h.adet;
  kayit.gunler[bugun] = gun;
  kayit.ilkGun ??= bugun;
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    // Kayıt yoksa özet boş görünür; oyun yine çalışır.
  }
}

export type Ozet = { gunler: { gun: string; saniye: number }[]; saniye: number; hareket: number; ziplama: number; toplamSaniye: number; toplamHareket: number };

// Son 7 gün (bugün dahil) ve başlangıçtan beri toplam.
export function haftalikOzet(): Ozet {
  const kayit = oku();
  const gunler = Array.from({ length: 7 }, (_, i) => {
    const t = new Date();
    t.setDate(t.getDate() - (6 - i));
    const anahtar = gunAnahtari(t);
    return { gun: anahtar, saniye: kayit.gunler[anahtar]?.saniye ?? 0 };
  });
  const hafta = gunler.map((g) => kayit.gunler[g.gun]).filter(Boolean) as Gun[];
  const tum = Object.values(kayit.gunler);
  return {
    gunler,
    saniye: hafta.reduce((t, g) => t + g.saniye, 0),
    hareket: hafta.reduce((t, g) => t + g.hareket, 0),
    ziplama: hafta.reduce((t, g) => t + g.ziplama, 0),
    toplamSaniye: tum.reduce((t, g) => t + g.saniye, 0),
    toplamHareket: tum.reduce((t, g) => t + g.hareket, 0),
  };
}

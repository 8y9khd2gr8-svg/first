import type { Hareket } from './hareketler';

// Ebeveyn özeti için hareket kayıtları. Sadece bu cihazda saklanır; hiçbir yere gönderilmez.
// Sadece çocuğun "Yaptım!" dediği hareketler sayılır.
const ANAHTAR = 'zipzip-istatistik-v1';

// sayac: hangi animasyondan kaç tekrar yapıldı (süreli hareketlerde 1 sayılır).
type Gun = { saniye: number; hareket: number; ziplama: number; sayac?: Record<string, number> };
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

// Zıplama sayısına (ve zıplama rozetlerine) eklenen hareketler.
const ZIPLAMALAR: string[] = ['zipla', 'acKapa', 'basket', 'engel', 'yanaZipla'];

export function hareketKaydet(h: Hareket) {
  const kayit = oku();
  const bugun = gunAnahtari();
  const gun = kayit.gunler[bugun] ?? { saniye: 0, hareket: 0, ziplama: 0 };
  gun.saniye += Math.round(h.tur === 'sayi' ? (h.adet * h.tempoMs) / 1000 : h.saniye);
  gun.hareket += 1;
  if (h.tur === 'sayi' && ZIPLAMALAR.includes(h.animasyon)) gun.ziplama += h.adet;
  gun.sayac ??= {};
  gun.sayac[h.animasyon] = (gun.sayac[h.animasyon] ?? 0) + (h.tur === 'sayi' ? h.adet : 1);
  kayit.gunler[bugun] = gun;
  kayit.ilkGun ??= bugun;
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    // Kayıt yoksa özet boş görünür; oyun yine çalışır.
  }
}

export type Ozet = { gunler: { gun: string; saniye: number }[]; saniye: number; hareket: number; ziplama: number; toplamSaniye: number; toplamHareket: number; toplamZiplama: number; gunSayisi: number; animasyonSayac: Record<string, number>; haftaSonuOynadi: boolean };

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
    toplamZiplama: tum.reduce((t, g) => t + g.ziplama, 0),
    gunSayisi: tum.filter((g) => g.hareket > 0).length,
    animasyonSayac: tum.reduce<Record<string, number>>((t, g) => {
      for (const [a, n] of Object.entries(g.sayac ?? {})) t[a] = (t[a] ?? 0) + n;
      return t;
    }, {}),
    haftaSonuOynadi: Object.entries(kayit.gunler).some(([gun, g]) => {
      if (!g.hareket) return false;
      const [yil, ay, gn] = gun.split('-').map(Number);
      const hafta = new Date(yil, ay - 1, gn).getDay();
      return hafta === 0 || hafta === 6;
    }),
  };
}

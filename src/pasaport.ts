// Çocuğun pasaport bilgileri (ad ve fotoğraf) sadece bu cihazda saklanır; hiçbir yere gönderilmez.
const ANAHTAR = 'zipzip-pasaport-v1';

export type Pasaport = { ad: string; foto?: string; avatar?: string; soruldu?: boolean };

// Fotoğraf istemeyen aileler için: çocuğun kendi seçtiği karakter (varsayılan görünüm).
export const AVATARLAR: { simge: string; ad: string }[] = [
  { simge: '🦊', ad: 'Tilki' },
  { simge: '🐻', ad: 'Ayı' },
  { simge: '🐼', ad: 'Panda' },
  { simge: '🐯', ad: 'Kaplan' },
  { simge: '🐰', ad: 'Tavşan' },
  { simge: '🐸', ad: 'Kurbağa' },
  { simge: '🦁', ad: 'Aslan' },
  { simge: '🐱', ad: 'Kedi' },
];

export function pasaportOku(): Pasaport {
  try {
    const k = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    const kayit = typeof k === 'object' && k ? k : {};
    // Bozuk alan yok sayılır: fotoğraf sadece resim verisiyse, karakter sadece listedekiyse kullanılır.
    return {
      ad: typeof kayit.ad === 'string' ? kayit.ad.slice(0, 40) : '',
      foto: typeof kayit.foto === 'string' && kayit.foto.startsWith('data:image/') ? kayit.foto : undefined,
      avatar: AVATARLAR.some((a) => a.simge === kayit.avatar) ? kayit.avatar : undefined,
      soruldu: kayit.soruldu === true,
    };
  } catch {
    return { ad: '' };
  }
}

export function pasaportYaz(degisiklik: Partial<Pasaport>) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify({ ...pasaportOku(), ...degisiklik }));
  } catch {
    // Yer yoksa ya da gizli sekmedeysek: oyun kayıtsız da çalışır.
  }
}

// Telefondan gelen fotoğrafı kareye kırpıp küçültür (yaklaşık 20-40 KB).
export async function fotoyuHazirla(dosya: File, boyut = 320): Promise<string> {
  const adres = URL.createObjectURL(dosya);
  try {
    const resim = new Image();
    resim.src = adres;
    await resim.decode();
    const kenar = Math.min(resim.naturalWidth, resim.naturalHeight);
    const tuval = document.createElement('canvas');
    tuval.width = tuval.height = boyut;
    tuval
      .getContext('2d')!
      .drawImage(resim, (resim.naturalWidth - kenar) / 2, (resim.naturalHeight - kenar) / 2, kenar, kenar, 0, 0, boyut, boyut);
    return tuval.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(adres);
  }
}

// Kayıtlı fotoğrafı oyunun kullanabileceği bir resme çevirir.
// Her yüklemede yeni bir anahtar: eski fotoğraf ekrandayken dokusu silinmez (silinirse çizim hata verir; Pasaport ayarında
// fotoğraf değiştirilince oluyordu). Yeni fotoğraf yerine geçince eski dokular silinir. Yükleme bitmeden ekrandan
// çıkıldıysa fotoğraf o ekrana eklenmez.
let fotoNo = 0;
export function fotoDokusuYukle(sahne: Phaser.Scene, foto: string, bitince: (anahtar: string) => void) {
  const anahtar = `cocukFoto${++fotoNo}`;
  let kapandi = false;
  sahne.events.once('shutdown', () => (kapandi = true));
  sahne.textures.once(`addtexture-${anahtar}`, () => {
    if (kapandi) return sahne.textures.remove(anahtar);
    bitince(anahtar);
    for (const eski of sahne.textures.getTextureKeys()) if (eski.startsWith('cocukFoto') && eski !== anahtar) sahne.textures.remove(eski);
  });
  sahne.textures.addBase64(anahtar, foto);
}

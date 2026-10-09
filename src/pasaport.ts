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
    const kayit = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    return { ad: typeof kayit.ad === 'string' ? kayit.ad : '', foto: kayit.foto, avatar: kayit.avatar, soruldu: !!kayit.soruldu };
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
export function fotoDokusuYukle(sahne: Phaser.Scene, foto: string, bitince: (anahtar: string) => void) {
  const anahtar = 'cocukFoto';
  if (sahne.textures.exists(anahtar)) sahne.textures.remove(anahtar);
  sahne.textures.once(`addtexture-${anahtar}`, () => bitince(anahtar));
  sahne.textures.addBase64(anahtar, foto);
}

// Bir kez yüklenen şey (ör. doğal ses kaydı) tekrar indirilmesin diye önbellekte tutulur.
// Yükleme başarısız olursa önbellekten silinir: bir anlık hata (dosya geç geldi, bellek doldu) oturum boyunca
// "kayıt yok" sayılmasın, sıradaki istek yeniden denesin. Hata yerine null döner (oyun asla takılmasın).
export function onbellekliYukle<T>(onbellek: Map<string, Promise<T | null>>, anahtar: string, yukle: () => Promise<T>): Promise<T | null> {
  let sonuc = onbellek.get(anahtar);
  if (!sonuc) {
    const yeni: Promise<T | null> = Promise.resolve()
      .then(yukle)
      .catch(() => {
        if (onbellek.get(anahtar) === yeni) onbellek.delete(anahtar);
        return null;
      });
    sonuc = yeni;
    onbellek.set(anahtar, sonuc);
  }
  return sonuc;
}

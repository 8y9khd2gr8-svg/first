// "Zıpzıp da zıplasın (kamerayla): sayfa iki kez 2,5 sn donsa da" testinin karar kuralı (kamera-benzetim.spec.ts).
// Eskiden test kamera sayısının 90 sn içinde artmasını bekliyordu: yükte sahte model seyrek çalışınca kırmızı oluyor,
// ama asıl hatayı (sayfa çocuk havadayken donunca taban havadaki omuzdan alınıp sayımın uzun süre takılması, 24 Ekim)
// ancak şansla yakalıyordu. Şimdi süre değil, modelin gördüğü zıplama sayılır: makinenin hızından bağımsız.
// Kural sahte kayıtlarla da denenir (tests/zipla-donma.test.ts).

// Sahte modelin her tanıması: [zaman (ms), çocuk havada mı (1/0), o tanımadan ÖNCE oyunun saydığı kamera zıplaması].
export type ZiplaKaresi = [t: number, havada: 0 | 1, sayi: number];
export type Donma = { bas: number; son: number };

export const DONMA_MS = 2_500;
// Donma bittikten sonra model bu kadar tam zıplama (havada kare → yerde kare) gördüyse en geç bu sayıda içinde sayım olmalı.
// Yeni oyun 1-2 zıplamada yine sayar; eski hata yükte 80 sn'den uzun, yüksüz ~5 zıplama takılıyordu (24 Ekim ölçümü).
export const GORULEN_ZIPLAMA_SINIRI = 3;

/** Kareler içinde, verilen aralıkta (bas dahil, son hariç sıra numarası) modelin gördüğü tam zıplamalar. */
export function gorulenZiplamalar(kareler: ZiplaKaresi[], bas: number, son = kareler.length): number {
  let n = 0;
  for (let i = Math.max(bas, 1); i < son; i++) if (kareler[i - 1][1] === 1 && kareler[i][1] === 0) n++;
  return n;
}

/** Son donmadan sonraki ilk sayım: { donmadan sonraki ilk karenin sırası, sayımın göründüğü karenin sırası (yoksa -1) }. */
export function donmaSonrasi(kareler: ZiplaKaresi[], donma: Donma) {
  const i0 = kareler.findIndex((k) => k[0] >= donma.son);
  if (i0 < 0) return { i0, sayim: -1 };
  const sayim = kareler.findIndex((k, i) => i > i0 && k[2] > kareler[i0][2]);
  return { i0, sayim };
}

/** Test bitti mi: sayım geldi ya da sınırdan fazla zıplama görüldü (artık beklemenin anlamı yok). */
export function olcumBitti(kareler: ZiplaKaresi[], donma: Donma): boolean {
  const { i0, sayim } = donmaSonrasi(kareler, donma);
  return i0 >= 0 && (sayim >= 0 || gorulenZiplamalar(kareler, i0) > GORULEN_ZIPLAMA_SINIRI);
}

/** Kurala uymayan her şeyi yazar; boş liste = geçti. */
export function ziplaDonmaHatalari(kareler: ZiplaKaresi[], donmalar: Donma[]): string[] {
  const hatalar: string[] = [];
  if (donmalar.length !== 2) return [`iki donma olmalı, ${donmalar.length} donma var`];
  donmalar.forEach((d, i) => {
    if (d.son - d.bas < DONMA_MS) hatalar.push(`${i + 1}. donma ${Math.round(d.son - d.bas)} ms, en az ${DONMA_MS} ms olmalı`);
    // Denenen yol: donma, model çocuğu havada görmüşken başlar (sayıcı "havada" iken sayfa donar).
    const once = kareler.filter((k) => k[0] < d.bas).pop();
    if (!once || once[1] !== 1) hatalar.push(`${i + 1}. donmadan önceki son kare havada değil (denenen yol yok)`);
  });
  if (donmalar[1].bas < donmalar[0].son) hatalar.push('ikinci donma birincisi bitmeden başladı');
  const { i0, sayim } = donmaSonrasi(kareler, donmalar[1]);
  if (i0 < 0) return [...hatalar, 'donmadan sonra hiç tanıma yok'];
  const gorulen = gorulenZiplamalar(kareler, i0, sayim < 0 ? kareler.length : sayim);
  if (sayim < 0 && gorulen > GORULEN_ZIPLAMA_SINIRI)
    hatalar.push(`donmadan sonra model ${gorulen} zıplama gördü, hiçbiri sayılmadı (sınır ${GORULEN_ZIPLAMA_SINIRI})`);
  else if (sayim < 0) hatalar.push(`donmadan sonra sayım yok, model sadece ${gorulen} zıplama gördü (ölçüm yetmedi)`);
  else if (gorulen > GORULEN_ZIPLAMA_SINIRI)
    hatalar.push(`donmadan sonra ilk sayım geç: model ${gorulen} zıplama gördükten sonra (sınır ${GORULEN_ZIPLAMA_SINIRI})`);
  return hatalar;
}

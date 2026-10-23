// Ayna donma testinin karar kuralı (kamera-benzetim.spec.ts "ayna sırasında sayfa iki kez 2,5 sn donsa da").
// Tarayıcıdaki ölçümden ayrı tutulur ki kural, makinenin hızından bağımsız olarak sahte kayıtlarla da denensin
// (tests/ayna-donma.test.ts: eski hata, eksik/kısa/binen donma, erken kapanma kırmızı olmalı).

export type Donma = { bas: number; son: number };
export type AynaDonmaOlcumu = { aynaBas: number; aynaSon: number; donmalar: Donma[] };

export const AYNA_EN_COK_MS = 6_000;
export const DONMA_MS = 2_500;
// Süre dolduktan (ya da donma bittikten) sonra ayna en geç bu kadar içinde kapanmalı. Eskiden fiilen 1,1 sn'ydi
// (planlı bitiş 6,1 sn + 1,1 = sabit 7,2 sn sınırı). Yeni oyun yükte en çok 0,31 sn, eski hata 1,75-1,97 sn (23 Ekim).
export const KAPANMA_PAYI_MS = 1_000;

/** Kurala uymayan her şeyi yazar; boş liste = geçti. */
export function aynaDonmaHatalari({ aynaBas, aynaSon, donmalar }: AynaDonmaOlcumu): string[] {
  const hatalar: string[] = [];
  if (donmalar.length !== 2) return [`iki donma olmalı, ${donmalar.length} donma var`];
  const [d1, d2] = donmalar;
  donmalar.forEach((d, i) => {
    if (d.son - d.bas < DONMA_MS) hatalar.push(`${i + 1}. donma ${Math.round(d.son - d.bas)} ms, en az ${DONMA_MS} ms olmalı`);
  });
  if (d2.bas < d1.son) hatalar.push('ikinci donma birincisi bitmeden başladı');
  if (d1.bas <= aynaBas) hatalar.push('ilk donma ayna başlamadan oldu');
  // Denenen yol: süre ikinci donma sırasında dolar. Donma 6 sn'den önce biterse test bu yolu denemiş olmaz.
  if (d2.son - aynaBas <= AYNA_EN_COK_MS) hatalar.push('ikinci donma 6 sn dolmadan bitti (denenen yol yok)');
  if (aynaSon <= d2.son) hatalar.push('ayna donma bitmeden kapandı');
  if (aynaSon - aynaBas <= AYNA_EN_COK_MS - 500) hatalar.push(`ayna erken kapandı (${Math.round(aynaSon - aynaBas)} ms)`);
  const enGec = Math.max(aynaBas + AYNA_EN_COK_MS, d2.son);
  if (aynaSon - enGec >= KAPANMA_PAYI_MS)
    hatalar.push(`ayna donma bitince hemen kapanmalı: ${Math.round(aynaSon - enGec)} ms geç (sınır ${KAPANMA_PAYI_MS} ms)`);
  return hatalar;
}

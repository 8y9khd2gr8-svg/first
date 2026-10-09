// Bir cümleden kısa, sabit bir dosya adı üretir (FNV-1a). Oyun ve seslendirme aracı aynı adı bulur.
export function sesAnahtari(metin: string): string {
  let h = 0x811c9dc5;
  for (const harf of metin.normalize('NFC')) {
    h ^= harf.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

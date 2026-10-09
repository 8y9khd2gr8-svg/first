// İlerleme sadece bu cihazda saklanır; hiçbir yere gönderilmez.
const ANAHTAR = 'zipzip-ilerleme-v1';

export function tamamlananlar(): string[] {
  try {
    const kayit = JSON.parse(localStorage.getItem(ANAHTAR) ?? '[]');
    return Array.isArray(kayit) ? kayit : [];
  } catch {
    return [];
  }
}

export function tamamla(durakId: string) {
  const liste = new Set(tamamlananlar());
  liste.add(durakId);
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify([...liste]));
  } catch {
    // Gizli sekme vb.: kayıt olmadan da oyun çalışır.
  }
}

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

// Beta testi için ebeveyn köşesinden bütün bölümler açılabilir (mağazaya çıkmadan kaldırılacak).
// Bölüm kilidi duraklar.ts'de (bolumKilidi).
const BETA_ANAHTAR = 'zipzip-beta-dunya';

export function betaDunyaAc(acik: boolean) {
  try {
    if (acik) localStorage.setItem(BETA_ANAHTAR, '1');
    else localStorage.removeItem(BETA_ANAHTAR);
  } catch {
    // önemli değil
  }
}

export function betaDunyaAcikMi(): boolean {
  try {
    return localStorage.getItem(BETA_ANAHTAR) === '1';
  } catch {
    return false;
  }
}

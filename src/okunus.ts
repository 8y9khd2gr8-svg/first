// Ses motorunun yanlış okuyabileceği yazımlar: ekranda yazıldığı gibi kalır, sese okunuşu gider.
// Hem doğal ses kaydında (scripts/seslendir.ts) hem telefonun sesinde (ses.ts) kullanılır.
// Kayıt anahtarı yazılan cümleden üretilir; okunuş değişince kayıt yeniden yapılmalı (public/ses'teki dosyayı silin).
const OKUNUS: [RegExp, string][] = [[/T-Rex/g, 'Ti Reks']];

export const okunus = (metin: string) => OKUNUS.reduce((m, [yazim, soyleyis]) => m.replace(yazim, soyleyis), metin);

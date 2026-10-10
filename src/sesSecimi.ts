// Telefonda birden çok Türkçe ses olabilir; en iyisi seçilir. Önce telefonun içinde çalışan ses
// (internetsiz çalışır, cümle hiçbir sunucuya gitmez), sonra kaliteli ("gelişmiş/premium/doğal") ses.
type Ses = { lang: string; name: string; voiceURI: string; localService: boolean; default: boolean };

export function sesPuani(ses: Ses): number {
  if (!ses.lang.toLowerCase().replace('_', '-').startsWith('tr')) return -1;
  const ad = `${ses.name} ${ses.voiceURI}`;
  let puan = 0;
  if (ses.localService) puan += 10;
  if (/premium|enhanced|gelişmiş|neural|natural|doğal/i.test(ad)) puan += 5;
  if (/compact|kompakt/i.test(ad)) puan -= 2;
  if (ses.default) puan += 1;
  return puan;
}

export function enIyiSes<T extends Ses>(sesler: readonly T[]): number {
  let enIyi = -1;
  sesler.forEach((ses, i) => {
    if (sesPuani(ses) >= 0 && (enIyi < 0 || sesPuani(ses) > sesPuani(sesler[enIyi]))) enIyi = i;
  });
  return enIyi;
}

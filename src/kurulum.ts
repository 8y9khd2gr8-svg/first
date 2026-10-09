// "Telefona yükle" yardımı. Android/Chrome yükleme penceresini sonraya saklar;
// iPhone'da bu pencere yok, ebeveyne Paylaş → Ana Ekrana Ekle adımları gösterilir.
type YuklemeIstegi = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let bekleyenIstek: YuklemeIstegi | null = null;

export function kurulumuDinle() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    bekleyenIstek = e as YuklemeIstegi;
  });
  window.addEventListener('appinstalled', () => (bekleyenIstek = null));
}

export const yuklenebilir = () => bekleyenIstek !== null;

export async function yukle(): Promise<boolean> {
  if (!bekleyenIstek) return false;
  await bekleyenIstek.prompt();
  const { outcome } = await bekleyenIstek.userChoice;
  bekleyenIstek = null;
  return outcome === 'accepted';
}

// Zaten ana ekrandan (uygulama olarak) mı açıldı?
export const uygulamaOlarakAcik = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const iPhoneMu = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

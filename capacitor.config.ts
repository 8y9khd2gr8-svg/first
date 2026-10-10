import type { CapacitorConfig } from '@capacitor/cli';

// Mağaza paketi (Capacitor): web oyununu Android ve iOS uygulamasına çevirir.
// Oyun telefonun içinden açılır; hiçbir dış sunucuya bağlanmaz.
const config: CapacitorConfig = {
  appId: 'com.zipzipdunya.oyun',
  appName: 'Zıp Zıp Dünya',
  webDir: 'dist',
  backgroundColor: '#14213D',
  android: { allowMixedContent: false },
  ios: { contentInset: 'never' },
};

export default config;

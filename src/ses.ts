// Sesler: kısa "bip" efektleri (Web Audio) ve seslendirme.
// konus(): cümlenin doğal ses kaydı varsa (public/ses/, npm run seslendir ile üretilir) onu çalar;
// yoksa telefonun kendi Türkçe konuşma motoruyla okur. Böylece oyun hiç sessiz kalmaz.
// Mağaza uygulamasında telefonun konuşma motoruna eklentiyle ulaşılır (Android'in uygulama içi tarayıcısında
// tarayıcı konuşması çalışmaz); tarayıcıda (test sitesi) tarayıcının konuşması kullanılır.
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { sesAnahtari } from './sesAnahtari';
import { enIyiSes } from './sesSecimi';
import { SES_DOSYALARI } from './sesDosyalari';

let baglam: AudioContext | null = null;

function sesBaglami(): AudioContext | null {
  if (!baglam) {
    const Sinif = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Sinif) return null;
    baglam = new Sinif();
  }
  if (baglam.state === 'suspended') void baglam.resume();
  return baglam;
}

// Telefonlar sesi ancak bir dokunuştan sonra açar; "Oyna" düğmesinde çağrılır.
export function sesiAc() {
  sesBaglami();
  if (!uygulamada && 'speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
}

export function bip(frekans = 660, sure = 0.15, dalga: OscillatorType = 'sine', yukseklik = 0.25) {
  const b = sesBaglami();
  if (!b) return;
  const osc = b.createOscillator();
  const kazanc = b.createGain();
  osc.type = dalga;
  osc.frequency.value = frekans;
  kazanc.gain.setValueAtTime(yukseklik, b.currentTime);
  kazanc.gain.exponentialRampToValueAtTime(0.001, b.currentTime + sure);
  osc.connect(kazanc).connect(b.destination);
  osc.start();
  osc.stop(b.currentTime + sure);
}

export function zaferMuzigi() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => bip(f, 0.22, 'triangle', 0.3), i * 130));
}

const uygulamada = Capacitor.isNativePlatform();
let turkceSes: SpeechSynthesisVoice | undefined;
let uygulamaSesi: number | undefined; // eklentideki ses sırası

function turkceSesiBul() {
  const sesler = speechSynthesis.getVoices();
  turkceSes = sesler[enIyiSes(sesler)];
}

if (uygulamada) {
  TextToSpeech.getSupportedVoices()
    .then(({ voices }) => {
      const i = enIyiSes(voices);
      if (i >= 0) uygulamaSesi = i;
    })
    .catch(() => undefined);
} else if ('speechSynthesis' in window) {
  turkceSesiBul();
  speechSynthesis.addEventListener('voiceschanged', turkceSesiBul);
}

const kayitlar = new Map<string, Promise<AudioBuffer | null>>();
let calan: AudioBufferSourceNode | null = null;
let konusmaNo = 0;

function kaydiYukle(anahtar: string): Promise<AudioBuffer | null> {
  let kayit = kayitlar.get(anahtar);
  if (!kayit) {
    kayit = fetch(`ses/${anahtar}.mp3`)
      .then((c) => (c.ok ? c.arrayBuffer() : Promise.reject()))
      .then((veri) => sesBaglami()!.decodeAudioData(veri))
      .catch(() => null);
    kayitlar.set(anahtar, kayit);
  }
  return kayit;
}

// Zıpzıp konuşurken ağzını oynatsın diye: konuşma başlayınca/bitince dinleyicilere haber verilir.
type KonusmaDinleyici = (konusuyor: boolean) => void;
const dinleyiciler = new Set<KonusmaDinleyici>();
let konusuyor = false;
let konusmaBitisi: ReturnType<typeof setTimeout> | undefined;

function konusmaDurumu(durum: boolean, enFazlaMs = 0) {
  clearTimeout(konusmaBitisi);
  // Telefonun sesi bazen "bitti" demez; ağız sonsuza dek oynamasın diye cümle uzunluğuna göre üst sınır.
  if (durum) konusmaBitisi = setTimeout(() => konusmaDurumu(false), enFazlaMs);
  if (durum === konusuyor) return;
  konusuyor = durum;
  dinleyiciler.forEach((f) => f(durum));
}

export function konusmayiDinle(f: KonusmaDinleyici): () => void {
  dinleyiciler.add(f);
  if (konusuyor) f(true);
  return () => dinleyiciler.delete(f);
}

export function konus(metin: string) {
  sustur();
  if (!metin) return; // söylenecek cümle yoksa sessiz geç (oyun asla takılmasın)
  const anahtar = sesAnahtari(metin);
  if (SES_DOSYALARI.has(anahtar) && sesBaglami()) {
    const no = ++konusmaNo;
    void kaydiYukle(anahtar).then((kayit) => {
      if (no !== konusmaNo) return; // bu arada başka bir cümle başladı
      if (!kayit) return telefonSesi(metin);
      const b = sesBaglami()!;
      calan = b.createBufferSource();
      calan.buffer = kayit;
      calan.connect(b.destination);
      calan.onended = () => no === konusmaNo && konusmaDurumu(false);
      calan.start();
      konusmaDurumu(true, kayit.duration * 1000 + 500);
    });
    return;
  }
  telefonSesi(metin);
}

// Çocuk için biraz yavaş ve neşeli (biraz ince) okunur.
const HIZ = 0.95;
const TON = 1.15;

function telefonSesi(metin: string) {
  if (uygulamada) {
    const no = konusmaNo;
    TextToSpeech.speak({ text: metin, lang: 'tr-TR', rate: HIZ, pitch: TON, voice: uygulamaSesi })
      .catch(() => undefined)
      .finally(() => no === konusmaNo && konusmaDurumu(false));
    konusmaDurumu(true, metin.length * 90 + 1500);
    return;
  }
  if (!('speechSynthesis' in window)) return;
  if (!turkceSes) turkceSesiBul();
  speechSynthesis.cancel();
  const s = new SpeechSynthesisUtterance(metin);
  s.lang = 'tr-TR';
  if (turkceSes) s.voice = turkceSes;
  s.rate = HIZ;
  s.pitch = TON;
  const no = konusmaNo;
  s.onend = s.onerror = () => no === konusmaNo && konusmaDurumu(false);
  speechSynthesis.speak(s);
  // "Başladı" haberi bazı telefonlarda gecikir ya da hiç gelmez; ağız hemen oynamaya başlar.
  konusmaDurumu(true, metin.length * 90 + 1500);
}

export function sustur() {
  konusmaNo++;
  try {
    calan?.stop();
  } catch {
    // zaten bitmiş
  }
  calan = null;
  konusmaDurumu(false);
  if (uygulamada) void TextToSpeech.stop().catch(() => undefined);
  else if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// Ebeveyn köşesindeki "Sesi dene" için: oyun bu telefonda hangi sesle konuşuyor?
export type SesDurumu = { kayitli: number; turkce: boolean; sesAdi?: string; internetsiz?: boolean };

function tarayiciSesleri(): Promise<SpeechSynthesisVoice[]> {
  const sesler = speechSynthesis.getVoices();
  if (sesler.length) return Promise.resolve(sesler);
  // Bazı tarayıcılar ses listesini geç verir; en fazla 1,5 sn beklenir.
  return new Promise((coz) => {
    const bitir = () => coz(speechSynthesis.getVoices());
    speechSynthesis.addEventListener('voiceschanged', bitir, { once: true });
    setTimeout(bitir, 1500);
  });
}

export async function sesDurumu(): Promise<SesDurumu> {
  const kayitli = SES_DOSYALARI.size;
  try {
    if (uygulamada) {
      const { voices } = await TextToSpeech.getSupportedVoices();
      const ses = voices[enIyiSes(voices)];
      if (ses) return { kayitli, turkce: true, sesAdi: ses.name, internetsiz: ses.localService };
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: 'tr-TR' });
      return { kayitli, turkce: supported };
    }
    if (!('speechSynthesis' in window)) return { kayitli, turkce: false };
    const sesler = await tarayiciSesleri();
    const ses = sesler[enIyiSes(sesler)];
    return ses ? { kayitli, turkce: true, sesAdi: ses.name, internetsiz: ses.localService } : { kayitli, turkce: false };
  } catch {
    return { kayitli, turkce: false };
  }
}

// Android uygulamasında telefonun "ses verilerini yükle" ekranını açar (iPhone'da ve tarayıcıda yok).
export const sesYuklemeAcilir = () => uygulamada && Capacitor.getPlatform() === 'android';
export function sesYuklemeEkraniniAc() {
  if (sesYuklemeAcilir()) void TextToSpeech.openInstall().catch(() => undefined);
}

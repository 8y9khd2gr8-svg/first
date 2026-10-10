// Sesler: kısa "bip" efektleri (Web Audio) ve seslendirme.
// konus(): cümlenin doğal ses kaydı varsa (public/ses/, npm run seslendir ile üretilir) onu çalar;
// yoksa telefonun kendi Türkçe konuşma motoruyla okur. Böylece oyun hiç sessiz kalmaz.
import { sesAnahtari } from './sesAnahtari';
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
  if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
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

let turkceSes: SpeechSynthesisVoice | undefined;

function turkceSesiBul() {
  turkceSes = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('tr'));
}

if ('speechSynthesis' in window) {
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

function telefonSesi(metin: string) {
  if (!('speechSynthesis' in window)) return;
  if (!turkceSes) turkceSesiBul();
  speechSynthesis.cancel();
  const s = new SpeechSynthesisUtterance(metin);
  s.lang = 'tr-TR';
  if (turkceSes) s.voice = turkceSes;
  s.rate = 0.95;
  s.pitch = 1.15;
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
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

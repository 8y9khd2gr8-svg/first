// Sesler: kısa "bip" efektleri (Web Audio) ve geçici Türkçe seslendirme
// (telefonun kendi konuşma motoru). Gerçek seslendirme kayıtları gelince
// konus() bu kayıtları çalacak şekilde değişecek.

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

export function konus(metin: string) {
  if (!('speechSynthesis' in window)) return;
  if (!turkceSes) turkceSesiBul();
  speechSynthesis.cancel();
  const s = new SpeechSynthesisUtterance(metin);
  s.lang = 'tr-TR';
  if (turkceSes) s.voice = turkceSes;
  s.rate = 0.95;
  s.pitch = 1.15;
  speechSynthesis.speak(s);
}

export function sustur() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

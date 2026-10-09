// Oyundaki bütün cümleleri doğal sesle bir kez seslendirip public/ses/ altına kaydeder.
// Sadece eksik kayıtları üretir; cümle değişirse yeni dosya oluşur.
//
// Kullanım (seçilen servise göre anahtarlar ortam değişkeni olarak verilir):
//   Azure:      AZURE_TTS_KEY=... AZURE_TTS_REGION=westeurope npm run seslendir
//   ElevenLabs: ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... npm run seslendir
import fs from 'node:fs';
import path from 'node:path';
import { tumMetinler } from '../src/metinler';
import { sesAnahtari } from '../src/sesAnahtari';

const KLASOR = 'public/ses';

async function azure(metin: string): Promise<Buffer> {
  const ses = process.env.AZURE_TTS_VOICE ?? 'tr-TR-EmelNeural';
  const ssml = `<speak version="1.0" xml:lang="tr-TR"><voice name="${ses}"><prosody rate="-5%" pitch="+8%">${metin
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')}</prosody></voice></speak>`;
  const cevap = await fetch(`https://${process.env.AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_TTS_KEY!,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
    },
    body: ssml,
  });
  if (!cevap.ok) throw new Error(`Azure ${cevap.status}: ${await cevap.text()}`);
  return Buffer.from(await cevap.arrayBuffer());
}

async function elevenlabs(metin: string): Promise<Buffer> {
  const cevap = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: metin, model_id: 'eleven_multilingual_v2', language_code: 'tr' }),
  });
  if (!cevap.ok) throw new Error(`ElevenLabs ${cevap.status}: ${await cevap.text()}`);
  return Buffer.from(await cevap.arrayBuffer());
}

const servis = process.env.AZURE_TTS_KEY ? azure : process.env.ELEVENLABS_API_KEY ? elevenlabs : null;
const metinler = tumMetinler();
fs.mkdirSync(KLASOR, { recursive: true });

let yeni = 0;
for (const metin of metinler) {
  const dosya = path.join(KLASOR, `${sesAnahtari(metin)}.mp3`);
  if (fs.existsSync(dosya)) continue;
  if (!servis) continue;
  fs.writeFileSync(dosya, await servis(metin));
  yeni++;
  console.log('✓', metin.slice(0, 70));
}

const mevcut = metinler.map(sesAnahtari).filter((a) => fs.existsSync(path.join(KLASOR, `${a}.mp3`)));
fs.writeFileSync(
  'src/sesDosyalari.ts',
  `// Bu dosya scripts/seslendir.ts tarafından üretilir; elle değiştirmeyin.\n` +
    `// Doğal ses kaydı bulunan cümlelerin anahtarları (public/ses/<anahtar>.mp3).\n` +
    `export const SES_DOSYALARI = new Set<string>(${JSON.stringify(mevcut)});\n`,
);
console.log(`${metinler.length} cümle, ${mevcut.length} kayıtlı, ${yeni} yeni.${servis ? '' : ' (Servis anahtarı verilmedi; yeni kayıt üretilmedi.)'}`);

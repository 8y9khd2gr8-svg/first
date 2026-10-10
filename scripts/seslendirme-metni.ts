// Seslendirmen/ajans için metin dosyası üretir: docs/seslendirme-metni.csv (Excel ile açılır).
// Her satır ayrı bir ses dosyası: dosya adı oyunun bulacağı ad (public/ses/<ad>.mp3).
// Çalıştırma: npm run seslendirme-metni
import fs from 'node:fs';
import { AILE_OTURUMU } from '../src/aile';
import { BOLUMLER, TUM_DURAKLAR } from '../src/duraklar';
import { H, ISINMALAR, SOGUMALAR } from '../src/hareketler';
import { GERI_SAYIM, M, SAYILAR, tumMetinler } from '../src/metinler';
import { sesAnahtari } from '../src/sesAnahtari';

const duraklar = TUM_DURAKLAR;
const komutlar = new Set([
  ...Object.values(H).map((h) => h.sesli),
  ...ISINMALAR.map((h) => h.sesli),
  ...duraklar.flatMap((d) => [d.ozel.sesli, ...d.ekler.map((e) => e.sesli)]),
  ...AILE_OTURUMU.map((h) => h.sesli),
]);
const sakin = new Set([...SOGUMALAR.map((h) => h.sesli), AILE_OTURUMU[AILE_OTURUMU.length - 1].sesli]);
const bilgiler = new Set(duraklar.map((d) => M.durakGiris(d.yer, d.ad, d.bilgi, BOLUMLER[d.bolum].kutuBaslik)));

// Her cümlenin türü ve nasıl okunacağı.
function tur(c: string): [string, string] {
  if (SAYILAR.includes(c) || GERI_SAYIM.includes(c)) return ['Sayı', 'Tek kelime; net, enerjik, kısa. Sonda sessizlik bırakın.'];
  if (sakin.has(c)) return ['Soğuma', 'Sakin, yavaş, yumuşak; nefes alır gibi.'];
  if (komutlar.has(c)) return ['Hareket komutu', 'Enerjik ama net; vücut parçasını vurgulayın (ör. "DİZLERİNİ"). 6 yaş anlasın.'];
  if (bilgiler.has(c)) return ['Durak bilgisi', 'Merak uyandıran, hikâye anlatır gibi; yavaş ve net.'];
  if (/Süper|Aferin|Harika|Tebrik|İnanılmaz|Muhteşem|kazandın|açıldı|harikasın|süpersiniz/i.test(c)) return ['Kutlama', 'Neşeli, coşkulu, gülümseyerek.'];
  return ['Yönlendirme', 'Sıcak, samimi, sakin bir hızla.'];
}

const tirnak = (s: string) => `"${s.replace(/"/g, '""')}"`;
const satirlar = tumMetinler().map((c, i) => {
  const [t, not] = tur(c);
  return [i + 1, `${sesAnahtari(c)}.mp3`, c, t, not].map((x) => tirnak(String(x))).join(';');
});
const baslik = ['Sıra', 'Dosya adı', 'Okunacak cümle', 'Tür', 'Nasıl okunmalı'].map(tirnak).join(';');
fs.mkdirSync('docs', { recursive: true });
// Başta BOM: Excel Türkçe harfleri doğru göstersin. Ayraç ";" (Türkçe Excel varsayılanı).
fs.writeFileSync('docs/seslendirme-metni.csv', '﻿' + [baslik, ...satirlar].join('\r\n') + '\r\n');
const kelime = tumMetinler().reduce((t, c) => t + c.split(/\s+/).length, 0);
console.log(`${satirlar.length} cümle, ${kelime} kelime → docs/seslendirme-metni.csv`);

// iPhone paketinin sürüm numarasını package.json'dakiyle eşitler (ör. 0.9.0).
// Android'de gerek yok: build.gradle sürümü package.json'dan kendisi okur.
// `npm run magaza` bunu kendiliğinden çalıştırır; `npm test` farklıysa uyarır.
import fs from 'node:fs';

const surum = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const dosya = 'ios/App/App.xcodeproj/project.pbxproj';
const eski = fs.readFileSync(dosya, 'utf8');
const yeni = eski.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${surum};`);
if (yeni !== eski) fs.writeFileSync(dosya, yeni);
console.log(`iPhone sürümü: ${surum}`);

import fs from 'fs';
const [veriYol, pozYol, out] = process.argv.slice(2);
const veri = JSON.parse(fs.readFileSync(veriYol, 'utf8'));
const poz = JSON.parse(fs.readFileSync(pozYol, 'utf8'));
const k = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const kartlar = veri.map((h, i) => `
<section class="kart" id="h${i}">
  <div class="ust"><span class="no">${i + 1}</span><h2>${k(h.baslik)}</h2></div>
  <div class="pozlar">${(poz[h.animasyon] ?? []).map((b) => `<img alt="" src="data:image/jpeg;base64,${b}">`).join('')}</div>
  <dl>
    <dt>Sesli komut</dt><dd>“${k(h.sesli)}”</dd>
    ${h.hikaye ? `<dt>Hikâye</dt><dd>${k(h.hikaye)}</dd>` : ''}
    <dt>Miktar</dt><dd>${k(h.miktar)} · ${k(h.tempo)}</dd>
    <dt>Nerede</dt><dd>${h.yerler.map(k).join(' · ')}</dd>
  </dl>
  <fieldset class="karar"><legend>Değerlendirme</legend>
    ${['Uygun', 'Değişmeli', 'Çıkarılmalı'].map((d) => `<label><input type="radio" name="k${i}" value="${d}"> ${d}</label>`).join('')}
  </fieldset>
  <textarea name="n${i}" placeholder="Not (ör. tekrar sayısı, yaş grubu, dikkat edilecek nokta)"></textarea>
</section>`).join('');
fs.writeFileSync(out, `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zıp Zıp Dünya – Hareket Kataloğu</title>
<style>
:root{--lac:#14213D;--sari:#FFC93C;--tur:#FF8A3D}
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;background:#f3f5fa;color:#1c2333}
header{background:var(--lac);color:#fff;padding:24px 16px}header h1{margin:0 0 6px;color:var(--sari)}
main{max-width:1000px;margin:0 auto;padding:16px}
.bilgi{background:#fff;border-radius:14px;padding:16px;margin-bottom:16px;border-left:6px solid var(--sari)}
.liste{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.kart{background:#fff;border-radius:14px;padding:14px;box-shadow:0 1px 4px #0002;break-inside:avoid}
.ust{display:flex;gap:10px;align-items:center}.no{background:var(--tur);color:#fff;border-radius:50%;min-width:32px;height:32px;display:grid;place-items:center;font-weight:700}
h2{font-size:18px;margin:0}
.pozlar{display:flex;gap:4px;margin:10px 0;background:var(--lac);border-radius:10px;padding:4px}.pozlar img{width:33%;border-radius:6px}
dl{margin:0;font-size:14px}dt{font-weight:700;color:#55607a;margin-top:4px}dd{margin:0}
fieldset{border:1px solid #dde;border-radius:10px;margin:10px 0 6px;font-size:14px;display:flex;gap:10px;flex-wrap:wrap}
textarea{width:100%;min-height:64px;border:1px solid #dde;border-radius:10px;padding:8px;font:inherit;font-size:14px}
.dugmeler{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}button{background:var(--tur);color:#fff;border:0;border-radius:10px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer}
@media print{header{background:#fff;color:#000}header h1{color:#000}.dugmeler{display:none}.kart{box-shadow:none;border:1px solid #ccc}body{background:#fff}}
</style></head><body>
<header><h1>Zıp Zıp Dünya – Hareket Kataloğu</h1><div>4-9 yaş için Türkçe hareket oyunu · ${veri.length} hareket · fizyoterapist değerlendirmesi için</div></header>
<main>
<div class="bilgi">
<p><strong>Oyun nasıl çalışıyor?</strong> Her durakta 5 hareket yapılır: ısınma → durağa özel hareket → 2 hareket → soğuma. Maskot Zıpzıp hareketi önce gösterir, sonra çocuk sayaçla birlikte yapar. Kaybetmek ya da süre baskısı yoktur. Resimler, Zıpzıp'ın bir tekrardaki duruşlarıdır.</p>
<p><strong>Sizden ricamız:</strong> Her hareketin 4-9 yaşa uygunluğu, tekrar sayısı ve hızı, dikkat edilmesi gereken bir nokta (eklem, denge, zemin) ve ısınma/soğumanın yeterliliği hakkında görüşünüz.</p>
<p>Her kartta “Uygun / Değişmeli / Çıkarılmalı” seçip not yazabilirsiniz. Notlar bu tarayıcıda kendiliğinden saklanır. Bitince <strong>“PDF olarak kaydet”</strong> düğmesiyle kaydedip gönderebilirsiniz.</p>
<div class="dugmeler"><button onclick="print()">PDF olarak kaydet / yazdır</button><button onclick="if(confirm('Bütün notlar silinsin mi?')){localStorage.removeItem(A);location.reload()}" style="background:#8892a6">Notları temizle</button></div>
</div>
<div class="liste">${kartlar}</div>
</main>
<script>
const A='zipzip-katalog-notlari';
let v={};try{v=JSON.parse(localStorage.getItem(A)||'{}')}catch(e){}
document.querySelectorAll('textarea,input[type=radio]').forEach(el=>{
  if(el.type==='radio'){el.checked=v[el.name]===el.value}else{el.value=v[el.name]||''}
  el.addEventListener('input',()=>{v[el.name]=el.value;try{localStorage.setItem(A,JSON.stringify(v))}catch(e){}});
});
</script></body></html>`);
console.log('ok', fs.statSync(out).size);

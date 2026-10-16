// Doğal ses kaydı önbelleği: bir kez yüklenemeyen kayıt oturum boyunca "yok" sayılmamalı. Tarayıcı gerekmez: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { onbellekliYukle } from '../src/onbellek';

test('ilk yükleme düşerse null döner ve önbellekten silinir; ikinci istek yeniden dener ve çalar', async () => {
  const onbellek = new Map<string, Promise<string | null>>();
  let deneme = 0;
  const yukle = async () => {
    deneme++;
    if (deneme === 1) throw new Error('ağ hatası');
    return 'kayit';
  };
  assert.equal(await onbellekliYukle(onbellek, 'merhaba', yukle), null);
  assert.equal(onbellek.has('merhaba'), false);
  assert.equal(await onbellekliYukle(onbellek, 'merhaba', yukle), 'kayit');
  // Başarılı kayıt önbellekte kalır: üçüncü istek indirmez.
  assert.equal(await onbellekliYukle(onbellek, 'merhaba', yukle), 'kayit');
  assert.equal(deneme, 2);
});

test('aynı anda iki istek tek yükleme yapar', async () => {
  const onbellek = new Map<string, Promise<number | null>>();
  let deneme = 0;
  const yukle = async () => ++deneme;
  const [a, b] = await Promise.all([onbellekliYukle(onbellek, 'x', yukle), onbellekliYukle(onbellek, 'x', yukle)]);
  assert.equal(a, 1);
  assert.equal(b, 1);
  assert.equal(deneme, 1);
});

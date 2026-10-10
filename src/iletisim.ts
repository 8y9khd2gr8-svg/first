// İletişim adresi: alan adı alınınca buraya yazılacak (ör. merhaba@zipzipdunya.com).
// Boş olduğu sürece ebeveyn köşesinde geri bildirim düğmesi yerine bir not görünür.
// Adres eklenince gizlilik.html ve kosullar.html'deki iletişim satırı da güncellenmeli.
export const ILETISIM_EPOSTA = '';

// Geri bildirim e-postası: telefonun kendi e-posta uygulaması açılır, oyun hiçbir yere bağlanmaz.
// Gövdeye sadece sürüm numarası eklenir (hatayı bulmak için); çocuğa ait hiçbir bilgi eklenmez.
export function geriBildirimAdresi(): string {
  const konu = encodeURIComponent(`Zıp Zıp Dünya geri bildirim (sürüm ${__SURUM__})`);
  const govde = encodeURIComponent(`Merhaba,\n\nNe oldu / ne değişsin:\n\n\nOyun sürümü: ${__SURUM__}\n`);
  return `mailto:${ILETISIM_EPOSTA}?subject=${konu}&body=${govde}`;
}

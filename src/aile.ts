// Aileyle hareketler: çocuk bir büyüğüyle (anne, baba, abla...) birlikte yapar.
// Büyük Macera ekranındaki 👪 düğmesiyle açılır; durak gibi 5 hareketlik bir oturumdur
// ama damga vermez. Komutlar yine vücut parçasını söyleyen net eylemler.
import { Hareket, H } from './hareketler';

export const AILE_ID = 'aile';

export const AILE_OTURUMU: Hareket[] = [
  {
    ...H.kollar,
    hikaye: 'Bir büyüğünü çağır!',
    baslik: 'El ele tutun,\nkollarınızı kaldırın!',
    sesli: 'Bir büyüğünü çağır, birlikte hareket edeceğiz! El ele tutun, kollarınızı yukarı kaldırın, aşağı indirin!',
    adet: 4,
  },
  {
    ...H.zipla,
    hikaye: 'Ailece hareket!',
    baslik: 'El ele tutun,\nbirlikte zıplayın!',
    sesli: 'El ele tutun ve birlikte zıplayın! Beş kere!',
  },
  {
    hikaye: 'Ayna oyunu',
    baslik: 'Büyüğün ne yaparsa\nsen de aynısını yap!',
    sesli: 'Ayna oyunu! Büyüğün kollarını nasıl oynatırsa, sen de aynısını yap!',
    animasyon: 'kolSalla',
    tur: 'sure',
    saniye: 15,
  },
  {
    ...H.comel,
    hikaye: 'Ailece hareket!',
    baslik: 'Karşılıklı el ele tutun,\nbirlikte çömelin!',
    sesli: 'Karşılıklı el ele tutun. Birlikte çömelin ve kalkın! Beş kere!',
    tempoMs: 2000,
  },
  {
    hikaye: 'Ailece hareket!',
    baslik: 'Sarılın,\nderin nefes alın!',
    sesli: 'Şimdi birbirinize kocaman sarılın ve derin bir nefes alın. Üç kere!',
    animasyon: 'kocaman',
    tur: 'sayi',
    adet: 3,
    tempoMs: 3600,
  },
];

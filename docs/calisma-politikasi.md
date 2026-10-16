# Zıp Zıp Dünya — Otonom Çalışma ve Onay Politikası (K33, 15 Ekim 2026 akşamı)

Kullanıcının verdiği politika (aksi açıkça belirtilmedikçe her görevde geçerli). K21, K24, K31 ve K32'nin yerine geçer.

## 1. Onay beklemeden yapılabilecek işler
- İlgili kodu, proje belgelerini ve mevcut testleri incelemek.
- Küçük, kapsamı belli ve geri alınabilir geliştirmeleri uygulamak.
- Hataları düzeltmek ve gerekli regresyon testlerini yazmak.
- İlgili birim, entegrasyon ve oyun testlerini çalıştırmak.
- Başarısız testleri incelemek, nedenini bulmak ve düzeltmeyi denemek.
- Kod kalitesini ve test kararlılığını iyileştirmek (gerçek oyun davranışını bozmadan).
- KAYIT.md, TEKNIK_DURUM.md ve ilgili belgeleri yapılan işlemlerle uyumlu güncellemek.
- Değişiklikleri ayrı bir Git dalında kaydetmek, commit oluşturmak.
- Görev küçük, güvenli ve bağımsızsa mevcut GitHub iş akışına uygun PR açmak.
- Testleri ve kontrolleri tekrar çalıştırıp sonuçları doğrulamak.
- Kapsam içindeki küçük ve güvenli sorunları düzeltmek.
- Engelde güvenli alternatifleri değerlendirmek; mümkün olan diğer işleri durdurmamak.

Her adımda onay istenmez; görev bitince sonuçlar tek raporda sunulur.

## 2. Mutlaka kullanıcı onayı gerektiren işler
- Ana dala (main) birleştirmek ya da ana dalı doğrudan değiştirmek (main'e giren test sitesinde hemen yayınlanır).
- Üretim sürümünü yayımlamak, mağazaya göndermek, dağıtım başlatmak.
- GitHub izinleri, güvenlik ayarları, koruma kuralları ya da gizli anahtarları değiştirmek.
- Ücretli servis başlatmak, satın alma ya da mali yükümlülük.
- Çocuklardan ya da kameradan alınan verilerin toplanma, saklanma, paylaşılma, işlenme biçimini değiştirmek.
- Gizlilik, güvenlik ya da çocuk güvenliği üzerinde önemli etkisi olan değişiklikler.
- Geniş mimari değişiklik, ana oynanış tasarımı değişikliği, geri alınması zor işlemler.
- Kullanıcı verilerini ya da çalışan sürümü geri döndürülemez biçimde silmek ya da üzerine yazmak.

Onay gerekiyorsa sadece o adım bekler; güvenli ve bağımsız diğer işler sürer.

## 3. Çalışan sürümü koruma
- Değişiklikten önce dal, commit ve çalışma ağacı kontrol edilir.
- Kullanıcının mevcut değişiklikleri silinmez, üzerine yazılmaz.
- Testler mümkünse değişiklikten önce ve sonra çalıştırılır.
- Her görev küçük, ayrı ve geri alınabilir adımlara bölünür.
- Testleri geçmeyen değişiklik başarılı diye raporlanmaz.
- Testlerin yeşil olması tek başına main'e birleştirme ya da yayın izni değildir.
- GitHub korumaları ya da onay mekanizmaları aşılmaya çalışılmaz.
- Birden fazla oturumun aynı dosyaları aynı anda değiştirmesi önlenir.

## 4. Test ve kayıt
- Değişiklikle ilgili testler Claude tarafından çalıştırılır.
- Mümkünse yeni test eski kodda kırmızı, düzeltilmiş kodda yeşil olacak şekilde doğrulanır.
- Çalıştırılamayan test açıkça söylenir; çalıştırılmış gibi gösterilmez.
- Başarılı değişiklikler ve test sonuçları kayda yazılır.
- Commit oluşunca kimliği, PR açılınca numarası ve test durumu raporlanır.
- Başarısız test gizlenmez; rapor yeşil görünsün diye test gevşetilmez.

## 5. Durdurma ve raporlama
Onay gerektirmeyen kararda gereksiz soru sorulmaz; en güvenli ve geri alınabilir seçenek uygulanır.
Görev sonunda rapor: (1) Ne değişti? (2) Hangi testler çalıştı, sonuçları? (3) Hangi belgeler güncellendi?
(4) Hangi commit / PR? (5) Kullanıcıdan gerçekten karar ya da onay bekleyen konu var mı?

Varsayılan akış: İncele → Uygula → Test et → Kaydet → Doğrula → Raporla.

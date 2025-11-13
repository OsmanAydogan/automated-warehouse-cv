# 🏭 Depo Optimizasyon Simülasyonu - PART 2 (Optimizasyon)
> **Proje Bölümü 2/2**: Depo simülasyon sistemi. Part 1 için bkz. `volume-measurement` klasörü.
> 
> **Bu, volume-measurement'in devamıdır!** Ölçüm sisteminden gelen verilerin depo optimizasyonu için kullanıldığı web tabanlı simülasyon arayüzü.

## 📋 Bu Uygulama Nedir?

**CSV formatında yüklenen depo ve kutu verilerini** kullanarak:
- Kutuları **öncelik seviyesine göre sınıflandırır** (Yüksek, Orta, Düşük)
- **Pareto Prensibi**'ne göre depo alanını bölümlendirir
- **Hibrit algoritma** ile en optimal yerleştirmeyi hesaplar
- **3D görselleştirme**'de sonuçları gösterir
- Tüm **kısıtları kontrol eder** (stabilite, kapasite, sınırlar)

##  Ne İşe Yarar?

### Depo Yönetimi
-  Kutuları önceliğe göre organize eder
-  Depo alanını verimli kullanır
-  Erişilebilirliği optimize eder

### Simülasyon
-  3D ortamda kutu yerleşimini gösterir
-  Çatışmaları tespit eder
-  Fiziksel kısıtları kontrol eder (stabilite, yük taşıma)

### Rapor
-  Hacim verimliliğini hesaplar
-  Yerleşemeyen kutuları raporlar
-  Tüm yerleşim detaylarını gösterir

---

##  İş Akışı

```
volume-measurement (Ölçüm Sistemi)
       ↓
   Database
   (box_measurements.db)
       ↓
   CSV Export
       ↓
   algo-demos (Web Arayüzü)
       ↓
   3D Simülasyon
       ↓
   Optimized Layout
```

---

##  Dosya Yapısı

```
├── index.html          # Ana web sayfası
├── css/
│   └── styles.css      # Görünüm ve tasarım
├── js/
│   └── main.js         # Algoritma ve Three.js 3D
└── README.md           # Bu dosya
```

---

##  Hızlı Başlangıç

### 1. volume-measurement'den CSV Veri Dışarı Aktar

```bash
# Veritabanından CSV indir:
# 1. box_measurements.db'yi açı
# 2. Verileri CSV olarak dışarı aktar
```

**CSV Format:**

**Depo Verisi** (warehouse.csv):
```
DepoAdi,Genislik,Yukseklik,Uzunluk
DepoA,300,200,400
```

**Kutu Verisi** (boxes.csv):
```
KutuID,Genislik,Uzunluk,Yukseklik,Agirlik,Oncelik,MaxUst
K001,50,40,30,10,1,100
K002,60,50,40,15,2,120
```

### 2. index.html'i Tarayıcıda Aç

```bash
# Basit web sunucusu başlat
python -m http.server 8000

# Veya doğrudan aç
# index.html dosyasına çift tıkla
```

### 3. Verileri Yükle ve Simülasyonu Başlat

1. ** Depo Verisi** - CSV dosyası yükle
2. ** Kutu Verisi** - CSV dosyası yükle
3. ** Simülasyonu Başlat** - Hesapla

---

##  Simülasyon Adımları

### 1 Veri Yükleme
- Depo boyutlarını ve kutu özelliklerini okur

### 2 Kutu Sınıflandırması
- Kutuları **Öncelik 1 (Yüksek)** → Ön bölge
- Kutuları **Öncelik 2 (Orta)** → Orta bölge
- Kutuları **Öncelik 3 (Düşük)** → Arka bölge

### 3 Alan Tahsisi (Pareto)
- **Yüksek Öncelik**: 20% (Ön)
- **Orta Öncelik**: 30% (Orta)
- **Düşük Öncelik**: 50% (Arka)

### 4 Yerleştirme Algoritması
- **EMS** (Empty Maximal Spaces) kullanır
- **Rotasyonları** denerek optimal pozisyon bulur
- **Kısıtları** kontrol eder:
  -  Kutu çakışması
  -  Stabilite (kutuların altında destek var mı?)
  -  Yük kapasitesi (üst kutuların ağırlığı)
  -  Depo sınırları

### 5 3D Görselleştirme
- Depoyu 3D ortamda gösterir
- Renkli kutular:
  -  **Kırmızı**: Yüksek Öncelik
  -  **Turuncu**: Orta Öncelik
  -  **Mavi**: Düşük Öncelik

### 6 Sonuç Raporu
- Hacim verimliliği (%)
- Toplam ağırlık (kg)
- Yerleşemeyen kutu sayısı
- Detaylı tablo

---

##  3D Görselleştirme Kontrolleri

| İşlem | Kontrol |
|-------|---------|
| **Döndür** | Mouse drag |
| **Yaklaş/Uzaklaş** | Mouse scroll |
| **Kaydır** | Ctrl + Mouse drag |
| **Animasyon** |  Butonu |
| **Wireframe** |  Butonu |
| **View Reset** |  Butonu |

---

##  Bağımlılıklar

- **Three.js** (3D grafikleri için) - CDN'den yüklenir
- **HTML5/CSS3/JavaScript** - Native

---

##  Önemli Notlar

### Algoritma Detayları

1. **EMS Algoritması**: Empty Maximal Spaces
   - Boş alanları maksimum üç boyutlu dikdörtgenler olarak temsil eder
   - Her kutu için en iyi EMS'yi bulur

2. **Stabilite Kontrolü**:
   - Kutu sadece başka kutunun üstüne konabilir
   - Ağırlık merkezi destek yüzeyinde olmalı
   - Min. %50 destek alanı gerekli

3. **Yük Kapasitesi**:
   - Her kutunun taşıyabileceği max ağırlık: MaxUst
   - Üstteki tüm kutuların ağırlığı kontrolü

4. **Pareto Prensibi**:
   - Yüksek öncelik kutuları hızlı erişim için ön bölgeye
   - Düşük öncelik kutuları arka bölgeye

---

##  Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| CSV dosyası okunmuyor | CSV format kontrol et (virgülle ayrılmış) |
| Simülasyon başlamıyor | Her iki dosya yüklü mü kontrol et |
| 3D görüntü boş | Tarayıcı konsolu hata kontrol et (F12) |
| Kutuların rengi yanlış | Öncelik değeri (Oncelik) 1-3 arası mı kontrol et |

---

##  Konfigürasyon

`main.js` dosyasında ayarlanabilir değerler:

```javascript
// Renk paleti
const colors = {
    high: 0xff4444,      // Yüksek Öncelik - Kırmızı
    medium: 0xffaa00,    // Orta Öncelik - Turuncu
    low: 0x4444ff,       // Düşük Öncelik - Mavi
    warehouse: 0x888888  // Depo - Gri
};

// Alan tahsisi (Pareto)
allocation = {
    low: { ... totalLength * 0.5 },      // 50%
    medium: { ... totalLength * 0.3 },   // 30%
    high: { ... totalLength * 0.2 }      // 20%
};
```

---

##  Çıktı Örnekleri

### İstatistikler
```
Hacim Verimliliği: 82.5%
Toplam Ağırlık: 450 kg
Yerleşemeyen Kutu: 2
```

### Sonuç Tablosu
| Sıra | Kutu ID | Pozisyon | Boyutlar | Durum | Kısıtlar |
|------|---------|----------|----------|-------|----------|
| 1 | K001 | 0,50,0 | 50×40×30 | Yerleşti | OK |
| 2 | K002 | 50,50,0 | 60×50×40 | Yerleşti | OK |

---

##  Teknoloji

- **Three.js**: 3D grafikleri
- **HTML5 Canvas**: Etiketler ve texture'lar
- **Vanilla JavaScript**: Algoritma ve kontrol
- **CSS3**: Modern tasarım ve responsive

---

**Devamı**: volume-measurement ölçüm sisteminden gelen verilerle kullanılır.

##  Kurulum Adımları

### 1. Dosyaları Hazırla

algo-demos klasörü aşağıdaki yapıya sahip olmalı:

```
algo-demos/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── README.md
└── KURULUM_VE_CALISTIRMA.md
```

Tüm dosyalar bulunuyor mu kontrol et.

### 2. Web Sunucusu Başlat (Önerilen)

**Python kullanarak:**
```bash
cd algo-demos
python -m http.server 8000
```

Tarayıcı adresi çubuğuna yaz: `http://localhost:8000`

**Alternatif - Direct Açma:**
- `index.html` dosyasına çift tıkla (Bazı tarayıcılarda sorun olabilir)

### 3. Verileri Hazırla

PROJEpart_1'den verileri CSV olarak dışarı aktar:

#### Depo Verisi (warehouse.csv):
```
DepoAdi,Genislik,Yukseklik,Uzunluk
DepoA,300,200,400
```

#### Kutu Verisi (boxes.csv):
```
KutuID,Genislik,Uzunluk,Yukseklik,Agirlik,Oncelik,MaxUst
K001,50,40,30,10,1,100
K002,60,50,40,15,2,120
K003,70,60,50,20,3,150
```

**Önemli**: CSV virgülle (`,`) ayrılmış olmalı!

---

## 🎮 Kullanım

### Aşama 1: Veri Yükle

1. ** Depo Verisi** kutusuna `warehouse.csv` yükle
2. ** Kutu Verisi** kutusuna `boxes.csv` yükle

### Aşama 2: Simülasyonu Başlat

- ** Simülasyonu Başlat** butonuna tıkla

### Aşama 3: Sonuçları Görüntüle

Otomatik olarak açılacak bölümler:

1. ** Yüklenen Veriler** - Depo ve kutu bilgileri tablosu
2. ** Kutu Sınıflandırması** - Önceliğe göre gruplandırma
3. ** Alan Tahsisi** - Pareto prensibine göre depo bölümleri
4. ** 3D Yerleştirme** - Three.js ile görselleştirme
5. ** Sonuçlar** - İstatistik ve detaylı tablo

---

##  3D Görünüm Kontrolleri

| İşlem | Nasıl Yapılır |
|-------|---------------|
| Döndür | Mouse'u sürükle (yalnız tık) |
| Yaklaş | Mouse tekerleğini yukarı kaydır |
| Uzaklaş | Mouse tekerleğini aşağı kaydır |
| Kaydır | Ctrl + Mouse sürükle |
| Animasyon |  Butonu tıkla |
| Wireframe |  Butonu tıkla |
| Görünümü Sıfırla |  Butonu tıkla |

---

##  CSV Dosyası Hazırlama

### PROJEpart_1'den Dışarı Aktarma

1. `Main/box_measurements.db` dosyasını aç
2. SQLite GUI tool kullanarak query çalıştır:

```sql
-- Depo bilgisi export
SELECT DepoAdi, Genislik, Yukseklik, Uzunluk
FROM warehouse_data;

-- Kutu bilgisi export
SELECT KutuID, Genislik, Uzunluk, Yukseklik, Agirlik, Oncelik, MaxUst
FROM box_measurements;
```

3. Sonuçları CSV olarak kaydet

### Excel/LibreOffice'den CSV Export

1. Excel dosyasını aç
2. **Dosya → Farklı Kaydet**
3. Format: **CSV (Virgülle ayrılmış değerler)**
4. Kodlama: **UTF-8**

---

##  Sorun Giderme

### CSV Yüklenmiyor

**Sorun**: "Dosya okuma hatası"

**Çözüm**:
- CSV dosyasının virgülle (`,`) ayrılmış olduğunu kontrol et
- Excel'de açıp **Dosya → Farklı Kaydet → CSV** seç
- Kodlama UTF-8 olmalı

### Simülasyon Başlamıyor

**Sorun**: "Simülasyonu Başlat" butonu deaktif

**Çözüm**:
- Her iki CSV dosyasını yüklemiş misin?
- Dosya formatı doğru mu?
- Tarayıcı konsolunu kontrol et (F12 → Console)

### 3D Görünüş Boş

**Sorun**: Siyah ekran, kutu görünmüyor

**Çözüm**:
- İnternet bağlantısı var mı? (Three.js CDN için gerekli)
- Tarayıcı konsolunda error var mı? (F12)
- Farklı tarayıcı dene (Chrome recommended)

### Veriler Tabloda Gösterilmiyor

**Sorun**: Tablo boş veya hatalı veriler

**Çözüm**:
- CSV sütun adları kontrol et:
  - **Depo**: DepoAdi, Genislik, Yukseklik, Uzunluk
  - **Kutu**: KutuID, Genislik, Uzunluk, Yukseklik, Agirlik, Oncelik, MaxUst
- Sütun sırası önemli
- Boş satır var mı sil

---

##  Başarılı Kurulum İşaretleri

-  `index.html` tarayıcıda açılıyor
-  Yükleme butonları çalışıyor
-  CSV dosyaları yükleniyor
-  Simülasyon başlıyor
-  3D görünüm gösteriliyor
-  Sonuç tablosu doldurulmuş

---

##  Önceki Adım: Part 1 - Kutu Ölçüm Sistemi

 **Part 1 verisiz başlayamazsın!**

Part 1'i henüz çalıştırmadıysanız:

1. **Part 1'e Git** (`../volume-measurement/`)
   - Kurulum kılavuzunu oku: `volume-measurement/KURULUM_VE_CALISTIRMA.md`
   - Kutuları ölç
   - Ölçüm verilerini kaydet
   - CSV export et

2. **CSV Dosyalarını Al**
   - `box_measurements.csv` (Part 1'den)
   - Depo boyutlarını tanımlayan `warehouse.csv` oluştur

3. **Part 2'ye Dön**
   - CSV dosyalarını yükle
   - Optimizasyonu çalıştır

 **Daha fazla bilgi**: 
 - [README.md](README.md) (Part 2 detayları)
 - [../README.md](../README.md) (Ana Proje Dokümantasyonu)

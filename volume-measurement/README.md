#  Koli Hacim Ölçüm Sistemi - PART 1 (Ölçüm)
> **Proje Bölümü 1/2**: Kutu ölçüm sistemi. Part 2 için bkz. `algo-demos` klasörü.

**ArUco işaretçileri** kullanarak kutuların hacmini (genişlik, yükseklik, derinlik) gerçek zamanlı olarak ölçen ve sonuçları veritabanında saklayan Python uygulaması.

##  Ne İşe Yarar?

- **Kutu Ölçümü**: IP kamera ile kutuyu görüp otomatik olarak boyutlarını ölçer
- **Hacim Hesaplama**: Genişlik × Yükseklik × Derinlik = Hacim
- **Veri Kayıt**: Ölçüm sonuçlarını veritabanına kaydeder
- **Fotoğraf Kayıt**: Ölçüm sırasındaki görüntüleri kaydeder
- **Kutu Bilgisi**: Ölçüldükten sonra kutu hakkında ek bilgiler (ağırlık, kırılganlık vb.) girişi

---

##  Dosya Yapısı

```
├── README.md                    # Bu dosya
├── KURULUM_VE_CALISTIRMA.md    # Kurulum kılavuzu
├── LICENSE                      # MIT Lisansı
├── .gitignore                   # Git ignore
│
├── aruco_ureteci/              # ArUco işaretçi oluşturma
│   └── create_aruco.py         # İşaretçi oluşturur (4x4 cm)
│
└── Main/                       # Ana uygulama
    ├── requirements.txt        # Python paketleri
    ├── hacim_olcumleri/       # Fotoğraf kayıt klasörü
    └── src/
        ├── core/              # Ölçüm ve detektör
        ├── database/          # Veritabanı yönetimi
        └── ui/                # PyQt6 arayüzü
```

---

##  Hızlı Başlangıç

### 1. Kurulum
```bash
git clone https://github.com/yourusername/koli-hacim-olcum.git
cd koli-hacim-olcum/Main
pip install -r requirements.txt
```

### 2. ArUco İşaretçi Oluştur
```bash
cd ../aruco_ureteci
python create_aruco.py
# marker23.png dosyasını 4x4 cm olacak şekilde yazdır
```

### 3. Uygulamayı Çalıştır
```bash
cd ../Main
python -m src.core.measure_object_size
```

---

##  Nasıl Kullanılır?

### Ölçüm Adımları

1. **Kutuyu kameraya doğru yerleştir** → Ön görünüm
   - Genişlik ve Yükseklik otomatik ölçülür
   - `Y` tuşuna bas → Fotoğraf kaydedilir

2. **Kutuyu sağa çevir** → Yan görünüm  
   - Derinlik otomatik ölçülür
   - `Y` tuşuna bas → Fotoğraf kaydedilir

3. **PyQt6 Formu Açılır**
   - Kutu bilgilerini gir (ağırlık, işaretleme vb.)
   - "Kaydet" butonuna tıkla
   - Veriler veritabanına kaydedilir

### Çıktılar

- **Fotoğraflar**: `Main/hacim_olcumleri/` klasörü
- **Veritabanı**: `Main/box_measurements.db` (SQLite)

### Klavye Kısayolları

| Tuş | Fonksiyon |
|-----|-----------|
| `Y` | Fotoğrafı kaydet |
| `N` | Fotoğrafı kaydetme |
| `ESC` | Programdan çık |

---

##  Bağımlılıklar

```
opencv-contrib-python>=4.8.0    # Görüntü işleme
numpy>=1.24.0                   # Matematik işlemleri
PyQt6>=6.5.0                    # GUI
```

---

##  Sorun Giderme

### Kamera açılmıyor
- `measure_object_size.py` dosyasında (satır 70) kamera URL'sini kontrol et
- Local webcam için: `cv2.VideoCapture(0)`

### ArUco işaretçi tespit edilmiyor
- İşaretçinin düzgün baskı olduğundan emin ol
- Işık koşullarını iyileştir
- İşaretçi tam 4x4 cm olmalı

### Kutu tespit edilmiyor
- Kutu keskin renk kontrastı olmalı (açık/koyu)
- Kamerayı kutuya 90° açıyla tutun

---

##  Lisans

MIT Lisansı - Detaylar için [LICENSE](LICENSE) dosyasını okuyun.

---

##  Detaylı Kurulum

Adım adım kurulum talimatları için [KURULUM_VE_CALISTIRMA.md](KURULUM_VE_CALISTIRMA.md) dosyasını okuyun.

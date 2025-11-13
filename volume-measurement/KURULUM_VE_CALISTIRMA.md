# Kurulum ve Çalıştırma Kılavuzu

##  Sistem Gereksinimleri

- **Python**: 3.8+
- **İşletim Sistemi**: Windows, Linux, macOS
- **RAM**: 2 GB
- **Kamera**: IP kamera veya USB webcam
- **ArUco İşaretçi**: 4×4 cm baskılı

---

##  Kurulum Adımları


### 1. Bağımlılıkları Yükle

```bash
pip install -r requirements.txt
```

---

##  ArUco İşaretçi Hazırlama

### 1. İşaretçi Oluştur

```bash
cd ../aruco_ureteci
python create_aruco.py
```

Bu komut `marker23.png` dosyası oluşturur.

### 2. İşaretçiyi Yazdır

- `marker23.png` dosyasını aç
- **%100 ölçekte** yazdır (değiştirme!)
- **Çıktı 4×4 cm olmalı** (cetvel ile kontrol et)
- Yazdırılan işaretçiyi kutuya/yüzeye yapıştır

---

##  Uygulamayı Çalıştırma

### Kamera URL'sini Ayarla

`Main/src/core/measure_object_size.py` dosyasını aç (satır ~70):

```python
# IP kamera için
cap = cv2.VideoCapture('http://192.168.5.25:8080/video')

# Veya USB webcam için
cap = cv2.VideoCapture(0)
```

URL'yi kendi kameranızın adresine göre değiştirin.

### Programı Başlat

```bash
cd Main
python -m src.core.measure_object_size
```

---

##  Kullanım

1. **Kutuyu kameraya doğru yerleştir** → Ön görünüm (W×H)
2. **`Y` tuşu bas** → Fotoğraf kaydedilir
3. **Kutuyu sağa çevir** → Yan görünüm (D)
4. **`Y` tuşu bas** → Fotoğraf kaydedilir
5. **Form doldur** → "Kaydet" tıkla
6. **`ESC`** → Programdan çık

---

##  Hızlı Sorun Çözümü

| Sorun | Çözüm |
|-------|-------|
| `ModuleNotFoundError` | `pip install -r requirements.txt` |
| Kamera açılmıyor | Kamera URL'sini kontrol et |
| ArUco bulunamıyor | İşaretçi düzgün baskı olsun, ışık iyi olsun |
| Kutu tespit edilmiyor | Kutuyu 90° açıyla tut, kontrast iyi olsun |
| `FileNotFoundError` | `Main` klasöründen çalıştır |

---

##  Çıktılar Nereye Kaydedilir?

- **Fotoğraflar**: `Main/hacim_olcumleri/hacim_olcumu_1/` vb.
- **Veritabanı**: `Main/box_measurements.db`

---

##  Başarılı Kurulum İşaretleri

-  `python --version` komutu Python 3.8+ döndürür

---

##  Sonraki Adım: Part 2 - Depo Optimizasyonu

 Kutu ölçümleri tamamlandıktan sonra **Part 2'yi başlat**:

1. **CSV Export Et**
   ```bash
   # Programdan: Measurements → Export as CSV
   # Dosya: box_measurements.csv
   ```

2. **Part 2'yi Aç** (`../algo-demos/`)
   - Kullanıcı kılavuzunu oku: `algo-demos/KURULUM_VE_CALISTIRMA.md`
   - CSV dosyasını yükle
   - Depo boyutlarını gir
   - Optimizasyonu çalıştır
   - 3D sonuçları incele

 **Daha fazla bilgi**: `../README.md` (Ana Proje Dokümantasyonu)
-  `pip list` opencv, numpy, PyQt6 gösterir
-  `marker23.png` oluşturulur
-  Program açıldığında OpenCV penceresi görünür
-  ArUco işaretçi tespit edilir (kırmızı çerçeve)
-  Kutu tespit edilir (mavi kutu)
-  Ölçümler ekrana yazdırılır

---


# Akıllı Depo Yönetim Sistemi

ArUco marker ile kutu ölçümü yapıp, sonra o kutuları 3D depoda en verimli şekilde yerleştiren iki parçalı bir sistem.

---

## Ne İşe Yarar?

**Senaryo:** Depona yüzlerce farklı boyutta kutu geliyor. Bunları nasıl yerleştireceksin?

1. **Part 1** → Kamerayla kutuyu tara, boyutlarını otomatik ölç
2. **Part 2** → Ölçülen kutuları 3D simülasyonda en optimal şekilde yerleştir

**Sonuç:** Depo alanını maksimum verimle kullan, önemli kutular öne gelsin.

---

## Proje Yapısı

```
PROJE/
├── volume-measurement/     # Part 1: Kutu Ölçüm Sistemi
│   └── ArUco marker + OpenCV ile gerçek zamanlı ölçüm
│
└── algo-demos/             # Part 2: Depo Optimizasyonu
    └── 3D simülasyon + EMS algoritması ile yerleştirme
```

---

## Hızlı Başlangıç

### Part 1: Kutuları Ölç

```bash
cd volume-measurement/Main
pip install -r requirements.txt
python -m src.core.measure_object_size
```

 Daha fazla detay: **volume-measurement/KURULUM_VE_CALISTIRMA.md**

---

### Part 2: Depoya Yerleştir

```bash
cd algo-demos
python -m http.server 8000
# Tarayıcıda: http://localhost:8000
```

Daha fazla detay: **algo-demos/KURULUM_VE_CALISTIRMA.md**

---

## Özellikler

### Part 1 – Ölçüm Sistemi

* IP kamera ile kutu boyutlarını otomatik ölç
* ArUco marker kullanarak gerçek dünya ölçeği
* Fotoğraf kayıt ve veritabanına yaz
* PyQt6 arayüzü ile kutu bilgisi girişi

### Part 2 – Optimizasyon

* Pareto prensibi ile alan tahsisi
* EMS algoritması ile akıllı yerleştirme
* 3D görselleştirme (Three.js)
* Stabilite ve yük kapasitesi kontrolü
* Öncelik bazlı kutu sınıflandırma

---

## Teknolojiler

**Part 1:** Python • OpenCV • ArUco • PyQt6 • SQLite
**Part 2:** JavaScript • Three.js • HTML5 • CSS3

---

## Lisans

**MIT License** – İstediğin gibi kullan, değiştir, paylaş!

---

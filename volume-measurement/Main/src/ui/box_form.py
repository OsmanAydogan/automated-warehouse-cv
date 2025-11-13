from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                             QLineEdit, QCheckBox, QPushButton, QMessageBox, QSpinBox)
from PyQt6.QtCore import Qt
import sys
from pathlib import Path

# Add src directory to Python path
src_path = str(Path(__file__).parent.parent)
if src_path not in sys.path:
    sys.path.append(src_path)

from database.database import Database

class BoxForm(QWidget):
    def __init__(self, measurements=None):
        super().__init__()
        self.measurements = measurements or {}
        self.db = Database()
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle('Kutu Bilgileri')
        self.setGeometry(300, 300, 400, 500)

        layout = QVBoxLayout()

        # Ölçüm bilgileri
        measurements_group = QVBoxLayout()
        measurements_group.addWidget(QLabel('Ölçüm Bilgileri', styleSheet='font-weight: bold;'))
        
        self.width_label = QLabel(f'Genişlik: {self.measurements.get("width", 0):.1f} cm')
        self.height_label = QLabel(f'Yükseklik: {self.measurements.get("height", 0):.1f} cm')
        self.depth_label = QLabel(f'Derinlik: {self.measurements.get("depth", 0):.1f} cm')
        self.volume_label = QLabel(f'Hacim: {self.measurements.get("volume", 0):.1f} cm³')

        measurements_group.addWidget(self.width_label)
        measurements_group.addWidget(self.height_label)
        measurements_group.addWidget(self.depth_label)
        measurements_group.addWidget(self.volume_label)
        
        layout.addLayout(measurements_group)
        layout.addSpacing(20)

        # Kutu özellikleri
        properties_group = QVBoxLayout()
        properties_group.addWidget(QLabel('Kutu Özellikleri', styleSheet='font-weight: bold;'))

        # Kırılganlık seviyesi
        fragility_layout = QHBoxLayout()
        fragility_layout.addWidget(QLabel('Kırılganlık Seviyesi (1-5):'))
        self.fragility_input = QSpinBox()
        self.fragility_input.setRange(1, 5)
        fragility_layout.addWidget(self.fragility_input)
        properties_group.addLayout(fragility_layout)

        # Maksimum Üst Ağırlık
        max_weight_layout = QHBoxLayout()
        max_weight_layout.addWidget(QLabel('Maksimum Üst Ağırlık (kg):'))
        self.max_weight_input = QLineEdit()
        self.max_weight_input.setPlaceholderText('0.0')
        max_weight_layout.addWidget(self.max_weight_input)
        properties_group.addLayout(max_weight_layout)

        # Döndürülme izni
        self.rotatable_checkbox = QCheckBox('Döndürülebilir')
        properties_group.addWidget(self.rotatable_checkbox)

        # Etiket bilgisi (Mevcut)
        marking_layout = QHBoxLayout()
        marking_layout.addWidget(QLabel('İşaretleme:'))
        self.marking_input = QLineEdit()
        self.marking_input.setPlaceholderText('Örn: Üstte, Dikkat vb.')
        marking_layout.addWidget(self.marking_input)
        properties_group.addLayout(marking_layout)

        # Öncelik seviyesi
        priority_layout = QHBoxLayout()
        priority_layout.addWidget(QLabel('Öncelik Seviyesi:'))
        self.priority_input = QSpinBox()
        self.priority_input.setRange(1, 3) # 1: Acil, 2: Normal, 3: Geç
        priority_layout.addWidget(self.priority_input)
        properties_group.addLayout(priority_layout)

        # Kırılganlık (Mevcut - Yeniden etiketlendi)
        self.fragile_checkbox = QCheckBox('Genel Kırılgan (deprecated?)') # Keeping existing fragile checkbox for now, maybe it has a different meaning?
        properties_group.addWidget(self.fragile_checkbox)

        # Ağırlık (Mevcut)
        weight_layout = QHBoxLayout()
        weight_layout.addWidget(QLabel('Ağırlık (kg):'))
        self.weight_input = QLineEdit()
        self.weight_input.setPlaceholderText('0.0')
        weight_layout.addWidget(self.weight_input)
        properties_group.addLayout(weight_layout)

        layout.addLayout(properties_group)
        layout.addSpacing(20)

        # Kaydet butonu
        save_button = QPushButton('Kaydet')
        save_button.clicked.connect(self.save_data)
        layout.addWidget(save_button)

        self.setLayout(layout)

    def save_data(self):
        try:
            weight = float(self.weight_input.text()) if self.weight_input.text() else None
            markings = self.marking_input.text() if self.marking_input.text() else None
            kirilganlik_seviyesi = self.fragility_input.value()
            maksimum_ust_agirlik = float(self.max_weight_input.text()) if self.max_weight_input.text() else None
            dondurulme_izni = self.rotatable_checkbox.isChecked()
            oncelik_seviyesi = self.priority_input.value()

            self.db.insert_measurement(
                width=self.measurements.get('width', 0),
                height=self.measurements.get('height', 0),
                depth=self.measurements.get('depth', 0),
                volume=self.measurements.get('volume', 0),
                is_fragile=self.fragile_checkbox.isChecked(),
                weight=weight,
                markings=markings,
                kirilganlik_seviyesi=kirilganlik_seviyesi,
                maksimum_ust_agirlik=maksimum_ust_agirlik,
                dondurulme_izni=dondurulme_izni,
                oncelik_seviyesi=oncelik_seviyesi
            )

            QMessageBox.information(self, 'Başarılı', 'Kutu bilgileri kaydedildi!')
            self.close()

        except ValueError:
            QMessageBox.warning(self, 'Hata', 'Lütfen ağırlık için geçerli bir sayı girin!') 
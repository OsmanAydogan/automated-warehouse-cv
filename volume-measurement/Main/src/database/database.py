import sqlite3

class Database:
    def __init__(self, db_name="box_measurements.db"):
        self.db_name = db_name
        self.create_tables()

    def create_tables(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()

        # Kutu ölçümleri tablosu
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS box_measurements (
            box_id INTEGER PRIMARY KEY AUTOINCREMENT,
            width REAL NOT NULL,
            height REAL NOT NULL,
            depth REAL NOT NULL,
            volume REAL NOT NULL,
            is_fragile BOOLEAN DEFAULT 0,
            weight REAL,
            markings TEXT,
            kirilganlik_seviyesi INTEGER,
            maksimum_ust_agirlik REAL,
            dondurulme_izni BOOLEAN,
            oncelik_seviyesi INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        conn.commit()
        conn.close()

    def insert_measurement(self, width, height, depth, volume, is_fragile=False, weight=None, markings=None, kirilganlik_seviyesi=None, maksimum_ust_agirlik=None, dondurulme_izni=True, oncelik_seviyesi=None):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()

        cursor.execute('''
        INSERT INTO box_measurements (width, height, depth, volume, is_fragile, weight, markings, kirilganlik_seviyesi, maksimum_ust_agirlik, dondurulme_izni, oncelik_seviyesi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (width, height, depth, volume, is_fragile, weight, markings, kirilganlik_seviyesi, maksimum_ust_agirlik, dondurulme_izni, oncelik_seviyesi))

        conn.commit()
        conn.close()

    def get_all_measurements(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM box_measurements ORDER BY created_at DESC')
        measurements = cursor.fetchall()

        conn.close()
        return measurements 
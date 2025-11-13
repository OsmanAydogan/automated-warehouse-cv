import cv2
import numpy as np
import time
import os
import sys
from pathlib import Path

# Yol'a ekle
src_path = str(Path(__file__).parent.parent)
if src_path not in sys.path:
    sys.path.append(src_path)

from core.object_detector import AdvancedBoxDetector
from ui.box_form import BoxForm
from PyQt6.QtWidgets import QApplication

def show_confirmation_dialog(image):
    window_name = "Onay Ekrani"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.imshow(window_name, image)
    
    while True:
        key = cv2.waitKey(1) & 0xFF
        if key == ord('y') or key == ord('Y'):
            cv2.destroyWindow(window_name)
            return True
        elif key == ord('n') or key == ord('N'):
            cv2.destroyWindow(window_name)
            return False

def get_next_measurement_folder():
    base_dir = "hacim_olcumleri"
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
    
    # Mevcut klasörleri kontrol et
    existing_folders = [f for f in os.listdir(base_dir) if f.startswith("hacim_olcumu_")]
    if not existing_folders:
        next_num = 1
    else:
        # En yüksek numarayı bul
        numbers = [int(f.split("_")[-1]) for f in existing_folders]
        next_num = max(numbers) + 1
    
    folder_name = f"hacim_olcumu_{next_num}"
    folder_path = os.path.join(base_dir, folder_name)
    os.makedirs(folder_path)
    return folder_path

def realtime_box_measurement():
    #DB
    app = QApplication(sys.argv)
    parameters = cv2.aruco.DetectorParameters()
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)

    detector = AdvancedBoxDetector()

    aruco_marker_size = 4.0  # cm
    min_object_size_ratio = 2.0  # Nesne boyutunun ArUco marker boyutuna oranı

    cap = cv2.VideoCapture('http://192.168.5.25:8080/video')

    MEASURE_WIDTH_HEIGHT = 0
    mode = MEASURE_WIDTH_HEIGHT
    measurements = {"width": None, "height": None, "depth": None}
    saved_frames = []
    last_save_time = 0
    save_cooldown = 2  # saniye
    current_measurement_folder = None

    ay_isimleri = {
    "01": "Ocak", "02": "Subat", "03": "Mart", "04": "Nisan",
    "05": "Mayis", "06": "Haziran", "07": "Temmuz", "08": "Agustos",
    "09": "Eylul", "10": "Ekim", "11": "Kasim", "12": "Aralik"
}
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Kamera okunamadı!")
            break

        frame = cv2.resize(frame, (1280, 720))
        output = frame.copy()

        corners, _, _ = cv2.aruco.detectMarkers(frame, aruco_dict, parameters=parameters)

        if mode == MEASURE_WIDTH_HEIGHT:
            status_text = "MOD: Genislik & Yukseklik Olcumu (On Gorunum)"
        else:
            status_text = "MOD: Derinlik Olcumu (Yan Gorunum)"

        cv2.putText(output, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(output, "ESC: Cikis", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 1)

        y_pos = 90
        for key, value in measurements.items():
            if value is not None:
                cv2.putText(output, f"{key}: {round(value, 1)} cm", (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                y_pos += 30

        if len(corners) > 0:
            int_corners = np.int32(corners[0])
            cv2.polylines(output, [int_corners], True, (0, 0, 255), 2)
            # ArUco perspektif oran kontrolü
            top_left, top_right, bottom_right, bottom_left = corners[0][0]
            side1 = np.linalg.norm(top_left - top_right)
            side2 = np.linalg.norm(top_right - bottom_right)

            aspect_ratio = side1 / side2 if side2 != 0 else 0
            if aspect_ratio == 1:  # Dik bakış açısı kontrolü
                aruco_perimeter = cv2.arcLength(corners[0], True)
                pixel_cm_ratio = aruco_perimeter / (4 * aruco_marker_size)
                

                contours = detector.detect_objects(frame)

                if contours:
                    target_contour = None
                    marker_rect = cv2.minAreaRect(corners[0])
                    (mx, my), (mw, mh), _ = marker_rect
                    marker_area = mw * mh

                    for cnt in contours:
                        if cv2.pointPolygonTest(cnt, (mx, my), False) >= 0:
                            target_contour = cnt
                            break

                    if target_contour is not None:
                        rect = cv2.minAreaRect(target_contour)
                        (x, y), (w, h), _ = rect
                        box = cv2.boxPoints(rect)
                        box = np.int32(box)
                        cv2.polylines(output, [box], True, (255, 0, 0), 2)
                        cv2.putText(output, "KUTU", (int(x), int(y)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                        cv2.putText(output, "Kutu tespit edildi!", (10, y_pos + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

                        # Nesne boyutu kontrolü
                        object_area = w * h
                        if object_area > marker_area * min_object_size_ratio:
                            if mode == MEASURE_WIDTH_HEIGHT:
                                width = w / pixel_cm_ratio
                                height = h / pixel_cm_ratio
                                measurements["width"] = width
                                measurements["height"] = height

                                cv2.putText(output, f"Genislik: {round(width, 1)} cm", (int(x - 100), int(y - 20)), cv2.FONT_HERSHEY_PLAIN, 2, (100, 200, 0), 2)
                                cv2.putText(output, f"Yukseklik: {round(height, 1)} cm", (int(x - 100), int(y + 15)), cv2.FONT_HERSHEY_PLAIN, 2, (100, 200, 0), 2)

                                # Otomatik kayıt kontrolü
                                current_time = time.time()
                                if current_time - last_save_time > save_cooldown:
                                    if current_measurement_folder is None:
                                        current_measurement_folder = get_next_measurement_folder()

                                    # Şu anki tarih ve saat bilgilerini al
                                    tarih = time.strftime("%d-%m-%Y")
                                    saat = time.strftime("%H-%M-%S")

                                    # Ay numarasını al ve Türkçe ay ismine çevir
                                    gun, ay, yil = tarih.split("-")
                                    ay_ismi = ay_isimleri[ay]

                                    # Türkçe zaman damgası oluştur
                                    timestamp = f"{gun}_{ay_ismi}_{yil}_{saat}"
                                    filename = os.path.join(current_measurement_folder, f"genislik_yukseklik_{timestamp}.jpg")
                                    temp_output = output.copy()
                                    cv2.putText(temp_output, "Bu goruntu kaydedilsin mi? (Y/N)", (10, y_pos + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                                    
                                    if show_confirmation_dialog(temp_output):
                                        cv2.imwrite(filename, output)
                                        print(f"Görüntü kaydedildi: {filename}")
                                        saved_frames.append(output)
                                        last_save_time = current_time
                                        mode = 1 - mode  # Derinlik moduna geç

                            else:
                                depth = w / pixel_cm_ratio
                                measurements["depth"] = depth
                                
                                # Derinlik ölçümü için kenarları çiz
                                box_points = cv2.boxPoints(rect)
                                box_points = np.int32(box_points)
                                
                                # Tüm kenarları mavi çiz
                                cv2.polylines(output, [box_points], True, (255, 0, 0), 2)
                                
                                # Derinlik ölçümü için kullanılan karışılıklı kenarları turuncu çiz
                                cv2.line(output, tuple(box_points[0]), tuple(box_points[3]), (0, 165, 255), 3)  
                                cv2.line(output, tuple(box_points[1]), tuple(box_points[2]), (0, 165, 255), 3)  
                                
                                cv2.putText(output, f"Derinlik(w): {round(depth, 1)} cm", (int(x - 100), int(y - 20)), cv2.FONT_HERSHEY_PLAIN, 2, (100, 200, 0), 2)

                                # Otomatik kayıt kontrolü
                                current_time = time.time()
                                if current_time - last_save_time > save_cooldown:
                                    # Derinlik ölçümü için yeni timestamp oluştur
                                    tarih = time.strftime("%d-%m-%Y")
                                    saat = time.strftime("%H-%M-%S")
                                    gun, ay, yil = tarih.split("-")
                                    ay_ismi = ay_isimleri[ay]
                                    timestamp = f"{gun}_{ay_ismi}_{yil}_{saat}"
                                    
                                    filename = os.path.join(current_measurement_folder, f"derinlik_{timestamp}.jpg")
                                    temp_output = output.copy()
                                    cv2.putText(temp_output, "Bu goruntu kaydedilsin mi? (Y/N)", (10, y_pos + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                                    
                                    if show_confirmation_dialog(temp_output):
                                        cv2.imwrite(filename, output)
                                        print(f"Görüntü kaydedildi: {filename}")
                                        saved_frames.append(output)
                                        last_save_time = current_time
                                        break  # Programdan çık
                        else:
                            cv2.putText(output, "Nesne boyutu yetersiz!", (10, y_pos + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            else:
                cv2.putText(output, "Aci Uygun Degil! Lütfen kamerayi duz konumlandirin.", (10, y_pos + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        if measurements["width"] is not None and measurements["height"] is not None and measurements["depth"] is not None:
            volume = measurements["width"] * measurements["height"] * measurements["depth"]
            cv2.putText(output, f"Hacim: {round(volume, 1)} cm^3", (10, y_pos + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

        cv2.namedWindow("Koli Hacim Hesaplama", cv2.WINDOW_NORMAL)
        cv2.imshow("Koli Hacim Hesaplama", output)

        key = cv2.waitKey(1)
        if key == 27:  # ESC
            break

    if measurements["width"] is not None and measurements["height"] is not None and measurements["depth"] is not None:
        volume = measurements["width"] * measurements["height"] * measurements["depth"]
        print("\n===== KOLİ ÖLÇÜM SONUÇLARI =====")
        print(f"Genişlik: {round(measurements['width'], 2)} cm")
        print(f"Yükseklik: {round(measurements['height'], 2)} cm")
        print(f"Derinlik: {round(measurements['depth'], 2)} cm")
        print(f"Hacim: {round(volume, 2)} cm^3")
        print("================================")

    cap.release()
    cv2.destroyAllWindows()

    # Tüm ölçümler tamamlandığında form arayüzünü göster DB
    if measurements["width"] is not None and measurements["height"] is not None and measurements["depth"] is not None:
        volume = measurements["width"] * measurements["height"] * measurements["depth"]
        measurements["volume"] = volume
        
        form = BoxForm(measurements)
        form.show()
        app.exec()
        
        return  # Programdan çık

if __name__ == "__main__":
    realtime_box_measurement()






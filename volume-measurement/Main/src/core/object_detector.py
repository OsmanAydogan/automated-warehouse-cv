import cv2
import numpy as np

class AdvancedBoxDetector:
    def __init__(self):
        pass

    def detect_objects(self, frame):
        # Görüntüyü yumuşatma
        blurred = cv2.GaussianBlur(frame, (7, 7), 0)
        
        # Gri tonlamaya çevirme
        gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
        
        # Canny kenar tespiti
        # *** bakılacak
        edges = cv2.Canny(gray, 30, 100)
        
        # Morfolojik işlemler ile kenarları güçlendirme
        kernel = np.ones((5,5), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=1)

        # Debug için kenar görüntüsünü gösterme
        # cv2.imshow("Edges", edges)
        cv2.imshow("Dilated", dilated)
        
        # Konturları bulma
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Konturları filtreleme
        objects_contours = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 2000:
                # Kontur yaklaşımı ile gürültüyü azaltma
                epsilon = 0.02 * cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, epsilon, True)
                
                # Dikdörtgensel şekilleri seçme (4-6 köşe)
                if 4 <= len(approx) <= 6:
                    # Konvekslik kontrolü
                    hull = cv2.convexHull(cnt)
                    hull_area = cv2.contourArea(hull)
                    solidity = float(area) / hull_area
                    
                    # Yüksek konvekslik oranına sahip şekilleri seç
                    if solidity > 0.9:
                        objects_contours.append(cnt)
        
        return objects_contours
    




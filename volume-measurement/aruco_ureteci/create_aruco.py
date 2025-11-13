import numpy as np
import cv2


import cv2
import numpy as np

dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)

markerImage = np.zeros((250, 250), dtype=np.uint8)

cv2.aruco.generateImageMarker(dictionary, 23, 250, markerImage, 1)

cv2.imwrite("marker23.png", markerImage) # markerImage inplace



# print(cv2.__version__)
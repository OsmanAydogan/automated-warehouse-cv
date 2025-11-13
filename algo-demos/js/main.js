// Global değişkenler
let warehouseData = null;
let boxData = null;
let classifiedBoxes = {};
let placedBoxes = [];
let scene, camera, renderer, controls;
let animationId = null;
let isAnimating = false;
let wireframeMode = false;
let lookAtTarget = null;
let targetRotationX = 0, targetRotationY = 0;
let mouseX = 0, mouseY = 0;
let isMouseDown = false;
let wasPanningLastFrame = false;
let placementOrder = 1;

// Renk paleti
const colors = {
    high: 0xff4444,
    medium: 0xffaa00,
    low: 0x4444ff,
    warehouse: 0x888888
};

// CSV okuma fonksiyonu
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }
    return data;
}

// Dosya yükleme olayları
document.getElementById('warehouseFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                warehouseData = parseCSV(e.target.result);
                console.log('Depo verisi yüklendi:', warehouseData);
                updateStartButton();
                displayData();
            } catch (error) {
                alert('Depo dosyası okuma hatası: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('boxFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                boxData = parseCSV(e.target.result);
                console.log('Kutu verisi yüklendi:', boxData);
                updateStartButton();
                displayData();
            } catch (error) {
                alert('Kutu dosyası okuma hatası: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});

// Başlat butonu durumu
function updateStartButton() {
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = !(warehouseData && boxData);
}

// Verileri görüntüleme
function displayData() {
    const dataPanel = document.getElementById('dataPanel');
    const dataDisplay = document.getElementById('dataDisplay');
    if (warehouseData && boxData) {
        dataPanel.classList.remove('hidden');
        let html = '<h3>Depo Bilgileri</h3>';
        html += '<div class="table-container"><table>';
        html += '<thead><tr><th>Depo Adı</th><th>Genişlik</th><th>Yükseklik</th><th>Uzunluk</th></tr></thead><tbody>';
        warehouseData.forEach(warehouse => {
            html += `<tr>
                <td>${warehouse['DepoAdi']}</td>
                <td>${warehouse['Genislik']}</td>
                <td>${warehouse['Yukseklik']}</td>
                <td>${warehouse['Uzunluk']}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        html += '<h3>Kutu Bilgileri</h3>';
        html += '<div class="table-container"><table>';
        html += '<thead><tr><th>Kutu ID</th><th>Boyutlar</th><th>Ağırlık</th><th>Öncelik</th><th>Max Üst</th></tr></thead><tbody>';
        boxData.forEach(box => {
            html += `<tr>
                <td>${box['KutuID']}</td>
                <td>${box['Genislik']} × ${box['Uzunluk']} × ${box['Yukseklik']}</td>
                <td>${box['Agirlik']}</td>
                <td>${box['Oncelik']}</td>
                <td>${box['MaxUst']}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        dataDisplay.innerHTML = html;
    }
}

// Kutu sınıflandırması
function classifyBoxes() {
    classifiedBoxes = {
        high: [],
        medium: [],
        low: []
    };
    boxData.forEach(box => {
        const priority = parseInt(box['Oncelik']);
        const boxObj = {
            id: box['KutuID'],
            width: parseFloat(box['Genislik']),
            length: parseFloat(box['Uzunluk']),
            height: parseFloat(box['Yukseklik']),
            weight: parseFloat(box['Agirlik']),
            priority: priority,
            maxLoad: parseFloat(box['MaxUst'])
        };
        boxObj.volume = boxObj.width * boxObj.length * boxObj.height;
        if (priority === 1) {
            classifiedBoxes.high.push(boxObj);
        } else if (priority === 2) {
            classifiedBoxes.medium.push(boxObj);
        } else {
            classifiedBoxes.low.push(boxObj);
        }
    });
    // Her sınıf için sıralama
    const sortBoxes = (boxes) => {
        return boxes.sort((a, b) => {
            if (b.maxLoad !== a.maxLoad) return b.maxLoad - a.maxLoad;
            if (b.volume !== a.volume) return b.volume - a.volume;
            return b.weight - a.weight;
        });
    };
    classifiedBoxes.high = sortBoxes(classifiedBoxes.high);
    classifiedBoxes.medium = sortBoxes(classifiedBoxes.medium);
    classifiedBoxes.low = sortBoxes(classifiedBoxes.low);
    displayClassification();
}

// Sınıflandırma görüntüleme
function displayClassification() {
    const panel = document.getElementById('classificationPanel');
    const display = document.getElementById('classificationDisplay');
    
    panel.classList.remove('hidden');
    
    let html = '';
    
    const groups = [
        { key: 'high', title: 'Yüksek Öncelik (1)', class: 'priority-high' },
        { key: 'medium', title: 'Orta Öncelik (2)', class: 'priority-medium' },
        { key: 'low', title: 'Düşük Öncelik (3)', class: 'priority-low' }
    ];
    
    groups.forEach(group => {
        html += `<div class="priority-group ${group.class}">
            <h3>${group.title}</h3>`;
        
        classifiedBoxes[group.key].forEach(box => {
            html += `<div class="box-item">
                <strong>${box.id}</strong><br>
                Boyut: ${box.width}×${box.length}×${box.height} cm<br>
                Hacim: ${box.volume.toLocaleString()} cm³<br>
                Ağırlık: ${box.weight} kg<br>
                Max Yük: ${box.maxLoad} kg
            </div>`;
        });
        
        html += '</div>';
    });
    
    display.innerHTML = html;
}

// Alan tahsisi
function calculateAllocation() {
    const warehouse = warehouseData[0];
    const totalLength = parseFloat(warehouse['Uzunluk']);
    const allocation = {
        low: { start: 0, end: totalLength * 0.5, length: totalLength * 0.5 },
        medium: { start: totalLength * 0.5, end: totalLength * 0.8, length: totalLength * 0.3 },
        high: { start: totalLength * 0.8, end: totalLength, length: totalLength * 0.2 }
    };
    displayAllocation(allocation, totalLength);
    return allocation;
}

// Alan tahsisi görüntüleme
function displayAllocation(allocation, totalLength) {
    const panel = document.getElementById('allocationPanel');
    const display = document.getElementById('allocationDisplay');
    
    panel.classList.remove('hidden');
    
    let html = '<div class="table-container"><table>';
    html += '<thead><tr><th>Bölge</th><th>Başlangıç-Bitiş (cm)</th><th>Alan (cm)</th><th>Yüzde</th></tr></thead><tbody>';
    
    const areas = [
        { name: 'Düşük Öncelik', data: allocation.low, color: '#4444ff' },
        { name: 'Orta Öncelik', data: allocation.medium, color: '#ffaa00' },
        { name: 'Yüksek Öncelik', data: allocation.high, color: '#ff4444' }
    ];
    
    areas.forEach(area => {
        const percentage = (area.data.length / totalLength * 100).toFixed(1);
        html += `<tr style="border-left: 4px solid ${area.color}">
            <td><strong>${area.name}</strong></td>
            <td>${area.data.start.toFixed(0)}-${area.data.end.toFixed(0)}</td>
            <td>${area.data.length.toFixed(0)}</td>
            <td>${percentage}%</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    display.innerHTML = html;
}

// EMS (Empty Maximal Spaces) sınıfı
class EMS {
    constructor(x, y, z, width, length, height) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.length = length;
        this.height = height;
    }
    canFit(box) {
        return box.width <= this.width && 
               box.length <= this.length && 
               box.height <= this.height;
    }
    volume() {
        return this.width * this.length * this.height;
    }
}

// Yerleştirme algoritması
function placeBoxes() {
    const warehouse = warehouseData[0];
    const warehouseWidth = parseFloat(warehouse['Genislik']);
    const warehouseHeight = parseFloat(warehouse['Yukseklik']);
    const warehouseLength = parseFloat(warehouse['Uzunluk']);
    const allocation = calculateAllocation();
    placedBoxes = [];
    // Her öncelik sınıfı için yerleştirme
    const priorityGroups = [
        { boxes: classifiedBoxes.high, area: allocation.high, priority: 'high' },
        { boxes: classifiedBoxes.medium, area: allocation.medium, priority: 'medium' },
        { boxes: classifiedBoxes.low, area: allocation.low, priority: 'low' }
    ];
    priorityGroups.forEach(group => {
        // Bu alan için EMS listesi
        const emsList = [new EMS(
            0, 
            group.area.start, 
            0, 
            warehouseWidth, 
            group.area.length, 
            warehouseHeight
        )];
        group.boxes.forEach(box => {
            let bestPosition = null;
            let bestEMS = null;
            // Tüm EMS'lerde ve rotasyonlarda dene
            for (let ems of emsList) {
                const rotations = getRotations(box);
                for (let rotation of rotations) {
                    if (ems.canFit(rotation)) {
                        const position = {
                            x: ems.x,
                            y: ems.y,
                            z: ems.z,
                            width: rotation.width,
                            length: rotation.length,
                            height: rotation.height
                        };
                        // Fiziksel kısıtları kontrol et
                        if (checkConstraints(position, box)) {
                            if (!bestPosition || 
                                position.z < bestPosition.z ||
                                (position.z === bestPosition.z && position.y < bestPosition.y) ||
                                (position.z === bestPosition.z && position.y === bestPosition.y && position.x < bestPosition.x)) {
                                bestPosition = position;
                                bestEMS = ems;
                            }
                        }
                    }
                }
            }
            if (bestPosition) {
                // Kutuyu yerleştir
                const placedBox = {
                    ...box,
                    x: bestPosition.x,
                    y: bestPosition.y,
                    z: bestPosition.z,
                    width: bestPosition.width,
                    length: bestPosition.length,
                    height: bestPosition.height,
                    priority: group.priority,
                    placed: true,
                    order: placementOrder++,
                    constraints: {
                        loadCapacity: true,
                        stability: true,
                        boundaries: true,
                        collision: true
                    }
                };
                placedBoxes.push(placedBox);
                // EMS'yi güncelle
                updateEMS(emsList, bestEMS, bestPosition);
            } else {
                // Yerleştirilemedi
                placedBoxes.push({
                    ...box,
                    placed: false,
                    order: null,
                    priority: group.priority,
                    constraints: {
                        loadCapacity: false,
                        stability: false,
                        boundaries: false,
                        collision: false
                    }
                });
            }
        });
    });
}

// Kutu rotasyonları
function getRotations(box) {
    const rotations = [];
    const dimensions = [
        { width: box.width, length: box.length, height: box.height },
        { width: box.width, length: box.height, height: box.length },
        { width: box.length, length: box.width, height: box.height },
        { width: box.length, length: box.height, height: box.width },
        { width: box.height, length: box.width, height: box.length },
        { width: box.height, length: box.length, height: box.width }
    ];
    // Benzersiz rotasyonları filtrele
    const uniqueRotations = [];
    dimensions.forEach(dim => {
        const exists = uniqueRotations.some(r => 
            r.width === dim.width && r.length === dim.length && r.height === dim.height
        );
        if (!exists) {
            uniqueRotations.push(dim);
        }
    });
    return uniqueRotations;
}

// Fiziksel kısıtları kontrol et
function checkConstraints(position, box) {
    // 1. Konteyner sınırları
    const warehouse = warehouseData[0];
    const warehouseWidth = parseFloat(warehouse['Genislik']);
    const warehouseHeight = parseFloat(warehouse['Yukseklik']);
    const warehouseLength = parseFloat(warehouse['Uzunluk']);
    if (
        position.x < 0 ||
        position.y < 0 ||
        position.z < 0 ||
        position.x + position.width > warehouseWidth ||
        position.y + position.length > warehouseLength ||
        position.z + position.height > warehouseHeight
    ) {
        return false;
    }
    // 2. Çakışma kontrolü (diğer kutularla hacim çakışması)
    for (let placed of placedBoxes) {
        if (!placed.placed) continue;
        if (
            position.x < placed.x + placed.width &&
            position.x + position.width > placed.x &&
            position.y < placed.y + placed.length &&
            position.y + position.length > placed.y &&
            position.z < placed.z + placed.height &&
            position.z + position.height > placed.z
        ) {
            return false;
        }
    }
    // 3. Yük taşıma kapasitesi ve stabilite (sadece z>0 için)
    if (position.z > 0) {
        // Altında kalan kutuları bul
        let supportingBoxes = [];
        for (let placed of placedBoxes) {
            if (!placed.placed) continue;
            // Tabanda temas eden kutular
            const xOverlap =
                position.x < placed.x + placed.width &&
                position.x + position.width > placed.x;
            const yOverlap =
                position.y < placed.y + placed.length &&
                position.y + position.length > placed.y;
            const zTouch =
                Math.abs(position.z - (placed.z + placed.height)) < 1e-3;
            if (xOverlap && yOverlap && zTouch) {
                supportingBoxes.push(placed);
            }
        }
        if (supportingBoxes.length === 0) {
            // Havada kalamaz
            return false;
        }
        // Tek destek: taban tamamen bir kutunun üstünde mi?
        let fullySupported = supportingBoxes.some(sup =>
            position.x >= sup.x &&
            position.x + position.width <= sup.x + sup.width &&
            position.y >= sup.y &&
            position.y + position.length <= sup.y + sup.length
        );
        if (!fullySupported) {
            // Çoklu destek: ağırlık merkezi destek yüzeyinde mi?
            const centerX = position.x + position.width / 2;
            const centerY = position.y + position.length / 2;
            let supportArea = 0;
            let coversCenter = false;
            for (let sup of supportingBoxes) {
                if (
                    centerX >= sup.x &&
                    centerX <= sup.x + sup.width &&
                    centerY >= sup.y &&
                    centerY <= sup.y + sup.length
                ) {
                    coversCenter = true;
                }
                // Alan hesabı
                const overlapX = Math.max(0, Math.min(position.x + position.width, sup.x + sup.width) - Math.max(position.x, sup.x));
                const overlapY = Math.max(0, Math.min(position.y + position.length, sup.y + sup.length) - Math.max(position.y, sup.y));
                supportArea += overlapX * overlapY;
            }
            if (!coversCenter || supportArea < position.width * position.length * 0.5) {
                // Yeterli destek yok
                return false;
            }
        }
        // Yük kapasitesi: alt kutuların max üst yükünü aşma
        for (let sup of supportingBoxes) {
            let totalUpperWeight = box.weight;
            // Üstüne daha önce konan kutuların ağırlığını da ekle
            for (let placed of placedBoxes) {
                if (!placed.placed) continue;
                if (
                    Math.abs(placed.z - (sup.z + sup.height)) < 1e-3 &&
                    placed.x < sup.x + sup.width &&
                    placed.x + placed.width > sup.x &&
                    placed.y < sup.y + sup.length &&
                    placed.y + placed.length > sup.y
                ) {
                    totalUpperWeight += placed.weight;
                }
            }
            if (totalUpperWeight > sup.maxLoad) {
                return false;
            }
        }
    }
    // Tüm kısıtlar sağlandı
    return true;
}

// EMS güncelleme (basit: yerleştirilen kutunun EMS'yi 3 yeni EMS'ye bölmesi)
function updateEMS(emsList, usedEMS, position) {
    // Eski EMS'i çıkar
    const idx = emsList.indexOf(usedEMS);
    if (idx !== -1) emsList.splice(idx, 1);
    // X ekseni
    if (position.width < usedEMS.width) {
        emsList.push(new EMS(
            usedEMS.x + position.width,
            usedEMS.y,
            usedEMS.z,
            usedEMS.width - position.width,
            usedEMS.length,
            usedEMS.height
        ));
    }
    // Y ekseni
    if (position.length < usedEMS.length) {
        emsList.push(new EMS(
            usedEMS.x,
            usedEMS.y + position.length,
            usedEMS.z,
            usedEMS.width,
            usedEMS.length - position.length,
            usedEMS.height
        ));
    }
    // Z ekseni
    if (position.height < usedEMS.height) {
        emsList.push(new EMS(
            usedEMS.x,
            usedEMS.y,
            usedEMS.z + position.height,
            usedEMS.width,
            usedEMS.length,
            usedEMS.height - position.height
        ));
    }
}

// 3B görselleştirme fonksiyonu (Three.js)
function visualize() {
    document.getElementById('visualizationPanel').classList.remove('hidden');
    const container = document.getElementById('viewerContainer');
    container.innerHTML = '';
    // Three.js sahnesi
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    const warehouse = warehouseData[0];
    const w = parseFloat(warehouse['Genislik']);
    const h = parseFloat(warehouse['Yukseklik']);
    const l = parseFloat(warehouse['Uzunluk']);
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 1, 5000);
    camera.position.set(w * 0.7, h * 1.2, l * 1.2);
    camera.lookAt(new THREE.Vector3(w / 2, h / 2, l / 2));
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);
    // Işıklar
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(w, h * 2, l);
    scene.add(directionalLight);
    // Depo çerçevesi
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, l));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const warehouseFrame = new THREE.LineSegments(edges, lineMaterial);
    warehouseFrame.position.set(w / 2, h / 2, l / 2);
    scene.add(warehouseFrame);
    // Zemin - Izgara
    const floorGeometry = new THREE.PlaneGeometry(w, l, Math.floor(w/10), Math.floor(l/10));
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333, transparent: true, opacity: 0.3, wireframe: true });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(w / 2, 0, l / 2);
    scene.add(floor);
    // Zemin - Katı
    const solidFloorGeometry = new THREE.PlaneGeometry(w, l);
    const solidFloorMaterial = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.8 });
    const solidFloor = new THREE.Mesh(solidFloorGeometry, solidFloorMaterial);
    solidFloor.rotation.x = -Math.PI / 2;
    solidFloor.position.set(w / 2, -0.1, l / 2);
    scene.add(solidFloor);
    // Kapı (deponun uzunluk ekseninin sonu)
    const doorGeometry = new THREE.PlaneGeometry(w * 0.33, h * 0.8);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(w / 2, h * 0.4, l); // X ortası, Y yerden 40%, Z deponun sonu
    scene.add(door);
    createDoorLabel(w, h, l);
    createAxisLabels(w, h, l);
    createZones(w, h, l);
    createPlacedBoxes();
    createBoxLabels();
    createRemainingAreaVisuals(w, h, l);
    renderer.render(scene, camera);
    lookAtTarget = new THREE.Vector3(w / 2, h / 2, l / 2);
    // Kamera açılarını başlat
    synchronizeRotationAngles();
    setupControls();
    animate();
}

function createDoorLabel(w, h, l) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    context.fillStyle = 'rgba(0, 255, 0, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText('🚪 KAPI', canvas.width/2, 50);
    context.font = '20px Arial';
    context.fillText('ENTRANCE', canvas.width/2, 80);
    context.font = '16px Arial';
    context.fillText('Uzunluk Y=' + l + 'cm', canvas.width/2, 105);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(w / 2, h * 0.72, l + 20);
    sprite.scale.set(w * 0.27, h * 0.16, 1);
    scene.add(sprite);
}

function createAxisLabels(w, h, l) {
    // X ekseni etiketi (Genişlik)
    const xCanvas = document.createElement('canvas');
    const xContext = xCanvas.getContext('2d');
    xCanvas.width = 256;
    xCanvas.height = 128;
    xContext.fillStyle = 'rgba(255, 255, 255, 0.9)';
    xContext.fillRect(0, 0, xCanvas.width, xCanvas.height);
    xContext.fillStyle = 'black';
    xContext.font = 'bold 24px Arial';
    xContext.textAlign = 'center';
    xContext.fillText('Genişlik: ' + w + 'cm', xCanvas.width/2, 50);
    xContext.font = '16px Arial';
    xContext.fillText('X Ekseni', xCanvas.width/2, 80);
    const xTexture = new THREE.CanvasTexture(xCanvas);
    const xMaterial = new THREE.SpriteMaterial({ map: xTexture });
    const xSprite = new THREE.Sprite(xMaterial);
    xSprite.position.set(w / 2, 10, l); // Deponun ön Zemininde
    xSprite.scale.set(w * 0.27, h * 0.16, 1);
    scene.add(xSprite);
    // Z ekseni etiketi (Uzunluk)
    const zCanvas = document.createElement('canvas');
    const zContext = zCanvas.getContext('2d');
    zCanvas.width = 256;
    zCanvas.height = 128;
    zContext.fillStyle = 'rgba(255, 255, 255, 0.9)';
    zContext.fillRect(0, 0, zCanvas.width, zCanvas.height);
    zContext.fillStyle = 'black';
    zContext.font = 'bold 24px Arial';
    zContext.textAlign = 'center';
    zContext.fillText('Uzunluk: ' + l + 'cm', zCanvas.width/2, 50);
    zContext.font = '16px Arial';
    zContext.fillText('Z Ekseni (Algoritma Y)', zCanvas.width/2, 80);
    const zTexture = new THREE.CanvasTexture(zCanvas);
    const zMaterial = new THREE.SpriteMaterial({ map: zTexture });
    const zSprite = new THREE.Sprite(zMaterial);
    zSprite.position.set(w, 10, l / 2);
    zSprite.scale.set(w * 0.27, h * 0.16, 1);
    scene.add(zSprite);
    // Y ekseni etiketi (Yükseklik)
    const yCanvas = document.createElement('canvas');
    const yContext = yCanvas.getContext('2d');
    yCanvas.width = 256;
    yCanvas.height = 128;
    yContext.fillStyle = 'rgba(255, 255, 255, 0.9)';
    yContext.fillRect(0, 0, yCanvas.width, yCanvas.height);
    yContext.fillStyle = 'black';
    yContext.font = 'bold 24px Arial';
    yContext.textAlign = 'center';
    yContext.fillText('Yükseklik: ' + h + 'cm', yCanvas.width/2, 50);
    yContext.font = '16px Arial';
    yContext.fillText('Y Ekseni', yCanvas.width/2, 80);
    const yTexture = new THREE.CanvasTexture(yCanvas);
    const yMaterial = new THREE.SpriteMaterial({ map: yTexture });
    const ySprite = new THREE.Sprite(yMaterial);
    ySprite.position.set(0, h / 2, 0);
    ySprite.scale.set(w * 0.27, h * 0.16, 1);
    scene.add(ySprite);
}

function createZones(w, h, l) {
    // Yüksek Öncelik Bölgesi (Ön - Kırmızı)
    const highZone = new THREE.PlaneGeometry(w, l * 0.2);
    const highMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444, transparent: true, opacity: 0.2 });
    const highMesh = new THREE.Mesh(highZone, highMaterial);
    highMesh.rotation.x = -Math.PI / 2;
    highMesh.position.set(w / 2, 0.1, l * 0.9);
    scene.add(highMesh);
    // Orta Öncelik Bölgesi (Orta - Turuncu)
    const medZone = new THREE.PlaneGeometry(w, l * 0.3);
    const medMaterial = new THREE.MeshLambertMaterial({ color: 0xffaa00, transparent: true, opacity: 0.2 });
    const medMesh = new THREE.Mesh(medZone, medMaterial);
    medMesh.rotation.x = -Math.PI / 2;
    medMesh.position.set(w / 2, 0.1, l * 0.65);
    scene.add(medMesh);
    // Düşük Öncelik Bölgesi (Arka - Mavi)
    const lowZone = new THREE.PlaneGeometry(w, l * 0.5);
    const lowMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff, transparent: true, opacity: 0.2 });
    const lowMesh = new THREE.Mesh(lowZone, lowMaterial);
    lowMesh.rotation.x = -Math.PI / 2;
    lowMesh.position.set(w / 2, 0.1, l * 0.25);
    scene.add(lowMesh);
    createZoneLabels(w, h, l);
}

function createZoneLabels(w, h, l) {
    const zones = [
        { name: 'Yüksek Öncelik\n(Ön Bölge)', pos: [w / 2, 10, l * 0.9], color: 'ff4444' },
        { name: 'Orta Öncelik\n(Orta Bölge)', pos: [w / 2, 10, l * 0.65], color: 'ffaa00' },
        { name: 'Düşük Öncelik\n(Arka Bölge)', pos: [w / 2, 10, l * 0.25], color: '4444ff' }
    ];
    zones.forEach(zone => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 100;
        context.fillStyle = `rgba(${parseInt(zone.color.slice(0,2), 16)}, ${parseInt(zone.color.slice(2,4), 16)}, ${parseInt(zone.color.slice(4,6), 16)}, 0.8)`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        const lines = zone.name.split('\n');
        lines.forEach((line, i) => {
            context.fillText(line, canvas.width/2, 30 + i * 25);
        });
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(zone.pos[0], zone.pos[1], zone.pos[2]);
        sprite.scale.set(Math.max(60, w * 0.2), Math.max(30, l * 0.05), 1);
        scene.add(sprite);
    });
}

function createPlacedBoxes() {
    placedBoxes.forEach(box => {
        if (!box.placed) return;
        const color = colors[box.priority] || 0xffffff;
        const geometry = new THREE.BoxGeometry(box.width, box.height, box.length);
        const material = new THREE.MeshPhongMaterial({ color, wireframe: wireframeMode, opacity: 0.9, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            box.x + box.width / 2,
            box.z + box.height / 2,
            box.y + box.length / 2
        );
        scene.add(mesh);
        // Kenar çizgisi ekle (beyaz)
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const line = new THREE.LineSegments(edges, lineMaterial);
        line.position.copy(mesh.position);
        scene.add(line);
    });
}

function createBoxLabels() {
    placedBoxes.forEach(box => {
        if (!box.placed) return;
        // Kutu üst yüzeyine yazı
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 96;
        canvas.height = 40;
        context.fillStyle = 'rgba(255,255,255,0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.font = 'bold 18px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(box.id, canvas.width/2, canvas.height/2);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        // Kutu üst yüzeyine materyal olarak uygula
        const labelGeometry = new THREE.PlaneGeometry(box.width, box.length);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.set(
            box.x + box.width / 2,
            box.z + box.height + 0.11, // kutunun hemen üstü
            box.y + box.length / 2
        );
        labelMesh.rotation.x = -Math.PI / 2; // düzlemi yatay yap
        scene.add(labelMesh);
    });
}

function createRemainingAreaVisuals(w, h, l) {
    // Burada, algoritmadan elde edilen EMS'ler veya uygun şekilde örnek veriyle gösterim yapılabilir.
    // Şimdilik örnek olarak, bölge bazlı kalan alanları gösterelim.
    // Düşük Öncelik (Arka): 0-200cm
    const emsAreas = [
        { label: 'Arka Bölge', min: [0, 0, 0], max: [w, h, l * 0.5], color: 0x4444ff },
        { label: 'Orta Bölge', min: [0, 0, l * 0.5], max: [w, h, l * 0.8], color: 0xffaa00 },
        { label: 'Ön Bölge', min: [0, 0, l * 0.8], max: [w, h, l], color: 0xff4444 }
    ];
    emsAreas.forEach(area => {
        const width = area.max[0] - area.min[0];
        const height = area.max[1] - area.min[1];
        const depth = area.max[2] - area.min[2];
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineDashedMaterial({ color: area.color, linewidth: 1, scale: 1, dashSize: 5, gapSize: 5 });
        const line = new THREE.LineSegments(edges, lineMaterial);
        line.computeLineDistances();
        line.position.set(area.min[0] + width / 2, area.min[1] + height / 2, area.min[2] + depth / 2);
        scene.add(line);
        // Alan etiketi
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        context.fillStyle = 'white';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.fillText(area.label, canvas.width/2, 70);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, opacity: 0.8 });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(area.min[0] + width / 2, area.max[1] + 1, area.min[2] + depth / 2);
        sprite.scale.set(Math.max(60, width * 0.3), Math.max(30, depth * 0.1), 1);
        scene.add(sprite);
    });
}

// ... (devamı: createDoorLabel, createAxisLabels, createZones, createZoneLabels, createPlacedBoxes, createBoxLabels, createRemainingAreaVisuals, startSimulation, resetSimulation, toggleWireframe, resetView, toggleAnimation, animate, synchronizeRotationAngles, setupControls, onDocumentMouseDown, onDocumentMouseUp, onDocumentMouseMove, onDocumentMouseWheel, updateLegend, showResults) ... 

// Simülasyonu başlat
function startSimulation() {
    classifyBoxes();
    placeBoxes();
    showResults();
    visualize();
}

// Sıfırla
function resetSimulation() {
    warehouseData = null;
    boxData = null;
    classifiedBoxes = {};
    placedBoxes = [];
    document.getElementById('dataPanel').classList.add('hidden');
    document.getElementById('classificationPanel').classList.add('hidden');
    document.getElementById('allocationPanel').classList.add('hidden');
    document.getElementById('visualizationPanel').classList.add('hidden');
    document.getElementById('resultsPanel').classList.add('hidden');
    document.getElementById('startBtn').disabled = true;
}

// Wireframe görünümünü değiştir
function toggleWireframe() {
    wireframeMode = !wireframeMode;
    visualize();
}

// Görünümü sıfırla
function resetView() {
    visualize();
}

// Animasyon (dummy, ileri geliştirme için)
function toggleAnimation() {
    isAnimating = !isAnimating;
    if (isAnimating) {
        animationId = requestAnimationFrame(animate);
    } else {
        cancelAnimationFrame(animationId);
    }
}
function animate() {
    animationId = requestAnimationFrame(animate);
    // Kamera pozisyonunu güncelle
    const radius = camera.position.distanceTo(lookAtTarget);
    camera.position.x = lookAtTarget.x + Math.cos(targetRotationY) * Math.cos(targetRotationX) * radius;
    camera.position.y = lookAtTarget.y + Math.sin(targetRotationX) * radius;
    camera.position.z = lookAtTarget.z + Math.sin(targetRotationY) * Math.cos(targetRotationX) * radius;
    camera.lookAt(lookAtTarget);
    renderer.render(scene, camera);
}

function synchronizeRotationAngles() {
    const relativePosition = camera.position.clone().sub(lookAtTarget);
    const currentRadius = relativePosition.length();
    if (currentRadius === 0) {
        targetRotationX = 0;
        targetRotationY = 0;
        return;
    }
    targetRotationX = Math.asin(relativePosition.y / currentRadius);
    targetRotationX = Math.max(-Math.PI/2 + 0.001, Math.min(Math.PI/2 - 0.001, targetRotationX));
    targetRotationY = Math.atan2(relativePosition.z, relativePosition.x);
}

function setupControls() {
    // Sadece bir kez eklenmesini sağlamak için eski eventleri kaldır
    document.removeEventListener('mousedown', onDocumentMouseDown, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    // document.removeEventListener('wheel', onDocumentMouseWheel, false); // Artık gerek yok
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    // document.addEventListener('wheel', onDocumentMouseWheel, { passive: false }); // Artık gerek yok
    if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('wheel', onDocumentMouseWheel, false);
        renderer.domElement.addEventListener('wheel', onDocumentMouseWheel, { passive: false });
    }
}

function onDocumentMouseDown(event) {
    if (event.button === 0) { // Sol tıklama
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
}

function onDocumentMouseUp(event) {
    isMouseDown = false;
    wasPanningLastFrame = false;
}

function onDocumentMouseMove(event) {
    if (isMouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        if (event.ctrlKey) {
            // Kaydırma (Panning)
            const panSpeed = 0.5;
            const cameraForward = new THREE.Vector3();
            camera.getWorldDirection(cameraForward);
            const cameraRight = new THREE.Vector3().crossVectors(cameraForward, camera.up).normalize();
            const panX = cameraRight.multiplyScalar(-deltaX * panSpeed);
            const panY = camera.up.clone().normalize().multiplyScalar(deltaY * panSpeed);
            camera.position.add(panX).add(panY);
            lookAtTarget.add(panX).add(panY);
            wasPanningLastFrame = true;
        } else {
            if (wasPanningLastFrame) {
                synchronizeRotationAngles();
                wasPanningLastFrame = false;
            }
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            targetRotationX = Math.max(-Math.PI/2 + 0.001, Math.min(Math.PI/2 - 0.001, targetRotationX));
        }
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
}

function onDocumentMouseWheel(event) {
    event.preventDefault(); // Sayfa kaymasını engelle
    const factor = event.deltaY > 0 ? 1.1 : 0.9;
    camera.position.sub(lookAtTarget).multiplyScalar(factor).add(lookAtTarget);
}

// Legend
function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background:#ff4444"></div> Yüksek Öncelik</div>
        <div class="legend-item"><div class="legend-color" style="background:#ffaa00"></div> Orta Öncelik</div>
        <div class="legend-item"><div class="legend-color" style="background:#4444ff"></div> Düşük Öncelik</div>
    `;
}
updateLegend();

// Sonuçlar panelini tekrar görünür yapacak ve tabloyu dolduracak fonksiyon:
function showResults() {
    document.getElementById('resultsPanel').classList.remove('hidden');
    const statsDisplay = document.getElementById('statsDisplay');
    const tableBody = document.getElementById('resultsTableBody');
    // İstatistikler
    const totalVolume = placedBoxes.reduce((sum, box) => sum + (box.placed ? box.width * box.length * box.height : 0), 0);
    const warehouse = warehouseData[0];
    const warehouseVolume = parseFloat(warehouse['Genislik']) *
        parseFloat(warehouse['Yukseklik']) *
        parseFloat(warehouse['Uzunluk']);
    const efficiency = (totalVolume / warehouseVolume * 100).toFixed(1);
    const totalWeight = placedBoxes.reduce((sum, box) => sum + (box.placed ? box.weight : 0), 0);
    const unplaced = placedBoxes.filter(box => !box.placed).length;
    statsDisplay.innerHTML = `
        <div class="stat-box"><h4>Hacim Verimliliği</h4><div class="value">${efficiency}%</div></div>
        <div class="stat-box"><h4>Toplam Ağırlık</h4><div class="value">${totalWeight} kg</div></div>
        <div class="stat-box"><h4>Yerleşemeyen Kutu</h4><div class="value">${unplaced}</div></div>
    `;
    // Tablo
    tableBody.innerHTML = '';
    placedBoxes.forEach(box => {
        const status = box.placed ? '<span class="status success">Yerleşti</span>' : '<span class="status error">Yerleşemedi</span>';
        let constraintMsg = '';
        if (!box.placed) {
            if (!box.constraints.loadCapacity) constraintMsg += 'Yük kapasitesi, ';
            if (!box.constraints.stability) constraintMsg += 'Stabilite, ';
            if (!box.constraints.boundaries) constraintMsg += 'Sınır, ';
            if (!box.constraints.collision) constraintMsg += 'Çakışma, ';
            constraintMsg = constraintMsg.replace(/, $/, '');
        }
        tableBody.innerHTML += `
            <tr>
                <td>${box.order !== undefined && box.order !== null ? box.order : '-'}</td>
                <td>${box.id}</td>
                <td>${box.placed ? `${box.x},${box.y},${box.z}` : '-'}</td>
                <td>${box.width}×${box.length}×${box.height}</td>
                <td>${status}</td>
                <td>${box.placed ? 'OK' : constraintMsg}</td>
            </tr>
        `;
    });
} 
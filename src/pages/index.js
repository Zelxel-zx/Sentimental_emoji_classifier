// Lógica específica de la página de análisis (index.html)
const defaultConfig = {
    background_color: "#000000",
    surface_color: "#000000",
    text_color: "#e0e0e0",
    primary_action_color: "#6366f1",
    secondary_action_color: "#8b5cf6",
    main_title: "Reconocimiento de emociones",
    draw_section_title: "Dibuja tu Emoción",
    results_section_title: "Resultados del Análisis",
    analyze_button_text: "Analizar",
    clear_button_text: "Limpiar",
    upload_button_text: "📁",
    font_family: "system-ui",
    font_size: 16
};

let allAnalysisData = [];
let isDrawing = false;
let uploadedImage = null;
let model = null;
const emotionClasses = ['Feliz', 'Triste', 'Enojado'];

// Cargar el modelo CNN
async function loadModel() {
    try {
        // Verificar si el servidor Flask está disponible
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            console.log('✓ Servidor de predicciones disponible');
            return true;
        }
    } catch (error) {
        console.warn('Servidor de predicciones no disponible:', error);
        console.warn('Inicia el servidor con: python server.py');
    }
    return false;
}

// Cargar métricas desde JSON
async function loadMetrics() {
    try {
        const response = await fetch('./metricas.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo de métricas');
        
        const metrics = await response.json();
        
        // Actualizar métricas
        document.getElementById('accuracy-value').textContent = (metrics.accuracy * 100).toFixed(2) + '%';
        document.getElementById('precision-value').textContent = (metrics.precision * 100).toFixed(2) + '%';
        document.getElementById('recall-value').textContent = (metrics.recall * 100).toFixed(2) + '%';
        document.getElementById('f1-value').textContent = (metrics.f1 * 100).toFixed(2) + '%';
        
        // Construir matriz de confusión
        if (metrics.confusion_matrix) {
            buildConfusionMatrix(metrics.confusion_matrix);
        }
        
        console.log('✓ Métricas cargadas correctamente');
    } catch (error) {
        console.error('Error al cargar métricas:', error);
    }
}

// Construir matriz de confusión dinámicamente
function buildConfusionMatrix(matrix) {
    const emotions = ['Feliz', 'Triste', 'Enojado'];
    const emojis = ['😠', '😊', '😢'];
    const colors = [
        ['#ff6b6b', '#4ecdc4', '#45b7d1'],
        ['#a8edea', '#fed6e3', '#ff8e53'],
        ['#ffb3ba', '#bae1ff', '#ffffba']
    ];
    
    const confusionRows = document.getElementById('confusion-rows');
    confusionRows.innerHTML = '';
    
    matrix.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex gap-3 items-center mb-2';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'text-sm w-14 text-right opacity-60 font-medium';
        labelDiv.textContent = emojis[rowIndex];
        
        const gridDiv = document.createElement('div');
        gridDiv.className = 'flex-1 grid grid-cols-3 gap-3';
        
        row.forEach((value, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'px-9 py-2.5 text-center text-sm font-semibold rounded-lg';
            
            // Destacar diagonal principal
            if (rowIndex === colIndex) {
                cellDiv.style.backgroundColor = 'rgba(99, 102, 241, 0.35)';
                cellDiv.style.border = '1px solid rgba(99, 102, 241, 0.5)';
                cellDiv.style.color = '#6366f1';
            } else {
                cellDiv.style.backgroundColor = 'rgba(99, 102, 241, 0.12)';
                cellDiv.style.border = '1px solid rgba(99, 102, 241, 0.2)';
            }
            cellDiv.style.borderRadius = '7px';
            cellDiv.style.minWidth = '75px';
            cellDiv.textContent = value;
            
            gridDiv.appendChild(cellDiv);
        });
        
        rowDiv.appendChild(labelDiv);
        rowDiv.appendChild(gridDiv);
        confusionRows.appendChild(rowDiv);
    });
}

// Canvas setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (uploadedImage) {
        uploadedImage = null;
        document.getElementById('previewContainer').classList.add('hidden');
    }
});

document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImage = event.target.result;
            document.getElementById('imagePreview').src = uploadedImage;
            document.getElementById('previewContainer').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

async function analyzeEmotion(source) {
    if (!uploadedImage && !isDrawn()) {
        showError('Por favor, dibuja algo o sube una imagen primero');
        return;
    }
    
    try {
        const imageSource = uploadedImage ? 'image' : 'canvas';
        const predictions = await predictEmotion(imageSource);
        
        if (predictions) {
            const emotions = {
                happy: Math.round(predictions[0] * 100),
                sad: Math.round(predictions[1] * 100),
                angry: Math.round(predictions[2] * 100)
            };
            updateEmotionBars(emotions);
        } else {
            showConnectionError();
            return;
        }
    } catch (error) {
        console.error('Error en predicción:', error);
        showConnectionError();
        return;
    }
}

// Mostrar error de conexión tipo Google
function showConnectionError() {
    // Crear overlay de error
    const overlay = document.createElement('div');
    overlay.id = 'connection-error-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a2e;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: #e0e0e0;
        font-family: system-ui, sans-serif;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; max-width: 400px; padding: 20px;">
            <div style="font-size: 80px; margin-bottom: 20px;">🔌</div>
            <h1 style="font-size: 24px; margin-bottom: 10px; color: #fff;">No se puede conectar con el modelo</h1>
            <p style="font-size: 16px; opacity: 0.7; margin-bottom: 20px;">El servidor de predicciones no está disponible.</p>
            <p style="font-size: 14px; opacity: 0.5; margin-bottom: 30px;">Asegúrate de que el servidor esté corriendo:<br><code style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 4px;">python server.py</code></p>
            <button onclick="document.getElementById('connection-error-overlay').remove()" style="
                background: #6366f1;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.2s;
            ">Cerrar</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Verificar si hay algo dibujado en el canvas
function isDrawn() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data.some((value, index) => index % 4 !== 3 ? value !== 0 : value !== 255);
}

// Predecir emoción usando el servidor
async function predictEmotion(imageSource) {
    try {
        let response;
        
        // Si es un canvas, convertirlo a blob
        if (imageSource === 'canvas') {
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            const formData = new FormData();
            formData.append('image', blob);
            
            response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                body: formData
            });
        } else if (uploadedImage) {
            // Si es una imagen cargada, enviarla en JSON
            response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_data: uploadedImage
                })
            });
        } else {
            return null;
        }
        
        if (!response.ok) {
            return null;
        }
        
        const result = await response.json();
        
        if (result.success) {
            return [
                result.predictions.feliz / 100,
                result.predictions.triste / 100,
                result.predictions.enojado / 100
            ];
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

function updateEmotionBars(emotions) {
    document.getElementById('happy-percent').textContent = emotions.happy + '%';
    document.getElementById('happy-bar').style.width = emotions.happy + '%';
    
    document.getElementById('sad-percent').textContent = emotions.sad + '%';
    document.getElementById('sad-bar').style.width = emotions.sad + '%';
    
    document.getElementById('angry-percent').textContent = emotions.angry + '%';
    document.getElementById('angry-bar').style.width = emotions.angry + '%';
}

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('analyzeBtn');
    btn.disabled = true;
    btn.textContent = 'Analizando...';
    
    try {
        const source = uploadedImage ? 'imagen' : 'dibujo';
        await analyzeEmotion(source);
    } finally {
        btn.disabled = false;
        btn.textContent = window.elementSdk?.config?.analyze_button_text || defaultConfig.analyze_button_text;
    }
});

function showLimitWarning() {
    const container = document.getElementById('app-container');
    const warning = document.createElement('div');
    warning.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow-lg';
    warning.style.zIndex = '1000';
    warning.textContent = 'Límite máximo de 999 análisis alcanzado. Por favor, elimina algunos primero.';
    container.appendChild(warning);
    setTimeout(() => warning.remove(), 5000);
}

function showError(message) {
    const container = document.getElementById('app-container');
    const error = document.createElement('div');
    error.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow-lg';
    error.style.zIndex = '1000';
    error.textContent = message;
    container.appendChild(error);
    setTimeout(() => error.remove(), 3000);
}

const dataHandler = {
    onDataChanged(data) {
        allAnalysisData = data;
    }
};

async function onConfigChange(config) {
    const baseSize = config.font_size || defaultConfig.font_size;
    const customFont = config.font_family || defaultConfig.font_family;
    const baseFontStack = 'system-ui, -apple-system, sans-serif';

    document.body.style.backgroundColor = config.background_color || defaultConfig.background_color;
    document.body.style.color = config.text_color || defaultConfig.text_color;
    document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;
    document.body.style.fontSize = `${baseSize}px`;

    document.getElementById('app-container').style.fontFamily = `${customFont}, ${baseFontStack}`;

    const cards = document.querySelectorAll('.section-card');
    cards.forEach(card => {
        card.style.backgroundColor = config.surface_color || defaultConfig.surface_color;
        card.style.borderColor = config.secondary_action_color || defaultConfig.secondary_action_color;
    });

    document.getElementById('main-title').textContent = config.main_title || defaultConfig.main_title;
    document.getElementById('main-title').style.fontSize = `${baseSize * 1.5}px`;
    document.getElementById('main-title').style.color = config.text_color || defaultConfig.text_color;

    document.getElementById('subtitle').textContent = config.subtitle || defaultConfig.subtitle;
    document.getElementById('subtitle').style.fontSize = `${baseSize * 0.75}px`;
    document.getElementById('subtitle').style.color = config.text_color || defaultConfig.text_color;

    document.getElementById('draw-section-title').textContent = config.draw_section_title || defaultConfig.draw_section_title;
    document.getElementById('draw-section-title').style.fontSize = `${baseSize * 0.875}px`;

    document.getElementById('results-section-title').textContent = config.results_section_title || defaultConfig.results_section_title;
    document.getElementById('results-section-title').style.fontSize = `${baseSize * 0.875}px`;

    document.getElementById('analyzeBtn').textContent = config.analyze_button_text || defaultConfig.analyze_button_text;
    document.getElementById('clearBtn').textContent = config.clear_button_text || defaultConfig.clear_button_text;
    document.getElementById('uploadBtn').textContent = config.upload_button_text || defaultConfig.upload_button_text;

    document.getElementById('analyzeBtn').style.backgroundColor = config.primary_action_color || defaultConfig.primary_action_color;
    document.getElementById('analyzeBtn').style.color = config.text_color || defaultConfig.text_color;
    document.getElementById('analyzeBtn').style.fontSize = `${baseSize * 0.75}px`;

    document.getElementById('clearBtn').style.backgroundColor = config.secondary_action_color || defaultConfig.secondary_action_color;
    document.getElementById('clearBtn').style.color = config.text_color || defaultConfig.text_color;
    document.getElementById('clearBtn').style.fontSize = `${baseSize * 0.75}px`;

    document.getElementById('uploadBtn').style.backgroundColor = config.secondary_action_color || defaultConfig.secondary_action_color;
    document.getElementById('uploadBtn').style.color = config.text_color || defaultConfig.text_color;
    document.getElementById('uploadBtn').style.fontSize = `${baseSize * 0.75}px`;

    document.getElementById('happy-bar').style.backgroundColor = config.primary_action_color || defaultConfig.primary_action_color;
    document.getElementById('sad-bar').style.backgroundColor = config.primary_action_color || defaultConfig.primary_action_color;
    document.getElementById('angry-bar').style.backgroundColor = config.primary_action_color || defaultConfig.primary_action_color;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    canvas.style.backgroundColor = config.surface_color || defaultConfig.surface_color;
    canvas.style.borderColor = config.secondary_action_color || defaultConfig.secondary_action_color;
}

async function init() {
    // Aplicar estilos predeterminados inmediatamente
    await onConfigChange(defaultConfig);

    // Cargar el modelo CNN
    await loadModel();

    // Solo inicializar SDKs si están disponibles
    if (window.elementSdk && typeof window.elementSdk.init === 'function') {
        try {
            await window.elementSdk.init({
                defaultConfig,
                onConfigChange,
                mapToCapabilities: (config) => ({
                    recolorables: [
                        {
                            get: () => config.background_color || defaultConfig.background_color,
                            set: (value) => {
                                config.background_color = value;
                                window.elementSdk.setConfig({ background_color: value });
                            }
                        },
                        {
                            get: () => config.surface_color || defaultConfig.surface_color,
                            set: (value) => {
                                config.surface_color = value;
                                window.elementSdk.setConfig({ surface_color: value });
                            }
                        },
                        {
                            get: () => config.text_color || defaultConfig.text_color,
                            set: (value) => {
                                config.text_color = value;
                                window.elementSdk.setConfig({ text_color: value });
                            }
                        },
                        {
                            get: () => config.primary_action_color || defaultConfig.primary_action_color,
                            set: (value) => {
                                config.primary_action_color = value;
                                window.elementSdk.setConfig({ primary_action_color: value });
                            }
                        },
                        {
                            get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
                            set: (value) => {
                                config.secondary_action_color = value;
                                window.elementSdk.setConfig({ secondary_action_color: value });
                            }
                        }
                    ],
                    borderables: [],
                    fontEditable: {
                        get: () => config.font_family || defaultConfig.font_family,
                        set: (value) => {
                            config.font_family = value;
                            window.elementSdk.setConfig({ font_family: value });
                        }
                    },
                    fontSizeable: {
                        get: () => config.font_size || defaultConfig.font_size,
                        set: (value) => {
                            config.font_size = value;
                            window.elementSdk.setConfig({ font_size: value });
                        }
                    }
                }),
                mapToEditPanelValues: (config) => new Map([
                    ["main_title", config.main_title || defaultConfig.main_title],
                    ["subtitle", config.subtitle || defaultConfig.subtitle],
                    ["draw_section_title", config.draw_section_title || defaultConfig.draw_section_title],
                    ["results_section_title", config.results_section_title || defaultConfig.results_section_title],
                    ["analyze_button_text", config.analyze_button_text || defaultConfig.analyze_button_text],
                    ["clear_button_text", config.clear_button_text || defaultConfig.clear_button_text],
                    ["upload_button_text", config.upload_button_text || defaultConfig.upload_button_text]
                ])
            });

            if (window.elementSdk.config) {
                await onConfigChange(window.elementSdk.config);
            }
        } catch (e) {
            console.warn('elementSdk no disponible:', e);
        }
    }

    if (window.dataSdk && typeof window.dataSdk.init === 'function') {
        try {
            const initResult = await window.dataSdk.init(dataHandler);
            if (!initResult.isOk) {
                console.warn("Error al inicializar dataSdk");
            }
        } catch (e) {
            console.warn('dataSdk no disponible:', e);
        }
    }
}

init();

// Cargar métricas inmediatamente cuando la página carga
loadMetrics();

// Configuración por defecto
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

// Funciones de utilidad
function showLimitWarning() {
    const container = document.getElementById('app-container');
    if (!container) return;
    
    const warning = document.createElement('div');
    warning.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow-lg';
    warning.style.zIndex = '1000';
    warning.textContent = 'Límite máximo de 999 análisis alcanzado. Por favor, elimina algunos primero.';
    container.appendChild(warning);
    setTimeout(() => warning.remove(), 5000);
}

function showError(message) {
    const container = document.getElementById('app-container');
    if (!container) return;
    
    const error = document.createElement('div');
    error.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow-lg';
    error.style.zIndex = '1000';
    error.textContent = message;
    container.appendChild(error);
    setTimeout(() => error.remove(), 3000);
}

// Data handler
const dataHandler = {
    onDataChanged(data) {
        allAnalysisData = data;
    }
};

// Función de configuración
async function onConfigChange(config, ctx, canvas) {
    const baseSize = config.font_size || defaultConfig.font_size;
    const customFont = config.font_family || defaultConfig.font_family;
    const baseFontStack = 'system-ui, -apple-system, sans-serif';

    document.body.style.backgroundColor = config.background_color || defaultConfig.background_color;
    document.body.style.color = config.text_color || defaultConfig.text_color;
    document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;
    document.body.style.fontSize = `${baseSize}px`;

    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.fontFamily = `${customFont}, ${baseFontStack}`;
    }

    const cards = document.querySelectorAll('.section-card');
    cards.forEach(card => {
        card.style.backgroundColor = config.surface_color || defaultConfig.surface_color;
        card.style.borderColor = config.secondary_action_color || defaultConfig.secondary_action_color;
    });

    const mainTitle = document.getElementById('main-title');
    if (mainTitle) {
        mainTitle.textContent = config.main_title || defaultConfig.main_title;
        mainTitle.style.fontSize = `${baseSize * 1.5}px`;
        mainTitle.style.color = config.text_color || defaultConfig.text_color;
    }

    const subtitle = document.getElementById('subtitle');
    if (subtitle) {
        subtitle.textContent = config.subtitle || defaultConfig.subtitle;
        subtitle.style.fontSize = `${baseSize * 0.75}px`;
        subtitle.style.color = config.text_color || defaultConfig.text_color;
    }

    const drawSectionTitle = document.getElementById('draw-section-title');
    if (drawSectionTitle) {
        drawSectionTitle.textContent = config.draw_section_title || defaultConfig.draw_section_title;
        drawSectionTitle.style.fontSize = `${baseSize * 0.875}px`;
    }

    const resultsSectionTitle = document.getElementById('results-section-title');
    if (resultsSectionTitle) {
        resultsSectionTitle.textContent = config.results_section_title || defaultConfig.results_section_title;
        resultsSectionTitle.style.fontSize = `${baseSize * 0.875}px`;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const uploadBtn = document.getElementById('uploadBtn');

    if (analyzeBtn) {
        analyzeBtn.textContent = config.analyze_button_text || defaultConfig.analyze_button_text;
        analyzeBtn.style.backgroundColor = config.primary_action_color || defaultConfig.primary_action_color;
        analyzeBtn.style.color = config.text_color || defaultConfig.text_color;
        analyzeBtn.style.fontSize = `${baseSize * 0.75}px`;
    }

    if (clearBtn) {
        clearBtn.textContent = config.clear_button_text || defaultConfig.clear_button_text;
        clearBtn.style.backgroundColor = config.secondary_action_color || defaultConfig.secondary_action_color;
        clearBtn.style.color = config.text_color || defaultConfig.text_color;
        clearBtn.style.fontSize = `${baseSize * 0.75}px`;
    }

    if (uploadBtn) {
        uploadBtn.textContent = config.upload_button_text || defaultConfig.upload_button_text;
        uploadBtn.style.backgroundColor = config.secondary_action_color || defaultConfig.secondary_action_color;
        uploadBtn.style.color = config.text_color || defaultConfig.text_color;
        uploadBtn.style.fontSize = `${baseSize * 0.75}px`;
    }

    const emotionBars = ['happy-bar', 'sad-bar', 'angry-bar'];
    emotionBars.forEach(barId => {
        const bar = document.getElementById(barId);
        if (bar) {
            bar.style.backgroundColor = config.primary_action_color || defaultConfig.primary_action_color;
        }
    });

    if (ctx && canvas) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        canvas.style.backgroundColor = config.surface_color || defaultConfig.surface_color;
        canvas.style.borderColor = config.secondary_action_color || defaultConfig.secondary_action_color;
    }
}

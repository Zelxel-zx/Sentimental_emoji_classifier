# Reconocimiento de Emociones con IA 🧠

Plataforma de análisis de emociones basada en inteligencia artificial.

## 📁 Estructura del Proyecto

```
├── inicio.html           # Página de bienvenida con animación de estrellas
├── index.html            # Página principal de análisis
├── styles.css            # Estilos compartidos
├── app.js                # Lógica y configuración compartida
├── keras_model_dataset_50x.h5  # Modelo entrenado
└── transfer_learning.ipynb     # Notebook de entrenamiento
```

## 📄 Archivos Principales

### **inicio.html** - Página de Bienvenida
- ✨ Animación de estrellas formando un cerebro
- 🎯 Botón INICIAR con efecto galaxia
- 📱 Información del proyecto al desplazarse
- Redirige a `index.html` cuando se hace clic en INICIAR

### **index.html** - Página de Análisis
- 🎨 Canvas para dibujar emociones
- 📤 Carga de imágenes
- 📊 Visualización de resultados
- 📈 Métricas del modelo (Accuracy, Precision, Recall, F1-Score)
- 🔲 Matriz de confusión

### **styles.css** - Estilos Compartidos
- Estilos globales consistentes
- Diseño dark theme
- Componentes reutilizables

### **app.js** - Lógica Compartida
- Configuración por defecto
- Funciones de utilidad
- Manejo de errores y avisos
- Funciones de configuración dinámica

## 🚀 Cómo Usar

1. Abre `inicio.html` para ver la página de bienvenida
2. Haz clic en "INICIAR" para ir a la página de análisis
3. En `index.html`:
   - Dibuja una expresión en el canvas o carga una imagen
   - Haz clic en "Analizar"
   - Visualiza los resultados

## 🎨 Características de Diseño

- **Dark Theme**: Interfaz con fondo oscuro y acentos púrpura/azul
- **Animaciones**: Transiciones suaves y efectos visuales
- **Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Emojis**: Uso de emojis para mejora de UX

## 🔧 Configuración

La configuración por defecto se encuentra en `app.js`:

```javascript
const defaultConfig = {
    background_color: "#000000",
    text_color: "#e0e0e0",
    primary_action_color: "#6366f1",
    secondary_action_color: "#8b5cf6",
    ...
}
```

## 📦 Dependencias

- Tailwind CSS (CDN)
- Element SDK (para configuración)
- Data SDK (para persistencia)

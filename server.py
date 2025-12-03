"""
Servidor Flask para predicciones del modelo CNN
Ejecuta: python server.py
Luego accede a: http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Cargar el modelo
print("Cargando modelo...")
model = keras.models.load_model("modelo B/cnn_model_emociones.h5")
print("✓ Modelo cargado")

# Orden correcto según las carpetas del dataset (alfabético)
# Dataset_emocional/Enojado, Dataset_emocional/Feliz, Dataset_emocional/Triste
emotion_classes = ['Enojado', 'Feliz', 'Triste']

@app.route('/predict', methods=['POST'])
def predict():
    """
    Recibe una imagen y retorna predicción de emociones
    Espera: imagen en base64 (JSON) o imagen uploadada (FormData)
    """
    try:
        # Obtener imagen
        if 'image' in request.files:
            # Imagen uploadada (FormData)
            image_file = request.files['image']
            img = Image.open(image_file).convert('L')  # Convertir a escala de grises
        elif request.is_json and 'image_data' in request.get_json():
            # Imagen en base64 (JSON)
            image_data = request.get_json()['image_data']
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            img_bytes = base64.b64decode(image_data)
            img = Image.open(io.BytesIO(img_bytes)).convert('L')  # Convertir a escala de grises
        else:
            return jsonify({'error': 'No image provided', 'success': False}), 400
        
        # Redimensionar a 28x28 (tamaño esperado por el modelo)
        img = img.resize((28, 28))
        
        # Convertir a array y normalizar [0,1]
        img_array = np.array(img, dtype='float32') / 255.0
        
        # Reshape para modelo: (1, 28, 28, 1) - batch, altura, ancho, canales
        img_input = img_array.reshape(1, 28, 28, 1)
        
        # Predicción
        predictions = model.predict(img_input, verbose=0)
        predictions = predictions[0]
        
        # Normalizar a porcentajes
        total = predictions.sum()
        percentages = (predictions / total * 100).astype(float)
        
        # El modelo predice en orden alfabético: [Enojado, Feliz, Triste]
        # índice 0 = Enojado, índice 1 = Feliz, índice 2 = Triste
        return jsonify({
            'success': True,
            'predictions': {
                'enojado': float(percentages[0]),
                'feliz': float(percentages[1]),
                'triste': float(percentages[2])
            },
            'raw': [float(p) for p in predictions]
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': True})

if __name__ == '__main__':
    print("Iniciando servidor en http://localhost:5000")
    print("Presiona Ctrl+C para detener")
    # debug=False y use_reloader=False para que Ctrl+C funcione correctamente
    app.run(debug=False, port=5000, use_reloader=False)

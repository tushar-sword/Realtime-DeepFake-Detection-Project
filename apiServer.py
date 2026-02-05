from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import timm
import numpy as np
from PIL import Image
import base64
import io
import logging

app = Flask(__name__)
CORS(app)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# CHANGE THE PATH HERE
# Load Vision Transformer (ViT) model
model = timm.create_model('vit_large_patch16_224', pretrained=True, num_classes=2)
state_dict = torch.load(
    "ENTER THE PATH OF MODEL FROM YOUR SYSTEM",
    map_location=torch.device('cpu')  # Load model on CPU
)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

def preprocess_image(image_data):
    image = Image.open(io.BytesIO(base64.b64decode(image_data)))
    image = image.resize((224, 224))
    image = np.array(image).astype(np.float32) / 255.0
    image = np.transpose(image, (2, 0, 1))
    image = torch.tensor(image).unsqueeze(0).to(device)
    return image

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json['data']
        if not data:
            logging.error("Empty data received.")
            return jsonify({"error": "Empty data"}), 400

        logging.info("Data received, length: %d", len(data))
        input_tensor = preprocess_image(data)
        with torch.no_grad():
            outputs = model(input_tensor)
            _, predicted = torch.max(outputs, 1)
        return jsonify({"prediction": predicted.item()})
    except Exception as e:
        logging.error("Error processing request: %s", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(debug=True)
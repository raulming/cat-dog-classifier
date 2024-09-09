from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io


app = Flask(__name__)
CORS(app)

# 加载你的模型
model = tf.keras.models.load_model('model/cats_and_dogs_small_1_moblienet.h5')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    
    if file:
        # 读取和预处理图像
        image = Image.open(io.BytesIO(file.read()))
        image = image.convert('RGB')  # 确保图像是RGB格式
        image = image.resize((150, 150))  # 调整大小以匹配模型输入
        image = np.array(image) / 255.0   # 归一化
        image = np.expand_dims(image, axis=0)
        
        # 进行预测
        prediction = model.predict(image)
        
        # 假设是二分类问题（猫vs狗）
        class_name = 'dog' if prediction[0][0] < 0.5 else 'cat'
        confidence = 1 - float(prediction[0][0]) if class_name == 'dog' else float(prediction[0][0])
        
        return jsonify({
            'class_name': class_name,
            'confidence': confidence
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
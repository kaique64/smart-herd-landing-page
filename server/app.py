from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
from dotenv import load_dotenv
from constants.constants import FLASK_RUN_HOST
from api_client.upload import upload_image_predict
import logging

load_dotenv()

app = Flask(__name__)
cors = CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)  # Capture all levels: DEBUG, INFO, WARNING, ERROR
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

@app.route('/model-img-predict', methods=['POST'])
def model_image_predict():
    try:
        app.logger.info('Init calling model')
        result = upload_image_predict(request.data)
        
        if result is None:
            app.logger.warning('Prediction result is None')
            raise Exception("Prediction result is None")
        
        app.logger.info('Prediction successful')
        return jsonify(result), 200
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An error occurred during prediction"}), 500

if __name__ == '__main__':
    app.run(port=3000, host=FLASK_RUN_HOST, debug=False)

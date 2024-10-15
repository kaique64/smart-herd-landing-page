from flask import Flask
from flask_cors import CORS
from flask import request
from dotenv import load_dotenv
from constants.constants import FLASK_RUN_HOST

from api_client.upload import upload_image_predict

load_dotenv()

app = Flask(__name__)
cors = CORS(app)

@app.route('/model-img-predict', methods = ['POST'])
def model_image_predict():
    print('Init calling model')
    return upload_image_predict(request.data)

if __name__ == '__main__':
    app.run(port=3000, host=FLASK_RUN_HOST, debug=True)

from flask import current_app
import requests
from constants.constants import API_KEY, ROBOFLOW_URL

def upload_image_predict(base64_image):
    try:
        current_app.logger.info(f'Calling model API: {ROBOFLOW_URL}')
        params = {'api_key': API_KEY}
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        response = requests.post(ROBOFLOW_URL, data=base64_image, params=params, headers=headers)
        response.raise_for_status()

        current_app.logger.info('Model API called successfully')
        return response.json()

    except requests.RequestException as error:
        current_app.logger.error(f'Error in upload: {str(error)}')
        return None

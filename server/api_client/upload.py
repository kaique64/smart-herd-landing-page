import requests
from constants.constants import API_KEY, ROBOFLOW_URL


def upload_image_predict(base64_image):
    try:
        print('Calling model api')
        params = {'api_key': API_KEY}
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        response = requests.post(ROBOFLOW_URL, data=base64_image, params=params, headers=headers)
        response.raise_for_status()

        print('Model api called successfully')
        return response.json()

    except requests.RequestException as error:
        print(f'Error in upload: {str(error)}')
        return None

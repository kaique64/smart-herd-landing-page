document.getElementById('submit-button').addEventListener('click', function (e) {
    e.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const fileInput = document.getElementById('image-upload');
    const imageUrlInput = document.getElementById('image-url').value;
    const imgElement = document.getElementById('image');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    submitButton.disabled = true;
    submitButton.innerHTML = 'Carregando...';

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = function () {
            imgElement.src = reader.result;
            imgElement.onload = function () {
                canvas.width = imgElement.width;
                canvas.height = imgElement.height;
                ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
                uploadImage(reader.result.split(',')[1], imgElement.naturalWidth, imgElement.naturalHeight); // Send base64 along with the original dimensions
            };
            imgElement.style.display = 'block'; // Show the image
        };
        reader.readAsDataURL(file);
    } else if (imageUrlInput) {
        imgElement.src = imageUrlInput;
        imgElement.onload = function () {
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
            fetch(imageUrlInput)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        uploadImage(reader.result.split(',')[1], imgElement.naturalWidth, imgElement.naturalHeight); // Send base64 along with the original dimensions
                    };
                    reader.readAsDataURL(blob);
                });
        };
        imgElement.style.display = 'block'; // Show the image
    } else {
        alert('Por favor, selecione uma imagem ou insira uma URL.');
        resetButton();
    }

    async function uploadImage(base64Image, originalWidth, originalHeight) {
        const data = await fetch('/model-api-key',  {method: 'GET'});
        const { key } = await data.json();
        
        axios({
            method: "POST",
            url: "https://detect.roboflow.com/cattle-zyenu/2",
            params: {
                api_key: key,
            },
            data: base64Image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            .then(function (response) {
                console.log(response.data);
                drawDetections(response.data.predictions, originalWidth, originalHeight);
                resetButton();
            })
            .catch(function (error) {
                console.log('Erro no upload:', error.message);
                alert('Erro ao fazer o upload. Tente novamente.');
                resetButton();
            });
    }

    function drawDetections(detections, originalWidth, originalHeight) {
        // Calculate scaling factor
        const scaleX = canvas.width / originalWidth;
        const scaleY = canvas.height / originalHeight;

        detections.forEach(detection => {
            const { x, y, width, height, class: detectedClass, confidence } = detection;

            // Scale the coordinates and dimensions
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;

            // Draw bounding box
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(scaledX - scaledWidth / 2, scaledY - scaledHeight / 2, scaledWidth, scaledHeight);

            // Draw label
            ctx.font = '18px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText(`${detectedClass} (${(confidence * 100).toFixed(2)}%)`, scaledX - scaledWidth / 2, scaledY - scaledHeight / 2 - 10);
        });
    }

    function resetButton() {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Enviar Imagem';
    }
});

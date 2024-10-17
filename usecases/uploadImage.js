// Encapsular todo o código em uma IIFE (Immediately Invoked Function Expression)
(function () {
    'use strict';

    // Constantes para seletores DOM
    const SELECTORS = {
        SAIBA_MAIS_LINK: 'a[href="#saiba-mais"]',
        UPLOAD_SECTION_LINK: 'a[href="#upload-section"]',
        SAIBA_MAIS_SECTION: '#saiba-mais',
        UPLOAD_SECTION: '#upload-section',
        UPLOAD_FORM: '#upload-form',
        FILE_INPUT: '#file',
        UPLOAD_STATUS: '#upload-status',
        DROP_ZONE: '.border-dashed',
        FILE_NAME_DISPLAY: '#file-name',
        BTN_UPLOAD: '#btn-upload',
        UPLOAD_LINK: '#upload-link',
        BTN_TEXT: '#btn-text',
        SPINNER: '#spinner',
        CANVAS: '#canvas',
        PREVIEW_IMAGE: '#preview-image-1',
        IMAGE_PREVIEW: '#image-preview',
        IMAGE_SOURCE_RADIOS: 'input[name="image-source"]',
        FILE_UPLOAD_SECTION: '#file-upload-section',
        URL_INPUT_SECTION: '#url-input-section',
        IMAGE_URL_INPUT: '#image-url',
        RESULT_TITLE: '#result'
    };

    // Funções auxiliares
    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    // Inicialização
    function init() {
        setupEventListeners();
        setupDropZone();
        fadeInElements();
    }

    // Configurar event listeners
    function setupEventListeners() {
        $(SELECTORS.SAIBA_MAIS_LINK).addEventListener('click', handleSaibaMaisClick);
        $(SELECTORS.UPLOAD_SECTION_LINK).addEventListener('click', handleTesteAgoraClick);
        $(SELECTORS.UPLOAD_FORM).addEventListener('submit', handleFormSubmit);
        $(SELECTORS.FILE_INPUT).addEventListener('change', displayFileName);
        $$(SELECTORS.IMAGE_SOURCE_RADIOS).forEach(radio => {
            radio.addEventListener('change', toggleImageSourceSection);
        });
    }

    function toggleImageSourceSection() {
        const fileSection = $(SELECTORS.FILE_UPLOAD_SECTION);
        const urlSection = $(SELECTORS.URL_INPUT_SECTION);

        if (this.value === 'file') {
            fileSection.classList.remove('hidden');
            urlSection.classList.add('hidden');
        } else {
            fileSection.classList.add('hidden');
            urlSection.classList.remove('hidden');
        }
    }

    // Configurar a zona de arrastar e soltar
    function setupDropZone() {
        const dropZone = $(SELECTORS.DROP_ZONE);
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults);
            document.body.addEventListener(eventName, preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('bg-gray-100'));
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('bg-gray-100'));
        });

        dropZone.addEventListener('drop', handleDrop);
    }

    // Handlers de eventos
    function handleSaibaMaisClick(e) {
        e.preventDefault();
        $(SELECTORS.SAIBA_MAIS_SECTION).scrollIntoView({ behavior: 'smooth' });
    }

    function handleTesteAgoraClick(e) {
        e.preventDefault();
        $(SELECTORS.UPLOAD_SECTION).scrollIntoView({ behavior: 'smooth' });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        await uploadFile();
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            $(SELECTORS.FILE_INPUT).files = e.dataTransfer.files;
            displayFileName();
        } else {
            showError("Por favor, arraste apenas arquivos de imagem.");
        }
    }

    // Funções de utilidade
    function setLoading(isLoading) {
        const btnUpload = $(SELECTORS.BTN_UPLOAD);
        const spinner = $(SELECTORS.SPINNER);
        const linkUpload = $(SELECTORS.UPLOAD_LINK);
        const btnText = $(SELECTORS.BTN_TEXT);

        btnUpload.disabled = isLoading;
        spinner.classList.toggle('hidden', !isLoading);
        linkUpload.classList.toggle('cursor-not-allowed', isLoading);
        linkUpload.classList.toggle('cursor-pointer', !isLoading);
        btnText.textContent = isLoading ? 'Enviando...' : 'Upload';
    }

    function displayFileName() {
        const file = $(SELECTORS.FILE_INPUT).files[0];
        const fileNameDisplay = $(SELECTORS.FILE_NAME_DISPLAY);

        if (file) {
            if (file.type.startsWith('image/')) {
                fileNameDisplay.textContent = `Imagem selecionada: ${file.name}`;
                fileNameDisplay.className = "mt-2 text-sm text-gray-500";
            } else {
                showError("Por favor, selecione apenas arquivos de imagem.");
                $(SELECTORS.FILE_INPUT).value = "";
            }
        } else {
            fileNameDisplay.textContent = '';
            fileNameDisplay.className = "mt-2 text-sm text-gray-500";
        }
    }

    function showError(message) {
        const fileNameDisplay = $(SELECTORS.FILE_NAME_DISPLAY);
        fileNameDisplay.textContent = message;
        fileNameDisplay.className = "mt-2 text-sm text-red-500";
    }

    // Lógica principal
    async function uploadFile() {
        const uploadStatus = $(SELECTORS.UPLOAD_STATUS);
        const imageSource = $('input[name="image-source"]:checked').value;
        let imageUrl, file;

        try {
            setLoading(true);
            uploadStatus.textContent = "";

            if (imageSource === 'file') {
                file = $(SELECTORS.FILE_INPUT).files[0];
                if (!file) {
                    throw new Error("Por favor, selecione um arquivo de imagem.");
                }
                if (!file.type.startsWith('image/')) {
                    throw new Error("Por favor, selecione apenas arquivos de imagem.");
                }
                imageUrl = URL.createObjectURL(file);
            } else {
                imageUrl = $(SELECTORS.IMAGE_URL_INPUT).value.trim();
                if (!imageUrl) {
                    throw new Error("Por favor, insira uma URL de imagem válida.");
                }

                const response = await fetch('/get-image-from-url', {
                    method: 'POST',
                    body: JSON.stringify({ url: imageUrl }),
                    headers: { "Content-Type": "text/plain" }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const blob = await response.blob();
                file = new File([blob], "image_from_url.jpg", { type: blob.type });
                imageUrl = URL.createObjectURL(blob);
            }

            const imgElement = $(SELECTORS.PREVIEW_IMAGE);
            imgElement.src = imageUrl;
            $(SELECTORS.IMAGE_PREVIEW).classList.remove('hidden');
            $(SELECTORS.RESULT_TITLE).innerHTML = 'Resultado';

            await new Promise((resolve) => {
                imgElement.onload = async function () {
                    await processImage(imgElement, file);
                    resolve();
                };
            });

            uploadStatus.textContent = "Imagem carregada com sucesso!";
            uploadStatus.className = "mt-4 text-center text-sm font-medium text-green-600";
        } catch (err) {
            console.error(err);
            uploadStatus.textContent = err.message || "Erro ao carregar a imagem. Por favor, tente novamente.";
            uploadStatus.className = "mt-4 text-center text-sm font-medium text-red-600";
        } finally {
            setLoading(false);
        }
    }

    async function processImage(imgElement, file) {
        const canvas = $(SELECTORS.CANVAS);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

        const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        applyBlackAndWhiteFilter(ctx, canvas.width, canvas.height);

        const base64Image = await fileToBase64(file);
        await uploadImage(base64Image, imgElement.naturalWidth, imgElement.naturalHeight, ctx, originalImageData);
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function applyBlackAndWhiteFilter(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    async function uploadImage(base64Image, originalWidth, originalHeight, ctx, originalImageData) {
        try {
            const { predictions } = await fetch("/model-img-predict", {
                method: 'POST',
                body: base64Image,
                headers: { "Content-Type": "text/plain" }
            }).then(res => res.json());

            ctx.putImageData(originalImageData, 0, 0);
            drawDetections(predictions, originalWidth, originalHeight, ctx);
            $(SELECTORS.RESULT_TITLE).innerHTML = `Resultado: ${predictions.length} Vacas/Bois encontrados`;
        } catch (error) {
            console.log('Erro no upload:', error.message);
        }
    }

    function drawDetections(detections, originalWidth, originalHeight, ctx) {
        const scaleX = ctx.canvas.width / originalWidth;
        const scaleY = ctx.canvas.height / originalHeight;

        detections.forEach(({ x, y, width, height, class: detectedClass, confidence }) => {
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(scaledX - scaledWidth / 2, scaledY - scaledHeight / 2, scaledWidth, scaledHeight);

            ctx.font = '18px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText(`${detectedClass} (${(confidence * 100).toFixed(2)}%)`, scaledX - scaledWidth / 2, scaledY - scaledHeight / 2 - 10);
        });
    }

    function fadeInElements() {
        const elements = $$('main > div');
        elements.forEach((element, index) => {
            element.classList.add('opacity-0', 'transition-opacity', 'duration-1000', 'ease-in-out');
            setTimeout(() => {
                element.classList.remove('opacity-0');
            }, index * 200);
        });
    }

    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', init);
})();
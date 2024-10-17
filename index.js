import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import axios from 'axios';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' }));
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/',function(_, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', function(_, res) {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/images/img.png', function(_, res) {
    res.sendFile(path.join(__dirname, 'images', 'img.png'));
});

app.get('/images/logo.png', function(_, res) {
    res.sendFile(path.join(__dirname, 'images', 'logo.png'));
});

app.get('/model-api-key', function(req, res) {
    res.json({ key: process.env.ROBOFLOW_API_KEY });
});

app.post('/get-image-from-url', async function(req, res) {
    try {
        const { url } = JSON.parse(req.body);

        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];

        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while fetching the image');
    }
});

app.post('/model-img-predict', async function (req, res) {
    try {
        console.log('Calling python server to predict image');
        
        const response = await axios.post("http://localhost:3000/model-img-predict", req.body, {
            headers: { "Content-Type": "text/plain" }
        });

        console.log('Python server called successfully');
        res.send(response.data);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.post('/upload', function(req, res) {
    if (!req.file) {
        console.error('Error: No file uploaded');
        return res.status(400).send('No file uploaded');
    }

    console.log('File saved successfully:', req.file.path);
    return res.status(200).send('File uploaded successfully');
});

app.get('/usecases/uploadImage.js', function (_, res) {
    res.sendFile(__dirname + "/usecases/uploadImage.js");
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))

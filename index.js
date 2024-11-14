import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import axios from 'axios';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'smart-herd';
let db;

async function connectToMongo() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

await connectToMongo();

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' }));
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', function (_, res) {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/images/img.png', function (_, res) {
    res.sendFile(path.join(__dirname, 'images', 'img.png'));
});

app.get('/images/logo.png', function (_, res) {
    res.sendFile(path.join(__dirname, 'images', 'logo.png'));
});

app.get('/model-api-key', function (req, res) {
    res.json({ key: process.env.ROBOFLOW_API_KEY });
});

app.post('/get-image-from-url', async function (req, res) {
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

app.post('/save-image', async function (req, res) {
    try {
        if (!req.body) {
            console.error('Error: No data uploaded');
            return res.status(400).send('No data uploaded');
        }

        console.log("Received image to save");

        const imageDoc = {
            image: req.body,
            timestamp: new Date(),
            metadata: {
                type: 'cattle-detection',
                format: 'png'
            }
        };

        const result = await db.collection('images').insertOne(imageDoc);

        console.log("Image saved successfully");
        return res.status(200).send({ msg: 'File uploaded successfully', id: result.insertedId });
    } catch (e) {
        return res.status(500).send({ msg: 'Error when trying to save image data' });
    }
});

app.get('/result-images', async function (req, res) {
    try {
        console.log("Getting images data");

        const result = await db.collection('images').find({}).toArray();

        console.log("Image saved successfully");
        return res.status(200).send({ result });
    } catch (e) {
        return res.status(500).send({ msg: 'Error when trying to get image data', error: e.message });
    }
});

app.get('/usecases/uploadImage.js', function (_, res) {
    res.sendFile(__dirname + "/usecases/uploadImage.js");
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))

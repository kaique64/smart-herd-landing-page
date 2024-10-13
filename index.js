import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000

// Get dirname to send absolute file path to render
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

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

app.post('/upload', upload.single('file'), function(req, res) {
    if (!req.file) {
        console.error('Error: No file uploaded');
        return res.status(400).send('No file uploaded');
    }

    console.log('File saved successfully:', req.file.path);
    return res.status(200).send('File uploaded successfully');
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))
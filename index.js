import express from 'express';
import path from 'path'

const app = express();
const PORT = 5000

// Get dirname to send absolute file path to render
const dirname = process.cwd();

app.get('/',function(_, res) {
    res.sendFile(path.join(`${dirname}/index.html`));
});

app.get('/style.css', function(_, res) {
    res.sendFile(`${dirname}/style.css`);
});

app.get('/images/img.png', function(_, res) {
    res.sendFile(`${dirname}/images/img.png`);
});

app.get('/images/logo.png', function(_, res) {
    res.sendFile(`${dirname}/images/logo.png`);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))

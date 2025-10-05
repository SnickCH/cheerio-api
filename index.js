import express from 'express';
import { load } from 'cheerio';

const app = express();
const port = 3000;

app.use(express.json());

// Einfacher GET-Test-Endpunkt
app.get('/hello', (req, res) => {
  res.send('Hallo von der Cheerio API!');
});

// Hauptfunktion: HTML parsen
app.post('/parse', (req, res) => {
  const { html, selector } = req.body;

  if (!html || !selector) {
    return res.status(400).json({ error: 'Missing "html" or "selector" in request body' });
  }

  try {
    const $ = load(html);
    const results = [];

    $(selector).each((i, el) => {
      results.push($(el).text().trim());
    });

    res.json({
      selector,
      count: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse HTML', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Cheerio API listening on http://localhost:${port}`);
});

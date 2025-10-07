import express from 'express';
import { load } from 'cheerio';
import { VM } from 'vm2';

const app = express();
const port = 3000;

app.use(express.json());

// --- Test Endpoint ---
app.get('/hello', (req, res) => {
  res.send('Hallo von der Cheerio API!');
});

// --- Main Endpoint: /parse ---
app.post('/parse', (req, res) => {
  const { html, selector, script } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'Missing "html" in request body' });
  }

  try {
    const $ = load(html);
    let result;

    //  Script mode (has priority)
    if (script) {
      try {
        const vm = new VM({
          timeout: 2000, // prevent infinite loops
          sandbox: { $, cheerio: { load } }
        });

        result = vm.run(script);
      } catch (err) {
        return res.status(400).json({
          error: 'Script execution failed',
          details: err.message
        });
      }
    }

    // Simple selector mode (fallback)
    else if (selector) {
      try {
        const results = [];
        $(selector).each((i, el) => {
          results.push($(el).text().trim());
        });

        result = {
          selector,
          count: results.length,
          results
        };
      } catch (err) {
        return res.status(400).json({
          error: 'Selector execution failed',
          details: err.message
        });
      }
    }

    // No valid parameter
    else {
      return res.status(400).json({
        error: 'Missing "selector" or "script" in request body'
      });
    }

    res.json({ result });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to parse HTML',
      details: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Cheerio API listening on http://localhost:${port}`);
});

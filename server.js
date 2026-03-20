require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3001;

const API_KEY = process.env.API_KEY;
const BASE = 'https://api.sportradar.com/soccer/trial/v4/en';

  app.use(express.static(path.join(__dirname)));
  
  app.get('/api/*path', async (req, res) => {
    const endpoint = req.path.replace('/api', '');
    const url = `${BASE}${endpoint}.json`;
  
    console.log(`[proxy] GET ${url}`);
  
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'x-api-key': API_KEY
        }
      });
  
      const rawText = await response.text();
      console.log(`[proxy] Status: ${response.status}`);
  
      res.setHeader('Access-Control-Allow-Origin', '*');
  
      try {
        const data = JSON.parse(rawText);
        if (data.summaries) {
          const statuses = [...new Set(data.summaries.map(m => m.sport_event_status?.match_status))];
          console.log('[proxy] match_status:', statuses);
        }
        res.status(response.status).json(data);
      } catch {
        res.status(response.status).send(rawText);
      }
  
    } catch (err) {
      console.error('[proxy] Error:', err.message);
      res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}/index.html\n`);
});
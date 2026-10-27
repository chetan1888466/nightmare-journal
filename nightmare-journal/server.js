const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';
const OLLAMA_TAGS_URL = 'http://localhost:11434/api/tags';
const OLLAMA_MODEL = 'gemma4:e2b';

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DREAMS_FILE = path.join(DATA_DIR, 'dreams.json');

// Ensure data directory and dreams.json file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DREAMS_FILE)) {
  fs.writeFileSync(DREAMS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readDreams() {
  try {
    const raw = fs.readFileSync(DREAMS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading dreams file:', err);
    return [];
  }
}

function writeDreams(dreams) {
  fs.writeFileSync(DREAMS_FILE, JSON.stringify(dreams, null, 2), 'utf-8');
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  // Enable CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Ollama Status Check
  if (req.method === 'GET' && pathname === '/api/ollama-status') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const ollamaRes = await fetch(OLLAMA_TAGS_URL, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const models = (data.models || []).map(m => m.name);
        const hasModel = models.some(name => name === OLLAMA_MODEL || name.startsWith(OLLAMA_MODEL));
        return sendJson(res, 200, {
          online: true,
          model: OLLAMA_MODEL,
          modelFound: hasModel,
          availableModels: models
        });
      } else {
        return sendJson(res, 200, {
          online: false,
          model: OLLAMA_MODEL,
          error: `Ollama returned status ${ollamaRes.status}`
        });
      }
    } catch (err) {
      return sendJson(res, 200, {
        online: false,
        model: OLLAMA_MODEL,
        error: 'Ollama is not running or unreachable at http://localhost:11434'
      });
    }
  }

  // 2. Transform Nightmare into Gentle Story using local Ollama model gemma4:e2b
  if (req.method === 'POST' && pathname === '/api/transform') {
    try {
      const body = await parseJsonBody(req);
      const dreamText = (body.dream || '').trim();

      if (!dreamText) {
        return sendJson(res, 400, { error: 'Please provide dream text to transform.' });
      }

      const systemPrompt = `You are a gentle and soothing bedtime storyteller.
Your task is to take the user's nightmare, scary dream, or troubled vision and transform it into a short, gentle, peaceful story.
Guidelines:
1. Turn frightening figures into misunderstood, gentle friends or harmless illusions.
2. Bring soft light and warmth into dark, ominous environments.
3. Keep the emotional tone safe, calm, and reassuring.
4. Conclude with a warm feeling of peace, rest, and safety.
5. Write 2 to 4 gentle paragraphs. Do not mention that you are an AI or comment on the prompt. Deliver only the story.`;

      const userPrompt = `Here is my dream/nightmare:\n\n"${dreamText}"\n\nPlease retell this as a short, gentle story.`;

      const ollamaPayload = {
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false
      };

      console.log(`[Ollama] Requesting transformation with model "${OLLAMA_MODEL}" at ${OLLAMA_CHAT_URL}...`);

      const controller = new AbortController();
      // Allow up to 180 seconds for local LLM inference
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      let ollamaRes;
      try {
        ollamaRes = await fetch(OLLAMA_CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ollamaPayload),
          signal: controller.signal
        });
      } catch (networkErr) {
        clearTimeout(timeoutId);
        if (networkErr.name === 'AbortError') {
          return sendJson(res, 504, {
            error: `Ollama request timed out. Model "${OLLAMA_MODEL}" took too long to respond.`
          });
        }
        return sendJson(res, 503, {
          error: `Cannot connect to local Ollama at ${OLLAMA_CHAT_URL}. Please verify Ollama is running on this computer.`
        });
      }
      clearTimeout(timeoutId);

      if (!ollamaRes.ok) {
        const errorText = await ollamaRes.text().catch(() => '');
        return sendJson(res, 502, {
          error: `Ollama error (${ollamaRes.status}): ${errorText || ollamaRes.statusText}`
        });
      }

      const ollamaData = await ollamaRes.json();
      const story = ollamaData?.message?.content || 'No story generated.';

      return sendJson(res, 200, {
        success: true,
        model: OLLAMA_MODEL,
        story: story
      });
    } catch (err) {
      console.error('Error during transform:', err);
      return sendJson(res, 500, { error: err.message || 'Internal server error' });
    }
  }

  // 3. GET /api/dreams - Read all saved dreams
  if (req.method === 'GET' && pathname === '/api/dreams') {
    const dreams = readDreams();
    // Return newest first
    dreams.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    return sendJson(res, 200, dreams);
  }

  // 4. POST /api/dreams - Save a new dream
  if (req.method === 'POST' && pathname === '/api/dreams') {
    try {
      const body = await parseJsonBody(req);
      const title = (body.title || '').trim() || 'Untitled Dream';
      const dream = (body.dream || '').trim();
      const gentleStory = (body.gentleStory || '').trim();
      const date = body.date || new Date().toISOString();

      if (!dream) {
        return sendJson(res, 400, { error: 'Dream text cannot be empty.' });
      }

      const dreams = readDreams();
      const newEntry = {
        id: Date.now().toString(),
        title,
        dream,
        gentleStory,
        date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dreams.push(newEntry);
      writeDreams(dreams);

      return sendJson(res, 201, { success: true, entry: newEntry });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Failed to save dream.' });
    }
  }

  // 5. PUT /api/dreams/:id - Update an existing dream
  if (req.method === 'PUT' && pathname.startsWith('/api/dreams/')) {
    const id = pathname.replace('/api/dreams/', '').trim();
    try {
      const body = await parseJsonBody(req);
      const dreams = readDreams();
      const index = dreams.findIndex(d => d.id === id);

      if (index === -1) {
        return sendJson(res, 404, { error: 'Dream entry not found.' });
      }

      const existing = dreams[index];
      if (body.title !== undefined) existing.title = body.title.trim() || 'Untitled Dream';
      if (body.dream !== undefined) existing.dream = body.dream.trim();
      if (body.gentleStory !== undefined) existing.gentleStory = body.gentleStory.trim();
      if (body.date !== undefined) existing.date = body.date;
      existing.updatedAt = new Date().toISOString();

      dreams[index] = existing;
      writeDreams(dreams);

      return sendJson(res, 200, { success: true, entry: existing });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Failed to update dream.' });
    }
  }

  // 6. DELETE /api/dreams/:id - Delete a dream
  if (req.method === 'DELETE' && pathname.startsWith('/api/dreams/')) {
    const id = pathname.replace('/api/dreams/', '').trim();
    const dreams = readDreams();
    const filtered = dreams.filter(d => d.id !== id);

    if (filtered.length === dreams.length) {
      return sendJson(res, 404, { error: 'Dream entry not found.' });
    }

    writeDreams(filtered);
    return sendJson(res, 200, { success: true, message: 'Dream deleted successfully.' });
  }

  // 7. Static file serving (HTML, CSS, JS)
  let safePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const resolvedPath = path.join(PUBLIC_DIR, path.normalize(safePath));

  if (!resolvedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  serveStatic(req, res, resolvedPath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` 🌙 Nightmare Journal Server is running!`);
  console.log(` 🌐 Open in browser: http://localhost:${PORT}`);
  console.log(` 🤖 Local Ollama Model: ${OLLAMA_MODEL}`);
  console.log(` 🔗 Ollama Target: ${OLLAMA_CHAT_URL}`);
  console.log(` 📁 Saved Dreams Location: ${DREAMS_FILE}`);
  console.log(`=======================================================`);
});

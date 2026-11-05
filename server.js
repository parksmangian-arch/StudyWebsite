const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let pdfParse, mammoth, AdmZip;
try { pdfParse = require('pdf-parse'); } catch (e) { console.warn('pdf-parse optional load:', e.message); }
try { mammoth = require('mammoth'); } catch (e) { console.warn('mammoth optional load:', e.message); }
try { AdmZip = require('adm-zip'); } catch (e) { console.warn('adm-zip optional load:', e.message); }

let PORT = parseInt(process.env.PORT || '3500', 10);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'study-data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(PUBLIC_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
const defaultData = {
  subjects: [],
  assignments: [],
  flashcardDecks: [],
  lastUpdated: 0
};

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initData = { ...defaultData, lastUpdated: 0 };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initData, null, 2), 'utf-8');
      return initData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.flashcardDecks)) {
      parsed.flashcardDecks = [];
    }
    if (typeof parsed.lastUpdated !== 'number') {
      parsed.lastUpdated = 0;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading study data, using default:', err);
    return { ...defaultData, lastUpdated: 0 };
  }
}

// Intelligent Question & Answer Extractor for Flashcard Generation
function generateCardsFromText(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const text = rawText.trim();
  const cards = [];
  const seenQuestions = new Set();

  function addCard(q, a) {
    q = q.trim().replace(/^[-*•\d.)\s]+/, '');
    a = a.trim().replace(/^[-*•\s]+/, '');
    if (!q || !a || q.length < 3 || a.length < 2) return;
    const key = q.toLowerCase();
    if (seenQuestions.has(key)) return;
    seenQuestions.add(key);
    cards.push({
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      question: q,
      answer: a,
      status: 'new'
    });
  }

  // 1. Markdown Headers followed by content (e.g. ### Photosynthesis)
  const headerSections = text.split(/(?=^#{1,4}\s+)/m);
  for (const sec of headerSections) {
    const match = sec.match(/^#{1,4}\s+([^\n]+)\n([\s\S]+)/);
    if (match) {
      const title = match[1].trim();
      const body = match[2].trim();
      if (body.length > 8 && body.length < 350) {
        addCard(`What is the core concept of "${title}"?`, body);
      }
    }
  }

  // 2. Parse lines with key-value delimiters (":", "-", "=")
  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    // Pattern: - Term: definition OR Term - definition OR **Term**: definition
    const termDefMatch = line.match(/^[-*•\s]*(\*\*[^*]+\*\*|[A-Za-z0-9\s()/_.-]{2,45})\s*[:–—=]\s*(.+)$/);
    if (termDefMatch) {
      let term = termDefMatch[1].replace(/\*\*/g, '').trim();
      let def = termDefMatch[2].trim();
      if (term.length >= 2 && def.length >= 4) {
        addCard(`What is ${term}?`, def);
        continue;
      }
    }

    // Pattern: "X is defined as Y" or "X is a/an Y" or "X refers to Y"
    const isDefMatch = line.match(/^([A-Z][A-Za-z0-9\s()/_.-]{1,45})\s+(is defined as|refers to|is a type of|is an?|means)\s+(.+)$/i);
    if (isDefMatch) {
      const term = isDefMatch[1].trim();
      const connector = isDefMatch[2].trim();
      const def = isDefMatch[3].trim();
      if (def.length > 5) {
        addCard(`What is ${term}?`, `${term} ${connector} ${def}`);
        continue;
      }
    }

    // Pattern: "Y occurs because X"
    const becauseMatch = line.match(/(.+?)\s+because\s+(.+)/i);
    if (becauseMatch && line.length < 220) {
      addCard(`Why does ${becauseMatch[1].trim()}?`, `Because ${becauseMatch[2].trim()}`);
      continue;
    }
  }

  // 3. Sentence Fallback for prose / paragraph notes
  if (cards.length < 3) {
    const sentences = text.match(/[^.!?\n]+[.!?]+/g) || [];
    for (const s of sentences) {
      const clean = s.trim().replace(/^[-*•\s]+/, '');
      if (clean.length < 20 || clean.length > 250) continue;

      if (/\b(is|are|refers to|means|causes|enables|consists of|requires)\b/i.test(clean)) {
        const parts = clean.split(/\b(is defined as|refers to|is a|is an|is|are)\b/i);
        if (parts.length >= 3 && parts[0].trim().length > 2 && parts[0].trim().length < 45) {
          addCard(`Explain the concept of ${parts[0].trim()}:`, clean);
        } else {
          addCard(`Key Principle / Takeaway:`, clean);
        }
      }
    }
  }

  // If still empty or brief, create a summary card
  if (cards.length === 0 && text.length > 8) {
    addCard(`Summary & Key Takeaway:`, text.substring(0, 300));
  }

  return cards;
}

// Extract text from PDF, DOCX, PPTX, or Plain text
async function extractTextFromFile(buffer, filename = '') {
  const ext = path.extname(filename).toLowerCase();

  // 1. PDF Documents (.pdf)
  if (ext === '.pdf') {
    if (!pdfParse) throw new Error('PDF scanning parser is not initialized');
    const pdfData = await pdfParse(buffer);
    return (pdfData.text || '').trim();
  }

  // 2. Word Documents (.docx)
  if (ext === '.docx') {
    if (!mammoth) throw new Error('Word document parser is not initialized');
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || '').trim();
  }

  // 3. PowerPoint Presentations (.pptx)
  if (ext === '.pptx') {
    if (!AdmZip) throw new Error('PowerPoint parser is not initialized');
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    // Sort slides numerically: ppt/slides/slide1.xml, slide2.xml...
    const slideEntries = zipEntries
      .filter(e => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
      .sort((a, b) => {
        const numA = parseInt((a.entryName.match(/slide(\d+)\.xml/i) || [0, 0])[1], 10);
        const numB = parseInt((b.entryName.match(/slide(\d+)\.xml/i) || [0, 0])[1], 10);
        return numA - numB;
      });

    if (slideEntries.length === 0) {
      throw new Error('No readable slide text found in this PPTX presentation');
    }

    let extracted = '';
    slideEntries.forEach((entry, idx) => {
      const xml = entry.getData().toString('utf-8');
      const matches = xml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi) || [];
      const texts = matches
        .map(m => m.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);

      if (texts.length > 0) {
        const slideTitle = texts[0];
        const bodyLines = texts.slice(1).map(line => line.startsWith('-') ? line : `- ${line}`);
        extracted += `### Slide ${idx + 1}: ${slideTitle}\n${bodyLines.join('\n')}\n\n`;
      }
    });

    return extracted.trim();
  }

  // 4. Binary fallback for older .doc or .ppt
  if (ext === '.doc' || ext === '.ppt') {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/[A-Za-z0-9\s.,!?:;()\-–—"'/]{4,}/g) || [];
    const filtered = matches
      .map(s => s.trim())
      .filter(s => s.length > 5 && !/^[0-9\s]+$/.test(s));
    if (filtered.length > 0) {
      return filtered.join('\n');
    }
  }

  // 5. Plain text / Markdown / Text files
  return buffer.toString('utf-8').trim();
}

function writeData(data) {
  try {
    data.lastUpdated = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing study data:', err);
    return false;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 35e6) { // 35MB limit for high-res pictures and slides
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        resolve(json);
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ROUTES ---
  if (pathname.startsWith('/api/')) {
    try {
      const data = readData();

      // GET /api/data
      if (pathname === '/api/data' && method === 'GET') {
        return sendJson(res, 200, data);
      }

      // POST /api/sync (Sync client state with server)
      if (pathname === '/api/sync' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (payload && Array.isArray(payload.subjects)) {
          data.subjects = payload.subjects;
          if (Array.isArray(payload.assignments)) data.assignments = payload.assignments;
          if (Array.isArray(payload.flashcardDecks)) data.flashcardDecks = payload.flashcardDecks;
          writeData(data);
          return sendJson(res, 200, { success: true, count: data.subjects.length, lastUpdated: data.lastUpdated });
        }
        return sendJson(res, 400, { error: 'Invalid sync payload' });
      }

      // POST /api/scan-file (Scan PDF, PPTX, DOCX, TXT for flashcards)
      if (pathname === '/api/scan-file' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.data) {
          return sendJson(res, 400, { error: 'No file data received' });
        }

        let buffer;
        const filename = payload.filename || 'document';

        if (payload.data.startsWith('data:')) {
          const base64Index = payload.data.indexOf(';base64,');
          if (base64Index !== -1) {
            const rawBase64 = payload.data.substring(base64Index + 8);
            buffer = Buffer.from(rawBase64, 'base64');
          } else {
            return sendJson(res, 400, { error: 'Invalid base64 encoding' });
          }
        } else {
          buffer = Buffer.from(payload.data, 'base64');
        }

        try {
          const extractedText = await extractTextFromFile(buffer, filename);
          if (!extractedText || !extractedText.trim()) {
            return sendJson(res, 400, { error: 'Could not find readable text in this file' });
          }

          const cleanTitle = path.basename(filename, path.extname(filename))
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();

          return sendJson(res, 200, {
            filename,
            suggestedTitle: cleanTitle + ' - Study Deck',
            text: extractedText,
            length: extractedText.length
          });
        } catch (err) {
          console.error('File scan error:', err);
          return sendJson(res, 500, { error: err.message || 'Failed to scan file' });
        }
      }

      // POST /api/upload (Pictures of notes, powerpoints, assignments)
      if (pathname === '/api/upload' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.data || !payload.data.startsWith('data:image/')) {
          return sendJson(res, 400, { error: 'Invalid image data' });
        }
        
        const matches = payload.data.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!matches) {
          return sendJson(res, 400, { error: 'Malformed base64 image data' });
        }
        
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext.includes('+')) ext = ext.split('+')[0];

        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        const fileName = `pic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/uploads/${fileName}`;

        return sendJson(res, 201, {
          url: publicUrl,
          name: payload.filename || fileName,
          size: buffer.length
        });
      }

      // POST /api/subjects
      if (pathname === '/api/subjects' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.name || !payload.name.trim()) {
          return sendJson(res, 400, { error: 'Subject name is required' });
        }
        const newSubject = {
          id: 'sub_' + Date.now(),
          name: payload.name.trim(),
          code: (payload.code || '').trim().toUpperCase(),
          color: payload.color || '#f4f4f5',
          createdAt: new Date().toISOString(),
          lessons: []
        };
        data.subjects.push(newSubject);
        writeData(data);
        return sendJson(res, 201, newSubject);
      }

      // PUT /api/subjects/:id
      const subjectMatch = pathname.match(/^\/api\/subjects\/([^\/]+)$/);
      if (subjectMatch && method === 'PUT') {
        const id = subjectMatch[1];
        const payload = await parseJsonBody(req);
        const sub = data.subjects.find(s => s.id === id);
        if (!sub) return sendJson(res, 404, { error: 'Subject not found' });
        if (payload.name) sub.name = payload.name.trim();
        if (payload.code !== undefined) sub.code = payload.code.trim().toUpperCase();
        if (payload.color) sub.color = payload.color;
        writeData(data);
        return sendJson(res, 200, sub);
      }

      // DELETE /api/subjects/:id
      if (subjectMatch && method === 'DELETE') {
        const id = subjectMatch[1];
        data.subjects = data.subjects.filter(s => s.id !== id);
        // Cascade remove assignments of this subject
        data.assignments = data.assignments.filter(a => a.subjectId !== id);
        writeData(data);
        return sendJson(res, 200, { success: true, id });
      }

      // POST /api/subjects/:id/lessons
      const lessonAddMatch = pathname.match(/^\/api\/subjects\/([^\/]+)\/lessons$/);
      if (lessonAddMatch && method === 'POST') {
        const subjectId = lessonAddMatch[1];
        const sub = data.subjects.find(s => s.id === subjectId);
        if (!sub) return sendJson(res, 404, { error: 'Subject not found' });

        const payload = await parseJsonBody(req);
        if (!payload.title || !payload.title.trim()) {
          return sendJson(res, 400, { error: 'Lesson title is required' });
        }

        const newLesson = {
          id: 'les_' + Date.now(),
          title: payload.title.trim(),
          summary: (payload.summary || '').trim(),
          content: (payload.content || '').trim(),
          status: payload.status || 'In Progress',
          images: Array.isArray(payload.images) ? payload.images : [],
          createdAt: new Date().toISOString()
        };

        if (!Array.isArray(sub.lessons)) sub.lessons = [];
        sub.lessons.push(newLesson);
        writeData(data);
        return sendJson(res, 201, newLesson);
      }

      // PUT /api/lessons/:id
      const lessonMatch = pathname.match(/^\/api\/lessons\/([^\/]+)$/);
      if (lessonMatch && method === 'PUT') {
        const lessonId = lessonMatch[1];
        const payload = await parseJsonBody(req);
        let found = null;

        for (const sub of data.subjects) {
          const l = sub.lessons.find(item => item.id === lessonId);
          if (l) {
            if (payload.title) l.title = payload.title.trim();
            if (payload.summary !== undefined) l.summary = payload.summary.trim();
            if (payload.content !== undefined) l.content = payload.content.trim();
            if (payload.status) l.status = payload.status;
            if (payload.images !== undefined) l.images = Array.isArray(payload.images) ? payload.images : [];
            found = l;
            break;
          }
        }

        if (!found) return sendJson(res, 404, { error: 'Lesson not found' });
        writeData(data);
        return sendJson(res, 200, found);
      }

      // DELETE /api/lessons/:id
      if (lessonMatch && method === 'DELETE') {
        const lessonId = lessonMatch[1];
        let deleted = false;
        for (const sub of data.subjects) {
          const before = sub.lessons.length;
          sub.lessons = sub.lessons.filter(l => l.id !== lessonId);
          if (sub.lessons.length < before) {
            deleted = true;
            break;
          }
        }
        if (!deleted) return sendJson(res, 404, { error: 'Lesson not found' });
        writeData(data);
        return sendJson(res, 200, { success: true, id: lessonId });
      }

      // POST /api/assignments
      if (pathname === '/api/assignments' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.title || !payload.title.trim()) {
          return sendJson(res, 400, { error: 'Assignment title is required' });
        }
        const newAssignment = {
          id: 'asg_' + Date.now(),
          subjectId: payload.subjectId || null,
          title: payload.title.trim(),
          dueDate: payload.dueDate || '',
          priority: payload.priority || 'Medium',
          completed: Boolean(payload.completed),
          notes: (payload.notes || '').trim(),
          images: Array.isArray(payload.images) ? payload.images : []
        };
        data.assignments.unshift(newAssignment);
        writeData(data);
        return sendJson(res, 201, newAssignment);
      }

      // PATCH /api/assignments/:id/toggle
      const assignToggleMatch = pathname.match(/^\/api\/assignments\/([^\/]+)\/toggle$/);
      if (assignToggleMatch && method === 'PATCH') {
        const asgId = assignToggleMatch[1];
        const asg = data.assignments.find(a => a.id === asgId);
        if (!asg) return sendJson(res, 404, { error: 'Assignment not found' });
        asg.completed = !asg.completed;
        writeData(data);
        return sendJson(res, 200, asg);
      }

      // PUT /api/assignments/:id
      const assignMatch = pathname.match(/^\/api\/assignments\/([^\/]+)$/);
      if (assignMatch && method === 'PUT') {
        const asgId = assignMatch[1];
        const payload = await parseJsonBody(req);
        const asg = data.assignments.find(a => a.id === asgId);
        if (!asg) return sendJson(res, 404, { error: 'Assignment not found' });
        if (payload.title) asg.title = payload.title.trim();
        if (payload.subjectId !== undefined) asg.subjectId = payload.subjectId;
        if (payload.dueDate !== undefined) asg.dueDate = payload.dueDate;
        if (payload.priority) asg.priority = payload.priority;
        if (payload.completed !== undefined) asg.completed = Boolean(payload.completed);
        if (payload.notes !== undefined) asg.notes = payload.notes.trim();
        if (payload.images !== undefined) asg.images = Array.isArray(payload.images) ? payload.images : [];
        writeData(data);
        return sendJson(res, 200, asg);
      }

      // DELETE /api/assignments/:id
      if (assignMatch && method === 'DELETE') {
        const asgId = assignMatch[1];
        data.assignments = data.assignments.filter(a => a.id !== asgId);
        writeData(data);
        return sendJson(res, 200, { success: true, id: asgId });
      }

      // --- FLASHCARDS API ROUTES ---

      // GET /api/flashcards
      if (pathname === '/api/flashcards' && method === 'GET') {
        return sendJson(res, 200, data.flashcardDecks || []);
      }

      // POST /api/flashcards/generate (Smart Q&A Extraction from notes/paragraphs)
      if (pathname === '/api/flashcards/generate' && method === 'POST') {
        const payload = await parseJsonBody(req);
        const text = payload.text || '';
        const generated = generateCardsFromText(text);
        return sendJson(res, 200, {
          title: (payload.title || 'Generated Deck').trim(),
          subjectId: payload.subjectId || null,
          cards: generated
        });
      }

      // POST /api/flashcards (Save deck)
      if (pathname === '/api/flashcards' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.title || !payload.title.trim()) {
          return sendJson(res, 400, { error: 'Deck title is required' });
        }
        const newDeck = {
          id: 'deck_' + Date.now(),
          title: payload.title.trim(),
          subjectId: payload.subjectId || null,
          cards: Array.isArray(payload.cards) ? payload.cards : [],
          createdAt: new Date().toISOString()
        };
        if (!Array.isArray(data.flashcardDecks)) data.flashcardDecks = [];
        data.flashcardDecks.unshift(newDeck);
        writeData(data);
        return sendJson(res, 201, newDeck);
      }

      // PUT /api/flashcards/:id (Update deck or card reviews)
      const deckMatch = pathname.match(/^\/api\/flashcards\/([^\/]+)$/);
      if (deckMatch && method === 'PUT') {
        const deckId = deckMatch[1];
        const payload = await parseJsonBody(req);
        if (!Array.isArray(data.flashcardDecks)) data.flashcardDecks = [];
        const deck = data.flashcardDecks.find(d => d.id === deckId);
        if (!deck) return sendJson(res, 404, { error: 'Deck not found' });

        if (payload.title) deck.title = payload.title.trim();
        if (payload.subjectId !== undefined) deck.subjectId = payload.subjectId;
        if (Array.isArray(payload.cards)) deck.cards = payload.cards;
        writeData(data);
        return sendJson(res, 200, deck);
      }

      // DELETE /api/flashcards/:id
      if (deckMatch && method === 'DELETE') {
        const deckId = deckMatch[1];
        if (!Array.isArray(data.flashcardDecks)) data.flashcardDecks = [];
        data.flashcardDecks = data.flashcardDecks.filter(d => d.id !== deckId);
        writeData(data);
        return sendJson(res, 200, { success: true, id: deckId });
      }

      return sendJson(res, 404, { error: 'API route not found' });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { error: 'Internal Server Error', message: apiErr.message });
    }
  }

  // --- STATIC FILE SERVING ---
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: must stay within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA support
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

function startListening(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`  STUDY SPACE (Node.js) is running!`);
    console.log(`  Local URL: http://localhost:${portToTry}`);
    console.log(`  Dark Minimalist Editorial Aesthetic Active`);
    console.log(`===============================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
    PORT++;
    startListening(PORT);
  } else {
    console.error('Server error:', err);
  }
});

startListening(PORT);

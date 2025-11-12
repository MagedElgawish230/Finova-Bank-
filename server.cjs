// !!! WARNING: THIS SERVER IS INSECURE BY DESIGN — FOR DEMO/PENTEST ONLY !!!

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- VULNERABLE FILE LEAK ENDPOINT ----
app.get('/leak-any/:fileName', (req, res) => {
  const file = req.params.fileName;
  const filePath = path.resolve(process.cwd(), file);
  res.set('Content-Type', 'text/plain');
  fs.createReadStream(filePath)
    .on('error', () => res.status(404).send('File not found'))
    .pipe(res);
});

// ---- VULNERABLE SQLi DEMO ENDPOINT ----
app.get('/api/vuln-sqli', (req, res) => {
  const account = req.query.account || '';
  // Simulate raw, vulnerable query usage
  res.send(`Fake Database result for: SELECT * FROM users WHERE account = '${account}'`);
});

// ---- VULNERABLE XSS DEMO ENDPOINT ----
app.post('/api/xss-echo', (req, res) => {
  // Directly reflect input back (classic reflected XSS)
  res.send(req.body.input || '');
});

// ---- Serve static React app (must build first) ----
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.warn(`!!! INSECURE TEST SERVER RUNNING on http://localhost:${PORT} !!!`);
});

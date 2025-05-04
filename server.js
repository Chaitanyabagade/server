const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 4001;

app.use(cors());
app.use(bodyParser.json());

app.get('/status', (req, res) => {
  res.send(`works perfect for command`);
});
app.post('/command', (req, res) => {
  const { command } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing command' });
  }
  exec(command, { cwd: __dirname }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }
    res.json({ response: stdout || 'Command executed successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

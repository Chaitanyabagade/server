const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require('http');
const { exec } = require('child_process'); 

const app = express();
const PORT = 4001;

// Create HTTP server
const server = createServer(app);

// ✅ Apply CORS middleware globally
app.use(cors());

// ✅ Parse JSON body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/status', (req, res) => {
  res.send(`yes this is works fine with cicd`);
});

app.post('/command', (req, res) => {
  const command = req.body.command;
  console.log("Command received:", command);

  if (!command) {
    return res.status(400).json({ error: 'Missing "command" in request body' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ response: `Error: ${error.message}` });
    }
    if (stderr) {
      return res.status(200).json({ response: `Stderr: ${stderr}` });
    }
    res.status(200).json({ response: stdout });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

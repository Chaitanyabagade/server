const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const updateServer = require('./serverUpdate');

const app = express();
const PORT = 4001;

// Create a regular HTTP server (needed for WebSocket upgrade)
const server = createServer(app);

// Create a WebSocket server on top of the HTTP server
const wss = new WebSocketServer({ server });

app.use(express.json());

app.post('/hook', updateServer);

app.get('/status', (req, res) => {
  res.send(`now it is full cicd with automated with auto connection tryies but it is very best idea not a any problem`);
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected!');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(`Server received: ${message}`);
      }
    });
  });

  ws.send('Welcome! You are connected to the WebSocket server!');
});

// Start both HTTP and WebSocket servers
server.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

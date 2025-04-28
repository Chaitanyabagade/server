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

// Function to broadcast messages to all EXCEPT the sender
function broadcastExceptSender(message, sender) {
  wss.clients.forEach(function each(client) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', function connection(ws) {
  console.log('New client connected.');

  // Notify others that a user connected
  broadcastExceptSender('A user connected.', ws);

  ws.on('message', function incoming(message) {
    console.log('Received:', message);

    // Broadcast message to all other clients
    broadcastExceptSender(message, ws);
  });

  ws.on('close', () => {
    console.log('Client disconnected.');

    // Notify others that a user disconnected
    broadcastExceptSender('A user disconnected.', ws);
  });
});


// Start both HTTP and WebSocket servers
server.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const updateServer = require('./serverUpdate');

const app = express();
const PORT = 4001;

// Create HTTP server
const server = createServer(app);

app.use(express.json());

app.post('/hook', updateServer);

app.get('/status', (req, res) => {
  res.send(`yes this is works fine with cicd`);
});

// WebSocket server
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server });

// Function to broadcast number of online clients
function broadcastOnlineClients() {
  const onlineCount = wss.clients.size; // Total connected clients
  const message = JSON.stringify({ type: 'online', count: onlineCount });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');
  
  // Send welcome message
  ws.send('Welcome to the WebSocket server!');

  // Broadcast updated online count
  broadcastOnlineClients();

  ws.on('message', (message) => {
    if (Buffer.isBuffer(message)) {
      message = message.toString();
    }

    console.log('Received from client:', message);

    // Broadcast the message to other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
    broadcastOnlineClients(); // Update online count when someone leaves
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

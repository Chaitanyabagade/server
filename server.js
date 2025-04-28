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

app.use(express.json());

app.post('/hook', updateServer);

app.get('/status', (req, res) => {
  res.send(`now it is full cicd with automated with auto connection tryies but it is very best idea not a any problem`);
});

// Handle WebSocket connections
const WebSocket = require('ws'); // Import the WebSocket library

// Define the WebSocket server on top of the existing HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Send a welcome message to the client when they connect
  ws.send('Welcome to the WebSocket server!');

  // Handle incoming messages from the client
  ws.on('message', (message) => {
    // If the message is a buffer, convert it to a string
    if (Buffer.isBuffer(message)) {
      message = message.toString(); // Convert buffer to string
    }

    console.log('Received from client:', message);  // Print actual received message

    // Broadcast the message to all connected WebSocket clients except the sender
    wss.clients.forEach((client) => {
      // Ensure the message is sent to clients that are not the sender
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message); // Send message to all other connected clients
      }
    });

    // Optionally respond back to the sender client
    ws.send(`Server received: ${message}`);
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start both HTTP and WebSocket servers
server.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

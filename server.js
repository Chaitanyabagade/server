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

// Define the clients set outside of the WebSocket connection handler
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Add new client to the set
  clients.add(ws);

  // Send a message to the client when they connect
  ws.send('Welcome to the WebSocket server!');

  // Handle incoming messages from the client
  ws.on('message', (message) => {
    try {
      console.log('Received from client:', message);

      // Broadcast the message to all other clients except the sender
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(`Received from another user: ${message}`);
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send('Error: Unable to process your message.');
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
    clients.delete(ws); // Remove client from the set when they disconnect
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

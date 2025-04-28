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
let clients = [];  // Store connected clients
let updateMessage = "Server is ready for updates!";  // Default message for updates

// Middleware to parse JSON data from POST request
app.use(express.json());

// Handle WebSocket connection
wss.on('connection', (ws) => {
  // Add the new client to the clients list
  clients.push(ws);
  
  // Notify all clients about the new connection
  broadcastMessage('Someone connected', ws);

  // When a message is received, broadcast it to all other clients
  ws.on('message', (message) => {
    console.log('Received message:', message);
    broadcastMessage(message, ws);
  });

  // When a client disconnects
  ws.on('close', () => {
    // Remove client from the list
    clients = clients.filter(client => client !== ws);
    broadcastMessage('Someone disconnected', ws);
  });

  // Error handling for the WebSocket
  ws.on('error', (error) => {
    console.log('WebSocket error:', error);
  });
});

// Function to send a message to all clients, except the sender
function broadcastMessage(message, sender) {
  clients.forEach(client => {
    if (client !== sender) {
      client.send(message);
    }
  });
}

// Start both HTTP and WebSocket servers
server.listen(PORT, () => {
  console.log(`Server is running (HTTP + WebSocket) on http://localhost:${PORT}`);
});

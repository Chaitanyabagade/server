const express = require('express');
const { exec } = require('child_process');
const mysql = require('mysql2');
const WebSocket = require('ws'); // Import the WebSocket library
const app = express();
const port = 4001;

// Create a WebSocket server and associate it with the HTTP server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server }); // Create WebSocket server on top of the existing HTTP server

// Your usual database connection and server setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Send a message to the client when they connect
  ws.send('Welcome to the WebSocket server!');

  // Handle incoming messages from the client
  ws.on('message', (message) => {
    // If the message is a buffer, convert it to a string
    if (Buffer.isBuffer(message)) {
      message = message.toString(); // Convert buffer to string
    }

    console.log('Received from client:', message);  // Print actual received message

    // Respond back to the client
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

app.get('/data', (req, res) => {
  res.send('Server is working correctly and updated.');
});

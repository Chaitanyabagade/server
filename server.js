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






























/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Middleware to parse JSON data from POST requests
app.use(express.json());

// Route to handle webhook for updating the server
app.post('/hook', (req, res) => {
  console.log('Received a request to update the server...');
    // Log the payload to see what GitHub is sending
  console.log('Payload:', req.body);

  // Step 1: Pull the latest code from the 'main' branch
  exec('git pull origin main', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error pulling latest changes: ${stderr}`);
      res.status(500).send('Error pulling latest code.');
      return;
    }

    console.log(`Git pull output: ${stdout}`);

    // Step 2: Run npm install to install dependencies
    exec('npm install', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error installing dependencies: ${stderr}`);
        res.status(500).send('Error installing dependencies.');
        return;
      }

      console.log(`npm install output: ${stdout}`);

      // Step 3: Restart the server after pulling the latest code and installing dependencies
      exec('pm2 restart server.js', (err, stdout, stderr) => {
        if (err) {
          console.error(`Error restarting server: ${stderr}`);
          res.status(500).send('Error restarting the server.');
          return;
        }

        console.log(`Server restart output: ${stdout}`);
        res.send('Server updated, dependencies installed, and restarted successfully!');
      });
    });
  });
});

// Your server route setup
app.get('/data', (req, res) => {
  res.send('Server is working correctly and updated.');
});

const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 4001;

// Your usual database connection and server setup
const mysql = require('mysql2');
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

// Middleware to parse JSON data from POST requests
app.use(express.json());

// Route to handle webhook for updating the server
app.post('/hook', (req, res) => {  // Changed from 'get' to 'post'
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
  res.send('server is working perfectly and updated correctly and also this is from my vs code to commit and server updated');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();



////////  This is default code for updateing the new changes on the server so don;t remove this  ///////////////

const PORT = 4001;
// Middleware to parse JSON data from POST requests
app.use(express.json());
// Route to handle webhook for updating the server
app.post('/hook', (req, res) => {
  console.log('Received a request to update the server...');
    // Log the payload to see what GitHub is sending
  console.log('Payload:', req.body);

  // Step 1: Pull the latest code from the 'main' branch
  exec('git fetch --all && git reset --hard origin/main', (err, stdout, stderr) => {
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

app.get('/status', (req, res) => {
  res.send(`now it is full cicd with automated with auto connection tryies but it is very best idea not a any problem `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
//////////////////// end of server update ////////////////////////////////////////////////////////////////////////////////

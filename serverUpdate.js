const { exec } = require('child_process');

function updateServer(req, res) {
  console.log('Received a request to update the server...');
  console.log('Payload:', req.body);

  exec('git fetch --all && git reset --hard origin/main', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error pulling latest changes: ${stderr}`);
      res.status(500).send('Error pulling latest code.');
      return;
    }

    console.log(`Git pull output: ${stdout}`);

    exec('npm install', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error installing dependencies: ${stderr}`);
        res.status(500).send('Error installing dependencies.');
        return;
      }

      console.log(`npm install output: ${stdout}`);

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
}

module.exports = updateServer;  // <<< EXPORT ONLY FUNCTION, NOT { updateServer }

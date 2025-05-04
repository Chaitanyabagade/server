const fs = require('fs');
const exec = require('child_process').exec;

function updateServer(req, res) {
  console.log('Received a request to update the server...');
  console.log('Payload:', req.body);

  fs.readFile('./server.js', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading server.js:', err);
      res.status(500).send('Error reading server.js file.');
      return;
    }

    const updatedData = `'const updateServer = require('./serverUpdate');\n` + data;
    const finalData = updatedData + '\napp.post("/hook", updateServer);';

    fs.writeFile('./server.js', finalData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to server.js:', err);
        res.status(500).send('Error updating server.js file.');
        return;
      }

      console.log('server.js file updated successfully.');

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
    });
  });
}
module.exports = updateServer;
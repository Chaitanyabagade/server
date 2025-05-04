const fs = require('fs');
const exec = require('child_process').exec;

function updateServer(req, res) {
  console.log('Received a request to update the server...');
  console.log('Payload:', req.body);

  // Step 1: Perform git pull to fetch latest changes
  exec('git fetch --all && git reset --hard origin/main', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error pulling latest changes: ${stderr}`);
      return res.status(500).send('Error pulling latest code.');
    }

    console.log(`Git pull output: ${stdout}`);

    // Step 2: Read the server.js file to make changes
    fs.readFile('./server.js', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading server.js:', err);
        return res.status(500).send('Error reading server.js file.');
      }

      // Modify server.js content
      const updatedData = `const updateServer = require('./serverUpdate');\n` + data;
      const finalData = updatedData + '\napp.post("/hook", updateServer);';

      // Step 3: Write the updated data back to server.js
      fs.writeFile('./server.js', finalData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing to server.js:', err);
          return res.status(500).send('Error updating server.js file.');
        }

        console.log('server.js file updated successfully.');

        // Step 4: Install dependencies after updating the file
        exec('npm install', (err, stdout, stderr) => {
          if (err) {
            console.error(`Error installing dependencies: ${stderr}`);
            return res.status(500).send('Error installing dependencies.');
          }

          console.log(`npm install output: ${stdout}`);

          // Step 5: Restart server after installing dependencies
          exec('pm2 restart server.js', (err, stdout, stderr) => {
            if (err) {
              console.error(`Error restarting server: ${stderr}`);
              return res.status(500).send('Error restarting the server.');
            }

            console.log(`Server restart output: ${stdout}`);
            return res.send('Server updated, dependencies installed, and restarted successfully!');
          });
        });
      });
    });
  });
}

module.exports = updateServer;

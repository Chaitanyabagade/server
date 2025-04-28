const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const updateServer = require('./serverUpdate');  // <<< NO { } brackets now

const app = express();
const PORT = 4001;

app.use(express.json());

app.post('/hook', updateServer);  // <<< now it is directly a function

app.get('/status', (req, res) => {
  res.send(`now it is full cicd with automated with auto connection tryies but it is very best idea not a any problem`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

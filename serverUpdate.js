const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { updateServer } = require('./serverUpdate');  // Import the update logic

const app = express();
const PORT = 4001;

// Middleware to parse JSON data from POST requests
app.use(express.json());

// Route to handle webhook for updating the server
app.post('/hook', updateServer);  // Use the updateServer function directly

// Your server route setup
app.get('/status', (req, res) => {
  res.send(`server is updated`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

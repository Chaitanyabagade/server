const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Command execution route
app.post("/command", (req, res) => {
  const { command } = req.body;

  // If no command is provided, return a 400 error
  if (!command) {
    return res.status(400).json({ error: "No command provided." });
  }

  const parts = command.split(" ");
  const cmd = parts[0];
  const args = parts.slice(1);

  const child = spawn(cmd, args, { shell: true });

  let output = "";
  let lastOutput = "";
  let stableTimer = null;

  // Send response when output is stable
  const finish = () => {
    if (!res.headersSent) {
      res.json({ response: output || "[No Output]" });
    }
    child.kill("SIGTERM");
  };

  // Restart timer each time there's output to check stability
  const restartTimer = () => {
    clearTimeout(stableTimer);
    stableTimer = setTimeout(() => {
      if (output === lastOutput) {
        finish();
      } else {
        lastOutput = output;
        restartTimer();
      }
    }, 1000); // Check every second
  };

  // Collect standard output data
  child.stdout.on("data", (data) => {
    output += data.toString();
    restartTimer(); // Restart the timer each time there's new output
  });

  // Collect error output data
  child.stderr.on("data", (data) => {
    output += data.toString();
    restartTimer();
  });

  // Handle errors during the command execution
  child.on("error", (err) => {
    res.status(500).json({ error: "Failed to execute command: " + err.message });
  });

  // Ensure the response is sent when the process completes
  child.on("close", (code) => {
    clearTimeout(stableTimer);
    if (!res.headersSent) {
      res.json({ response: output || "[No Output]" });
    }
  });

  // Start the timer immediately
  restartTimer();
});

// Status route
app.get('/status', (req, res) => {
  res.send(`works perfect for command`);
});

// Start server
const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

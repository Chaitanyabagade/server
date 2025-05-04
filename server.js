const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/command", (req, res) => {
  const { command } = req.body;

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

  const finish = () => {
    if (!res.headersSent) {
      res.json({ response: output || "[No Output]" });
    }
    child.kill("SIGTERM");
  };

  const restartTimer = () => {
    clearTimeout(stableTimer);
    stableTimer = setTimeout(() => {
      // if no new output came for 1 second, assume it's stable
      if (output === lastOutput) {
        finish();
      } else {
        lastOutput = output;
        restartTimer();
      }
    }, 1000);
  };

  child.stdout.on("data", (data) => {
    output += data.toString();
    restartTimer();
  });

  child.stderr.on("data", (data) => {
    output += data.toString();
    restartTimer();
  });

  child.on("error", (err) => {
    res.status(500).json({ error: "Failed to execute command: " + err.message });
  });

  child.on("close", (code) => {
    clearTimeout(stableTimer);
    if (!res.headersSent) {
      res.json({ response: output || "[No Output]" });
    }
  });

  // Start initial timer in case there's no output
  restartTimer();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/status', (req, res) => {
  res.send(`works perfect for command`);
});
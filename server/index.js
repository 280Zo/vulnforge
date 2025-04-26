const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Dummy AI check simulation
app.post("/api/check-fix", (req, res) => {
  const { code, filename, language, difficulty } = req.body;

  console.log(`Received code for ${filename} (${language}, ${difficulty})`);
  console.log(code);

  // For now: randomly succeed/fail (later replace with real AI check)
  const success = Math.random() < 0.7; // 70% chance "fix is good"

  res.json({ success });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

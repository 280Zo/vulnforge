const express = require('express');
const fetch = require('node-fetch'); // If you use node-fetch to call Ollama

const app = express();
app.use(express.json()); // <--- Make sure to parse JSON bodies

// Add your routes
app.post("/api/pull-model", async (req, res) => {
  const { model } = req.body;

  try {
    // Check if model already exists
    const tagsResponse = await fetch("http://ollama:11434/api/tags"); // <-- updated if inside compose
    const tagsData = await tagsResponse.json();

    const modelAlreadyExists = tagsData.models.some((m) => m.name.includes(model));

    if (modelAlreadyExists) {
      console.log(`Model ${model} already exists locally.`);
      return res.json({ success: true, alreadyExists: true });
    }

    console.log(`Model ${model} not found. Pulling...`);

    const pullResponse = await fetch("http://ollama:11434/api/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model }),
    });

    if (!pullResponse.ok) {
      console.error("Failed to pull model:", await pullResponse.text());
      return res.status(500).json({ error: "Failed to pull model." });
    }

    console.log(`Model ${model} pulled successfully.`);
    return res.json({ success: true, alreadyExists: false });
  } catch (err) {
    console.error("Error pulling model:", err);
    res.status(500).json({ error: "Internal server error pulling model." });
  }
});

app.post("/api/check-fix", async (req, res) => {
  try {
    // Placeholder logic for now:
    console.log("Received fix submission:", req.body);

    // TODO: Send to Ollama /api/generate and ask it to review the fix

    res.json({ success: true, message: "Fix received. (Stubbed response)" });
  } catch (err) {
    console.error("Error checking fix:", err);
    res.status(500).json({ error: "Failed to check fix." });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

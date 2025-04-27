import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Route: Pull a model
app.post("/api/pull-model", async (req, res) => {
  const { model } = req.body;

  try {
    const tagsResponse = await fetch("http://ollama:11434/api/tags");
    const tagsData = await tagsResponse.json();

    const modelAlreadyExists = tagsData.models.some((m) =>
      m.name.includes(model)
    );

    if (modelAlreadyExists) {
      console.log(`Model ${model} already exists.`);
      return res.json({ success: true, alreadyExists: true });
    }

    console.log(`Model ${model} not found. Pulling...`);
    const pullResponse = await fetch("http://ollama:11434/api/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model }),
    });

    if (!pullResponse.ok) {
      const errorText = await pullResponse.text();
      console.error("Error pulling model:", errorText);
      return res.status(500).json({ error: "Failed to pull model." });
    }

    console.log("Pull request accepted. Polling for model...");

    const startTime = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutes

    while (true) {
      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check again
      const checkResponse = await fetch("http://ollama:11434/api/tags");
      const checkData = await checkResponse.json();

      const found = checkData.models.some((m) => m.name.includes(model));

      if (found) {
        console.log(`Model ${model} is now available.`);
        return res.json({ success: true, alreadyExists: false });
      }

      if (Date.now() - startTime > timeout) {
        console.error(`Timeout waiting for model ${model} to download.`);
        return res
          .status(500)
          .json({ error: "Timed out waiting for model download." });
      }
    }
  } catch (err) {
    console.error("Error pulling model:", err);
    res.status(500).json({ error: "Internal server error pulling model." });
  }
});

// Route: Check Fix (Placeholder for later)
app.post("/api/check-fix", async (req, res) => {
  const { code, filename, language, difficulty } = req.body;
  console.log("Received fix submission:", {
    code,
    filename,
    language,
    difficulty,
  });

  // Later, call AI provider to validate fix.
  res.json({ success: true, message: "Fix checking placeholder." });
});

// Route: Generate New Challenge
app.post("/api/new-challenge", async (req, res) => {
  const { model, language, difficulty } = req.body;

  try {
    const prompt = `Generate a ${difficulty} secure coding challenge in ${language}. 
The code should have a subtle but important vulnerability appropriate for the difficulty level. 
Output only the full code without explanation.`;

    const response = await fetch("http://ollama:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // we want full reply not streaming
      }),
    });

    const data = await response.json();

    if (!data.response) {
      throw new Error("No response from model");
    }

    console.log("Challenge generated successfully.");
    res.json({ code: data.response });
  } catch (err) {
    console.error("Error generating challenge:", err);
    res.status(500).json({ error: "Failed to generate challenge." });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});

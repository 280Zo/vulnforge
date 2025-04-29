import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Pull a model (streaming status updates back to client)
app.post("/api/pull-model", async (req, res) => {
  const { model } = req.body;

  try {
    // First check if it exists
    const tagsResponse = await fetch("http://ollama:11434/api/tags");
    const tagsData = await tagsResponse.json();
    const exists = tagsData.models.some((m) => m.name.includes(model));

    if (exists) {
      console.log(`✅ Model ${model} already exists.`);
      res.json({ success: true, alreadyExists: true });
      return;
    }

    console.log(`🚀 Pulling model: ${model}...`);

    const pullResponse = await fetch("http://ollama:11434/api/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model }),
    });

    if (!pullResponse.ok) {
      throw new Error(`Failed to initiate pull: status ${pullResponse.status}`);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    pullResponse.body.on("data", (chunk) => {
      const chunkStr = chunk.toString();
      const lines = chunkStr.split("\n");

      for (const line of lines) {
        if (!line.trim().startsWith("{")) continue; // Skip junk

        try {
          const parsed = JSON.parse(line);

          if (parsed.status) {
            console.log("🔵 Stream Status:", parsed.status);
            res.write(`data: ${JSON.stringify({ status: parsed.status })}\n\n`);
          }

          if (parsed.completed) {
            console.log("✅ Pull completed");
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
          }
        } catch (err) {
          console.error("Failed to parse chunk during pull:", line);
        }
      }
    });

    pullResponse.body.on("end", () => {
      console.log("✅ Pull stream ended.");
      res.end();
    });

    pullResponse.body.on("error", (err) => {
      console.error("Stream error during pull:", err);
      res.end();
    });
  } catch (err) {
    console.error("Fatal error pulling model:", err);
    res.status(500).json({ error: "Failed to pull model." });
  }
});

// Pull model route (unchanged)
app.post("/api/new-challenge", async (req, res) => {
  const { model, language, difficulty } = req.body;

  const prompt = `
You are tasked with generating a secure coding challenge.

Rules:
- Language: ${language}
- Difficulty: ${difficulty}

Difficulty Guidelines:
- Easy:
  - Based on the OWASP Top 10 common vulnerabilities (e.g., Injection, Broken Authentication, Sensitive Data Exposure, Security Misconfiguration).
  - Obvious or basic mistakes — minimal effort needed to discover.
  - Examples: Lack of input validation, direct user input in SQL queries, missing authentication checks, exposing sensitive information.

- Medium:
  - More subtle or layered vulnerabilities.
  - May involve partial input validation, incorrect access control, cross-origin issues, or flaws requiring moderate code tracing.
  - Introduce slight complexity or misleading "safe looking" code.

- Hard:
  - Hidden, complex, or novel vulnerabilities that are non-obvious.
  - Can involve business logic flaws, race conditions, insecure deserialization, confused deputy problems, or multi-function interaction issues.
  - Requires deep code analysis or multi-step attack paths.

Output Requirements:
- The code must contain exactly one vulnerability, and no more.
- Output only code — no explanations, no descriptions, no natural language.
- No comments in the code.
- No vulnerability hints inside the code.
- No leading or trailing text — output pure code inside proper triple backticks with the correct language tag (e.g., \`\`\`python).
- Code length should scale with difficulty:
  - Easy: 10–20 lines.
  - Medium: 20–40 lines.
  - Hard: 40–80+ lines.
- The code must represent a realistic, real-world application snippet, such as:
  - Authentication flows
  - File uploads
  - User management systems
  - Payment processing
  - Session handling
  - Database operations
  - API endpoints
- Do not generate trivial or purely educational toy examples (e.g., "Hello World" programs or basic arithmetic).
- The code should look as if it was extracted from a real project.

Important:
- No introductory or concluding sentences.
- No explanation after the code block.
- Focus entirely on real-world plausibility.
  `;

  try {
    const response = await fetch("http://ollama:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        temperature: 0.2,
        top_p: 0.9,
        top_k: 50,
        num_predict: 512,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate. Ollama status: ${response.status}`);
    }

    // Proper way to stream response back to the browser
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // This is the CORRECT Node.js way to forward the response
    response.body.on("data", (chunk) => {
      res.write(`data: ${chunk.toString()}\n\n`);
    });

    response.body.on("end", () => {
      res.end();
    });

    response.body.on("error", (err) => {
      console.error("Stream error:", err);
      res.end();
    });
  } catch (err) {
    console.error("Error generating challenge:", err);
    res.status(500).json({ error: "Failed to generate challenge." });
  }
});

app.get("/api/list-models", async (req, res) => {
  try {
    const response = await fetch("http://ollama:11434/api/tags");
    const data = await response.json();
    const models = (data.models || []).map((model) => model.name);
    res.json({ models });
  } catch (err) {
    console.error("Error fetching model list:", err);
    res.status(500).json({ error: "Failed to fetch models." });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});

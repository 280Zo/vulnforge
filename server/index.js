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

  const prompt = `
You are tasked with generating a secure coding challenge.

Rules:
- Language: [LANGUAGE]
- Difficulty: [DIFFICULTY]

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
        stream: false,
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

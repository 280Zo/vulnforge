# DRAFT - Vuln Forge

This will be a casual project which leverages AI to help practice secure code review.
Right now it's nothing usable. Hang tight.

# TODO

## Language

## Improve Code Viewer

**Response Streaming**

Stream the response directly from AI so users can see the code written in real time

**CodeMirror**

Implement CodeMirror for line numbers and real code editor feel

- Install CodeMirror or Monaco
- Replace `<textarea>` with `<CodeMirror />`
- Automatically get:
  - Line numbers
  - Syntax highlight for the selected language
  - More familiar editor experience

**Save Files**

The vulnerability and/or fix can be across multiple files.
Make sure the content for each individual file is saved for edit mode

**Hint**

Add a "Hint" button that shows the class of vulnerability or some other vague hint


## UI Improvements

**Dark Mode**

Add a dark mode selector

**Vulnerability Found**

Animated fade out of the "✅ Correct! You found the vulnerability" banner

**Dialog Boxes**

Only use web app dialog boxes (e.g. model already exists or failed shows a system dialog box)

**Update Download a Model Dialog**

Change the recommendation to be actual tags to copy and paste:
```txt
recommeneded: codellama:13b
```

**Existing Models**

Have an option for using local models, instead of just downloading a model

## Downloading a Model

**Failure Message**

Add better error messages if pulling fails. For example if a user mis-types a model name, or if the download state is not known anymore?

**Better Tracking of Download State**

after a few minutes of downloading it says the download failed (❌ Failed to pull model. Please try again.), even though it's still going on.

Option 1: (Good - Add Progress Bar)

    Tell the frontend: "Don't wait forever on fetch, instead use an Event Stream (SSE) or WebSocket"
    Implement SSE streaming so that the frontend shows real-time % downloaded based on the live progress data from Ollama API.
    push live JSON chunks to your React app
    React listens to these and updates the progress bar

Option 2: (Simple and Good Enough for Now)

    When the user clicks "Download", start showing "Downloading..." indefinitely

    Only stop showing it if Ollama sends back "model pulled".

    If the fetch fails (timeout, etc), don't immediately show error — let user know "Download continuing in background."

**Auto Complete**

Get a list of models and then add it autocomplete to the text entry field

## Providers

**Gemini and OpenAPI**

Set up integrations with those API endpoints

**New Challenge - Rate Limit**

Don't let a new challenge be generated if one is already being generated

**New Challenge - Status**

It takes a minute to generate a challenge, especially on slow computers.
Show a status while a new challenge is generated.

## Prompt

**Validation**

The validation causes multiple requests. ⚠️ The generated challenge was invalid. Please try again.
Tune this for better performance.

**Timing**

The prompt takes a long time

**Multi-File**
Add multi-file generation with enhanced AI prompting:

    "Generate a realistic small app with 2–4 files, spreading functionality across them."

    "The vulnerability must be present across or inside one file, not scattered."

You could even have different challenge types later:

    Simple Mode: One file

    Advanced Mode: Multi-file project

## README
- Note that local models are probably only good enough for easy level
- Recommende Models
  - gemma2:2b-instruct-fp16
  - llama3:8b-instruct
- Prompt
```
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
```
- Model settings
```
temperature: 0.2,
top_p: 0.9, //	balance randomness vs safety
top_k: 50, // further limit candidate tokens
num_predict: 512, // if output is truncated early, bump it up to 768 or 1024
```
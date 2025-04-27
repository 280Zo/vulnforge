# TODO

## Improve Code Viewer

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
recommeneded:
    codellama:13b
    codellama:34b
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

## Providers

**Gemini and OpenAPI**

Set up integrations with those API endpoints

**New Challenge - Rate Limit**

Don't let a new challenge be generated if one is already being generated

**New Challenge - Status**

It takes a minute to generate a challenge, especially on slow computers.
Show a status while a new challenge is generated.
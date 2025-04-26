import { useState } from "react";
import SettingsPanel from "./components/SettingsPanel";
import FileExplorer from "./components/FileExplorer";
import CodeViewer from "./components/CodeViewer";
import VulnResponse from "./components/VulnResponse";
import APIKeyModal from "./components/APIKeyModal";
import ModelSelectorModal from "./components/ModelSelectorModal";

const dummyFiles: Record<string, string> = {
  "app.py": `import flask, render_template, request
from models import user, db
from validate_input import utils

@app.route('/reset_password', methods=['POST', 'GET'])
def reset_password():
    if request.method == 'POST':
        username = request.form['username']
        ...`,
  "models.py": `class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)`,
  "utils.py": `def sanitize(input):
    return input.replace("<", "").replace(">", "")`,
};

const availableModels = [
  "codellama:7b-instruct",
  "codellama:13b-instruct",
  "codellama:34b-instruct",
  "mistral:7b-instruct",
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState("app.py");
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState("medium");
  const [provider, setProvider] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");

  const [isAPIKeyModalOpen, setIsAPIKeyModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  const handleGenerateChallenge = () => {
    if (!provider) {
      alert("Please select a provider first.");
      return;
    }

    if (provider === "openai" || provider === "gemini") {
      setIsAPIKeyModalOpen(true);
    } else if (provider === "ollama") {
      setIsModelModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-8 py-6 shadow-sm text-center">
        <h1 className="text-3xl font-bold">Vuln Forge</h1>
        <p className="text-sm text-gray-600 mt-2">
          Review, identify, and fix vulnerabilities in AI governed secure coding challenges.
        </p>
      </header>

      {/* Main Body */}
      <main className="flex flex-col items-center flex-1 w-full px-8 py-8 space-y-8">
        {/* Settings Panel */}
        <div className="w-full max-w-5xl">
          <SettingsPanel
            language={language}
            setLanguage={setLanguage}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            provider={provider}
            setProvider={setProvider}
            onGenerateChallenge={handleGenerateChallenge}
          />
        </div>

        {/* Workspace */}
        <div className="w-full max-w-5xl flex bg-white rounded shadow overflow-hidden" style={{ minHeight: "400px" }}>
          <div className="w-[250px] bg-gray-50 border-r">
            <FileExplorer
              files={Object.keys(dummyFiles)}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </div>
          <div className="flex-1">
            <CodeViewer code={dummyFiles[selectedFile]} />
          </div>
        </div>

        {/* Vuln Response */}
        <div className="w-full max-w-5xl">
          <VulnResponse />
        </div>
      </main>

      {/* Modals */}
      <APIKeyModal
        isOpen={isAPIKeyModalOpen}
        onClose={() => setIsAPIKeyModalOpen(false)}
        onSave={(key) => setApiKey(key)}
      />
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        models={availableModels}
        onSelectModel={(model) => setModelName(model)}
      />
    </div>
  );
}

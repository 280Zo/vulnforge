import { useState, useEffect } from "react";
import SettingsPanel from "./components/SettingsPanel";
import FileExplorer from "./components/FileExplorer";
import CodeViewer from "./components/CodeViewer";
import VulnResponse from "./components/VulnResponse";
import APIKeyModal from "./components/APIKeyModal";
import ModelSelectorModal from "./components/ModelSelectorModal";

const vulnerableLines: Record<string, number[]> = {
  "app.py": [9],
  "models.py": [2],
  "utils.py": [1],
};

export default function App() {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState("app.py");
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState("medium");
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [isAPIKeyModalOpen, setIsAPIKeyModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedLinesPerFile, setSelectedLinesPerFile] = useState<Record<string, number[]>>({});
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>("");
  const [fixChecked, setFixChecked] = useState<boolean>(false);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const [dummyFiles, setDummyFiles] = useState<Record<string, string>>({
    "app.py": `# Placeholder - generate new challenge to begin.`,
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/list-models");
        const data = await response.json();
        setAvailableModels(data.models);
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (!isLoadingChallenge) {
      setLoadingDots("");
      return;
    }
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoadingChallenge]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleCheckFix = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/check-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editedCode, filename: selectedFile, language, difficulty }),
      });
      const data = await response.json();
      setFeedbackMessage(data.success ? "✅ Fix confirmed! Vulnerability remediated." : "❌ Fix not sufficient. Try again.");
    } catch (error) {
      console.error("Error checking fix:", error);
      setFeedbackMessage("❌ Error checking your fix. Please try again.");
    }
  };

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

  const handleSubmitSelectedLines = () => {
    const correctLines = vulnerableLines[selectedFile] || [];
    const matchFound = selectedLines.some((line) => correctLines.includes(line));
    if (matchFound) {
      setIsCorrect(true);
      setFeedbackMessage("✅ Correct! You found the vulnerability.");
      setEditedCode(dummyFiles[selectedFile]);
      setCanEdit(true);
      setTimeout(() => setFeedbackMessage(""), 1000);
    } else {
      setIsCorrect(false);
      setFeedbackMessage("❌ Not quite. Try again!");
    }
  };

  const handleSelectFile = (fileName: string) => {
    setSelectedFile(fileName);
    setSelectedLines(selectedLinesPerFile[fileName] || []);
  };

  const updateSelectedLines = (lines: number[]) => {
    setSelectedLines(lines);
    if (selectedFile) {
      setSelectedLinesPerFile((prev) => ({ ...prev, [selectedFile]: lines }));
    }
  };

  const handleNewChallenge = async () => {
    setIsLoadingChallenge(true);
    setSelectedLines([]);
    setSelectedLinesPerFile({});
    setFeedbackMessage("");
    setIsCorrect(null);
    setCanEdit(false);
    setEditedCode("");
    setFixChecked(false);
  
    if (!modelName) {
      alert("Please select a model first.");
      setIsLoadingChallenge(false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3001/api/new-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName, language, difficulty }),
      });
  
      if (!response.body) {
        throw new Error("No response body");
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
  
        // Ollama streams multiple "data: ..." chunks
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
  
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          if (!jsonStr.trim()) continue;
  
          try {
            const parsed = JSON.parse(jsonStr);
  
            if (parsed.response) {
              fullText += parsed.response;
              setDummyFiles({ "main.py": fullText });
            }
          } catch (e) {
            console.error("Failed to parse JSON chunk:", jsonStr);
          }
        }
      }
  
      setSelectedFile("main.py");
    } catch (err) {
      console.error("Error generating challenge:", err);
      alert("⚠️ Error generating challenge. Please try again.");
    } finally {
      setIsLoadingChallenge(false);
    }
  };  

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b px-8 py-6 shadow-sm text-center">
        <h1 className="text-3xl dark:text-gray-100 font-bold">Vuln Forge</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Review, identify, and fix vulnerabilities in AI governed secure coding challenges.
        </p>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-8 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </header>

      {/* Main Body */}
      <main className="flex flex-col items-center flex-1 w-full px-8 py-8 space-y-8">
        <div className="w-full max-w-5xl">
          <SettingsPanel
            language={language}
            setLanguage={setLanguage}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            provider={provider}
            setProvider={setProvider}
            setIsAPIKeyModalOpen={setIsAPIKeyModalOpen}
            setIsModelModalOpen={setIsModelModalOpen}
          />
        </div>

        <div className="w-full max-w-5xl flex justify-end">
          <button
            onClick={handleNewChallenge}
            disabled={isLoadingChallenge}
            className={`${
              isLoadingChallenge
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600"
            } text-white px-4 py-2 rounded`}
          >
            {isLoadingChallenge ? (
              <div className="flex items-center justify-center">
                <span>Generating</span>
                <span className="inline-block w-[1.5ch] text-left ml-1">{loadingDots}</span>
              </div>
            ) : (
              "+ New Challenge"
            )}
          </button>
        </div>

        <div
          className="w-full max-w-5xl flex bg-white dark:bg-gray-800 rounded shadow overflow-hidden"
          style={{ minHeight: "400px" }}
        >
          <div className="w-[250px] bg-gray-50 border-r dark:bg-gray-800">
            <FileExplorer
              files={Object.keys(dummyFiles)}
              selectedFile={selectedFile}
              setSelectedFile={handleSelectFile}
            />
          </div>
          <div className="flex-1">
            <CodeViewer
              code={dummyFiles[selectedFile]}
              selectedLines={selectedLines}
              setSelectedLines={updateSelectedLines}
              canEdit={canEdit}
              editedCode={editedCode}
              setEditedCode={setEditedCode}
            />
          </div>
        </div>

        <div className="w-full max-w-5xl">
          <VulnResponse
            selectedLines={selectedLines}
            onSubmitSelectedLines={handleSubmitSelectedLines}
            feedbackMessage={feedbackMessage}
            isCorrect={isCorrect}
            canEdit={canEdit}
            onSaveFix={handleCheckFix}
          />
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

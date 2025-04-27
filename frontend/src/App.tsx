import { useState, useEffect } from "react";
import SettingsPanel from "./components/SettingsPanel";
import FileExplorer from "./components/FileExplorer";
import CodeViewer from "./components/CodeViewer";
import VulnResponse from "./components/VulnResponse";
import APIKeyModal from "./components/APIKeyModal";
import ModelSelectorModal from "./components/ModelSelectorModal";
import { parseAIResponse } from "./utils/parseAIResponse";

const vulnerableLines: Record<string, number[]> = {
  "app.py": [9], // just examples for now
  "models.py": [2],
  "utils.py": [1],
};

export default function App() {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState("app.py");
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState("medium");
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [isAPIKeyModalOpen, setIsAPIKeyModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedLinesPerFile, setSelectedLinesPerFile] = useState<
    Record<string, number[]>
  >({});
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>("");
  const [fixChecked, setFixChecked] = useState<boolean>(false);
  const handleCheckFix = async () => {
    console.log("Submitting fix for AI check:", editedCode);
    try {
      const response = await fetch("http://localhost:3001/api/check-fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: editedCode,
          filename: selectedFile,
          language,
          difficulty,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFeedbackMessage("✅ Fix confirmed! Vulnerability remediated.");
      } else {
        setFeedbackMessage("❌ Fix not sufficient. Try again.");
      }
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
    console.log("Selected lines submitted:", selectedLines);

    const correctLines = vulnerableLines[selectedFile] || [];

    // Simple check: did they select at least 1 correct line?
    const matchFound = selectedLines.some((line) =>
      correctLines.includes(line)
    );

    if (matchFound) {
      setIsCorrect(true);
      setFeedbackMessage("✅ Correct! You found the vulnerability.");
      setEditedCode(dummyFiles[selectedFile]);
      setCanEdit(true);

      // 🛠 Auto-clear the feedback after 3 seconds
      setTimeout(() => {
        setFeedbackMessage("");
      }, 1000);
    } else {
      setIsCorrect(false);
      setFeedbackMessage("❌ Not quite. Try again!");
    }
  };
  const handleSelectFile = (fileName: string) => {
    setSelectedFile(fileName);

    // Load previous selections for this file, or empty array if none
    setSelectedLines(selectedLinesPerFile[fileName] || []);
  };
  const updateSelectedLines = (lines: number[]) => {
    setSelectedLines(lines);
    if (selectedFile) {
      setSelectedLinesPerFile((prev) => ({
        ...prev,
        [selectedFile]: lines,
      }));
    }
  };
  const handleNewChallenge = async () => {
    setIsLoadingChallenge(true); // Start loading

    // Reset stuff
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
        body: JSON.stringify({
          model: modelName,
          language,
          difficulty,
        }),
      });

      const data = await response.json();

      const parsedCode = parseAIResponse(data.code);

      if (!parsedCode) {
        alert("⚠️ The generated challenge was invalid. Please try again.");
        setIsLoadingChallenge(false);
        return;
      }

      setDummyFiles({
        "main.py": parsedCode,
      });
      setSelectedFile("main.py");
    } catch (err) {
      console.error("Error generating challenge:", err);
      alert("Error generating challenge. See console.");
    } finally {
      setIsLoadingChallenge(false); // End loading
    }
  };
  const [dummyFiles, setDummyFiles] = useState<Record<string, string>>({
    "app.py": `# Placeholder - generate new challenge to begin.`,
  });
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");


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
  }, []); // <-- END of first useEffect
  
  useEffect(() => {
    if (!isLoadingChallenge) {
      setLoadingDots(""); // Reset dots when not loading
      return;
    }
  
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
  
    return () => clearInterval(interval);
  }, [isLoadingChallenge]);
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-8 py-6 shadow-sm text-center">
        <h1 className="text-3xl font-bold">Vuln Forge</h1>
        <p className="text-sm text-gray-600 mt-2">
          Review, identify, and fix vulnerabilities in AI governed secure coding
          challenges.
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
                : "bg-purple-600 hover:bg-purple-700"
            } text-white px-4 py-2 rounded`}
          >
            {isLoadingChallenge ? `Generating${loadingDots}` : "+ New Challenge"}
          </button>
        </div>

        {/* Workspace */}
        <div
          className="w-full max-w-5xl flex bg-white rounded shadow overflow-hidden"
          style={{ minHeight: "400px" }}
        >
          <div className="w-[250px] bg-gray-50 border-r">
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

        {/* Vuln Response */}
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

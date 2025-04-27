import Modal from "./Modal";
import { useState, useEffect } from "react";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelName: string) => void;
}

export default function ModelSelectorModal({
  isOpen,
  onClose,
  onSelectModel,
}: ModelSelectorModalProps) {
  const [modelInput, setModelInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDots, setDownloadDots] = useState("");

  useEffect(() => {
    if (!isDownloading) return;

    const interval = setInterval(() => {
      setDownloadDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500); // Every 500ms

    return () => clearInterval(interval);
  }, [isDownloading]);

  const handleSelect = async () => {
    if (modelInput.trim() === "") return;

    setIsDownloading(true);

    try {
      const response = await fetch("http://localhost:3001/api/pull-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelInput.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        onSelectModel(modelInput.trim());
        setModelInput("");
        setIsDownloading(false);

        if (data.alreadyExists) {
          alert(`✅ Model '${modelInput.trim()}' already exists and is ready.`);
        } else {
          alert(`✅ Model '${modelInput.trim()}' pulled and ready.`);
        }

        onClose();
      } else {
        alert("❌ Failed to pull model. Please try again.");
        setIsDownloading(false);
      }
    } catch (err) {
      console.warn("Warning: Fetch failed but download might still be in progress.", err);
      alert("⚠️ No download detected. It may still be in progress. Please monitor Ollama manually.");
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDownloading) onClose();
      }}
      title="Download a Model"
      subtitle={
        <div className="flex flex-col space-y-1">
          <span>
            Paste model name from{" "}
            <a
              href="https://ollama.com/library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Ollama Library
            </a>
          </span>
          <span>codellama 13b/34b recommended</span>
        </div>
      }
    >
      {/* Model input box */}
      <input
        type="text"
        placeholder="e.g., codellama:13b"
        value={modelInput}
        onChange={(e) => setModelInput(e.target.value)}
        className="w-full border rounded p-2 mb-4"
        disabled={isDownloading}
      />

      {/* Confirm button */}
      {!isDownloading && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          onClick={handleSelect}
          disabled={!modelInput.trim()}
        >
          Confirm Model
        </button>
      )}

      {/* Downloading state */}
      {isDownloading && (
        <div className="text-center text-blue-600 font-semibold flex justify-center items-center space-x-2">
          <span>Downloading</span>
          <span className="w-6 text-left">{downloadDots}</span>
        </div>
      )}
    </Modal>
  );
}

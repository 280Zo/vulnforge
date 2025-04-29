import Modal from "./Modal";
import { useState, useEffect } from "react";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadedModels: string[];
  apiKeyExists: boolean;
  onSelectModel: (modelName: string) => void;
}

export default function ModelSelectorModal({
  isOpen,
  onClose,
  downloadedModels,
  apiKeyExists,
  onSelectModel,
}: ModelSelectorModalProps) {
  const [selectedModel, setSelectedModel] = useState("");
  const [manualModelInput, setManualModelInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDots, setDownloadDots] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!isDownloading) {
      setDownloadDots("");
      return;
    }

    const interval = setInterval(() => {
      setDownloadDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isDownloading]);

  const handleConfirm = async () => {
    const modelToUse = manualModelInput.trim() || selectedModel.trim();
    if (!modelToUse) return;

    setIsDownloading(true);
    setStatusMessage("Starting download...");

    try {
      const response = await fetch("http://localhost:3001/api/pull-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelToUse }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let isSuccess = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          if (!jsonStr.trim()) continue;

          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.status) {
              setStatusMessage(parsed.status);
            }
            if (parsed.done && parsed.status?.toLowerCase() === "success") {
              isSuccess = true;
            }
          } catch (e) {
            console.error("Failed to parse JSON chunk:", jsonStr);
          }
        }
      }

      if (isSuccess) {
        onSelectModel(modelToUse);
        setIsDownloading(false);
        setStatusMessage("");
        onClose();
      } else {
        console.error("Download failed or incomplete");
        setIsDownloading(false);
        // Keep modal open, just stop the button
      }
    } catch (err) {
      console.error("Error pulling model:", err);
      setIsDownloading(false);
      setStatusMessage("❌ Error pulling model. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDownloading) onClose();
      }}
      title="Select or Download a Model"
      subtitle={
        <>
          <span className="block">Choose an option below:</span>
          <span className="block text-xs text-gray-500">
            (OpenAI and Gemini require API key)
          </span>
        </>
      }
    >
      {/* Dropdown */}
      <select
        className="w-full border rounded p-2 mb-4"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        disabled={isDownloading}
      >
        <option value="" disabled>
          Select a downloaded model...
        </option>
        {downloadedModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
        {apiKeyExists && (
          <>
            <option value="openai">OpenAI (API Key)</option>
            <option value="gemini">Gemini (API Key)</option>
          </>
        )}
      </select>

      {/* OR Manual Entry */}
      <input
        type="text"
        placeholder="Or type a new model name here..."
        value={manualModelInput}
        onChange={(e) => setManualModelInput(e.target.value)}
        className="w-full border rounded p-2 mb-4"
        disabled={isDownloading}
      />

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={isDownloading || (!selectedModel && !manualModelInput)}
        className={`w-full px-4 py-2 rounded ${
          isDownloading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isDownloading ? (
          <div className="flex items-center justify-center">
            <span>Downloading</span>
            <span className="inline-block w-[1.5ch] text-left ml-1">
              {downloadDots}
            </span>
          </div>
        ) : (
          "Confirm"
        )}
      </button>

      {/* Status Message */}
      {statusMessage && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          {statusMessage}
        </div>
      )}
    </Modal>
  );
}

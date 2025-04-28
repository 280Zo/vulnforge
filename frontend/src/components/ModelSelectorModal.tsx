import Modal from "./Modal";
import { useState } from "react";

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

  const handleConfirm = () => {
    const modelToUse = manualModelInput.trim() || selectedModel.trim();
    if (modelToUse) {
      onSelectModel(modelToUse);
      onClose();
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
            <option disabled>────────────</option>
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
      />

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!selectedModel && !manualModelInput}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Confirm
      </button>
    </Modal>
  );
}

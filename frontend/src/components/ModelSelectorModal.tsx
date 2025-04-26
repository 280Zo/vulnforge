import Modal from "./Modal";
import { useState } from "react";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: string[];
  onSelectModel: (modelName: string) => void;
}

export default function ModelSelectorModal({
  isOpen,
  onClose,
  models,
  onSelectModel,
}: ModelSelectorModalProps) {
  const [selectedModel, setSelectedModel] = useState("");

  const handleModelSelect = async (model: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/pull-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`Model ${model} is ready.`);
        onSelectModel(model); // Set model selection only after pull successful
        onClose();
      } else {
        alert("Failed to pull model. Try again.");
      }
    } catch (error) {
      console.error("Error pulling model:", error);
      alert("Error pulling model. Try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Model"
      subtitle="codellama 13b/34b recommended"
    >
      <select
        className="w-full border rounded p-2 mb-4"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="" disabled>
          Select a model...
        </option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        onClick={() => handleModelSelect(selectedModel)}
        disabled={!selectedModel}
      >
        Confirm Model
      </button>

      {selectedModel && selectedModel.includes("34b") && (
        <p className="text-red-600 text-sm mt-2">
          ⚠️ Warning: Large models (like 34B) may require significant RAM and
          disk space.
        </p>
      )}
    </Modal>
  );
}

import Modal from "./Modal";
import { useState } from "react";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: string[];
  onSelectModel: (modelName: string) => void;
}

export default function ModelSelectorModal({ isOpen, onClose, models, onSelectModel }: ModelSelectorModalProps) {
  const [selectedModel, setSelectedModel] = useState("");

  const handleSelect = () => {
    if (selectedModel) {
      onSelectModel(selectedModel);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Model" subtitle="codellama 13b/34b recommended">
      <select
        className="w-full border rounded p-2 mb-4"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="" disabled>Select a model...</option>
        {models.map((model) => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        onClick={handleSelect}
      >
        Confirm Model
      </button>

      {selectedModel && selectedModel.includes("34b") && (
        <p className="text-red-600 text-sm mt-2">
          ⚠️ Warning: Large models (like 34B) may require significant RAM and disk space.
        </p>
      )}
    </Modal>
  );
}

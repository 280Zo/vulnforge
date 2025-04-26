import Modal from "./Modal";
import { useState } from "react";

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

  const handleSelect = async () => {
    if (modelInput.trim() !== "") {
      onSelectModel(modelInput.trim());
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download a Model"
      subtitle={
        <div className="flex flex-col items-center space-y-1 text-center">
          <span>
            Paste model name from the {" "}
            <a
              href="https://ollama.com/library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Ollama Library
            </a>
          </span>
        </div>
      }
    >
      {/* Model input box */}
      <input
        type="text"
        placeholder="e.g., codellama:13b-code"
        value={modelInput}
        onChange={(e) => setModelInput(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />

      {/* Confirm button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        onClick={handleSelect}
        disabled={!modelInput.trim()}
      >
        Confirm Model
      </button>
    </Modal>
  );
}

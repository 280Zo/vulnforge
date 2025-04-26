import Modal from "./Modal";
import { useState } from "react";

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function APIKeyModal({ isOpen, onClose, onSave }: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter API Key">
      <input
        type="password"
        className="w-full border rounded p-2 mb-4"
        placeholder="Paste your API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        onClick={handleSave}
      >
        Save API Key
      </button>
    </Modal>
  );
}

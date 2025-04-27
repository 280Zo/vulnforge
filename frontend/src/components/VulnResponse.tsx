interface VulnResponseProps {
  selectedLines: number[];
  onSubmitSelectedLines: () => void;
  feedbackMessage: string;
  isCorrect: boolean | null;
  canEdit: boolean;
  onSaveFix: () => void;
}

export default function VulnResponse({
  selectedLines,
  onSubmitSelectedLines,
  feedbackMessage,
  isCorrect,
  canEdit,
  onSaveFix,
}: VulnResponseProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow space-y-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Select the vulnerable line(s) of code
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Click the line(s) you think contain the vulnerability, then submit.
      </p>

      {selectedLines.length > 0 && isCorrect !== true && (
        <button
          onClick={onSubmitSelectedLines}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Submit Selected Lines
        </button>
      )}

      {canEdit && (
        <button
          onClick={onSaveFix}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4"
        >
          Check Your Fix
        </button>
      )}

      {/* Add feedback inside return */}
      {isCorrect !== null && (
        <div
          className={`text-lg font-semibold ${
            isCorrect ? "text-green-600" : "text-red-600"
          }`}
        >
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}

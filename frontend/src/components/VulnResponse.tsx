interface VulnResponseProps {
  selectedLines: number[];
  onSubmitSelectedLines: () => void;
}

export default function VulnResponse({ selectedLines, onSubmitSelectedLines }: VulnResponseProps) {
  return (
    <div className="bg-white p-6 rounded shadow space-y-4 text-center">
      <h2 className="text-xl font-semibold">Select the vulnerable line(s) of code</h2>
      <p className="text-gray-600">
        Click the line(s) you think contain the vulnerability, then submit.
      </p>

      {selectedLines.length > 0 && (
        <button
          onClick={onSubmitSelectedLines}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Submit Selected Lines
        </button>
      )}
    </div>
  );
}

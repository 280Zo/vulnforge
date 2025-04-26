import { useState } from "react";

export default function VulnResponse() {
  const [solved, setSolved] = useState(false); // track if challenge was solved
  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <label className="block font-semibold">
        Describe the vulnerability and its impact
      </label>
      <textarea
        className="w-full border rounded p-3 resize-y font-sans"
        rows={4}
        placeholder="Example: This endpoint allows unauthenticated users to reset passwords via GET request..."
      />
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            // Simulate solving the challenge
            setSolved(true);
          }}
        >
          Submit
        </button>
        {solved && (
          <button className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">
            Next Challenge
          </button>
        )}
      </div>
    </div>
  );
}

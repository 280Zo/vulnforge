interface SettingsPanelProps {
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: string;
  setDifficulty: (diff: string) => void;
  provider: string;
  setProvider: (prov: string) => void;
  onGenerateChallenge: () => void;
}

function SettingsPanel({
  language,
  setLanguage,
  difficulty,
  setDifficulty,
  provider,
  setProvider,
  onGenerateChallenge,
}: SettingsPanelProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateChallenge();
  };

  return (
    <form className="bg-white p-6 rounded shadow-md space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-4">
        {/* Language Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Python</option>
            <option>JavaScript</option>
            <option>TypeScript</option>
            <option>Java</option>
            <option>Go</option>
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Provider Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="" disabled>Select Provider</option>
            <option value="ollama">Ollama (local)</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
      >
        Generate Challenge
      </button>
    </form>
  );
}

export default SettingsPanel;

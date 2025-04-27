interface SettingsPanelProps {
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: string;
  setDifficulty: (diff: string) => void;
  provider: string;
  setProvider: (prov: string) => void;
  setIsAPIKeyModalOpen: (open: boolean) => void;
  setIsModelModalOpen: (open: boolean) => void;
}

function SettingsPanel({
  language,
  setLanguage,
  difficulty,
  setDifficulty,
  provider,
  setProvider,
  setIsAPIKeyModalOpen,
  setIsModelModalOpen,
}: SettingsPanelProps) {


  return (
    <form className="bg-white dark:bg-gray-800 p-6 rounded shadow-md space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Language Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Provider Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => {
              const selectedProvider = e.target.value;
              setProvider(selectedProvider);

              // Auto-trigger modals
              if (
                selectedProvider === "openai" ||
                selectedProvider === "gemini"
              ) {
                setIsAPIKeyModalOpen(true);
              } else if (selectedProvider === "ollama") {
                setIsModelModalOpen(true);
              }
            }}
            className="w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="" disabled>
              Select Provider
            </option>
            <option value="ollama">Ollama (local)</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
      </div>
    </form>
  );
}

export default SettingsPanel;

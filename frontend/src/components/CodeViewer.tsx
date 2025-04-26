interface CodeViewerProps {
  code: string;
  selectedLines: number[];
  setSelectedLines: (lines: number[]) => void;
}

export default function CodeViewer({ code, selectedLines, setSelectedLines }: CodeViewerProps) {
  const lines = code.split("\n");

  const toggleLineSelection = (lineNumber: number) => {
    if (selectedLines.includes(lineNumber)) {
      setSelectedLines(selectedLines.filter((line) => line !== lineNumber));
    } else {
      setSelectedLines([...selectedLines, lineNumber]);
    }
  };

  return (
    <div className="p-4 font-mono text-sm bg-white text-black whitespace-pre overflow-auto h-full">
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const isSelected = selectedLines.includes(lineNumber);

        return (
          <div
            key={lineNumber}
            onClick={() => toggleLineSelection(lineNumber)}
            className={`flex items-start space-x-4 py-0.5 px-2 cursor-pointer rounded ${
              isSelected ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <span className="w-8 text-right text-gray-400 select-none">{lineNumber}</span>
            <span className="flex-1">{line || "\u00A0"}</span>
          </div>
        );
      })}
    </div>
  );
}

interface FileExplorerProps {
  files: string[];
  selectedFile: string;
  setSelectedFile: (filename: string) => void;
}

export default function FileExplorer({
  files,
  selectedFile,
  setSelectedFile,
}: FileExplorerProps) {
  return (
    <ul className="space-y-1 p-2">
      {files.map((file) => {
        const isSelected = file === selectedFile;
        return (
          <li
            key={file}
            onClick={() => setSelectedFile(file)}
            className={`cursor-pointer px-3 py-2 rounded text-sm font-mono ${
              isSelected
                ? "bg-indigo-500 text-white font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
            }`}
          >
            {file}
          </li>
        );
      })}
    </ul>
  );
}

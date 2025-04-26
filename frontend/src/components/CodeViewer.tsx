interface CodeViewerProps {
  code: string;
}

export default function CodeViewer({ code }: CodeViewerProps) {
  return (
    <div className="p-4 font-mono text-sm bg-white text-black whitespace-pre overflow-auto h-full">
      {code}
    </div>
  );
}

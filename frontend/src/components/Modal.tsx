interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string; // optional subtitle
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">  
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100"> 
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"> 
                {subtitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" 
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

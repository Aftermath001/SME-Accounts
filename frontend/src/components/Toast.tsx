interface ToastProps {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-success-500 text-white',
    error: 'bg-error-500 text-white',
    warning: 'bg-warning-500 text-white',
    info: 'bg-primary-500 text-white',
  };

  return (
    <div
      className={`${colors[type]} px-4 py-3 rounded-xl shadow-card flex items-center gap-3 min-w-[300px] animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      <span className="text-lg">{icons[type]}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-white hover:opacity-80 transition-opacity">
        ✕
      </button>
    </div>
  );
}

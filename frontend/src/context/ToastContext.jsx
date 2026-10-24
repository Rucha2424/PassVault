import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-white',
              border: 'border-vault-success/30',
              iconColor: 'text-vault-success',
              accent: 'bg-vault-success',
            },
            error: {
              icon: AlertCircle,
              bg: 'bg-white',
              border: 'border-vault-error/30',
              iconColor: 'text-vault-error',
              accent: 'bg-vault-error',
            },
            warning: {
              icon: AlertCircle,
              bg: 'bg-white',
              border: 'border-vault-warning/30',
              iconColor: 'text-vault-warning',
              accent: 'bg-vault-warning',
            },
            info: {
              icon: Info,
              bg: 'bg-white',
              border: 'border-ultra-violet/30',
              iconColor: 'text-ultra-violet',
              accent: 'bg-ultra-violet',
            },
          };

          const config = typeConfig[toast.type] || typeConfig.info;
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-elevated
                border ${config.bg} ${config.border} animate-fade-in relative overflow-hidden
              `}
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.accent}`} />
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ml-1 ${config.iconColor}`} />
              <div className="flex-1 text-xs sm:text-sm text-deep-plum font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-muted-text hover:text-deep-plum transition-colors p-0.5 rounded"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

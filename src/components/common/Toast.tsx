/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-600 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-white border-emerald-300 text-slate-800 shadow-md',
    error: 'bg-white border-rose-300 text-slate-800 shadow-md',
    info: 'bg-white border-sky-300 text-slate-800 shadow-md'
  };

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border flex items-start gap-3 transition-all transform animate-in slide-in-from-top-2 duration-200 ${bgStyles[toast.type]}`}
      role="alert"
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-xs font-bold text-slate-900">{toast.title}</p>}
        <p className="text-xs text-slate-600 leading-snug mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition"
        aria-label="Tutup Makluman"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

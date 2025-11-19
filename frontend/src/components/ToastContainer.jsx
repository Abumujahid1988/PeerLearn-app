import React from 'react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer(){
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm p-3 rounded shadow text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm">{t.message}</div>
            <button onClick={() => removeToast(t.id)} className="text-xs opacity-80">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

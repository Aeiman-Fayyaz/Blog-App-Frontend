import React from 'react';
import { toast } from 'react-toastify';
import { Check, X } from 'lucide-react';

/**
 * Custom confirmation toast utility
 * Shows a confirmation prompt with Yes/No buttons
 * Returns a promise that resolves to true/false
 */
export const confirmDelete = (message) => {
  return new Promise((resolve) => {
    const ToastContent = ({ closeToast }) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resolve(true);
              closeToast();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Check className="w-4 h-4" />
            Yes, Delete
          </button>
          <button
            onClick={() => {
              resolve(false);
              closeToast();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-400 hover:bg-slate-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );

    toast.warning(<ToastContent />, {
      position: 'top-center',
      autoClose: false,
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
  });
};

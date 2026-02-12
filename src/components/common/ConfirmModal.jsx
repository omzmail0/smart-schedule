import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "نعم، متأكد", cancelText = "إلغاء", isDestructive = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={`flex-1 h-12 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {confirmText}
          </button>
          <button onClick={onCancel} className="flex-1 h-12 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

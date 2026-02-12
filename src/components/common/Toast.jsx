import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-gray-800',
    error: 'bg-white border-l-4 border-red-500 text-gray-800',
  };
  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl min-w-[300px] animate-in slide-in-from-top-2 duration-300 ${styles[type]}`}>
      {icons[type]}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

export default Toast;

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    // تقليل الوقت شوية لـ 2.5 ثانية عشان يبقى أخف
    const timer = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]); // إضافة message للـ deps عشان لو الرسالة اتغيرت التايمر يعيد

  const styles = {
    success: 'bg-gray-900 text-white',
    error: 'bg-red-500 text-white',
  };

  const icons = {
    success: <CheckCircle2 className="text-green-400" size={20} />,
    error: <XCircle className="text-white" size={20} />,
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl min-w-[280px] max-w-[90%] animate-in slide-in-from-top-4 fade-in duration-300 ${styles[type]}`}>
      {icons[type]}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

export default Toast;

import React from 'react';
import { Loader2 } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center animate-out fade-out duration-500">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute text-blue-600">
            <Loader2 size={24} className="animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-gray-400 text-xs font-bold animate-pulse">جاري تحميل البيانات...</p>
    </div>
  );
};

export default SplashScreen;

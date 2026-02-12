import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center animate-out fade-out duration-500">
      <div className="relative flex items-center justify-center">
        {/* دائرة بتلف */}
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        {/* لوجو أو نقطة ثابتة في النص */}
        <div className="absolute w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
            ⏳
        </div>
      </div>
      <p className="mt-4 text-gray-400 text-xs font-bold animate-pulse">جاري تحميل البيانات...</p>
    </div>
  );
};

export default SplashScreen;

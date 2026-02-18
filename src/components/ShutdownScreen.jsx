import React from 'react';
import { PowerOff } from 'lucide-react';

const ShutdownScreen = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-center page-enter" dir="rtl">
      
      {/* الأيقونة مع أنيميشن نبض هادئ */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gray-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-50 z-10">
            <PowerOff size={40} className="text-gray-400" strokeWidth={1.5}/>
        </div>
      </div>

      <h1 className="text-4xl font-black text-gray-800 mb-3 tracking-tight">
        تم إيقاف النظام
      </h1>
      
      <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
        نعتذر، الخدمة متوقفة تماماً في الوقت الحالي
      </p>

      {/* الرسالة الإنجليزية بشكل تقني */}
      <div className="fixed bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] font-mono text-gray-300 tracking-[0.2em] uppercase">
          DATABASE RULES : LOCKED
        </p>
      </div>
    </div>
  );
};

export default ShutdownScreen;

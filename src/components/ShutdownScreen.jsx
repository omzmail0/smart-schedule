import React from 'react';
import { PowerOff } from 'lucide-react';

const ShutdownScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center page-enter" dir="rtl">
      
      {/* الأيقونة مع تأثير نبض أحمر خافت */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-10"></div>
        <div className="relative w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center shadow-2xl border border-gray-700 z-10">
            <PowerOff size={40} className="text-red-500" strokeWidth={1.5}/>
        </div>
      </div>

      <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
        تم إيقاف النظام
      </h1>
      
      <p className="text-[10px] font-mono text-white font-bold tracking-[0.2em] uppercase opacity-50">
          DATABASE RULES : LOCKED
        </p>

      {/* رسالة المشرف في مكان مناسب */}
      <div className="mt-16 pt-8 border-t border-red-800 w-full max-w-[200px]">
        <p className="text-[10px] font-mono text-white-900 font-bold tracking-[0.2em] uppercase">
          DATABASE RULES : LOCKED
        </p>
      </div>
    </div>
  );
};

export default ShutdownScreen;

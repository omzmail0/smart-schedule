import React from 'react';
import { CalendarClock } from 'lucide-react'; // أيقونة معبرة عن التطبيق

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#FDFDFD] z-[999] flex flex-col items-center justify-center animate-out fade-out duration-700">
      
      {/* اللوجو النابض */}
      <div className="relative flex items-center justify-center mb-8">
        {/* دائرة خلفية بتكبر وتصغر */}
        <div className="absolute w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-20"></div>
        
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-gray-50 z-10 animate-bounce-slow">
            {/* استخدمنا لون ثابت هنا لأن الإعدادات لسه بتحمل */}
            <CalendarClock size={40} className="text-[#0e395c]" strokeWidth={1.5} />
        </div>
      </div>

      {/* شريط تحميل بسيط جداً */}
      <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-[#0e395c] animate-loading-bar rounded-full"></div>
      </div>
      
      <p className="mt-4 text-gray-400 text-[10px] font-bold tracking-widest opacity-60">جاري التحميل</p>
    </div>
  );
};

export default SplashScreen;

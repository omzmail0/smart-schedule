import React from 'react';
import { PowerOff } from 'lucide-react';

const ShutdownScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in" dir="rtl">
      
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-gray-100">
        <PowerOff size={48} className="text-gray-400"/>
      </div>

      <h1 className="text-3xl font-black text-gray-800 mb-2">تم إيقاف النظام</h1>
      
      <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
        الخدمة غير متاحة حالياً.
      </p>

      {/* رسالة التذكير للمشرف بالإنجليزية */}
      <div className="mt-12 pt-8 border-t border-gray-200 w-full max-w-xs">
        <p className="text-[10px] text-red-400 font-bold tracking-[0.1em] opacity-80 uppercase">
          Database Rules are LOCKED 🔒
        </p>
      </div>
    </div>
  );
};

export default ShutdownScreen;

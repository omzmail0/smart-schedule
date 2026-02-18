import React from 'react';
import { Lock } from 'lucide-react';

const MaintenanceScreen = ({ settings }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center page-enter" dir="rtl"> {/* ✅ تم التعديل */}
      
      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <Lock size={64} className="text-gray-400"/>
      </div>

      <h1 className="text-4xl font-black text-gray-800 mb-4">النظام مغلق</h1>
      
      <p className="text-gray-500 font-medium text-lg">
        {settings.teamName}
      </p>

      <div className="mt-12 pt-8 border-t border-gray-200 w-full max-w-xs">
        <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] opacity-50">ADMIN ACCESS ONLY</p>
      </div>
    </div>
  );
};

export default MaintenanceScreen;

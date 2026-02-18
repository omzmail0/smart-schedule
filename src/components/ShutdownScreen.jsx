import React from 'react';
import { PowerOff } from 'lucide-react';

const ShutdownScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in" dir="rtl">
      
      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <PowerOff size={48} className="text-red-500"/>
      </div>

      <h1 className="text-3xl font-black mb-2">تم إيقاف النظام</h1>
    
  );
};

export default ShutdownScreen;

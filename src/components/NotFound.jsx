import React from 'react';
import { SearchX, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center page-enter" dir="rtl"> {/* ✅ تم التعديل */}
      
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <SearchX size={48} className="text-gray-400"/>
      </div>

      <h1 className="text-6xl font-black text-gray-800 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-600 mb-4">الصفحة غير موجودة</h2>
      
      <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
        يبدو أنك وصلت لرابط غير صحيح أو تم حذفه.
      </p>

      <a href="/" className="h-12 px-8 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-80 transition-all shadow-lg">
        العودة للرئيسية <ArrowRight size={18}/>
      </a>
    </div>
  );
};

export default NotFound;

import React from 'react';
import { Calendar, UserCog, ArrowLeft, ArrowDown } from 'lucide-react';
import Button from './Button';

const LandingPage = ({ onStart, settings, adminSlots = [] }) => {
  
  // هل الدورة نشطة؟
  const hasActiveCycle = adminSlots && adminSlots.length > 0;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-800 flex flex-col pt-20" dir="rtl">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFDFD]/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="p-4 md:p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3">
                {settings.logo ? (
                    <img src={settings.logo} className="w-10 h-10 rounded-xl object-cover shadow-sm"/>
                ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: settings.primaryColor }}>
                        {settings.teamName[0]}
                    </div>
                )}
                <div>
                    <h1 className="font-extrabold text-lg text-gray-800 leading-tight">{settings.teamName}</h1>
                    <p className="text-[10px] font-bold text-gray-400">أداة التنسيق</p>
                </div>
            </div>
            <button onClick={onStart} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                تسجيل دخول <ArrowLeft size={16}/>
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-10 px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* الحالة الديناميكية (نفس الشكل، اختلاف اللون والنص فقط) */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border ${hasActiveCycle ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-orange-50 text-orange-800 border-orange-100'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasActiveCycle ? 'bg-blue-400' : 'bg-orange-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasActiveCycle ? 'bg-blue-600' : 'bg-orange-600'}`}></span>
            </span>
            {hasActiveCycle ? "النظام يعمل الآن" : "بانتظار بدء دورة جديدة"}
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900 max-w-3xl">
          نسّق مواعيدك مع <br/>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${settings.primaryColor}, #334155)` }}>
            خطة الفريق
          </span>
        </h1>
        
        <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
          فكرة الأداة بسيطة: المدير بيطرح المواعيد المتاحة عنده، وأنت بتدخل تختار اللي يناسبك منهم.
        </p>

        {/* Workflow Section */}
        <div className="w-full max-w-4xl grid md:grid-cols-[1fr_auto_1fr] items-center gap-6 mb-16">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-2 -mt-2 z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-3 text-blue-700">
                        <UserCog size={24}/>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">1. تحديد المتاح</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        مسؤول الفريق بيحدد الأول الأوقات اللي هو فاضي فيها خلال الأسبوع.
                    </p>
                </div>
            </div>

            <div className="flex justify-center text-gray-300">
                <ArrowLeft size={32} className="hidden md:block" />
                <ArrowDown size={32} className="block md:hidden" />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-green-200 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-2 -mt-2 z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-3 text-green-700">
                        <Calendar size={24}/>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">2. اختيارك أنت</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        أنت بتدخل تختار من المواعيد دي الوقت اللي يناسبك عشان نعتمد الاجتماع.
                    </p>
                </div>
            </div>

        </div>

        {/* Action Button - رجع زي ما كان */}
        <div className="mb-12">
            <Button 
                onClick={onStart} 
                style={{ backgroundColor: settings.primaryColor }} 
                className="h-14 px-10 text-lg text-white shadow-xl rounded-2xl hover:opacity-90 transition-opacity"
            >
                ابدأ اختيار مواعيدك <ArrowLeft size={20}/>
            </Button>
        </div>

      </main>
      
      <div className="h-8"></div>
    </div>
  );
};

export default LandingPage;

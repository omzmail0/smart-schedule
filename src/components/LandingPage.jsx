import React from 'react';
import { Calendar, UserCog, ArrowLeft, ArrowDown, KeyRound, CheckCircle2 } from 'lucide-react';
import Button from './Button';

const LandingPage = ({ onStart, settings, adminSlots = [] }) => {
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
                    <p className="text-[10px] font-bold text-gray-400">نظام تنسيق المواعيد</p>
                </div>
            </div>
            <button onClick={onStart} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                دخول بالكود <KeyRound size={16}/>
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-8 px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* الحالة */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border ${hasActiveCycle ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-orange-50 text-orange-800 border-orange-100'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasActiveCycle ? 'bg-blue-400' : 'bg-orange-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasActiveCycle ? 'bg-blue-600' : 'bg-orange-600'}`}></span>
            </span>
            {hasActiveCycle ? "النظام يعمل الآن" : "بانتظار بدء دورة جديدة"}
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-gray-900 max-w-3xl">
          نسّق مواعيدك بسهولة <br/>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${settings.primaryColor}, #334155)` }}>
             باستخدام كود الدخول
          </span>
        </h1>
        
        <p className="text-base text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
          بدون تسجيل معقد ولا حفظ كلمات مرور.. كود واحد بيوصلك من الأدمن، بتدخل بيه وتحدد المواعيد اللي تناسبك.
        </p>

        {/* Action Button */}
        <div className="mb-16 w-full max-w-xs">
            <Button 
                onClick={onStart} 
                style={{ backgroundColor: settings.primaryColor }} 
                className="w-full h-14 text-lg text-white shadow-xl rounded-2xl hover:scale-105 transition-transform"
            >
                معايا الكود، ابدأ <ArrowLeft size={20}/>
            </Button>
        </div>

        {/* How it works Section (التعليمات) */}
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>
             
             <h3 className="text-xl font-black text-gray-800 mb-8 relative z-10">كيف أستخدم الموقع؟</h3>
             
             <div className="grid md:grid-cols-3 gap-8 relative z-10 text-right">
                
                {/* الخطوة 1 */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 font-bold text-xl shadow-sm">1</div>
                    <h4 className="font-bold text-gray-900 mb-2">استلم الكود</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        تواصل مع مسؤول الفريق واستلم <span className="font-bold text-gray-700">كود الدخول</span> الخاص بك (مكون من 8 أرقام).
                    </p>
                </div>

                {/* سهم */}
                <div className="hidden md:flex items-center justify-center text-gray-200"><ArrowLeft size={32}/></div>

                {/* الخطوة 2 */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 font-bold text-xl shadow-sm">2</div>
                    <h4 className="font-bold text-gray-900 mb-2">سجل دخول</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        اضغط على "ابدأ"، واكتب الكود في الخانة المخصصة. النظام هيتعرف عليك فوراً.
                    </p>
                </div>

                {/* سهم */}
                <div className="hidden md:flex items-center justify-center text-gray-200"><ArrowLeft size={32}/></div>

                {/* الخطوة 3 */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 font-bold text-xl shadow-sm">3</div>
                    <h4 className="font-bold text-gray-900 mb-2">اختر الميعاد</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        هتظهرلك المواعيد اللي طرحها المدير، علم على كل الأوقات اللي انت فاضي فيها واضغط إرسال.
                    </p>
                </div>

             </div>
        </div>

      </main>
      
      <div className="h-8"></div>
    </div>
  );
};

export default LandingPage;

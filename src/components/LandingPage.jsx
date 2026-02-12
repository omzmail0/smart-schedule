import React from 'react';
import { Calendar, Users, Lock, ArrowLeft, ShieldAlert, ArrowRight } from 'lucide-react';
import Button from './Button';

const LandingPage = ({ onStart, settings }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white font-sans text-gray-800 selection:bg-blue-100 flex flex-col" dir="rtl">
      
      {/* Navbar Simple */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
            {settings.logo ? (
                <img src={settings.logo} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-white"/>
            ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: settings.primaryColor }}>
                    {settings.teamName[0]}
                </div>
            )}
            <h1 className="font-extrabold text-xl tracking-tight text-gray-800">{settings.teamName}</h1>
        </div>
        <button onClick={onStart} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
            دخول الأعضاء <ArrowLeft size={16}/>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-700 text-xs font-bold mb-8 border border-blue-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            نظام ذكي لتنسيق المواعيد
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] text-gray-900 tracking-tight">
          نسّق مواعيد فريقك <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">بكل سهولة وذكاء</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
          تخلص من عناء الرسائل الطويلة لتحديد موعد اجتماع. منصة <strong className="text-gray-700">{settings.teamName}</strong> تتيح لكل عضو تحديد أوقاته المناسبة، والنظام يختار الوقت المثالي للجميع.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full max-w-sm sm:max-w-none">
            <Button 
                onClick={onStart} 
                style={{ backgroundColor: settings.primaryColor }} 
                className="w-full sm:w-auto h-16 px-10 text-xl text-white shadow-xl shadow-blue-500/20 rounded-2xl hover:scale-105 transition-transform"
            >
                ابدأ الآن <ArrowLeft size={24}/>
            </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-right w-full">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                    <Calendar size={24}/>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">جدولة مرنة</h3>
                <p className="text-sm text-gray-500 leading-relaxed">حدد الساعات التي تكون فيها متاحاً خلال الأسبوع بضغطة زر واحدة.</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                    <Users size={24}/>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">تحليل ذكي</h3>
                <p className="text-sm text-gray-500 leading-relaxed">النظام يجمع البيانات ويقترح أفضل وقت يناسب أكبر عدد من الأعضاء.</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                    <Lock size={24}/>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">خصوصية وأمان</h3>
                <p className="text-sm text-gray-500 leading-relaxed">بياناتك محفوظة، ولا يمكن لأحد تعديل جدولك غيرك أنت والمدير.</p>
            </div>
        </div>

        {/* Admin Note Section */}
        <div className="mt-16 bg-orange-50/80 border border-orange-100 rounded-[2.5rem] p-8 text-center max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><ShieldAlert size={150} className="text-orange-900"/></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600 shadow-sm">
                    <ShieldAlert size={24}/>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">تنويه هام للزوار الجدد</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed max-w-lg">
                    هذا النظام خاص ومغلق لأعضاء الفريق فقط. لا يمكنك إنشاء حساب بنفسك.<br/>
                    يجب أن تتواصل مع <strong>مدير الفريق</strong> ليقوم بإنشاء حساب لك وتسليمك بيانات الدخول.
                </p>
                <button onClick={onStart} className="text-xs font-bold text-orange-700 bg-white border border-orange-200 px-5 py-2.5 rounded-xl hover:bg-orange-100 transition-colors shadow-sm">
                    لدي حساب بالفعل، تسجيل الدخول
                </button>
            </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="text-center py-8 text-gray-400 text-xs font-medium border-t border-gray-100 mt-12 bg-white/50 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} {settings.teamName}. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
};

export default LandingPage;

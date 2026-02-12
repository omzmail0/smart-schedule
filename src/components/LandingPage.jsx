import React from 'react';
import { Calendar, Users, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from './Button';

const LandingPage = ({ onStart, settings }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans text-gray-800 flex flex-col" dir="rtl">
      
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
            {settings.logo ? (
                <img src={settings.logo} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white"/>
            ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: settings.primaryColor }}>
                    {settings.teamName[0]}
                </div>
            )}
            <div>
                <h1 className="font-extrabold text-lg tracking-tight text-gray-900">{settings.teamName}</h1>
                <p className="text-xs font-bold text-gray-400">نظام تنسيق المواعيد</p>
            </div>
        </div>
        <button onClick={onStart} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2 shadow-sm">
            تسجيل الدخول <ArrowLeft size={16}/>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-8 border border-blue-100">
            <Zap size={14} className="fill-blue-500 text-blue-500"/>
            المنصة الرسمية للفريق
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] text-gray-900">
          نسق اجتماعات <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${settings.primaryColor}, #2563eb)` }}>
             {settings.teamName}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          هذا الموقع مخصص لتسهيل التواصل بين أعضاء الفريق. حدد أوقات فراغك، واترك النظام يختار الموعد الأنسب للجميع بذكاء.
        </p>

        <Button 
            onClick={onStart} 
            style={{ backgroundColor: settings.primaryColor }} 
            className="w-full sm:w-auto h-16 px-10 text-xl text-white shadow-xl rounded-2xl hover:scale-105 transition-transform"
        >
            ابدأ الآن <ArrowLeft size={24}/>
        </Button>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 text-right w-full mt-20">
            <FeatureCard icon={<Calendar/>} title="جدولة مرنة" desc="حدد الساعات المتاحة لك خلال الأسبوع بكل سهولة." color={settings.primaryColor} />
            <FeatureCard icon={<Users/>} title="التوافق الجماعي" desc="النظام يحلل جداول الجميع ويقترح الوقت الذهبي." color={settings.primaryColor} />
            <FeatureCard icon={<Zap/>} title="سهولة الاستخدام" desc="واجهة بسيطة ومباشرة تركز على إنجاز المهمة." color={settings.primaryColor} />
        </div>

      </main>

      <footer className="text-center py-8 text-gray-400 text-xs font-medium border-t border-gray-100 mt-10">
        &copy; {new Date().getFullYear()} {settings.teamName} - جميع الحقوق محفوظة
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ backgroundColor: color }}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <h3 className="font-bold text-gray-800 mb-2 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;

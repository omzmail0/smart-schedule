import React from 'react';
import { Calendar, Users, Lock, ArrowLeft, ShieldAlert, Camera } from 'lucide-react';
import Button from './Button';

const LandingPage = ({ onStart, settings }) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-800 flex flex-col" dir="rtl">
      
      {/* Navbar Simple */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
            {settings.logo ? (
                <img src={settings.logo} className="w-10 h-10 rounded-xl object-cover shadow-sm"/>
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
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mb-8 border border-gray-200">
            <Camera size={14} />
            منصة تيم الميديا - صناع الحياة
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
          نسّق مواعيد الفريق <br/>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${settings.primaryColor}, #1e293b)` }}>
            بكل سهولة واحترافية
          </span>
        </h1>
        
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          تخلص من عناء الرسائل الطويلة لتحديد موعد اجتماع. منصة <strong className="text-gray-800">{settings.teamName}</strong> تتيح لكل عضو تحديد أوقاته المناسبة، والنظام يختار الوقت المثالي للجميع.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
            <Button 
                onClick={onStart} 
                style={{ backgroundColor: settings.primaryColor }} 
                className="w-full sm:w-auto h-14 px-8 text-lg text-white shadow-xl rounded-2xl hover:opacity-90 transition-opacity"
            >
                تسجيل الدخول <ArrowLeft size={20}/>
            </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-right w-full">
            <FeatureCard 
                icon={<Calendar className="text-blue-600"/>}
                title="جدولة مرنة"
                desc="حدد الساعات التي تكون فيها متاحاً خلال الأسبوع بضغطة زر."
            />
            <FeatureCard 
                icon={<Users className="text-purple-600"/>}
                title="تحليل ذكي"
                desc="النظام يجمع البيانات ويقترح أفضل وقت يناسب أكبر عدد من الأعضاء."
            />
            <FeatureCard 
                icon={<Lock className="text-green-600"/>}
                title="خصوصية وأمان"
                desc="بياناتك محفوظة، ولا يمكن لأحد تعديل جدولك غيرك أنت والمسؤول."
            />
        </div>

        {/* Admin Note Section - رجعنا الجزء المهم */}
        <div className="mt-16 bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5"><ShieldAlert size={100} className="text-orange-600"/></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                    <ShieldAlert size={28}/>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">كيف أحصل على حساب؟</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed max-w-lg">
                    هذا النظام مغلق لأعضاء الفريق فقط. لا يمكنك إنشاء حساب بنفسك.<br/>
                    <strong>مسؤول الميديا</strong> هو الوحيد الذي يمتلك صلاحية إنشاء الحسابات وتسليم بيانات الدخول (اسم المستخدم وكلمة المرور) لكل عضو.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-800 bg-orange-100/50 px-4 py-2 rounded-lg">
                    معك البيانات؟ اضغط على زر "تسجيل الدخول" بالأعلى
                </div>
            </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-100 mt-12 bg-white">
        &copy; {new Date().getFullYear()} {settings.teamName}. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;

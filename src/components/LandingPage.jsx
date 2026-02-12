import React from 'react';
import { Calendar, Users, Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
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
            <div>
                <h1 className="font-extrabold text-lg tracking-tight text-gray-800 leading-tight">{settings.teamName}</h1>
                <p className="text-[10px] font-bold text-gray-400 tracking-wide">أداة تنسيق المواعيد</p>
            </div>
        </div>
        <button onClick={onStart} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
            تسجيل دخول <ArrowLeft size={16}/>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* النقطة المتحركة */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-8 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            أداة تنظيم فريق الميديا
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
          نظم وقتك، وركز على إبداعك
        </h1>
        
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          أداة بسيطة مخصصة لـ <strong className="text-gray-800">{settings.teamName}</strong>.
          كل اللي عليك تحدد الساعات اللي فاضي فيها، والأداة هتطلع أنسب ميعاد للاجتماع أو الشغل.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
            <Button 
                onClick={onStart} 
                style={{ backgroundColor: settings.primaryColor }} 
                className="w-full sm:w-auto h-14 px-8 text-lg text-white shadow-xl rounded-2xl hover:opacity-90 transition-opacity"
            >
                ابدأ الاستخدام <ArrowLeft size={20}/>
            </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-right w-full">
            <FeatureCard 
                icon={<Calendar className="text-blue-600"/>}
                title="حدد وقتك"
                desc="اختار الساعات المتاحة ليك في الأسبوع بلمسة واحدة."
            />
            <FeatureCard 
                icon={<Users className="text-purple-600"/>}
                title="التوافق الذكي"
                desc="الأداة بتقارن جداولنا كلنا وبتقترح الوقت اللي يناسب الأغلبية."
            />
            <FeatureCard 
                icon={<Lock className="text-green-600"/>}
                title="خصوصية تامة"
                desc="جدولك محدش بيشوفه ولا يعدله غيرك أنت ومسؤول الميديا."
            />
        </div>

        {/* Admin Note Section - بتصميم هادئ ومختصر */}
        <div className="mt-16 w-full max-w-2xl bg-orange-50/50 border border-orange-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0 text-orange-600">
                <ShieldAlert size={24}/>
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1 text-sm">تنويه للمتطوعين الجدد</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                    عشان تستخدم الأداة دي، لازم يكون ليك حساب. <strong>مسؤول الميديا</strong> هو الوحيد اللي يقدر يعملك الحساب ويسلمك البيانات.
                </p>
                {/* الزر الإضافي بدلاً من النص */}
                <button onClick={onStart} className="text-xs font-bold text-white bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded-lg transition-colors shadow-sm">
                    معايا حساب، دخول
                </button>
            </div>
        </div>

      </main>
      
      {/* مسافة سفلية فقط بدون نص حقوق */}
      <div className="h-8"></div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <h3 className="font-bold text-gray-800 mb-1 text-base">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;

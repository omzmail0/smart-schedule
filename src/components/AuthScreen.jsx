import React, { useState } from 'react';
import { KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from './Button';

const AuthScreen = ({ onLogin, settings, onBack, onShowToast }) => {
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accessCode.length < 8) {
        onShowToast("الكود يجب أن يكون 8 أرقام", "error");
        return;
    }
    onLogin(accessCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6 relative justify-center" dir="rtl">
      
      {/* زر الرجوع */}
      <button 
        onClick={onBack} 
        className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all z-10 border border-gray-200"
      >
        <ArrowRight size={20}/>
      </button>

      <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8 animate-fade-in">
            {settings.logo ? 
                <img src={settings.logo} className="w-24 h-24 mx-auto mb-4 rounded-3xl object-cover shadow-xl border-4 border-white"/> : 
                <div className="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-lg border border-gray-100" style={{ color: settings.primaryColor }}><KeyRound size={48}/></div>
            }
            <h1 className="text-2xl font-black text-gray-800 mb-1">تسجيل الدخول</h1>
            <p className="text-gray-400 font-medium text-sm">أدخل الكود الخاص بك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 w-full mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 mr-1">كود الدخول (8 أرقام)</label>
                <input 
                    type="tel"
                    maxLength={8}
                    className="w-full h-16 px-5 bg-gray-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-2xl text-center text-gray-800 tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-lg" 
                    style={{ '--tw-ring-color': settings.primaryColor }} 
                    placeholder="12345678"
                    value={accessCode} 
                    onChange={e => setAccessCode(e.target.value.replace(/[^0-9]/g, ''))} 
                />
            </div>

            <Button className="w-full h-14 text-base mt-4 font-bold shadow-lg text-white" style={{ backgroundColor: settings.primaryColor }}>
                دخول للنظام <ArrowRight size={18} className="mr-2"/>
            </Button>
          </form>

          {/* التنبيه */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
             <ShieldCheck size={20} className="text-blue-500 shrink-0 mt-0.5"/>
             <div>
                <h4 className="font-bold text-gray-800 text-xs mb-1">نسيت الكود؟</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                    لا تقلق، تواصل مع <strong>مسؤول الفريق</strong> وسيقوم بإرسال الكود لك مرة أخرى فوراً.
                </p>
             </div>
          </div>
          
      </div>
    </div>
  );
};

export default AuthScreen;

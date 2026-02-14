import React, { useState } from 'react';
import { KeyRound, ArrowRight, ShieldAlert } from 'lucide-react';
import Button from './Button';

const AuthScreen = ({ onLogin, settings, onShowToast }) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6" dir="rtl">
      
      <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-10 animate-fade-in">
            {settings.logo ? 
                <img src={settings.logo} className="w-28 h-28 mx-auto mb-6 rounded-3xl object-cover shadow-2xl border-4 border-white"/> : 
                <div className="inline-flex p-6 bg-white rounded-3xl mb-6 shadow-xl border border-gray-100" style={{ color: settings.primaryColor }}><KeyRound size={56}/></div>
            }
            {/* ✅ التعديل هنا: اسم التيم بدلاً من تسجيل الدخول */}
            <h1 className="text-3xl font-black text-gray-800 mb-2">{settings.teamName}</h1>
            <p className="text-gray-400 font-medium">أدخل الكود الخاص بك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 w-full mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
            
            <div className="text-center">
                <input 
                    type="tel"
                    maxLength={8}
                    className="w-full h-20 bg-gray-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-3xl text-center text-gray-800 tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-lg shadow-inner" 
                    style={{ '--tw-ring-color': settings.primaryColor }} 
                    placeholder="12345678"
                    value={accessCode} 
                    onChange={e => setAccessCode(e.target.value.replace(/[^0-9]/g, ''))} 
                />
                <p className="text-[10px] text-gray-400 mt-2 font-bold">الكود مكون من 8 أرقام</p>
            </div>

            {/* ✅ التعديل هنا: تسجيل الدخول بدلاً من دخول للنظام */}
            <Button className="w-full h-16 text-lg font-bold shadow-xl text-white rounded-2xl hover:scale-[1.02] transition-transform" style={{ backgroundColor: settings.primaryColor }}>
                تسجيل الدخول <ArrowRight size={20} className="mr-2"/>
            </Button>
          </form>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
             <div className="bg-red-50 p-2 rounded-full text-red-500 shrink-0"><ShieldAlert size={18}/></div>
             <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">واجهت مشكلة؟</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    إذا فقدت الكود أو نسيت الرقم، تواصل فوراً مع <strong>مشرف الفريق</strong> ليقوم بإعادة إرساله لك.
                </p>
             </div>
          </div>
          
      </div>
    </div>
  );
};

export default AuthScreen;

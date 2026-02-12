import React, { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react'; // السهم للرجوع
import Button from './Button';

const AuthScreen = ({ onLogin, settings, onBack }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6 relative justify-center" dir="rtl">
      
      {/* زر الرجوع */}
      <button 
        onClick={onBack} 
        className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all z-10 border border-gray-200"
        title="رجوع للقائمة الرئيسية"
      >
        <ArrowRight size={20}/>
      </button>

      <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8 animate-fade-in">
            {settings.logo ? 
                <img src={settings.logo} className="w-24 h-24 mx-auto mb-4 rounded-3xl object-cover shadow-xl border-4 border-white"/> : 
                <div className="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-lg border border-gray-100" style={{ color: settings.primaryColor }}><Calendar size={48}/></div>
            }
            <h1 className="text-2xl font-black text-gray-800 mb-1">{settings.teamName}</h1>
            <p className="text-gray-400 font-medium text-sm">أهلاً بك، سجل دخولك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 w-full">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 mr-1">اسم المستخدم</label>
                <input 
                    className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold text-gray-700" 
                    style={{ '--tw-ring-color': settings.primaryColor }} 
                    value={loginData.username} 
                    onChange={e => setLoginData({...loginData, username: e.target.value.replace(/\s/g, '')})} 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 mr-1">كلمة المرور</label>
                <input 
                    type="password" 
                    className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold text-gray-700" 
                    style={{ '--tw-ring-color': settings.primaryColor }} 
                    value={loginData.password} 
                    onChange={e => setLoginData({...loginData, password: e.target.value})} 
                />
            </div>

            <Button className="w-full h-14 text-base mt-4 font-bold shadow-lg" style={{ backgroundColor: settings.primaryColor }}>دخول</Button>
          </form>
      </div>
    </div>
  );
};

export default AuthScreen;

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Button from './Button'; // استدعاء الزر من نفس المجلد

const AuthScreen = ({ onAuth, settings }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuth(isRegistering, loginData);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-6" dir="rtl">
      <div className="text-center mb-10 animate-fade-in">
        {settings.logo ? <img src={settings.logo} className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover shadow-lg"/> : <div className="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-md" style={{ color: settings.primaryColor }}><Calendar size={40}/></div>}
        <h1 className="text-3xl font-black text-gray-800">{settings.teamName}</h1>
        <p className="text-gray-400 mt-2 font-medium">{isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full">
        <input className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} placeholder="اسم المستخدم (بالإنجليزي)" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value.replace(/\s/g, '')})} />
        <input type="password" className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} placeholder="كلمة المرور (6 أحرف ع الأقل)" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
        <Button className="w-full h-14 text-lg mt-4" style={{ backgroundColor: settings.primaryColor }}>{isRegistering ? 'إنشاء حساب' : 'دخول'}</Button>
      </form>
      <div className="text-center mt-4">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-bold text-gray-400 hover:text-gray-600">
              {isRegistering ? 'لديك حساب بالفعل؟ تسجيل دخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
          </button>
      </div>
    </div>
  );
};

export default AuthScreen;

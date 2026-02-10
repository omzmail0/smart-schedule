import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Button from './Button';

// استقبل دالة التنبيه
const AuthScreen = ({ onLogin, settings, onShowToast }) => { // Note: We need to pass onShowToast from App.jsx if we use it here directly, but handleLogin in App.jsx handles the logic/toasts mostly.
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginData);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-6" dir="rtl">
      <div className="text-center mb-10 animate-fade-in">
        {settings.logo ? <img src={settings.logo} className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover shadow-lg"/> : <div className="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-md" style={{ color: settings.primaryColor }}><Calendar size={40}/></div>}
        <h1 className="text-3xl font-black text-gray-800">{settings.teamName}</h1>
        <p className="text-gray-400 mt-2 font-medium">تسجيل الدخول</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full">
        <input 
          className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" 
          style={{ '--tw-ring-color': settings.primaryColor }} 
          placeholder="اسم المستخدم" 
          value={loginData.username} 
          onChange={e => setLoginData({...loginData, username: e.target.value.replace(/\s/g, '')})} 
        />
        <input 
          type="password" 
          className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" 
          style={{ '--tw-ring-color': settings.primaryColor }} 
          placeholder="كلمة المرور" 
          value={loginData.password} 
          onChange={e => setLoginData({...loginData, password: e.target.value})} 
        />
        <Button className="w-full h-14 text-lg mt-4" style={{ backgroundColor: settings.primaryColor }}>دخول</Button>
      </form>
    </div>
  );
};

export default AuthScreen;

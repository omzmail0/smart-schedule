import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Button from './Button';

const AuthScreen = ({ onAuth, settings }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  // أضفنا حقل name للاسم الكامل
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuth(isRegistering, formData);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-6" dir="rtl">
      <div className="text-center mb-10 animate-fade-in">
        {settings.logo ? <img src={settings.logo} className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover shadow-lg"/> : <div className="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-md" style={{ color: settings.primaryColor }}><Calendar size={40}/></div>}
        <h1 className="text-3xl font-black text-gray-800">{settings.teamName}</h1>
        <p className="text-gray-400 mt-2 font-medium">{isRegistering ? 'طلب انضمام للفريق' : 'تسجيل الدخول'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full">
        
        {/* حقل الاسم الكامل يظهر فقط عند التسجيل */}
        {isRegistering && (
          <input 
            className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" 
            style={{ '--tw-ring-color': settings.primaryColor }} 
            placeholder="الاسم" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        )}

        <input 
          className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" 
          style={{ '--tw-ring-color': settings.primaryColor }} 
          placeholder="اسم المستخدم (إنجليزي للدخول)" 
          value={formData.username} 
          // منع المسافات في اسم المستخدم
          onChange={e => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})} 
        />
        
        <input 
          type="password" 
          className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" 
          style={{ '--tw-ring-color': settings.primaryColor }} 
          placeholder="كلمة المرور" 
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
        />
        
        <Button className="w-full h-14 text-lg mt-4" style={{ backgroundColor: settings.primaryColor }}>
          {isRegistering ? 'إرسال طلب الانضمام' : 'دخول'}
        </Button>
      </form>
      <div className="text-center mt-4">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-bold text-gray-400 hover:text-gray-600">
              {isRegistering ? 'لديك حساب بالفعل؟ تسجيل دخول' : 'ليس لديك حساب؟ طلب انضمام'}
          </button>
      </div>
    </div>
  );
};

export default AuthScreen;

import React from 'react';
import { LogOut, Copy, Check, RefreshCw, Shield } from 'lucide-react';

const ProfileTab = ({ user, settings, handleLogout, regenerateUserCode }) => {
  const [copied, setCopied] = React.useState(false);

  const copyCode = () => {
      navigator.clipboard.writeText(user.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in p-4 pb-24">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            {/* الخلفية الديكورية */}
            <div className="absolute top-0 left-0 right-0 h-32 opacity-[0.03]" style={{ backgroundColor: settings.primaryColor }}></div>
            
            {/* أيقونة الفريق + الاسم */}
            <div className="relative z-10 mb-8">
                <div className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center bg-white p-1 mx-auto mb-4 border border-gray-50">
                    {settings.logo ? (
                        <img src={settings.logo} className="w-full h-full object-cover rounded-xl"/>
                    ) : (
                        <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: settings.primaryColor }}>
                            {settings.teamName[0]}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-black text-gray-800">{user.name}</h2>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold inline-block ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    {user.role === 'admin' ? 'مسؤول النظام' : 'عضو فريق'}
                </div>
            </div>

            {/* كارت الكود (التصميم المفضل) */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
                {/* اسم الفريق في الأعلى */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                    <h3 className="font-bold text-gray-200 text-sm">{settings.teamName}</h3>
                    <Shield size={16} className="text-gray-500"/>
                </div>

                <div className="text-center py-2">
                    <p className="text-[10px] text-gray-400 mb-2 font-medium">PASSCODE</p>
                    
                    {/* ✅ الحل هنا: dir="ltr" + مسافات */}
                    <div className="flex justify-center items-center gap-2 cursor-pointer group" onClick={copyCode} dir="ltr">
                        <span className="font-mono text-4xl font-black tracking-widest text-white whitespace-nowrap">
                            {user.accessCode.slice(0, 4)} {user.accessCode.slice(4)}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-end">
                    {/* زر التجديد */}
                    {user.role === 'admin' ? (
                        <button onClick={() => regenerateUserCode(user.id)} className="text-[10px] text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors">
                            <RefreshCw size={10}/> تجديد الكود
                        </button>
                    ) : <div></div>}

                    {/* زر النسخ */}
                    <button onClick={copyCode} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900'}`}>
                        {copied ? <Check size={18}/> : <Copy size={18}/>}
                    </button>
                </div>
            </div>

            {/* زر الخروج */}
            <button 
                onClick={handleLogout} 
                className="w-full h-16 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center hover:bg-red-50 hover:border-red-100 transition-all gap-2 shadow-sm"
            >
                <LogOut size={20}/> تسجيل الخروج
            </button>

        </div>
    </div>
  );
};

export default ProfileTab;

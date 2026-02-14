import React from 'react';
import { LogOut, ShieldCheck, Copy, Check, RefreshCw, Layers } from 'lucide-react';

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
                        <div className="w-full h-full rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: settings.primaryColor }}>
                            <Layers size={32}/>
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-black text-gray-800">{user.name}</h2>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold inline-block ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    {user.role === 'admin' ? 'مسؤول النظام' : 'عضو فريق'}
                </div>
            </div>

            {/* كارت الكود (التصميم الجديد) */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
                
                {/* اسم الفريق داخل الكارت */}
                <div className="text-center mb-6 border-b border-gray-700 pb-4">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">عضو في فريق</p>
                    <h3 className="font-bold text-gray-200">{settings.teamName}</h3>
                </div>

                <div className="text-center">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <ShieldCheck size={10}/> PASSCODE
                        </p>
                        {user.role === 'admin' && (
                            <button onClick={() => regenerateUserCode(user.id)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" title="تجديد الكود">
                                <RefreshCw size={10}/>
                            </button>
                        )}
                    </div>

                    {/* ✅ الحل هنا: dir="ltr" عشان الأرقام تظهر صح */}
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 cursor-pointer relative group" onClick={copyCode} dir="ltr">
                        <span className="font-mono text-3xl font-black tracking-[0.2em] text-white drop-shadow-md">
                            {user.accessCode.slice(0, 4)}  {user.accessCode.slice(4)}
                        </span>
                        
                        {/* أيقونة النسخ العائمة */}
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                            {copied ? <Check size={14}/> : <Copy size={14}/>}
                        </div>
                    </div>
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

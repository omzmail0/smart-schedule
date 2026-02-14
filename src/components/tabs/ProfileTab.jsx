import React from 'react';
import { User, LogOut, Copy, Check, RefreshCw, Layers, Shield } from 'lucide-react';

const ProfileTab = ({ user, settings, handleLogout, regenerateUserCode }) => {
  const [copied, setCopied] = React.useState(false);

  const copyCode = () => {
      navigator.clipboard.writeText(user.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            {/* زخرفة خلفية */}
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: settings.primaryColor }}></div>
            <div className="absolute top-10 -right-10 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: settings.primaryColor }}></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center bg-white p-1 mb-4 border border-gray-50">
                    {settings.logo ? (
                        <img src={settings.logo} className="w-full h-full object-cover rounded-xl"/>
                    ) : (
                        <div className="w-full h-full rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: settings.primaryColor }}>
                            <Layers size={32}/>
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-black text-gray-800">{user.name}</h2>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    {user.role === 'admin' ? 'مسؤول النظام' : 'عضو فريق'}
                </div>
            </div>
        </div>

        {/* Access Code Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 opacity-80">
                    <Shield size={16}/>
                    <span className="text-xs font-bold">بطاقة الدخول</span>
                </div>
                {/* زر التجديد للأدمن */}
                {user.role === 'admin' && (
                    <button onClick={() => regenerateUserCode(user.id)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md">
                        <RefreshCw size={14}/>
                    </button>
                )}
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">الكود الشخصي</p>
                <div className="flex items-center justify-center gap-3" onClick={copyCode}>
                    <span className="font-mono text-4xl font-black tracking-[0.15em] drop-shadow-md cursor-pointer select-all">
                        {user.accessCode.slice(0, 4)} {user.accessCode.slice(4)}
                    </span>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-end">
                <div>
                    <p className="text-[10px] text-gray-500 font-bold">SMART ID</p>
                    <p className="text-xs font-bold text-gray-300">{settings.teamName}</p>
                </div>
                <button onClick={copyCode} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900'}`}>
                    {copied ? <Check size={18}/> : <Copy size={18}/>}
                </button>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleLogout} 
            className="w-full h-16 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center hover:bg-red-50 hover:border-red-100 transition-all gap-2 shadow-sm"
        >
            <LogOut size={20}/> تسجيل الخروج
        </button>

    </div>
  );
};

export default ProfileTab;

import React from 'react';
import { UserCircle, LogOut, ShieldCheck, Copy, Check } from 'lucide-react';
import Button from '../Button';

const ProfileTab = ({ user, settings, openEditProfile, handleLogout }) => {
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
            
            {/* الصورة والاسم */}
            <div className="relative z-10 mb-6">
                <div className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-xl rotate-3" style={{ backgroundColor: settings.primaryColor }}>
                    {user.name[0]}
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-1">{user.name}</h2>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
                    {user.role === 'admin' ? 'مدير الفريق' : 'عضو في الفريق'}
                </span>
            </div>

            {/* كارت الكود */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-200 relative group">
                <p className="text-xs font-bold text-gray-400 mb-2 flex items-center justify-center gap-1">
                    <ShieldCheck size={12}/> كود الدخول الخاص بك
                </p>
                <div className="flex items-center justify-center gap-3" onClick={copyCode} role="button">
                    <span className="font-mono font-black text-3xl text-gray-700 tracking-widest">{user.accessCode}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${copied ? 'bg-green-500 text-white' : 'text-gray-400 group-hover:bg-white group-hover:text-blue-500'}`}>
                        {copied ? <Check size={14}/> : <Copy size={14}/>}
                    </div>
                </div>
            </div>

            {/* الإجراءات */}
            <div className="space-y-3">
                {user.role === 'admin' && (
                    <Button onClick={openEditProfile} variant="outline" className="w-full rounded-2xl border-gray-200 h-14">
                        تعديل بياناتي
                    </Button>
                )}
                
                <button 
                    onClick={handleLogout} 
                    className="w-full h-14 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center hover:bg-red-100 transition-colors gap-2"
                >
                    <LogOut size={18}/> تسجيل الخروج
                </button>
            </div>
            
            <p className="text-[10px] text-gray-300 mt-6 font-bold tracking-widest">SMART SCHEDULE v1.2</p>
        </div>
    </div>
  );
};

export default ProfileTab;

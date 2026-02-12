import React from 'react';
import { Edit } from 'lucide-react';
import Button from '../Button';

const ProfileTab = ({ user, settings, openEditProfile, handleLogout }) => {
  return (
    <div className="animate-in fade-in p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 opacity-10" style={{ backgroundColor: settings.primaryColor }}></div>
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white relative z-10" style={{ backgroundColor: settings.primaryColor }}>{user.name[0]}</div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-400 font-medium mb-8">@{user.username}</p>
            
            {user.role === 'admin' && (
            <button onClick={openEditProfile} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold mb-6 hover:bg-gray-200 flex items-center justify-center gap-2 mx-auto">
                <Edit size={16}/> تعديل بياناتي
            </button>
            )}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right"><p className="text-xs text-gray-400 font-bold mb-2">الفريق</p><div className="flex items-center gap-2 font-bold text-gray-700">{settings.logo && <img src={settings.logo} className="w-6 h-6 rounded-md"/>}{settings.teamName}</div></div>
            <Button onClick={handleLogout} variant="danger" className="w-full">تسجيل الخروج</Button>
        </div>
    </div>
  );
};

export default ProfileTab;

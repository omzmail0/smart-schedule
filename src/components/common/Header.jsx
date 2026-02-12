import React from 'react';
import { LogOut } from 'lucide-react';
import Button from '../Button';

const Header = ({ user, settings, onLogout }) => {
  return (
    <div className="bg-white px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        {settings.logo ? (
          <img src={settings.logo} className="w-10 h-10 rounded-xl object-cover border border-gray-100"/>
        ) : (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: settings.primaryColor }}>
            {settings.teamName[0]}
          </div>
        )}
        <div>
          <h1 className="font-extrabold text-gray-800 text-lg leading-tight">{settings.teamName}</h1>
          <p className="text-[10px] font-bold text-gray-400">
            {user.role === 'admin' ? 'مدير الفريق' : `مرحباً ${user.name}`}
          </p>
        </div>
      </div>
      <Button variant="ghost" onClick={onLogout}><LogOut size={20}/></Button>
    </div>
  );
};

export default Header;

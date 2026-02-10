import React from 'react';
import { Home, Users, Star, Settings, Menu } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, role, color }) => {
  const navItemClass = (tab) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === tab ? 'font-bold' : 'text-gray-400'}`;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center z-40 pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
      <button onClick={() => setActiveTab('home')} className={navItemClass('home')} style={{ color: activeTab === 'home' ? color : undefined }}><Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} /><span className="text-[10px]">الرئيسية</span></button>
      {role === 'admin' && (<>
        <button onClick={() => setActiveTab('members')} className={navItemClass('members')} style={{ color: activeTab === 'members' ? color : undefined }}><Users size={28} strokeWidth={activeTab === 'members' ? 2.5 : 2} /><span className="text-[10px]">الأعضاء</span></button>
        <button onClick={() => setActiveTab('analysis')} className={navItemClass('analysis')} style={{ color: activeTab === 'analysis' ? color : undefined }}><Star size={28} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} /><span className="text-[10px]">تحليل</span></button>
        <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')} style={{ color: activeTab === 'settings' ? color : undefined }}><Settings size={28} strokeWidth={activeTab === 'settings' ? 2.5 : 2} /><span className="text-[10px]">إعدادات</span></button>
      </>)}
      {role !== 'admin' && (<button onClick={() => setActiveTab('profile')} className={navItemClass('profile')} style={{ color: activeTab === 'profile' ? color : undefined }}><Menu size={28} strokeWidth={activeTab === 'profile' ? 2.5 : 2} /><span className="text-[10px]">حسابي</span></button>)}
    </div>
  );
};

export default BottomNav;

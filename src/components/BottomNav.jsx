import React from 'react';
import { Home, Users, Star, Settings, Menu, UserCircle } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, role, color }) => {
  // قللنا حجم الخط والأيقونات قليلاً عشان الـ 5 أيقونات يكفوا في الموبايل
  const navItemClass = (tab) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === tab ? 'font-bold' : 'text-gray-400'}`;
  const iconSize = 24; // حجم موحد للأيقونات

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center z-40 pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
      
      {/* 1. الرئيسية (للجميع) */}
      <button onClick={() => setActiveTab('home')} className={navItemClass('home')} style={{ color: activeTab === 'home' ? color : undefined }}>
        <Home size={iconSize} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      {role === 'admin' && (
        <>
          {/* 2. الأعضاء (أدمن فقط) */}
          <button onClick={() => setActiveTab('members')} className={navItemClass('members')} style={{ color: activeTab === 'members' ? color : undefined }}>
            <Users size={iconSize} strokeWidth={activeTab === 'members' ? 2.5 : 2} />
            <span className="text-[10px]">الأعضاء</span>
          </button>

          {/* 3. تحليل (أدمن فقط) */}
          <button onClick={() => setActiveTab('analysis')} className={navItemClass('analysis')} style={{ color: activeTab === 'analysis' ? color : undefined }}>
            <Star size={iconSize} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
            <span className="text-[10px]">تحليل</span>
          </button>

          {/* 4. إعدادات الفريق (أدمن فقط) */}
          <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')} style={{ color: activeTab === 'settings' ? color : undefined }}>
            <Settings size={iconSize} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px]">إعدادات</span>
          </button>
        </>
      )}

      {/* 5. حسابي (للجميع الآن) - كان مخفياً للمدير سابقاً */}
      <button onClick={() => setActiveTab('profile')} className={navItemClass('profile')} style={{ color: activeTab === 'profile' ? color : undefined }}>
        <UserCircle size={iconSize} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
        <span className="text-[10px]">حسابي</span>
      </button>

    </div>
  );
};

export default BottomNav;

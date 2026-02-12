import React, { useRef } from 'react';
import { Upload, RotateCcw } from 'lucide-react';
import Button from '../Button';

const SettingsTab = ({ settings, setSettings, saveSettings, resetAllAvailability }) => {
  const fileInputRef = useRef(null);
  
  const handleLogoUpload = (e) => { 
      const file = e.target.files[0]; 
      if (file) { 
          const reader = new FileReader(); 
          reader.onloadend = () => { setSettings({ ...settings, logo: reader.result }); }; 
          reader.readAsDataURL(file); 
      } 
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="text-center py-4"><h2 className="text-xl font-bold text-gray-800">إعدادات الفريق</h2></div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div><label className="block text-sm font-bold text-gray-500 mb-2">اسم الفريق</label><input className="w-full h-12 px-4 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} value={settings.teamName} onChange={e => setSettings({...settings, teamName: e.target.value})} /></div>
        <div><label className="block text-sm font-bold text-gray-500 mb-2">اللون</label><div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">{['#0e395c', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#000000'].map(c => (<button key={c} onClick={() => setSettings({...settings, primaryColor: c})} className={`w-12 h-12 rounded-full border-4 flex-shrink-0 transition-transform ${settings.primaryColor === c ? 'scale-110 border-gray-300' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></div>
        <div><label className="block text-sm font-bold text-gray-500 mb-2">الشعار</label><div className="flex items-center gap-4">{settings.logo && <img src={settings.logo} className="w-16 h-16 rounded-xl object-cover border"/>}<button onClick={() => fileInputRef.current.click()} className="flex-1 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-400"><Upload size={20}/> <span>تغيير</span></button><input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" /></div></div>
        <Button onClick={() => saveSettings(settings)} style={{ backgroundColor: settings.primaryColor }} className="w-full text-white">حفظ الهوية</Button>
        <hr className="border-gray-100 my-4"/>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100"><h4 className="font-bold text-orange-800 mb-1 text-sm">بداية دورة جديدة؟</h4><p className="text-xs text-orange-600 mb-3">تحذير: هذا يمسح جميع الجداول.</p><Button onClick={resetAllAvailability} className="w-full h-10 bg-orange-200 text-orange-800 shadow-none hover:bg-orange-300 border-none"><RotateCcw size={16}/> تصفير كامل</Button></div>
        </div>
    </div>
  );
};

export default SettingsTab;

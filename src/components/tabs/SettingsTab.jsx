import React, { useRef } from 'react';
import { Upload, RotateCcw, Power, Lock, Unlock, Type } from 'lucide-react';
import Button from '../Button';

const SettingsTab = ({ settings, setSettings, saveSettings, resetAllAvailability }) => {
  const fileInputRef = useRef(null);
  
  // ✅ القائمة الموسعة للخطوط
  const fonts = [
      { name: 'Zain', label: 'زين (عصري)' },
      { name: 'Cairo', label: 'القاهرة (رسمي)' },
      { name: 'Tajawal', label: 'تجوّل (ناعم)' },
      { name: 'Almarai', label: 'المراعي (واضح)' },
      { name: 'IBM Plex Sans Arabic', label: 'IBM (تقني)' },
      { name: 'Rubik', label: 'روبيك (مودرن)' },
      { name: 'Noto Kufi Arabic', label: 'كوفي (أنيق)' },
      { name: 'Readex Pro', label: 'ريديكس (هندسي)' },
      { name: 'Marhey', label: 'مرحي (شبابي)' },
      { name: 'Alexandria', label: 'إسكندرية (فخم)' },
  ];

  const handleLogoUpload = (e) => { 
      const file = e.target.files[0]; 
      if (file) { 
          const reader = new FileReader(); 
          reader.onloadend = () => { setSettings({ ...settings, logo: reader.result }); }; 
          reader.readAsDataURL(file); 
      } 
  };

  const toggleMaintenance = () => {
      const newState = !settings.isMaintenance;
      setSettings({ ...settings, isMaintenance: newState });
      saveSettings({ ...settings, isMaintenance: newState });
  };

  const changeFont = (fontName) => {
      setSettings({ ...settings, fontFamily: fontName });
      document.documentElement.style.setProperty('--app-font', `"${fontName}", sans-serif`);
  };

  return (
    <div className="space-y-6 pb-20 page-enter">
        <div className="text-center py-4"><h2 className="text-xl font-bold text-gray-800">إعدادات الفريق</h2></div>
        
        <div className={`p-6 rounded-3xl border shadow-sm transition-all ${settings.isMaintenance ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.isMaintenance ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                        <Power size={20}/>
                    </div>
                    <div>
                        <h3 className={`font-bold ${settings.isMaintenance ? 'text-red-800' : 'text-green-800'}`}>
                            {settings.isMaintenance ? 'الموقع مغلق' : 'الموقع متاح'}
                        </h3>
                        <p className={`text-[10px] font-bold ${settings.isMaintenance ? 'text-red-600' : 'text-green-600'}`}>
                            {settings.isMaintenance ? 'لا يمكن للأعضاء الدخول' : 'يستقبل الردود الآن'}
                        </p>
                    </div>
                </div>
            </div>
            <button 
                onClick={toggleMaintenance}
                className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${settings.isMaintenance ? 'bg-white text-red-600 hover:bg-red-100' : 'bg-white text-green-600 hover:bg-green-100'}`}
            >
                {settings.isMaintenance ? <><Unlock size={16}/> فتح الموقع للأعضاء</> : <><Lock size={16}/> إغلاق الموقع مؤقتاً</>}
            </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div><label className="block text-sm font-bold text-gray-500 mb-2">اسم الفريق</label><input className="w-full h-12 px-4 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} value={settings.teamName} onChange={e => setSettings({...settings, teamName: e.target.value})} /></div>
            
            <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 flex items-center gap-1"><Type size={16}/> نوع الخط</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar"> {/* إضافة سكرول للقائمة الطويلة */}
                    {fonts.map(font => (
                        <button 
                            key={font.name}
                            onClick={() => changeFont(font.name)} 
                            className={`h-12 rounded-xl text-sm font-bold border-2 transition-all ${settings.fontFamily === font.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
                            style={{ fontFamily: font.name }}
                        >
                            {font.label}
                        </button>
                    ))}
                </div>
            </div>

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

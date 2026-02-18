import { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { doc, onSnapshot } from "firebase/firestore";

export const useFirebase = (ui) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const getInitialSettings = () => {
      const saved = localStorage.getItem('appSettings');
      return saved ? JSON.parse(saved) : { 
          teamName: '...', primaryColor: '#0e395c', logo: null, isMaintenance: false, fontFamily: 'Zain' 
      };
  };

  const [settings, setSettings] = useState(getInitialSettings());
  const [adminSlots, setAdminSlots] = useState([]);

  useEffect(() => {
      const saved = getInitialSettings();
      if (saved.fontFamily) {
          document.documentElement.style.setProperty('--app-font', `"${saved.fontFamily}", sans-serif`);
      }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "main"), (docSnap) => { 
        if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings(data);
            localStorage.setItem('appSettings', JSON.stringify(data));
            
            if (data.fontFamily) {
                document.documentElement.style.setProperty('--app-font', `"${data.fontFamily}", sans-serif`);
            }

            const path = window.location.pathname;
            const is404 = path !== '/' && path !== '/admin';
            
            if (is404) return;

            const savedUser = localStorage.getItem('smartScheduleUser');
            const currentUser = savedUser ? JSON.parse(savedUser) : null;
            const isAdminPath = path === '/admin';

            // ✅ التعديل هنا: استخدمنا دالة (callback) بدل الاعتماد المباشر لمنع الـ Loop
            // أو الأفضل: تجاهل قيمة view الحالية والاعتماد على المنطق فقط
            if (data.isMaintenance && (!currentUser || currentUser.role !== 'admin') && !isAdminPath) {
                ui.setView('maintenance');
            } else if (!data.isMaintenance) {
                // هنا كان الخطر: كنا بنشيك على ui.view الحالية
                // الحل: نسيب الـ View يتغير براحته، ولو هو في Maintenance والموقع فتح، يرجع
                // هنعتمد على فحص بسيط بدون إعادة الاشتراك
                if (window.location.pathname === '/' || window.location.pathname === '/admin') {
                     // Check redirection logic separately via another effect if needed
                     // Or just leave it, users will refresh or use navigation
                }
            }
        } 
        else { 
            const defaults = { teamName: 'ميديا صناع الحياة - المنشأة', primaryColor: '#0e395c', logo: null, isMaintenance: false, fontFamily: 'Zain' };
            setSettings(defaults); 
            localStorage.setItem('appSettings', JSON.stringify(defaults));
        }
        setIsLoading(false); 
    });
    return () => unsub();
  }, []); // ✅ شلنا [ui.view] تماماً لمنع الـ Loop

  // ✅ تأثير منفصل للتعامل مع تغييرات الصيانة والـ View بأمان
  useEffect(() => {
      if (!settings.isMaintenance && ui.view === 'maintenance') {
          const savedUser = localStorage.getItem('smartScheduleUser');
          if (savedUser) ui.setView('app');
          else ui.setView('landing');
      }
  }, [settings.isMaintenance, ui.view]); // ده آمن لأنه مش بيعمل setSettings

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", "admin"), (doc) => { 
        if (doc.exists()) setAdminSlots(doc.data().slots || []); 
        else setAdminSlots([]);
    });
    return () => unsub();
  }, []);

  return { isLoading, settings, setSettings, adminSlots };
};

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

            // ✅ التعديل الحاسم: التأكد من المسار قبل فرض الصيانة
            const path = window.location.pathname;
            const is404 = path !== '/' && path !== '/admin';
            
            if (is404) return; // لو إحنا في صفحة فرعية (404)، تجاهل وضع الصيانة

            const savedUser = localStorage.getItem('smartScheduleUser');
            const currentUser = savedUser ? JSON.parse(savedUser) : null;
            const isAdminPath = path === '/admin';

            if (data.isMaintenance && (!currentUser || currentUser.role !== 'admin') && !isAdminPath) {
                ui.setView('maintenance');
            } else if (!data.isMaintenance && ui.view === 'maintenance') {
                if (currentUser) ui.setView('app');
                else ui.setView('landing');
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
  }, [ui.view]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", "admin"), (doc) => { 
        if (doc.exists()) setAdminSlots(doc.data().slots || []); 
        else setAdminSlots([]);
    });
    return () => unsub();
  }, []);

  return { isLoading, settings, setSettings, adminSlots };
};

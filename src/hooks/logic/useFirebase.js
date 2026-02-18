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

  // ✅ فقط جلب البيانات وتحديث الخط، بدون أي منطق توجيه
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "main"), (docSnap) => { 
        if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings(data);
            localStorage.setItem('appSettings', JSON.stringify(data));
            
            if (data.fontFamily) {
                document.documentElement.style.setProperty('--app-font', `"${data.fontFamily}", sans-serif`);
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
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", "admin"), (doc) => { 
        if (doc.exists()) setAdminSlots(doc.data().slots || []); 
        else setAdminSlots([]);
    });
    return () => unsub();
  }, []);

  return { isLoading, settings, setSettings, adminSlots };
};

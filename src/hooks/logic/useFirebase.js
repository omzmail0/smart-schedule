import { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { doc, onSnapshot } from "firebase/firestore";

export const useFirebase = (ui) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({ teamName: '...', primaryColor: '#0e395c', logo: null, isMaintenance: false, fontFamily: 'Zain' });
  const [adminSlots, setAdminSlots] = useState([]);

  // Fetch Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "main"), (docSnap) => { 
        if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings(data);
            
            // Check Maintenance Mode
            const savedUser = localStorage.getItem('smartScheduleUser');
            const currentUser = savedUser ? JSON.parse(savedUser) : null;
            const isAdminPath = window.location.pathname === '/admin';

            if (data.isMaintenance && (!currentUser || currentUser.role !== 'admin') && !isAdminPath) {
                ui.setView('maintenance');
            } else if (!data.isMaintenance && ui.view === 'maintenance') {
                if (currentUser) ui.setView('app'); // Simplified redirect
                else ui.setView('landing');
            }
        } 
        else { setSettings({ teamName: 'ميديا صناع الحياة - المنشأة', primaryColor: '#0e395c', logo: null, isMaintenance: false, fontFamily: 'Zain' }); }
        setIsLoading(false); 
    });
    return () => unsub();
  }, [ui.view]); // Added dependency

  // Fetch Admin Slots
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", "admin"), (doc) => { 
        if (doc.exists()) setAdminSlots(doc.data().slots || []); 
        else setAdminSlots([]);
    });
    return () => unsub();
  }, []);

  return { isLoading, settings, setSettings, adminSlots };
};

import { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, getDocs, query, where, getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

export const useAuth = (settings, ui, isLoadingSettings) => {
  const [user, setUser] = useState(null);

  // Init Admin
  useEffect(() => {
    const initAdmin = async () => {
        try {
            const adminRef = doc(db, "users", "admin");
            const adminSnap = await getDoc(adminRef);
            if (!adminSnap.exists()) {
                await setDoc(adminRef, { id: "admin", name: "Admin", accessCode: "12345678", role: "admin", createdAt: serverTimestamp() });
            }
        } catch (error) { console.error(error); }
    };
    initAdmin();
  }, []);

  // ✅ مراقبة حالة الصيانة واليوزر الحالي
  useEffect(() => {
      // لو الموقع صيانة، واليوزر مش أدمن (أو مفيش يوزر)، وديه للصيانة
      if (settings.isMaintenance) {
          const isAdminPath = window.location.pathname === '/admin';
          // لو هو أدمن ومسجل، خليه يعدي
          if (user && user.role === 'admin') return;
          // لو هو مش أدمن، ومش في صفحة الأدمن، اقفل عليه
          if (!isAdminPath) {
              ui.setView('maintenance');
          }
      } else {
          // لو الموقع فتح وكان في الصيانة، رجعه
          if (ui.view === 'maintenance') {
              if (user) ui.setView('app');
              else ui.setView('landing');
          }
      }
  }, [settings.isMaintenance, user]); // يعتمد على اليوزر والإعدادات

  // Check Auth on Load
  useEffect(() => {
    const checkStart = async () => {
        const path = window.location.pathname;
        const isAdminPath = path === '/admin';
        const isRoot = path === '/';
        
        if (!isRoot && !isAdminPath) {
            ui.setView('404');
            return;
        }

        if (ui.view === '404') return;

        const savedUser = localStorage.getItem('smartScheduleUser');
        
        if (isAdminPath) {
            if (savedUser) {
                const u = JSON.parse(savedUser);
                if (u.role === 'admin') {
                    setUser(u);
                    ui.setView('app');
                } else {
                    ui.setView('landing'); 
                }
            } else {
                ui.setView('landing');
            }
            return;
        }

        // لو صيانة، ومفيش يوزر محفوظ كأدمن
        if (settings.isMaintenance) {
             if (savedUser) {
                 const u = JSON.parse(savedUser);
                 if (u.role === 'admin') {
                     setUser(u);
                     ui.setView('app'); // الأدمن يعدي
                     return;
                 }
             }
             ui.setView('maintenance');
             return;
        }

        if (savedUser) { 
            const u = JSON.parse(savedUser);
            setUser(u);
            checkRedirect(u, false); 
        }
    };
    
    if (!isLoadingSettings || (window.location.pathname !== '/' && window.location.pathname !== '/admin')) {
        checkStart();
    }
  }, [isLoadingSettings]); // شلنا settings.isMaintenance من هنا عشان الـ effect اللي فوق يتعامل معاها

  const checkRedirect = async (userData, shouldShowToast = true) => {
      if (userData.role === 'admin') {
          ui.setView('app');
          if(shouldShowToast) ui.showToast(`مرحباً بك يا مدير`);
          return;
      }

      if (settings.isMaintenance) {
          ui.setView('maintenance');
          return;
      }

      const userAvailDoc = await getDoc(doc(db, "availability", userData.id));
      const hasSubmitted = userAvailDoc.exists() && (userAvailDoc.data().slots?.length > 0 || userAvailDoc.data().status === 'busy');
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      const meetingsSnap = await getDocs(collection(db, "meetings"));
      const isMeetingBooked = !meetingsSnap.empty;
      
      const adminDoc = await getDoc(doc(db, "availability", "admin"));
      const hasAdminSlots = adminDoc.exists() && adminDoc.data().slots && adminDoc.data().slots.length > 0;

      if (hasSubmitted || hasSeenOnboarding || isMeetingBooked || !hasAdminSlots) {
          ui.setView('app');
          if(shouldShowToast) ui.showToast(`أهلاً بك يا ${userData.name.split(' ')[0]}`);
      } else {
          ui.setView('onboarding');
      }
  };

  const handleLogin = async (inputCode) => {
    if (!inputCode) return ui.showToast("يرجى إدخال الكود", "error");
    
    const isAdminPath = window.location.pathname === '/admin';
    
    try {
        const q = query(collection(db, "users"), where("accessCode", "==", inputCode));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const userData = snap.docs[0].data();
            
            if (isAdminPath && userData.role !== 'admin') {
                return ui.showToast("غير مسموح للأعضاء بالدخول من هنا", "error");
            }

            if (settings.isMaintenance && userData.role !== 'admin') {
                ui.setView('maintenance');
                return;
            }

            setUser(userData);
            localStorage.setItem('smartScheduleUser', JSON.stringify(userData));
            checkRedirect(userData, true);
            ui.setActiveTab('home');
        } else { 
            ui.showToast("الكود غير صحيح", "error"); 
        }
    } catch (error) { ui.showToast("حدث خطأ في الاتصال", "error"); }
  };

  const handleLogout = () => { 
      localStorage.removeItem('smartScheduleUser'); 
      localStorage.removeItem('hasSeenOnboarding'); 
      setUser(null); 
      if (settings.isMaintenance && window.location.pathname !== '/admin') {
          ui.setView('maintenance');
      } else {
          ui.setView('landing'); 
      }
      ui.setActiveTab('home'); 
  };

  const finishOnboarding = () => {
      localStorage.setItem('hasSeenOnboarding', 'true');
      ui.setView('app');
      if(user) ui.showToast(`يلا نبدأ يا ${user.name.split(' ')[0]} 🚀`);
  };

  return { user, setUser, handleLogin, handleLogout, finishOnboarding };
};

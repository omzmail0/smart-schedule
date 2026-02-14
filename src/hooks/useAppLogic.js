import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { generateId, generateAccessCode, isPastTime } from '../utils/helpers';

export const useAppLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState({ teamName: '...', primaryColor: '#0e395c', logo: null });
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [availability, setAvailability] = useState({}); 
  const [analysisResult, setAnalysisResult] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', accessCode: '' });
  
  const [inspectMember, setInspectMember] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // تحديث دالة التوست عشان تضمن إن مفيش توست قديم معلق
  const showToast = (message, type = 'success') => {
      setToast(null); // تصفير القديم أولاً
      setTimeout(() => setToast({ message, type }), 100);
  };

  const triggerConfirm = (title, message, action, isDestructive = false) => {
      setConfirmData({ title, message, action, isDestructive });
  };

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (docSnap) => { 
        if (docSnap.exists()) { setSettings(docSnap.data()); } 
        else { setSettings({ teamName: 'ميديا صناع الحياة - المنشأة', primaryColor: '#0e395c', logo: null }); }
        setIsLoading(false); 
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", "admin"), (doc) => { 
        if (doc.exists()) setAdminSlots(doc.data().slots || []); 
        else setAdminSlots([]);
    });
    return () => unsub();
  }, []);

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

  useEffect(() => {
    if (!user) return;
    const unsubMembers = onSnapshot(collection(db, "users"), (snap) => setMembers(snap.docs.map(d => d.data()).filter(u => u.role !== 'admin')));
    const unsubMeetings = onSnapshot(collection(db, "meetings"), (snap) => setMeetings(snap.docs.map(d => d.data())));
    const unsubAllAvail = onSnapshot(collection(db, "availability"), (snap) => {
       const data = {}; snap.forEach(d => { data[d.id] = d.data(); }); setAvailability(data);
    });
    return () => { unsubMembers(); unsubMeetings(); unsubAllAvail(); };
  }, [user]);

  // فحص التوجيه (تشغيل التوست هنا للمستخدمين العائدين)
  useEffect(() => {
    const savedUser = localStorage.getItem('smartScheduleUser');
    if (savedUser) { 
        const u = JSON.parse(savedUser);
        setUser(u);
        checkRedirect(u, false); // false = لا تظهر توست هنا عشان ميتكررش مع الـ Reload
    }
  }, [availability]); 

  const checkRedirect = async (userData, shouldShowToast = true) => {
      if (userData.role === 'admin') {
          setView('app');
          if(shouldShowToast) showToast(`مرحباً بك يا مدير`);
          return;
      }

      const userAvailDoc = await getDoc(doc(db, "availability", userData.id));
      const hasSubmitted = userAvailDoc.exists() && (userAvailDoc.data().slots?.length > 0 || userAvailDoc.data().status === 'busy');
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

      if (hasSubmitted || hasSeenOnboarding) {
          setView('app');
          if(shouldShowToast) showToast(`أهلاً بك يا ${userData.name.split(' ')[0]}`);
      } else {
          setView('onboarding');
          // هنا مش هنظهر توست عشان ميزعجش المستخدم وهو بيقرأ
      }
  };

  const handleLogin = async (inputCode) => {
    if (!inputCode) return showToast("يرجى إدخال الكود", "error");
    setIsLoading(true);
    try {
        const q = query(collection(db, "users"), where("accessCode", "==", inputCode));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const userData = snap.docs[0].data();
            setUser(userData);
            localStorage.setItem('smartScheduleUser', JSON.stringify(userData));
            
            // التوجيه مع إظهار الترحيب
            checkRedirect(userData, true);
            setActiveTab('home');
        } else { 
            showToast("الكود غير صحيح", "error"); 
        }
    } catch (error) { showToast("حدث خطأ في الاتصال", "error"); } finally { setIsLoading(false); }
  };

  // إظهار الترحيب عند إنهاء الشرح
  const finishOnboarding = () => {
      localStorage.setItem('hasSeenOnboarding', 'true');
      setView('app');
      if(user) showToast(`يلا نبدأ يا ${user.name.split(' ')[0]} 🚀`);
  };

  const handleLogout = () => { 
      localStorage.removeItem('smartScheduleUser'); 
      localStorage.removeItem('hasSeenOnboarding'); 
      setUser(null); 
      setView('landing'); 
      setActiveTab('home'); 
  };

  const getUniqueCode = async () => {
      let isUnique = false;
      let finalCode = '';
      while (!isUnique) {
          finalCode = generateAccessCode();
          const q = query(collection(db, "users"), where("accessCode", "==", finalCode));
          const snap = await getDocs(q);
          if (snap.empty) isUnique = true;
      }
      return finalCode;
  };

  const regenerateUserCode = async (targetUserId) => {
      triggerConfirm("تغيير الكود", "سيتم إلغاء الكود القديم نهائياً. هل أنت متأكد؟", async () => {
          try {
              const newCode = await getUniqueCode();
              await setDoc(doc(db, "users", targetUserId), { accessCode: newCode }, { merge: true });
              
              if (user.id === targetUserId) {
                  const updatedUser = { ...user, accessCode: newCode };
                  setUser(updatedUser);
                  localStorage.setItem('smartScheduleUser', JSON.stringify(updatedUser));
              }
              showToast("تم تغيير الكود بنجاح");
          } catch (e) { showToast("حدث خطأ", "error"); }
      }, true);
  };

  const handleSaveMember = async () => {
    if (!memberForm.name) return showToast("يرجى كتابة الاسم", "error");
    try {
        const id = editingMemberId || generateId();
        let finalCode = memberForm.accessCode;
        if (!editingMemberId && !finalCode) {
            finalCode = await getUniqueCode();
        }
        const role = (editingMemberId === 'admin' || (user && user.id === id && user.role === 'admin')) ? 'admin' : 'member';
        const userData = { id, name: memberForm.name, accessCode: finalCode, role: role, createdAt: serverTimestamp() };
        await setDoc(doc(db, "users", id), userData, { merge: true });
        if (user && user.id === id) { setUser(userData); localStorage.setItem('smartScheduleUser', JSON.stringify(userData)); }
        setIsModalOpen(false);
        showToast(editingMemberId ? "تم التحديث" : "تم الإضافة");
    } catch (e) { showToast(e.message, "error"); }
  };

  const deleteMember = (memberId) => { 
      triggerConfirm("حذف العضو", "سيتم حذف العضو وجداوله.", async () => {
        await deleteDoc(doc(db, "users", memberId)); await deleteDoc(doc(db, "availability", memberId)); showToast("تم الحذف");
      }, true);
  };

  const saveSettings = async (newSettings) => { await setDoc(doc(db, "settings", "main"), newSettings); setSettings(newSettings); showToast("تم التحديث"); };

  const analyzeSchedule = () => {
    if (adminSlots.length === 0) return showToast("حدد الأوقات المتاحة أولاً", "error");
    const bookedSlotIds = meetings.map(m => m.slot);
    const suggestions = adminSlots.map(slot => {
      if (bookedSlotIds.includes(slot)) return null; 
      const [y, m, d, h] = slot.split('-');
      if (isPastTime(`${y}-${m}-${d}`, h)) return null;
      const availableMembers = members.filter(m => (availability[m.id]?.slots || []).includes(slot));
      return { slot, count: availableMembers.length, total: members.length, names: availableMembers.map(m => m.name) };
    }).filter(Boolean);
    suggestions.sort((a, b) => b.count - a.count);
    setAnalysisResult(suggestions);
  };

  const bookMeeting = (slot) => { 
      triggerConfirm("تأكيد الحجز", "اعتماد الموعد؟", async () => {
        const id = generateId(); await setDoc(doc(db, "meetings", id), { id, slot, createdAt: serverTimestamp() }); setAnalysisResult(null); showToast("تم الاعتماد");
      });
  };

  const cancelMeeting = (meetingId) => { 
      triggerConfirm("إلغاء", "تأكيد الإلغاء؟", async () => { await deleteDoc(doc(db, "meetings", meetingId)); showToast("تم الإلغاء"); }, true);
  };

  const resetAllAvailability = () => { 
      triggerConfirm("تصفير", "مسح كل الجداول؟", async () => {
        const snap = await getDocs(collection(db, "availability")); const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "availability", d.id))); await Promise.all(deletePromises); showToast("تم التصفير");
      }, true);
  };

  return {
    isLoading, user, setUser, view, activeTab, setActiveTab,
    members, meetings, adminSlots, availability, settings, setSettings, analysisResult,
    isModalOpen, setIsModalOpen, editingMemberId, setEditingMemberId,
    memberForm, setMemberForm, inspectMember, setInspectMember,
    toast, setToast, confirmData, setConfirmData,
    showToast, triggerConfirm,
    handleLogin, handleLogout, handleSaveMember, deleteMember, saveSettings,
    analyzeSchedule, bookMeeting, cancelMeeting, resetAllAvailability,
    finishOnboarding, regenerateUserCode
  };
};

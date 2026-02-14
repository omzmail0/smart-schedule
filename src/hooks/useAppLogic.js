import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { generateId, generateAccessCode, isPastTime } from '../utils/helpers';

export const useAppLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // landing, onboarding, app
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState({ teamName: '...', primaryColor: '#0e395c', logo: null });
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [availability, setAvailability] = useState({}); 
  const [analysisResult, setAnalysisResult] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', accessCode: '' });
  
  const [inspectMember, setInspectMember] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

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

  // Admin Init
  useEffect(() => {
    const initAdmin = async () => {
        try {
            const adminRef = doc(db, "users", "admin");
            const adminSnap = await getDoc(adminRef);
            if (!adminSnap.exists()) {
                await setDoc(adminRef, { 
                    id: "admin", 
                    name: "Admin", 
                    accessCode: "12345678", 
                    role: "admin", 
                    createdAt: serverTimestamp() 
                });
            }
        } catch (error) { console.error(error); }
    };
    initAdmin();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartScheduleUser');
    // لو المستخدم مسجل، نشوف هل هو شاف الـ onboarding ولا لسه
    if (savedUser) { 
        const u = JSON.parse(savedUser);
        setUser(u); 
        // لو أدمن يدخل علطول، لو عضو جديد يروح للـ onboarding الأول
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (u.role === 'admin' || hasSeenOnboarding) {
            setView('app');
        } else {
            setView('onboarding');
        }
    }
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
            
            // توجيه ذكي: لو أدمن يروح للتطبيق، لو عضو يروح للشرح
            if (userData.role === 'admin') {
                setView('app');
            } else {
                setView('onboarding'); // روح لصفحة الشرح
            }
            
            setActiveTab('home');
            showToast(`أهلاً بك يا ${userData.name.split(' ')[0]}`);
        } else { 
            showToast("الكود غير صحيح", "error"); 
        }
    } catch (error) { showToast("حدث خطأ في الاتصال", "error"); } finally { setIsLoading(false); }
  };

  const finishOnboarding = () => {
      localStorage.setItem('hasSeenOnboarding', 'true');
      setView('app');
  };

  const handleLogout = () => { 
      localStorage.removeItem('smartScheduleUser'); 
      localStorage.removeItem('hasSeenOnboarding'); // عشان لما يرجع يشوف الشرح تاني لو حبيت
      setUser(null); 
      setView('landing'); 
      setActiveTab('home'); 
  };

  const handleSaveMember = async () => {
    if (!memberForm.name) return showToast("يرجى كتابة الاسم", "error");
    try {
        const id = editingMemberId || generateId();
        let finalCode = memberForm.accessCode;
        if (!editingMemberId && !finalCode) {
            let isUnique = false;
            while (!isUnique) {
                finalCode = generateAccessCode();
                const q = query(collection(db, "users"), where("accessCode", "==", finalCode));
                const snap = await getDocs(q);
                if (snap.empty) isUnique = true;
            }
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
    finishOnboarding // دالة إنهاء الشرح
  };
};

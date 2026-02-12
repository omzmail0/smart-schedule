// src/hooks/useAppLogic.js
import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { generateId, isPastTime } from '../utils/helpers';

export const useAppLogic = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [availability, setAvailability] = useState({}); 
  const [settings, setSettings] = useState({ teamName: 'مجدول الفريق', primaryColor: '#0e395c', logo: null });
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', username: '', password: '' });
  const [inspectMember, setInspectMember] = useState(null);

  // States for UI
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const triggerConfirm = (title, message, action, isDestructive = false) => {
      setConfirmData({ title, message, action, isDestructive });
  };

  // --- Effects ---
  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (docSnap) => { 
        if (docSnap.exists()) setSettings(docSnap.data()); 
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    const initAdmin = async () => {
        const adminRef = doc(db, "users", "admin");
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
            await setDoc(adminRef, {
                id: "admin", name: "المدير", username: "admin", password: "admin", role: "admin", createdAt: serverTimestamp()
            });
        }
    };
    initAdmin();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartScheduleUser');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('app');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubMembers = onSnapshot(collection(db, "users"), (snap) => setMembers(snap.docs.map(d => d.data()).filter(u => u.role !== 'admin')));
    const unsubMeetings = onSnapshot(collection(db, "meetings"), (snap) => setMeetings(snap.docs.map(d => d.data())));
    const unsubAdminAvail = onSnapshot(doc(db, "availability", "admin"), (doc) => { 
        if (doc.exists()) setAdminSlots(doc.data().slots || []); 
        else setAdminSlots([]);
    });
    const unsubAllAvail = onSnapshot(collection(db, "availability"), (snap) => {
       const data = {};
       snap.forEach(d => { data[d.id] = d.data(); });
       setAvailability(data);
    });
    return () => { unsubMembers(); unsubMeetings(); unsubAdminAvail(); unsubAllAvail(); };
  }, [user]);

  // --- Actions ---
  const handleLogin = async (loginData) => {
    if (!loginData.username || !loginData.password) return showToast("يرجى إكمال جميع البيانات", "error");
    try {
        const q = query(collection(db, "users"), where("username", "==", loginData.username), where("password", "==", loginData.password));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const userData = snap.docs[0].data();
            setUser(userData);
            localStorage.setItem('smartScheduleUser', JSON.stringify(userData));
            setView('app');
            setActiveTab('home');
            showToast(`مرحباً بك يا ${userData.name}`);
        } else {
            showToast("بيانات الدخول غير صحيحة", "error");
        }
    } catch (error) { showToast("حدث خطأ في الاتصال", "error"); }
  };

  const handleLogout = () => {
      localStorage.removeItem('smartScheduleUser');
      setUser(null);
      setView('login');
      setActiveTab('home');
      setAdminSlots([]);
  };

  const handleSaveMember = async () => {
    if (!memberForm.name || !memberForm.username || !memberForm.password) return showToast("البيانات ناقصة", "error");
    try {
        const id = editingMemberId || generateId();
        const role = (editingMemberId === 'admin' || (user && user.id === id && user.role === 'admin')) ? 'admin' : 'member';
        const userData = { id, name: memberForm.name, username: memberForm.username, password: memberForm.password, role: role, createdAt: serverTimestamp() };
        await setDoc(doc(db, "users", id), userData, { merge: true });
        
        if (user && user.id === id) {
            setUser(userData);
            localStorage.setItem('smartScheduleUser', JSON.stringify(userData));
        }
        setIsModalOpen(false);
        showToast(editingMemberId ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
    } catch (e) { showToast(e.message, "error"); }
  };

  const deleteMember = (memberId) => { 
      triggerConfirm("حذف العضو", "هل أنت متأكد من حذف هذا العضو نهائياً؟", async () => {
        await deleteDoc(doc(db, "users", memberId)); 
        await deleteDoc(doc(db, "availability", memberId));
        showToast("تم حذف العضو");
      }, true);
  };

  const saveSettings = async (newSettings) => { 
      await setDoc(doc(db, "settings", "main"), newSettings); 
      setSettings(newSettings);
      showToast("تم تحديث الإعدادات"); 
  };

  const analyzeSchedule = () => {
    if (adminSlots.length === 0) return showToast("يرجى تحديد أوقاتك المتاحة أولاً", "error");
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
      triggerConfirm("تأكيد الحجز", "هل تريد اعتماد هذا الموعد؟", async () => {
        const id = generateId(); 
        await setDoc(doc(db, "meetings", id), { id, slot, createdAt: serverTimestamp() }); 
        setAnalysisResult(null);
        showToast("تم حجز الموعد");
      });
  };

  const cancelMeeting = (meetingId) => { 
      triggerConfirm("إلغاء الاجتماع", "تأكيد الإلغاء؟", async () => {
        await deleteDoc(doc(db, "meetings", meetingId));
        showToast("تم الإلغاء");
      }, true);
  };

  const resetAllAvailability = () => { 
      triggerConfirm("تصفير الجداول", "سيتم مسح كل الجداول. متأكد؟", async () => {
        const snap = await getDocs(collection(db, "availability")); 
        const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "availability", d.id)));
        await Promise.all(deletePromises);
        showToast("تم تصفير الجداول");
      }, true);
  };

  return {
    user, setUser, view, activeTab, setActiveTab,
    members, meetings, adminSlots, availability, settings, setSettings, analysisResult,
    isModalOpen, setIsModalOpen, editingMemberId, setEditingMemberId,
    memberForm, setMemberForm, inspectMember, setInspectMember,
    toast, setToast, confirmData, setConfirmData,
    showToast, triggerConfirm,
    handleLogin, handleLogout, handleSaveMember, deleteMember, saveSettings,
    analyzeSchedule, bookMeeting, cancelMeeting, resetAllAvailability
  };
};

import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { generateId, isPastTime } from '../utils/helpers';

export const useAppLogic = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // نبدأ بصفحة الهبوط
  const [activeTab, setActiveTab] = useState('home');
  
  // الإعدادات الافتراضية (تتغير تلقائياً عند جلب البيانات من فايربيز)
  const [settings, setSettings] = useState({ 
      teamName: 'ميديا المنشاه', 
      primaryColor: '#0ea5e9', // الأزرق السماوي
      logo: null 
  });

  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [availability, setAvailability] = useState({}); 
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // حالات المودال (Modals)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', username: '', password: '' });
  const [inspectMember, setInspectMember] = useState(null);

  // التنبيهات
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const triggerConfirm = (title, message, action, isDestructive = false) => {
      setConfirmData({ title, message, action, isDestructive });
  };

  // --- جلب البيانات ---
  useEffect(() => {
    // جلب الإعدادات (اسم التيم واللون)
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (docSnap) => { 
        if (docSnap.exists()) setSettings(docSnap.data()); 
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    // التأكد من وجود أدمن
    const initAdmin = async () => {
        const adminRef = doc(db, "users", "admin");
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
            await setDoc(adminRef, {
                id: "admin", name: "مسؤول الفريق", username: "admin", password: "admin", role: "admin", createdAt: serverTimestamp()
            });
        }
    };
    initAdmin();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartScheduleUser');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('app'); // لو مسجل دخول، يدخل للتطبيق علطول
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

  // --- الوظائف الأساسية ---
  const onStart = () => setView('login');
  const onBackToLanding = () => setView('landing');

  const handleLogin = async (loginData) => {
    if (!loginData.username || !loginData.password) return showToast("اكتب البيانات كاملة يا بطل", "error");
    try {
        const q = query(collection(db, "users"), where("username", "==", loginData.username), where("password", "==", loginData.password));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const userData = snap.docs[0].data();
            setUser(userData);
            localStorage.setItem('smartScheduleUser', JSON.stringify(userData));
            setView('app');
            setActiveTab('home');
            showToast(`منور يا ${userData.name.split(' ')[0]} ❤️`);
        } else {
            showToast("البيانات غلط، راجع المسؤول", "error");
        }
    } catch (error) { showToast("في مشكلة في النت", "error"); }
  };

  const handleLogout = () => {
      localStorage.removeItem('smartScheduleUser');
      setUser(null);
      setView('landing'); 
      setActiveTab('home');
      setAdminSlots([]);
  };

  // باقي وظائف الإدارة (الحفظ، الحذف، الحجز، التصفير)
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
        showToast(editingMemberId ? "تم التعديل" : "تمت الإضافة");
    } catch (e) { showToast(e.message, "error"); }
  };

  const deleteMember = (memberId) => { 
      triggerConfirm("حذف العضو", "متأكد إنك عايز تحذفه نهائي؟", async () => {
        await deleteDoc(doc(db, "users", memberId)); 
        await deleteDoc(doc(db, "availability", memberId));
        showToast("تم الحذف");
      }, true);
  };

  const saveSettings = async (newSettings) => { 
      await setDoc(doc(db, "settings", "main"), newSettings); 
      setSettings(newSettings);
      showToast("تم تحديث هوية الفريق"); 
  };

  const analyzeSchedule = () => {
    if (adminSlots.length === 0) return showToast("لازم تحدد المواعيد المتاحة الأول", "error");
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
      triggerConfirm("اعتماد الموعد", "هل نعتمد الميعاد ده رسمياً؟", async () => {
        const id = generateId(); 
        await setDoc(doc(db, "meetings", id), { id, slot, createdAt: serverTimestamp() }); 
        setAnalysisResult(null);
        showToast("تم اعتماد الاجتماع");
      });
  };

  const cancelMeeting = (meetingId) => { 
      triggerConfirm("إلغاء الاجتماع", "أكيد عايز تلغي؟", async () => { await deleteDoc(doc(db, "meetings", meetingId)); showToast("تم الإلغاء"); }, true);
  };

  const resetAllAvailability = () => { 
      triggerConfirm("تصفير الجداول", "ده هيمسح كل جداول الأعضاء. متأكد؟", async () => {
        const snap = await getDocs(collection(db, "availability")); 
        const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "availability", d.id)));
        await Promise.all(deletePromises);
        showToast("تم التصفير بنجاح");
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
    analyzeSchedule, bookMeeting, cancelMeeting, resetAllAvailability,
    onStart, onBackToLanding
  };
};

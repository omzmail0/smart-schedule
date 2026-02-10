// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
// 👇 تم إضافة الأيقونات الناقصة هنا (ChevronRight, ChevronLeft, CheckSquare, Ban, X)
import { Trash2, UserPlus, LogOut, Calendar, Users, Star, Settings, Upload, RefreshCw, Pencil, RotateCcw, Lock, Info, CheckCircle2, Home, Menu, ChevronRight, ChevronLeft, CheckSquare, Ban, X } from 'lucide-react';
import { db } from './utils/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc, query, where } from "firebase/firestore";
import { generateId, HOURS, getWeekDays, formatDate, formatTime, getStartOfWeek, getSlotId, isPastTime } from './utils/helpers';

// --- Components ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, style = {} }) => {
  const base = "h-12 px-6 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm";
  const styles = {
    primary: "text-white shadow-md", 
    danger: "bg-red-50 text-red-600 border border-red-100",
    outline: "border-2 border-gray-100 text-gray-700 bg-white",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50 shadow-none h-auto p-2",
    float: "fixed bottom-24 left-6 right-6 shadow-xl z-30 text-lg py-4 h-auto"
  };
  return <button onClick={onClick} disabled={disabled} style={style} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
};

const BottomNav = ({ activeTab, setActiveTab, role, color }) => {
  const navItemClass = (tab) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === tab ? 'font-bold' : 'text-gray-400'}`;
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center z-40 pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
      <button onClick={() => setActiveTab('home')} className={navItemClass('home')} style={{ color: activeTab === 'home' ? color : undefined }}><Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} /><span className="text-[10px]">الرئيسية</span></button>
      {role === 'admin' && (<>
        <button onClick={() => setActiveTab('members')} className={navItemClass('members')} style={{ color: activeTab === 'members' ? color : undefined }}><Users size={28} strokeWidth={activeTab === 'members' ? 2.5 : 2} /><span className="text-[10px]">الأعضاء</span></button>
        <button onClick={() => setActiveTab('analysis')} className={navItemClass('analysis')} style={{ color: activeTab === 'analysis' ? color : undefined }}><Star size={28} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} /><span className="text-[10px]">تحليل</span></button>
        <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')} style={{ color: activeTab === 'settings' ? color : undefined }}><Settings size={28} strokeWidth={activeTab === 'settings' ? 2.5 : 2} /><span className="text-[10px]">إعدادات</span></button>
      </>)}
      {role !== 'admin' && (<button onClick={() => setActiveTab('profile')} className={navItemClass('profile')} style={{ color: activeTab === 'profile' ? color : undefined }}><Menu size={28} strokeWidth={activeTab === 'profile' ? 2.5 : 2} /><span className="text-[10px]">حسابي</span></button>)}
    </div>
  );
};

const DailyScheduler = ({ userId, role, adminSlots = null, onSave, themeColor, bookedSlots = [] }) => {
  const [selected, setSelected] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const days = getWeekDays(weekStart);
  const isScheduleFrozen = bookedSlots.length > 0;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", userId), (doc) => {
      if (doc.exists()) setSelected(doc.data().slots || []); else setSelected([]);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    const todayIndex = days.findIndex(d => d.toDateString() === new Date().toDateString());
    setActiveDayIndex(todayIndex !== -1 ? todayIndex : 0);
  }, [weekStart]);

  const toggleSlot = (date, hour) => {
    const slotId = getSlotId(date, hour);
    if (bookedSlots.some(m => m.slot === slotId)) return alert("⛔ هذا الموعد تم اعتماده كاجتماع رسمي.");
    if (isScheduleFrozen) return alert("⛔ الجدول مغلق بالكامل لوجود اجتماع مؤكد.");
    if (isPastTime(date, hour)) return alert("لا يمكن تحديد وقت في الماضي!");
    
    const isOwnerAdmin = role === 'admin';
    if (!isOwnerAdmin && adminSlots && !adminSlots.includes(slotId)) return alert("الوقت غير متاح من المدير.");
    
    const newSelected = selected.includes(slotId) ? selected.filter(s => s !== slotId) : [...selected, slotId];
    setSelected(newSelected);
  };

  const saveChanges = async () => {
    if (isScheduleFrozen) return;
    try {
      await setDoc(doc(db, "availability", userId), { slots: selected }, { merge: true });
      if (onSave) onSave();
      alert("✅ تم الحفظ (سحابياً)");
    } catch (e) { alert("خطأ في الحفظ: " + e.message); }
  };

  const goToday = () => { setWeekStart(getStartOfWeek(new Date())); };

  return (
    <div className="pb-24">
      {isScheduleFrozen && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>}

      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2">
           <span className="font-bold text-gray-800 text-lg">{formatDate(weekStart).split(',')[1]}</span>
           <button onClick={goToday} className="bg-gray-100 text-xs px-2 py-1 rounded-md text-gray-600 font-bold flex items-center gap-1">اليوم <RefreshCw size={10}/></button>
        </div>
        <div className="flex gap-1">
           <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; })} className="p-2 bg-white border rounded-full shadow-sm"><ChevronRight size={20}/></button>
           <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; })} className="p-2 bg-white border rounded-full shadow-sm"><ChevronLeft size={20}/></button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar px-1 snap-x">
        {days.map((d, i) => {
          const isSelected = activeDayIndex === i;
          const hasData = selected.some(s => s.startsWith(getSlotId(d, 10).slice(0, 10)));
          return (
            <button key={i} onClick={() => setActiveDayIndex(i)}
              style={{ borderColor: isSelected ? themeColor : 'transparent', backgroundColor: isSelected ? `${themeColor}10` : 'white', color: isSelected ? themeColor : '#9ca3af' }}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-[18%] aspect-[3/4] rounded-2xl border-2 transition-all shadow-sm`}>
              <span className="text-[10px] font-bold opacity-80">{formatDate(d).split(' ')[0]}</span>
              <span className="text-xl font-bold">{d.getDate()}</span>
              {hasData && <div style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>

      <div className={`bg-white rounded-3xl p-5 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-gray-50 min-h-[350px] transition-opacity ${isScheduleFrozen ? 'opacity-80' : ''}`}>
        <h4 className="text-center font-bold text-gray-400 mb-6 text-sm">{formatDate(days[activeDayIndex])}</h4>
        
        <div className="grid grid-cols-3 gap-3">
          {HOURS.map(hour => {
            const slotId = getSlotId(days[activeDayIndex], hour);
            const isSelected = selected.includes(slotId);
            const isOwnerAdmin = role === 'admin';
            const isAllowed = isOwnerAdmin || (!adminSlots || adminSlots.includes(slotId));
            const isPast = isPastTime(days[activeDayIndex], hour);
            const isBooked = bookedSlots.some(m => m.slot === slotId);
            
            // --- UX: Hide unavailable slots for members ---
            if (!isOwnerAdmin && !isAllowed && !isBooked) return null;

            let slotStyle = {};
            let slotClass = "bg-gray-50 border-gray-100 text-gray-400";

            if (isBooked) {
               return (
                 <div key={hour} onClick={() => toggleSlot(days[activeDayIndex], hour)} className={`h-14 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border bg-red-50 border-red-200 text-red-500 opacity-90`}>
                    <div className="flex items-center gap-1"><CheckSquare size={12}/> {formatTime(hour)}</div>
                    <span className="text-[9px]">تم الحجز</span>
                 </div>
               );
            }
            if (isPast) slotClass = "bg-gray-50 opacity-30 cursor-not-allowed text-gray-300";
            else if (!isAllowed) slotClass = "bg-gray-50 opacity-40 cursor-not-allowed border-dashed border-gray-200";
            else if (isSelected) {
               slotStyle = { backgroundColor: themeColor, color: 'white', boxShadow: `0 4px 12px ${themeColor}60` };
               slotClass = "transform scale-105 font-bold border-transparent";
            } else slotClass = "bg-white border-gray-200 text-gray-600 hover:border-gray-400";
            
            if (isScheduleFrozen && !isBooked) slotClass += " cursor-not-allowed opacity-60";

            return (
              <button key={hour} disabled={isPast || (!isAllowed && !isOwnerAdmin) || isScheduleFrozen} onClick={() => toggleSlot(days[activeDayIndex], hour)}
                style={slotStyle} className={`h-14 rounded-2xl text-sm transition-all flex flex-col items-center justify-center border ${slotClass}`}>
                {formatTime(hour)}
              </button>
            );
          })}
        </div>
        
        {/* Empty State */}
        {!HOURS.some(h => role === 'admin' || (adminSlots && adminSlots.includes(getSlotId(days[activeDayIndex], h)))) && role !== 'admin' && (
           <div className="text-center py-10 text-gray-400 flex flex-col items-center">
              <Ban size={32} className="mb-2 opacity-20"/>
              <p className="text-xs">لا توجد مواعيد متاحة في هذا اليوم</p>
           </div>
        )}
      </div>
      {!isScheduleFrozen && <Button variant="float" onClick={saveChanges} style={{ backgroundColor: themeColor }} className="text-white">حفظ التغييرات 💾</Button>}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [settings, setSettings] = useState({ teamName: 'مجدول الفريق', primaryColor: '#0e395c', logo: null });
  const [analysisResult, setAnalysisResult] = useState(null);

  const [memberForm, setMemberForm] = useState({ name: '', username: '', password: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkAdmin = async () => {
       const q = query(collection(db, "users"), where("username", "==", "admin"));
       const snap = await getDocs(q);
       if (snap.empty) { await setDoc(doc(db, "users", "admin"), { id: "admin", name: "المدير", role: "admin", username: "admin", password: "admin" }); }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, "users"), (snap) => setMembers(snap.docs.map(d => d.data()).filter(u => u.role !== 'admin')));
    const unsubMeetings = onSnapshot(collection(db, "meetings"), (snap) => setMeetings(snap.docs.map(d => d.data())));
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (doc) => { if (doc.exists()) setSettings(doc.data()); });
    const unsubAdminAvail = onSnapshot(doc(db, "availability", "admin"), (doc) => { if (doc.exists()) setAdminSlots(doc.data().slots || []); else setAdminSlots([]); });
    return () => { unsubMembers(); unsubMeetings(); unsubSettings(); unsubAdminAvail(); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const q = query(collection(db, "users"), where("username", "==", loginData.username), where("password", "==", loginData.password));
    const snap = await getDocs(q);
    if (!snap.empty) { setUser(snap.docs[0].data()); setView('app'); setActiveTab('home'); } else alert("بيانات خاطئة");
  };

  const handleMemberSubmit = async () => {
    if (!memberForm.name || !memberForm.username || !memberForm.password) return alert("أكمل البيانات");
    const id = editingMemberId || generateId();
    await setDoc(doc(db, "users", id), { ...memberForm, id, role: 'member' }, { merge: true });
    closeModal();
    alert(editingMemberId ? "تم التعديل" : "تمت الإضافة");
  };

  const openAddModal = () => { setMemberForm({ name: '', username: '', password: '' }); setEditingMemberId(null); setIsModalOpen(true); };
  const openEditModal = (member) => { setMemberForm({ name: member.name, username: member.username, password: member.password }); setEditingMemberId(member.id); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingMemberId(null); };
  const saveSettings = async () => { await setDoc(doc(db, "settings", "main"), settings); alert("تم التحديث!"); };
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setSettings({ ...settings, logo: reader.result }); }; reader.readAsDataURL(file); } };

  const analyzeSchedule = async () => {
    if (adminSlots.length === 0) return alert("حدد أوقاتك أولاً");
    const availSnap = await getDocs(collection(db, "availability"));
    const allAvail = {};
    availSnap.forEach(d => { allAvail[d.id] = d.data().slots || []; });
    const bookedSlotIds = meetings.map(m => m.slot);
    const suggestions = adminSlots.map(slot => {
      if (bookedSlotIds.includes(slot)) return null; 
      const [y, m, d, h] = slot.split('-');
      if (isPastTime(`${y}-${m}-${d}`, h)) return null;
      const availableMembers = members.filter(m => (allAvail[m.id] || []).includes(slot));
      return { slot, count: availableMembers.length, total: members.length, names: availableMembers.map(m => m.name) };
    }).filter(Boolean);
    suggestions.sort((a, b) => b.count - a.count);
    setAnalysisResult(suggestions);
  };

  const bookMeeting = async (slot) => { if (!window.confirm("حجز الموعد؟")) return; const id = generateId(); await setDoc(doc(db, "meetings", id), { id, slot, createdAt: new Date().toISOString() }); setAnalysisResult(null); };
  const cancelMeeting = async (meetingId) => { if (!window.confirm("إلغاء الاجتماع؟")) return; await deleteDoc(doc(db, "meetings", meetingId)); };
  const resetAllAvailability = async () => { if (!window.confirm("⚠️ تصفير كامل للجداول؟ (لا يمكن التراجع)")) return; const snap = await getDocs(collection(db, "availability")); snap.forEach(d => { deleteDoc(doc(db, "availability", d.id)); }); alert("تم التصفير. ابدأوا من جديد."); };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-6" dir="rtl">
        <div className="text-center mb-10 animate-fade-in">
          {settings.logo ? <img src={settings.logo} className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover shadow-lg"/> : <div className="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-md" style={{ color: settings.primaryColor }}><Calendar size={40}/></div>}
          <h1 className="text-3xl font-black text-gray-800">{settings.teamName}</h1>
          <p className="text-gray-400 mt-2 font-medium">تسجيل الدخول</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <input className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} placeholder="اسم المستخدم" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} />
          <input type="password" className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} placeholder="كلمة المرور" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
          <Button className="w-full h-14 text-lg mt-4" style={{ backgroundColor: settings.primaryColor }}>دخول</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100" dir="rtl">
      <div className="bg-white px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          {settings.logo ? <img src={settings.logo} className="w-10 h-10 rounded-xl object-cover border border-gray-100"/> : <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: settings.primaryColor }}>{settings.teamName[0]}</div>}
          <div><h1 className="font-extrabold text-gray-800 text-lg leading-tight">{settings.teamName}</h1><p className="text-[10px] font-bold text-gray-400">{user.role === 'admin' ? 'مدير الفريق' : `مرحباً ${user.name}`}</p></div>
        </div>
        <Button variant="ghost" onClick={() => { setUser(null); setView('login'); }}><LogOut size={20}/></Button>
      </div>

      <div className="p-5 max-w-lg mx-auto pb-24">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            
            {user.role !== 'admin' && (
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 p-4 opacity-10"><Info size={80} className="text-blue-600"/></div>
                 <h3 className="font-bold text-blue-900 mb-2 relative z-10 flex items-center gap-2"><CheckCircle2 size={18}/> تنبيه هام</h3>
                 <p className="text-sm text-blue-800 leading-relaxed relative z-10 font-medium">يرجى تحديد <strong>جميع</strong> الأوقات المناسبة لك، وليس موعداً واحداً فقط. كلما زادت اختياراتك، زادت فرصة التوافق مع الفريق! 🚀</p>
              </div>
            )}

            {meetings.length > 0 && (
               <div>
                 <h3 className="font-bold text-gray-800 text-sm mb-3 px-1">📅 اجتماعات مؤكدة</h3>
                 <div className="space-y-3">
                   {meetings.map(meet => {
                     const [y, m, d, h] = meet.slot.split('-');
                     return (
                       <div key={meet.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: settings.primaryColor }}><span className="font-bold text-xl">{formatTime(h).split(':')[0]}</span></div>
                            <div><div className="font-bold text-gray-800 text-lg">اجتماع</div><div className="text-sm font-medium text-gray-400">{formatDate(new Date(y, m-1, d))}</div></div>
                         </div>
                         {user.role === 'admin' && <button onClick={() => cancelMeeting(meet.id)} className="bg-red-50 text-red-500 p-2 rounded-xl text-xs font-bold">إلغاء</button>}
                       </div>
                     )
                   })}
                 </div>
               </div>
            )}
            <div>
               <h3 className="font-bold text-gray-800 text-sm mb-3 px-1">{user.role === 'admin' ? '⚡ الأوقات المتاحة للفريق' : '📌 حدد أوقات فراغك'}</h3>
               <DailyScheduler userId={user.id} role={user.role} adminSlots={adminSlots} themeColor={settings.primaryColor} bookedSlots={meetings} />
            </div>
          </div>
        )}

        {/* ... (باقي التبويبات Settings, Members, etc. كما هي) ... */}
        {activeTab === 'settings' && user.role === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="text-center py-4"><h2 className="text-xl font-bold text-gray-800">إعدادات الفريق</h2></div>
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div><label className="block text-sm font-bold text-gray-500 mb-2">اسم الفريق</label><input className="w-full h-12 px-4 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2" style={{ '--tw-ring-color': settings.primaryColor }} value={settings.teamName} onChange={e => setSettings({...settings, teamName: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-gray-500 mb-2">اللون</label><div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">{['#0e395c', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#000000'].map(c => (<button key={c} onClick={() => setSettings({...settings, primaryColor: c})} className={`w-12 h-12 rounded-full border-4 flex-shrink-0 transition-transform ${settings.primaryColor === c ? 'scale-110 border-gray-300' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></div>
                <div><label className="block text-sm font-bold text-gray-500 mb-2">الشعار</label><div className="flex items-center gap-4">{settings.logo && <img src={settings.logo} className="w-16 h-16 rounded-xl object-cover border"/>}<button onClick={() => fileInputRef.current.click()} className="flex-1 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-400"><Upload size={20}/> <span>تغيير</span></button><input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" /></div></div>
                <Button onClick={saveSettings} style={{ backgroundColor: settings.primaryColor }} className="w-full text-white">حفظ الهوية</Button>
                <hr className="border-gray-100 my-4"/>
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100"><h4 className="font-bold text-orange-800 mb-1 text-sm">بداية دورة جديدة؟</h4><p className="text-xs text-orange-600 mb-3">تحذير: هذا يمسح جميع الجداول.</p><Button onClick={resetAllAvailability} className="w-full h-10 bg-orange-200 text-orange-800 shadow-none hover:bg-orange-300 border-none"><RotateCcw size={16}/> تصفير كامل</Button></div>
             </div>
          </div>
        )}

        {activeTab === 'members' && (
           <div className="animate-in fade-in space-y-4">
              <div className="flex justify-between items-center px-1"><h2 className="font-bold text-lg">الأعضاء</h2><button onClick={openAddModal} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><UserPlus size={14}/> جديد</button></div>
              {members.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{m.name[0]}</div><div className="font-bold text-gray-800">{m.name}</div></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(m)} className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100"><Pencil size={16}/></button>
                    <button onClick={() => { if(window.confirm('حذف؟')) deleteDoc(doc(db, "users", m.id)); }} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'analysis' && (
           <div className="animate-in fade-in">
              <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-gray-100 mb-6">
                 <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${settings.primaryColor}20`, color: settings.primaryColor }}><Star size={40}/></div>
                 <h2 className="font-bold text-xl mb-2">أفضل وقت</h2>
                 <p className="text-gray-400 text-sm mb-6">سيتم مقارنة الجداول المتاحة</p>
                 <Button onClick={analyzeSchedule} style={{ backgroundColor: settings.primaryColor }} className="w-full text-white">تحليل الآن</Button>
              </div>
              {analysisResult && (
                 <div className="space-y-3">
                    {analysisResult.map((res, i) => (
                       <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                          <div><div className="font-bold text-gray-800">{formatDate(new Date(res.slot.split('-').slice(0,3).join('-')))}</div><div className="text-xs text-gray-400 mt-1">{res.count} من {res.total} متاحين</div></div>
                          <div className="flex items-center gap-3"><span className="font-bold text-lg" style={{ color: settings.primaryColor }}>{formatTime(res.slot.split('-')[3])}</span><button onClick={() => bookMeeting(res.slot)} className="bg-black text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-gray-800">حجز</button></div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}

        {activeTab === 'profile' && (
           <div className="animate-in fade-in p-4">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 right-0 h-24 opacity-10" style={{ backgroundColor: settings.primaryColor }}></div>
                 <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white relative z-10" style={{ backgroundColor: settings.primaryColor }}>{user.name[0]}</div>
                 <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                 <p className="text-gray-400 font-medium mb-8">@{user.username}</p>
                 <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right"><p className="text-xs text-gray-400 font-bold mb-2">الفريق</p><div className="flex items-center gap-2 font-bold text-gray-700">{settings.logo && <img src={settings.logo} className="w-6 h-6 rounded-md"/>}{settings.teamName}</div></div>
                 <Button onClick={() => { setUser(null); setView('login'); }} variant="danger" className="w-full">تسجيل الخروج</Button>
              </div>
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[30px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-bold mb-6 text-center">{editingMemberId ? 'تعديل عضو' : 'عضو جديد'}</h3>
            <div className="space-y-4">
              <input placeholder="الاسم" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
              <input placeholder="اسم المستخدم" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} />
              <input placeholder="كلمة المرور" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none" value={memberForm.password} onChange={e => setMemberForm({...memberForm, password: e.target.value})} />
              <Button onClick={handleMemberSubmit} style={{ backgroundColor: settings.primaryColor }} className="w-full mt-2 text-white">{editingMemberId ? 'حفظ' : 'إضافة'}</Button>
            </div>
            <button onClick={closeModal} className="w-full mt-4 text-gray-400 font-bold text-sm">إلغاء</button>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={user?.role} color={settings.primaryColor} />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, UserPlus, LogOut, Star, Settings, Upload, RotateCcw, Info, CheckCircle2, X, Eye, Pencil, Calendar, Clock, Edit } from 'lucide-react';
import { db } from './utils/firebase';
import { collection, doc, setDoc, updateDoc, getDoc, getDocs, onSnapshot, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { generateId, formatDate, formatTime, isPastTime } from './utils/helpers';

// استيراد المكونات
import Button from './components/Button';
import BottomNav from './components/BottomNav';
import DailyScheduler from './components/DailyScheduler';
import AuthScreen from './components/AuthScreen';
import { Toast, ConfirmModal } from './components/UI';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [availability, setAvailability] = useState({}); 
  const [settings, setSettings] = useState({ teamName: 'مجدول الفريق', primaryColor: '#0e395c', logo: null });
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', username: '', password: '' });
  
  const [inspectMember, setInspectMember] = useState(null);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const triggerConfirm = (title, message, action, isDestructive = false) => {
      setConfirmData({ title, message, action, isDestructive });
  };

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
                id: "admin",
                name: "المدير",
                username: "admin",
                password: "admin",
                role: "admin",
                createdAt: serverTimestamp()
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

  const openAddModal = () => { setMemberForm({ name: '', username: '', password: '' }); setEditingMemberId(null); setIsModalOpen(true); };
  const openEditModal = (member) => { setMemberForm({ name: member.name, username: member.username, password: member.password }); setEditingMemberId(member.id); setIsModalOpen(true); };
  
  const openEditProfile = () => {
      setMemberForm({ name: user.name, username: user.username, password: user.password });
      setEditingMemberId(user.id);
      setIsModalOpen(true);
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
      triggerConfirm(
          "حذف العضو", 
          "هل أنت متأكد من حذف هذا العضو نهائياً؟", 
          async () => {
            await deleteDoc(doc(db, "users", memberId)); 
            await deleteDoc(doc(db, "availability", memberId));
            showToast("تم حذف العضو");
          },
          true 
      );
  };

  const saveSettings = async () => { await setDoc(doc(db, "settings", "main"), settings); showToast("تم تحديث الإعدادات"); };
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setSettings({ ...settings, logo: reader.result }); }; reader.readAsDataURL(file); } };

  const analyzeSchedule = async () => {
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

  const getMemberStatus = (mId) => {
    const userAvail = availability[mId];
    if (!userAvail) return { text: 'لم يدخل', color: 'bg-gray-100 text-gray-400' };
    if (userAvail.status === 'busy') return { text: 'مشغول', color: 'bg-red-100 text-red-600' };
    if (userAvail.slots && userAvail.slots.length > 0) return { text: 'تم التحديد', color: 'bg-green-100 text-green-600' };
    return { text: 'لم يحدد', color: 'bg-yellow-100 text-yellow-600' };
  };

  const getMemberScheduleSummary = (memberId) => {
    const slots = availability[memberId]?.slots || [];
    const grouped = slots.reduce((acc, slot) => {
        const [y, m, d, h] = slot.split('-');
        const dateKey = `${y}-${m}-${d}`;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(parseInt(h));
        return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal 
        isOpen={!!confirmData} 
        title={confirmData?.title} 
        message={confirmData?.message} 
        isDestructive={confirmData?.isDestructive}
        onConfirm={() => { confirmData.action(); setConfirmData(null); }} 
        onCancel={() => setConfirmData(null)} 
      />

      {view === 'login' ? (
          <AuthScreen onLogin={handleLogin} settings={settings} />
      ) : (
        <>
          <div className="bg-white px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              {settings.logo ? <img src={settings.logo} className="w-10 h-10 rounded-xl object-cover border border-gray-100"/> : <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: settings.primaryColor }}>{settings.teamName[0]}</div>}
              <div><h1 className="font-extrabold text-gray-800 text-lg leading-tight">{settings.teamName}</h1><p className="text-[10px] font-bold text-gray-400">{user.role === 'admin' ? 'مدير الفريق' : `مرحباً ${user.name}`}</p></div>
            </div>
            <Button variant="ghost" onClick={handleLogout}><LogOut size={20}/></Button>
          </div>
          
          <div className="p-5 max-w-lg mx-auto pb-24">
            
            <div style={{ display: activeTab === 'home' ? 'block' : 'none' }} className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                {user.role !== 'admin' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden">
                     <div className="absolute top-0 left-0 p-4 opacity-10"><Info size={80} className="text-blue-600"/></div>
                     <h3 className="font-bold text-blue-900 mb-2 relative z-10 flex items-center gap-2"><CheckCircle2 size={18}/> تنبيه هام</h3>
                     <p className="text-sm text-blue-800 leading-relaxed relative z-10 font-medium">يرجى تحديد <strong>جميع</strong> الأوقات المناسبة لك، وليس موعداً واحداً فقط. كلما زادت اختياراتك، زادت فرصة التوافق مع الفريق!</p>
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
                   <DailyScheduler 
                        userId={user.id} 
                        role={user.role} 
                        adminSlots={adminSlots} 
                        themeColor={settings.primaryColor} 
                        bookedSlots={meetings} 
                        onShowToast={showToast} 
                        onTriggerConfirm={triggerConfirm}
                   />
                </div>
            </div>

            {activeTab === 'members' && (
               <div className="animate-in fade-in space-y-4">
                  <div className="flex justify-between items-center px-1"><h2 className="font-bold text-lg">الأعضاء</h2>{user.role === 'admin' && (<button onClick={openAddModal} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-all"><UserPlus size={14}/> إضافة عضو</button>)}</div>
                  {members.length === 0 ? <p className="text-center text-gray-400 py-10">لا يوجد أعضاء، أضف أول عضو!</p> : members.map(m => {
                    const status = getMemberStatus(m.id);
                    return (
                      <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{m.name[0]}</div>
                          <div>
                            <div className="font-bold text-gray-800">{m.name}</div>
                            <div className={`text-[10px] px-2 py-0.5 rounded-md w-fit mt-1 ${status.color}`}>{status.text}</div>
                          </div>
                        </div>
                        {user.role === 'admin' && (
                            <div className="flex gap-2">
                            {status.text === 'تم التحديد' && (<button onClick={() => setInspectMember(m)} className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-100"><Eye size={16}/></button>)}
                            <button onClick={() => openEditModal(m)} className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100"><Pencil size={16}/></button>
                            <button onClick={() => deleteMember(m.id)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={16}/></button>
                            </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            )}

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
                     
                     {/* زر التعديل يظهر فقط للأدمن */}
                     {user.role === 'admin' && (
                        <button onClick={openEditProfile} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold mb-6 hover:bg-gray-200 flex items-center justify-center gap-2 mx-auto">
                            <Edit size={16}/> تعديل بياناتي
                        </button>
                     )}

                     <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right"><p className="text-xs text-gray-400 font-bold mb-2">الفريق</p><div className="flex items-center gap-2 font-bold text-gray-700">{settings.logo && <img src={settings.logo} className="w-6 h-6 rounded-md"/>}{settings.teamName}</div></div>
                     <Button onClick={handleLogout} variant="danger" className="w-full">تسجيل الخروج</Button>
                  </div>
               </div>
            )}

          </div>
          
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-t-[30px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <h3 className="text-xl font-bold mb-6 text-center">{editingMemberId ? 'تعديل البيانات' : 'إضافة عضو جديد'}</h3>
                <div className="space-y-4">
                  <input placeholder="الاسم الكامل" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                  <input placeholder="اسم المستخدم" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500" value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value.replace(/\s/g, '')})} />
                  <input placeholder="كلمة المرور" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500" value={memberForm.password} onChange={e => setMemberForm({...memberForm, password: e.target.value})} />
                  <Button onClick={handleSaveMember} style={{ backgroundColor: settings.primaryColor }} className="w-full mt-2 text-white">{editingMemberId ? 'حفظ التعديلات' : 'إنشاء الحساب'}</Button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-gray-400 font-bold text-sm">إلغاء</button>
              </div>
            </div>
          )}

          {inspectMember && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: settings.primaryColor }}>{inspectMember.name[0]}</div>
                        <div>
                            <h3 className="font-bold text-gray-800 leading-tight">{inspectMember.name}</h3>
                            <p className="text-[10px] text-gray-400">الأوقات المتاحة</p>
                        </div>
                     </div>
                     <button onClick={() => setInspectMember(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100"><X size={18} className="text-gray-500"/></button>
                  </div>
                  <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-gray-50/50">
                     {(() => {
                        const summary = getMemberScheduleSummary(inspectMember.id);
                        if (summary.length === 0) {
                            return (
                                <div className="text-center py-10 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3"><Clock size={32} className="text-gray-300"/></div>
                                    <p className="text-gray-500 font-medium">لم يحدد هذا العضو أي مواعيد</p>
                                </div>
                            );
                        }
                        return summary.map(([date, hours]) => (
                           <div key={date} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                              <div className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-gray-50 pb-2">
                                 <Calendar size={16} className="text-gray-400"/>
                                 {formatDate(new Date(date))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                 {hours.sort((a,b)=>a-b).map(h => (
                                    <span key={h} className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-100">
                                       {formatTime(h)}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        ));
                     })()}
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-white">
                     <button onClick={() => setInspectMember(null)} className="w-full h-12 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50">إغلاق</button>
                  </div>
               </div>
            </div>
          )}

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={user?.role} color={settings.primaryColor} />
        </>
      )}
    </div>
  );
}

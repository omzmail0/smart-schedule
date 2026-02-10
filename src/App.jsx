import React, { useState, useEffect, useRef } from 'react';
import { Trash2, LogOut, Star, Settings, Upload, RotateCcw, Info, CheckCircle2, X, Eye, Check, UserMinus } from 'lucide-react';
import { db } from './utils/firebase';
import { collection, doc, setDoc, updateDoc, getDoc, getDocs, onSnapshot, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { generateId, formatDate, formatTime, isPastTime } from './utils/helpers';

import Button from './components/Button';
import BottomNav from './components/BottomNav';
import DailyScheduler from './components/DailyScheduler';
import AuthScreen from './components/AuthScreen';

const auth = getAuth();

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
  
  const [inspectMember, setInspectMember] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // التحقق من حالة الحساب (Pending vs Active)
                if (userData.status === 'pending') {
                    await signOut(auth);
                    alert("⏳ تم استلام طلبك، بانتظار موافقة المدير.");
                    setUser(null);
                    setView('login');
                } else {
                    setUser({ ...userData, id: currentUser.uid });
                    setView('app');
                }
            }
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // جلب جميع المستخدمين (للمدير) أو الأعضاء النشطين فقط (للباقي)
    const unsubMembers = onSnapshot(collection(db, "users"), (snap) => {
        const allUsers = snap.docs.map(d => d.data()).filter(u => u.role !== 'admin');
        setMembers(allUsers);
    });

    const unsubMeetings = onSnapshot(collection(db, "meetings"), (snap) => setMeetings(snap.docs.map(d => d.data())));
    const unsubSettings = onSnapshot(doc(db, "settings", "main"), (doc) => { if (doc.exists()) setSettings(doc.data()); });
    const unsubAdminAvail = onSnapshot(doc(db, "availability", "admin"), (doc) => { if (doc.exists()) setAdminSlots(doc.data().slots || []); else setAdminSlots([]); });
    const unsubAllAvail = onSnapshot(collection(db, "availability"), (snap) => {
       const data = {};
       snap.forEach(d => { data[d.id] = d.data(); });
       setAvailability(data);
    });

    return () => { unsubMembers(); unsubMeetings(); unsubSettings(); unsubAdminAvail(); unsubAllAvail(); };
  }, [user]);

  const handleAuth = async (isRegistering, formData) => {
    if (!formData.username || !formData.password) return alert("أكمل البيانات");
    const email = `${formData.username}@team.com`;
    
    try {
        if (isRegistering) {
            if (!formData.name) return alert("يرجى كتابة الاسم الكامل");
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
            const uid = userCredential.user.uid;
            // أول مستخدم (admin) يكون نشط تلقائياً، الباقي pending
            const isFirstAdmin = formData.username === 'admin';
            
            await setDoc(doc(db, "users", uid), {
                id: uid,
                name: formData.name, // الاسم الحر (الاسم الكامل)
                username: formData.username,
                role: isFirstAdmin ? 'admin' : 'member',
                status: isFirstAdmin ? 'active' : 'pending', // الحالة الافتراضية معلق
                createdAt: serverTimestamp()
            });
            
            if (isFirstAdmin) {
                alert("تم إنشاء حساب المدير.");
            } else {
                await signOut(auth);
                alert("✅ تم إرسال الطلب! انتظر موافقة المدير.");
            }
        } else {
            await signInWithEmailAndPassword(auth, email, formData.password);
        }
    } catch (error) {
        let msg = "حدث خطأ";
        if (error.code === 'auth/email-already-in-use') msg = "هذا المستخدم مسجل بالفعل";
        if (error.code === 'auth/invalid-credential') msg = "بيانات الدخول غير صحيحة";
        if (error.code === 'auth/weak-password') msg = "كلمة المرور ضعيفة";
        alert(msg);
    }
  };

  const handleLogout = async () => {
      await signOut(auth);
      setUser(null);
      setView('login');
  };

  // وظائف المدير (قبول/رفض الأعضاء)
  const approveMember = async (memberId) => {
      if(!window.confirm("الموافقة على العضو؟")) return;
      await updateDoc(doc(db, "users", memberId), { status: 'active' });
  };

  const deleteMember = async (memberId) => {
      if(!window.confirm("حذف/رفض العضو نهائياً؟")) return;
      await deleteDoc(doc(db, "users", memberId));
      await deleteDoc(doc(db, "availability", memberId)); // حذف جدوله أيضاً
  };

  const saveSettings = async () => { await setDoc(doc(db, "settings", "main"), settings); alert("تم التحديث!"); };
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setSettings({ ...settings, logo: reader.result }); }; reader.readAsDataURL(file); } };

  const analyzeSchedule = async () => {
    if (adminSlots.length === 0) return alert("حدد أوقاتك أولاً");
    const bookedSlotIds = meetings.map(m => m.slot);
    // فقط الأعضاء النشطين يدخلون في التحليل
    const activeMembers = members.filter(m => m.status === 'active');
    
    const suggestions = adminSlots.map(slot => {
      if (bookedSlotIds.includes(slot)) return null; 
      const [y, m, d, h] = slot.split('-');
      if (isPastTime(`${y}-${m}-${d}`, h)) return null;
      const availableMembers = activeMembers.filter(m => (availability[m.id]?.slots || []).includes(slot));
      return { slot, count: availableMembers.length, total: activeMembers.length, names: availableMembers.map(m => m.name) };
    }).filter(Boolean);
    suggestions.sort((a, b) => b.count - a.count);
    setAnalysisResult(suggestions);
  };

  const bookMeeting = async (slot) => { 
      if (!window.confirm("حجز الموعد؟")) return; 
      const id = generateId(); 
      await setDoc(doc(db, "meetings", id), { id, slot, createdAt: serverTimestamp() }); 
      setAnalysisResult(null); 
  };
  const cancelMeeting = async (meetingId) => { if (!window.confirm("إلغاء الاجتماع؟")) return; await deleteDoc(doc(db, "meetings", meetingId)); };
  const resetAllAvailability = async () => { if (!window.confirm("⚠️ تصفير كامل للجداول؟ (لا يمكن التراجع)")) return; const snap = await getDocs(collection(db, "availability")); snap.forEach(d => { deleteDoc(doc(db, "availability", d.id)); }); alert("تم التصفير. ابدأوا من جديد."); };

  const getMemberStatus = (mId) => {
    const userAvail = availability[mId];
    if (!userAvail) return { text: 'لم يدخل', color: 'bg-gray-100 text-gray-400' };
    if (userAvail.status === 'busy') return { text: 'مشغول', color: 'bg-red-100 text-red-600' };
    if (userAvail.slots && userAvail.slots.length > 0) return { text: 'تم التحديد', color: 'bg-green-100 text-green-600' };
    return { text: 'لم يحدد', color: 'bg-yellow-100 text-yellow-600' };
  };

  if (view === 'login') {
    return <AuthScreen onAuth={handleAuth} settings={settings} />;
  }

  // فلترة الأعضاء للعرض
  const pendingMembers = members.filter(m => m.status === 'pending');
  const activeMembers = members.filter(m => m.status === 'active' || !m.status); // ندعم القديم بدون status

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100" dir="rtl">
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

        {activeTab === 'members' && (
           <div className="animate-in fade-in space-y-6">
              
              {/* قسم الطلبات المعلقة (للمدير فقط) */}
              {user.role === 'admin' && pendingMembers.length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-3xl p-4">
                    <h3 className="font-bold text-orange-800 mb-3 px-1 flex items-center gap-2">⏳ طلبات الانضمام ({pendingMembers.length})</h3>
                    <div className="space-y-2">
                        {pendingMembers.map(m => (
                            <div key={m.id} className="bg-white p-3 rounded-2xl flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-gray-800">{m.name}</div>
                                    <div className="text-xs text-gray-400">@{m.username}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => approveMember(m.id)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"><Check size={16}/></button>
                                    <button onClick={() => deleteMember(m.id)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"><X size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* قائمة الأعضاء النشطين */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-3 px-1">الفريق الحالي</h3>
                <div className="space-y-3">
                    {activeMembers.length === 0 ? <p className="text-gray-400 text-center py-4">لا يوجد أعضاء نشطين بعد.</p> : activeMembers.map(m => {
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
                                    {status.text === 'تم التحديد' && (
                                        <button onClick={() => setInspectMember(m)} className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-100"><Eye size={16}/></button>
                                    )}
                                    <button onClick={() => deleteMember(m.id)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={16}/></button>
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
              </div>
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
                 <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right"><p className="text-xs text-gray-400 font-bold mb-2">الفريق</p><div className="flex items-center gap-2 font-bold text-gray-700">{settings.logo && <img src={settings.logo} className="w-6 h-6 rounded-md"/>}{settings.teamName}</div></div>
                 <Button onClick={handleLogout} variant="danger" className="w-full">تسجيل الخروج</Button>
              </div>
           </div>
        )}

      </div>
      
      {inspectMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                 <h3 className="font-bold text-gray-800">جدول: {inspectMember.name}</h3>
                 <button onClick={() => setInspectMember(null)}><X/></button>
              </div>
              <div className="p-4">
                 <DailyScheduler 
                    userId={inspectMember.id} 
                    role="member"
                    readOnlyView={true} 
                    readOnlySlots={availability[inspectMember.id]?.slots || []}
                    themeColor={settings.primaryColor}
                    adminSlots={adminSlots} 
                 />
              </div>
           </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={user?.role} color={settings.primaryColor} />
    </div>
  );
}

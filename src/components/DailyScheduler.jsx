import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight, ChevronLeft, CheckSquare, Ban, Lock, Send, UserX } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../utils/firebase';
import { getStartOfWeek, getWeekDays, getSlotId, isPastTime, formatDate, formatTime, HOURS } from '../utils/helpers';
import Button from './Button';

const DailyScheduler = ({ userId, role, adminSlots = [], onSave, themeColor, bookedSlots = [], readOnlyView = false, readOnlySlots = [] }) => {
  const [selected, setSelected] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date())); 
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [memberDays, setMemberDays] = useState([]); 
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const days = getWeekDays(weekStart);
  const isScheduleFrozen = bookedSlots.length > 0;

  useEffect(() => {
    if (readOnlyView) {
      setSelected(readOnlySlots);
    } else {
      const unsub = onSnapshot(doc(db, "availability", userId), (docSnapshot) => {
        if (docSnapshot.exists() && !hasUnsavedChanges) { 
           setSelected(docSnapshot.data().slots || []);
        }
      });
      return () => unsub();
    }
  }, [userId, readOnlyView]);

  useEffect(() => {
    const today = new Date();
    const todayIdx = days.findIndex(d => d.toDateString() === today.toDateString());
    setActiveDayIndex(todayIdx !== -1 ? todayIdx : 0);
  }, [weekStart]);

  useEffect(() => {
    if (role !== 'admin' && adminSlots.length > 0) {
      const uniqueDates = [...new Set(adminSlots.map(slot => slot.split('-').slice(0, 3).join('-')))];
      const futureDates = uniqueDates.map(dStr => new Date(dStr)).filter(d => d >= new Date().setHours(0,0,0,0)).sort((a, b) => a - b);
      setMemberDays(futureDates);
      setActiveDayIndex(0); 
    }
  }, [adminSlots, role]);

  const daysToShow = role === 'admin' ? days : memberDays;
  const activeDate = daysToShow.length > 0 ? daysToShow[activeDayIndex] || daysToShow[0] : new Date();

  const goToday = () => setWeekStart(getStartOfWeek(new Date()));

  const toggleSlot = (date, hour) => {
    if (readOnlyView) return;
    const slotId = getSlotId(date, hour);
    
    if (bookedSlots.some(m => m.slot === slotId)) return alert("⛔ هذا الموعد تم اعتماده كاجتماع رسمي.");
    if (isScheduleFrozen) return alert("⛔ الجدول مغلق بالكامل لوجود اجتماع مؤكد.");
    if (isPastTime(date, hour)) return alert("لا يمكن تحديد وقت في الماضي!");
    
    const isOwnerAdmin = role === 'admin';
    if (!isOwnerAdmin && adminSlots && !adminSlots.includes(slotId)) return alert("الوقت غير متاح من المدير.");
    
    const newSelected = selected.includes(slotId) ? selected.filter(s => s !== slotId) : [...selected, slotId];
    setSelected(newSelected);
    setHasUnsavedChanges(true);
  };

  const handleInitialSave = () => {
    if (role === 'admin') saveChanges(); 
    else setIsReviewing(true); 
  };
  
  const saveChanges = async () => {
    if (isScheduleFrozen) return;
    try {
      await setDoc(doc(db, "availability", userId), { slots: selected, status: 'active', updatedAt: serverTimestamp() }, { merge: true });
      setHasUnsavedChanges(false);
      if (onSave) onSave();
      if (role === 'admin') alert("✅ تم الحفظ (سحابياً)");
      else {
          setIsReviewing(false);
          setIsSuccess(true);
      }
    } catch (e) { alert("خطأ: " + e.message); }
  };

  const markAsBusy = async () => {
    if (!window.confirm("هل أنت متأكد أنك غير متاح؟")) return;
    try {
      await setDoc(doc(db, "availability", userId), { slots: [], status: 'busy', updatedAt: serverTimestamp() }, { merge: true });
      setSelected([]); 
      setHasUnsavedChanges(false);
      alert("تم الإبلاغ.");
    } catch (e) { alert("خطأ: " + e.message); }
  };

  const groupedSelections = selected.reduce((acc, slot) => {
    const [y, m, d, h] = slot.split('-');
    const dateKey = `${y}-${m}-${d}`;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(h);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      {isScheduleFrozen && !readOnlyView && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>}

      {role === 'admin' && (
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
      )}

      {daysToShow.length > 0 ? (
        <>
          <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar px-1 snap-x">
            {daysToShow.map((d, i) => {
              const dateKey = d.toISOString().split('T')[0];
              const isSelected = activeDayIndex === i;
              const hasData = selected.some(s => s.startsWith(getSlotId(d, 10).slice(0, 10)));
              return (
                <button key={dateKey} onClick={() => setActiveDayIndex(i)}
                  style={{ borderColor: isSelected ? themeColor : 'transparent', backgroundColor: isSelected ? `${themeColor}10` : 'white', color: isSelected ? themeColor : '#9ca3af' }}
                  className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-[18%] aspect-[3/4] rounded-2xl border-2 transition-all shadow-sm`}>
                  <span className="text-[10px] font-bold opacity-80">{formatDate(d).split(' ')[0]}</span>
                  <span className="text-xl font-bold">{d.getDate()}</span>
                  {hasData && <div style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full mt-1"></div>}
                </button>
              );
            })}
          </div>

          <div className={`bg-white rounded-3xl p-5 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-gray-50 min-h-[350px] transition-opacity ${isScheduleFrozen && !readOnlyView ? 'opacity-80' : ''}`}>
            <h4 className="text-center font-bold text-gray-400 mb-6 text-sm">{formatDate(activeDate)}</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {HOURS.map(hour => {
                const slotId = getSlotId(activeDate, hour);
                const isSelected = selected.includes(slotId);
                const isOwnerAdmin = role === 'admin';
                const isAllowed = isOwnerAdmin || (!adminSlots || adminSlots.includes(slotId));
                const isPast = isPastTime(activeDate, hour);
                const isBooked = bookedSlots.some(m => m.slot === slotId);
                
                if (!isOwnerAdmin && !isAllowed && !isBooked) return null;

                let slotStyle = {};
                let slotClass = "bg-gray-50 border-gray-100 text-gray-400";
                
                if (isBooked) {
                  return (
                    <div key={hour} onClick={() => !readOnlyView && toggleSlot(activeDate, hour)} className={`h-14 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border bg-red-50 border-red-200 text-red-500 opacity-90 cursor-not-allowed`}>
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
                } else slotClass = "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50";
                
                if (isScheduleFrozen && !isBooked && !readOnlyView) slotClass += " cursor-not-allowed opacity-60";

                return (
                  <button key={hour} disabled={(isPast || (!isAllowed && !isOwnerAdmin) || isScheduleFrozen) && !readOnlyView} onClick={() => toggleSlot(activeDate, hour)}
                    style={slotStyle} className={`h-14 rounded-2xl text-sm transition-all flex flex-col items-center justify-center border ${slotClass}`}>
                    {formatTime(hour)}
                  </button>
                );
              })}
            </div>
            
            {!HOURS.some(h => role === 'admin' || (adminSlots && adminSlots.includes(getSlotId(activeDate, h)))) && role !== 'admin' && (
               <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                  <Ban size={32} className="mb-2 opacity-20"/>
                  <p className="text-xs">لا توجد مواعيد متاحة في هذا اليوم</p>
               </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
           <div className="text-4xl mb-4">📅</div>
           <p className="font-bold text-gray-600">لا توجد أيام متاحة حالياً</p>
           <p className="text-xs mt-2 text-gray-400">يرجى انتظار المدير لتحديد المواعيد القادمة.</p>
        </div>
      )}

      {role !== 'admin' && daysToShow.length > 0 && !isScheduleFrozen && (
         <div className="fixed bottom-24 left-4 right-4 z-30 flex gap-3">
            <Button onClick={markAsBusy} className="flex-1 bg-red-100 text-red-600 shadow-lg text-xs" style={{ height: 'auto', padding: '12px' }}>
               <UserX size={16}/> غير مناسب لي
            </Button>
            <Button onClick={handleInitialSave} disabled={selected.length === 0 && !hasUnsavedChanges} style={{ backgroundColor: themeColor, flex: 2 }} className="text-white shadow-lg">
               {hasUnsavedChanges ? `حفظ التغييرات (${selected.length})` : `مراجعة (${selected.length})`} 💾
            </Button>
         </div>
      )}
      
      {role === 'admin' && !isScheduleFrozen && (
         <Button variant="float" onClick={saveChanges} disabled={!hasUnsavedChanges} style={{ backgroundColor: hasUnsavedChanges ? themeColor : '#ccc' }} className="text-white transition-colors">
            {hasUnsavedChanges ? 'حفظ التغييرات 💾' : 'تم الحفظ ✅'}
         </Button>
      )}

      {isReviewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[30px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
             <div className="text-center mb-6">
                <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-800">مراجعة اختياراتك</h3>
                <p className="text-gray-400 text-sm">تأكد من تحديد كل الأوقات المناسبة لك</p>
             </div>
             <div className="space-y-4 mb-6">
                {Object.keys(groupedSelections).length === 0 ? <p className="text-center text-red-500 bg-red-50 p-4 rounded-xl">لم تقم باختيار أي موعد!</p> : 
                   Object.entries(groupedSelections).sort().map(([dateStr, hours]) => (
                      <div key={dateStr} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                         <div className="font-bold text-gray-700 mb-2 flex items-center gap-2"><div className="text-sm">📅</div> {formatDate(new Date(dateStr))}</div>
                         <div className="flex flex-wrap gap-2">{hours.sort((a,b)=>a-b).map(h => (<span key={h} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg font-bold text-gray-600">{formatTime(h)}</span>))}</div>
                      </div>
                   ))
                }
             </div>
             <div className="flex gap-3">
                <Button onClick={saveChanges} style={{ backgroundColor: themeColor }} className="flex-1 text-white">تأكيد وإرسال <Send size={16}/></Button>
                <Button onClick={() => setIsReviewing(false)} variant="outline" className="flex-1">رجوع</Button>
             </div>
          </div>
        </div>
      )}

      {isSuccess && (
         <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce"><div className="text-4xl text-green-600">✅</div></div>
            <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">تم التسجيل بنجاح! 🎉</h2>
            <p className="text-center text-gray-500 mb-8 max-w-xs leading-relaxed">شكراً لك. تم حفظ الأوقات التي تناسبك.<br/>بانتظار باقي الزملاء ليعتمد المدير الموعد النهائي.</p>
            <div className="w-full max-w-sm space-y-3"><Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">تعديل المواعيد مرة أخرى</Button></div>
         </div>
      )}
    </div>
  );
};

export default DailyScheduler;

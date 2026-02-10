import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight, ChevronLeft, CheckSquare, Ban, Lock, Send, UserX, Check, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
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
        } else if (!docSnapshot.exists() && !hasUnsavedChanges) {
           setSelected([]); 
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

    if (navigator.vibrate) navigator.vibrate(30);
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

  const groupedSelections = selected.reduce((acc, slot) => {
    const [y, m, d, h] = slot.split('-');
    const dateKey = `${y}-${m}-${d}`;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(h);
    return acc;
  }, {});

  return (
    <div className="pb-40"> 
      
      {isScheduleFrozen && !readOnlyView && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>}

      {role === 'admin' && (
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2">
             <span className="font-bold text-gray-800 text-lg">{formatDate(weekStart).split(',')[1]}</span>
             <button onClick={goToday} className="bg-gray-100 text-xs px-3 py-1.5 rounded-lg text-gray-600 font-bold flex items-center gap-1 hover:bg-gray-200 transition-colors">اليوم <RefreshCw size={12}/></button>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; })} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"><ChevronRight size={20}/></button>
             <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; })} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"><ChevronLeft size={20}/></button>
          </div>
        </div>
      )}

      {daysToShow.length > 0 ? (
        <>
          {/* تم إضافة pt-6 هنا لحل مشكلة القص */}
          <div className="flex overflow-x-auto pt-6 pb-4 gap-3 no-scrollbar px-2 snap-x">
            {daysToShow.map((d, i) => {
              const dateKey = d.toISOString().split('T')[0];
              const isSelected = activeDayIndex === i;
              const hasData = selected.some(s => s.startsWith(getSlotId(d, 10).slice(0, 10)));
              return (
                <button key={dateKey} onClick={() => setActiveDayIndex(i)}
                  style={{ 
                      borderColor: isSelected ? themeColor : 'transparent', 
                      backgroundColor: isSelected ? `${themeColor}10` : 'white', 
                      color: isSelected ? themeColor : '#9ca3af' 
                  }}
                  className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-[18%] aspect-[3/4] rounded-2xl border-2 transition-all duration-200 shadow-sm ${isSelected ? 'scale-110 shadow-lg -translate-y-1' : 'scale-100'}`}>
                  <span className="text-[10px] font-bold opacity-80">{formatDate(d).split(' ')[0]}</span>
                  <span className="text-xl font-bold">{d.getDate()}</span>
                  {hasData && <div style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full mt-1"></div>}
                </button>
              );
            })}
          </div>

          <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[350px] transition-opacity ${isScheduleFrozen && !readOnlyView ? 'opacity-80' : ''}`}>
            <h4 className="text-center font-bold text-gray-400 mb-6 text-sm flex items-center justify-center gap-2">
                <CalendarDays size={16}/>
                {formatDate(activeDate)}
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
              {HOURS.map(hour => {
                const slotId = getSlotId(activeDate, hour);
                const isSelected = selected.includes(slotId);
                const isOwnerAdmin = role === 'admin';
                const isAllowed = isOwnerAdmin || (!adminSlots || adminSlots.includes(slotId));
                const isPast = isPastTime(activeDate, hour);
                const isBooked = bookedSlots.some(m => m.slot === slotId);
                
                if (!isOwnerAdmin && !isAllowed && !isBooked) return null;

                if (isBooked) {
                  return (
                    <div key={hour} className="h-14 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border bg-red-50 border-red-200 text-red-500 opacity-90 cursor-not-allowed">
                        <div className="flex items-center gap-1"><CheckSquare size={12}/> {formatTime(hour)}</div>
                        <span className="text-[9px]">تم الحجز</span>
                    </div>
                  );
                }

                if (isPast) {
                    return (
                        <div key={hour} className="h-14 rounded-2xl flex flex-col items-center justify-center bg-gray-50 text-gray-300 cursor-not-allowed opacity-50">
                            <span className="text-xs font-bold line-through">{formatTime(hour)}</span>
                        </div>
                    );
                }
                
                if (!isAllowed) {
                    return (
                        <div key={hour} className="h-14 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center opacity-40 cursor-not-allowed">
                            <span className="text-xs text-gray-300">غير متاح</span>
                        </div>
                    );
                }

                return (
                  <button 
                    key={hour} 
                    disabled={(isPast || (!isAllowed && !isOwnerAdmin) || isScheduleFrozen) && !readOnlyView} 
                    onClick={() => toggleSlot(activeDate, hour)}
                    style={isSelected ? { 
                        backgroundColor: themeColor, 
                        color: 'white', 
                        boxShadow: `0 8px 16px -4px ${themeColor}60`,
                        transform: 'scale(1.05)'
                    } : {}} 
                    className={`h-14 rounded-2xl text-sm transition-all duration-200 flex flex-col items-center justify-center border relative overflow-hidden group
                        ${isSelected ? 'font-bold border-transparent' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'}
                        ${isScheduleFrozen && !readOnlyView ? 'cursor-not-allowed opacity-60' : ''}
                    `}
                  >
                    {isSelected && <div className="absolute top-1 right-1 opacity-50"><Check size={10} strokeWidth={4}/></div>}
                    <span className="flex items-center gap-1">
                        {!isSelected && <Clock size={12} className="opacity-30"/>}
                        {formatTime(hour)}
                    </span>
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

      {/* شريط الإجراءات السفلي المعدل */}
      {role !== 'admin' && daysToShow.length > 0 && !isScheduleFrozen && (
         <div className="fixed bottom-24 left-0 right-0 z-30 px-4 pointer-events-none">
            <div className="max-w-lg mx-auto flex items-center gap-3 pointer-events-auto">
                
                {/* زر "لا يوجد مواعيد مناسبة" بالنص الكامل */}
                <button 
                    onClick={() => { if(window.confirm("هل أنت متأكد أنك غير متاح؟")){setDoc(doc(db, "availability", userId), { slots: [], status: 'busy', updatedAt: serverTimestamp() }, { merge: true }); setSelected([]); setHasUnsavedChanges(false); alert("تم الإبلاغ."); } }} 
                    className="flex-1 h-14 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-bold text-xs shadow-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                    <UserX size={18}/>
                    <span>لا يوجد مواعيد مناسبة لي</span>
                </button>

                {/* زر الحفظ */}
                <button 
                    onClick={handleInitialSave} 
                    disabled={selected.length === 0 && !hasUnsavedChanges} 
                    style={{ backgroundColor: themeColor }}
                    className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-white font-bold shadow-xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
                >
                    {hasUnsavedChanges ? (
                        <><span>حفظ التغييرات</span> <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">{selected.length}</span></>
                    ) : (
                        <><span>مراجعة واعتماد</span> <CheckCircle2 size={20}/></>
                    )}
                </button>
            </div>
         </div>
      )}
      
      {role === 'admin' && !isScheduleFrozen && (
         <div className="fixed bottom-24 left-0 right-0 z-30 px-4 pointer-events-none">
             <div className="max-w-lg mx-auto pointer-events-auto">
                <Button 
                    onClick={saveChanges} 
                    disabled={!hasUnsavedChanges} 
                    style={{ backgroundColor: hasUnsavedChanges ? themeColor : '#374151' }} 
                    className="w-full h-14 text-lg shadow-xl"
                >
                    {hasUnsavedChanges ? '💾 حفظ التعديلات' : '✅ البيانات محفوظة'}
                </Button>
             </div>
         </div>
      )}

      {isReviewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
             <div className="text-center mb-8 mt-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Send size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1">تأكيد المواعيد</h3>
                <p className="text-gray-400 text-sm">لقد قمت باختيار <strong className="text-gray-800">{selected.length}</strong> ساعة متاحة.</p>
             </div>
             
             <div className="space-y-3 mb-8">
                {Object.keys(groupedSelections).length === 0 ? <p className="text-center text-red-500 bg-red-50 p-4 rounded-xl font-bold">لم تقم باختيار أي موعد!</p> : 
                   Object.entries(groupedSelections).sort().map(([dateStr, hours]) => (
                      <div key={dateStr} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex flex-col gap-3">
                         <div className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                            <CalendarDays size={16} className="text-blue-500"/> 
                            {formatDate(new Date(dateStr))}
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {hours.sort((a,b)=>a-b).map(h => (
                                <span key={h} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-bold text-gray-600 shadow-sm flex items-center gap-1">
                                    {formatTime(h)}
                                </span>
                            ))}
                         </div>
                      </div>
                   ))
                }
             </div>
             
             <div className="flex gap-3">
                <Button onClick={saveChanges} style={{ backgroundColor: themeColor }} className="flex-[2] text-white h-14 text-lg shadow-xl">إرسال للمدير 🚀</Button>
                <button onClick={() => setIsReviewing(false)} className="flex-1 h-14 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50">تعديل</button>
             </div>
          </div>
        </div>
      )}

      {isSuccess && (
         <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 size={64} className="text-green-500"/>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-3">تم الإرسال بنجاح!</h2>
            <p className="text-gray-500 mb-10 max-w-xs leading-relaxed mx-auto">شكراً لك. تم تسجيل الأوقات التي تناسبك.<br/>سيقوم المدير بمراجعة الردود وتحديد الموعد النهائي.</p>
            <div className="w-full max-w-sm space-y-3">
                <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full h-14 border-2">تعديل المواعيد مرة أخرى</Button>
            </div>
         </div>
      )}
    </div>
  );
};

export default DailyScheduler;

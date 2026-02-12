import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ChevronRight, ChevronLeft, CheckSquare, Ban, Lock, Send, UserX, Check, Clock, CalendarDays, CheckCircle2, AlertTriangle, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../utils/firebase';
import { getStartOfWeek, getWeekDays, getSlotId, isPastTime, formatDate, formatTime, HOURS } from '../utils/helpers';
import Button from './Button';

const DailyScheduler = ({ userId, role, adminSlots = [], onSave, themeColor, bookedSlots = [], readOnlyView = false, readOnlySlots = [], onShowToast, onTriggerConfirm }) => {
  const [selected, setSelected] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date())); 
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  
  const [currentStep, setCurrentStep] = useState(0); 
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => { setIsDown(true); setStartX(e.pageX - sliderRef.current.offsetLeft); setScrollLeft(sliderRef.current.scrollLeft); };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; const walk = (x - startX) * 2; sliderRef.current.scrollLeft = scrollLeft - walk; };

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

  const activeDate = days[activeDayIndex];
  const goToday = () => setWeekStart(getStartOfWeek(new Date()));

  const toggleSlot = (slotId) => {
    if (readOnlyView || isScheduleFrozen) return;
    if (bookedSlots.some(m => m.slot === slotId)) return onShowToast("هذا الموعد تم اعتماده مسبقاً", "error");

    const newSelected = selected.includes(slotId) ? selected.filter(s => s !== slotId) : [...selected, slotId];
    setSelected(newSelected);
    setHasUnsavedChanges(true);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const saveChanges = async () => {
    if (isScheduleFrozen) return;
    try {
      await setDoc(doc(db, "availability", userId), { slots: selected, status: 'active', updatedAt: serverTimestamp() }, { merge: true });
      setHasUnsavedChanges(false);
      if (onSave) onSave();
      if (role === 'admin') onShowToast("تم الحفظ بنجاح");
      else { setIsSuccess(true); }
    } catch (e) { onShowToast("حدث خطأ أثناء الحفظ", "error"); }
  };

  const handleMarkBusy = async () => {
        try {
            await setDoc(doc(db, "availability", userId), { slots: [], status: 'busy', updatedAt: serverTimestamp() }, { merge: true });
            setSelected([]); setHasUnsavedChanges(false); setIsSuccess(true);
        } catch(e) { onShowToast(e.message, "error"); }
  };

  const groupedSelections = selected.reduce((acc, slot) => {
    const [y, m, d, h] = slot.split('-'); const dateKey = `${y}-${m}-${d}`;
    if (!acc[dateKey]) acc[dateKey] = []; acc[dateKey].push(h); return acc;
  }, {});

  // --- Render for MEMBER (Wizard Step-by-Step View) ---
  if (role !== 'admin') {
      const sortedAdminSlots = [...adminSlots].sort((a, b) => {
          const dateA = new Date(a.split('-').slice(0,3).join('-') + ' ' + a.split('-')[3] + ':00');
          const dateB = new Date(b.split('-').slice(0,3).join('-') + ' ' + b.split('-')[3] + ':00');
          return dateA - dateB;
      }).filter(slot => {
          const [y, m, d, h] = slot.split('-');
          return !isPastTime(`${y}-${m}-${d}`, h);
      });

      const slotsByDay = sortedAdminSlots.reduce((acc, slot) => {
          const dateStr = slot.split('-').slice(0, 3).join('-');
          if (!acc[dateStr]) acc[dateStr] = [];
          acc[dateStr].push(slot);
          return acc;
      }, {});

      const dayKeys = Object.keys(slotsByDay);
      const totalSteps = dayKeys.length;
      const isFinalStep = currentStep === totalSteps;

      const handleNextStep = () => {
          if (currentStep < totalSteps) {
              const currentDaySlots = slotsByDay[dayKeys[currentStep]];
              const hasSelectedToday = currentDaySlots.some(slot => selected.includes(slot));

              if (!hasSelectedToday) {
                  onTriggerConfirm(
                      "لم تختر أي موعد",
                      "هل أنت متأكد أنك غير متاح طوال هذا اليوم؟",
                      () => setCurrentStep(prev => prev + 1),
                      false 
                  );
              } else {
                  setCurrentStep(prev => prev + 1);
              }
          } else {
              setCurrentStep(prev => prev + 1);
          }
      };

      return (
        <div className="pb-40 animate-in fade-in">
            {isScheduleFrozen && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>}
            
            {dayKeys.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Calendar size={32}/></div>
                    <p className="font-bold text-gray-600">لا توجد مواعيد متاحة حالياً</p>
                    <p className="text-xs mt-2 text-gray-400">يرجى انتظار المدير لتحديد المواعيد.</p>
                </div>
            ) : (
                <>
                    {/* Progress Bar */}
                    <div className="mb-6 px-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                            <span>{isFinalStep ? "المراجعة النهائية" : `يوم ${currentStep + 1} من ${totalSteps}`}</span>
                            <span>{Math.round(((currentStep) / totalSteps) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${((currentStep) / totalSteps) * 100}%`, backgroundColor: themeColor }}
                            ></div>
                        </div>
                    </div>

                    {!isFinalStep ? (
                        // --- Day View ---
                        <div className="animate-in slide-in-from-right-4 duration-300" key={currentStep}>
                            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 min-h-[300px]">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-black text-gray-800">{formatDate(new Date(dayKeys[currentStep]))}</h3>
                                    <p className="text-gray-400 text-xs mt-1">حدد الساعات المناسبة لك في هذا اليوم</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {slotsByDay[dayKeys[currentStep]].map(slot => {
                                        const hour = slot.split('-')[3];
                                        const isSelected = selected.includes(slot);
                                        const isBooked = bookedSlots.some(m => m.slot === slot);
                                        if (isBooked) return null;

                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => toggleSlot(slot)}
                                                disabled={isScheduleFrozen}
                                                className={`relative h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between px-4 ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                                            >
                                                <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>{formatTime(hour)}</span>
                                                {isSelected ? <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3}/></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- Final Step (Smart Review with Summary) ---
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 text-center animate-in zoom-in-95 duration-300">
                            {selected.length > 0 ? (
                                <>
                                    <h3 className="text-2xl font-black text-gray-800 mb-2">مراجعة اختياراتك 🧐</h3>
                                    <p className="text-gray-500 text-sm mb-6">تأكد من المواعيد قبل الإرسال النهائي</p>
                                    
                                    {/* Summary List */}
                                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-right max-h-60 overflow-y-auto space-y-3 border border-gray-100">
                                        {Object.entries(groupedSelections).sort().map(([dateStr, hours]) => (
                                            <div key={dateStr} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                                <div className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                                    <CalendarDays size={14} className="text-blue-500"/>
                                                    {formatDate(new Date(dateStr))}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {hours.sort((a,b)=>a-b).map(h => (
                                                        <span key={h} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                                                            {formatTime(h)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button 
                                        onClick={saveChanges} 
                                        style={{ backgroundColor: themeColor }} 
                                        className="w-full h-14 text-lg shadow-xl text-white"
                                    >
                                        اعتماد وإرسال <CheckCircle2 size={20} className="mr-2"/>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                        <UserX size={40}/>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-800 mb-2">لم تجد وقتاً مناسباً؟</h3>
                                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                        يبدو أن المواعيد المتاحة من المسؤول لا تناسبك نهائياً.<br/>
                                        سيتم تسجيل أنك "مشغول" في هذه الدورة.
                                    </p>
                                    <button 
                                        onClick={handleMarkBusy} 
                                        className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <UserX size={18}/>
                                        تأكيد أني غير متاح
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {!isScheduleFrozen && !isFinalStep && (
                        <div className="fixed bottom-24 left-0 right-0 z-30 px-6 pointer-events-none">
                            <div className="max-w-lg mx-auto flex justify-between items-center pointer-events-auto">
                                <button 
                                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                    disabled={currentStep === 0}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${currentStep === 0 ? 'bg-gray-100 border-transparent text-gray-300 opacity-0' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ArrowRight size={24}/>
                                </button>

                                <button 
                                    onClick={handleNextStep}
                                    style={{ backgroundColor: themeColor }}
                                    className="h-12 px-8 rounded-full text-white font-bold shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                                >
                                    التالي <ArrowLeft size={20}/>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {isSuccess && (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300 text-center">
                    <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce"><CheckCircle2 size={64} className="text-green-500"/></div>
                    <h2 className="text-3xl font-black text-gray-800 mb-3">تم الإرسال بنجاح!</h2>
                    <p className="text-gray-500 mb-10 max-w-xs leading-relaxed mx-auto">
                        {selected.length > 0 ? "شكراً لك. تم تسجيل الأوقات التي تناسبك." : "تم تسجيل أنك غير متاح في هذه المواعيد."}
                    </p>
                    <Button onClick={() => { setIsSuccess(false); setCurrentStep(0); }} variant="outline" className="w-full h-14 border-2">تعديل المواعيد مرة أخرى</Button>
                </div>
            )}
        </div>
      );
  }

  // --- Render for ADMIN (Classic Grid View) ---
  return (
    <div className="pb-40"> 
      {isScheduleFrozen && !readOnlyView && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>}
      
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

      <div className="flex overflow-x-auto pt-6 pb-4 gap-3 no-scrollbar px-2 snap-x cursor-grab active:cursor-grabbing" ref={sliderRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
        {days.map((d, i) => {
            const isSelected = activeDayIndex === i;
            const hasData = selected.some(s => s.startsWith(getSlotId(d, 10).slice(0, 10)));
            return (
            <button key={i} onClick={() => !isDown && setActiveDayIndex(i)} 
                style={{ borderColor: isSelected ? themeColor : 'transparent', backgroundColor: isSelected ? `${themeColor}10` : 'white', color: isSelected ? themeColor : '#9ca3af' }}
                className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-[18%] aspect-[3/4] rounded-2xl border-2 transition-all duration-200 shadow-sm select-none ${isSelected ? 'scale-110 shadow-lg -translate-y-1' : 'scale-100'}`}>
                <span className="text-[10px] font-bold opacity-80">{formatDate(d).split(' ')[0]}</span>
                <span className="text-xl font-bold">{d.getDate()}</span>
                {hasData && <div style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full mt-1"></div>}
            </button>
            );
        })}
      </div>

      <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[350px] transition-opacity ${isScheduleFrozen && !readOnlyView ? 'opacity-80' : ''}`}>
        <h4 className="text-center font-bold text-gray-400 mb-6 text-sm flex items-center justify-center gap-2"><CalendarDays size={16}/> {formatDate(activeDate)}</h4>
        <div className="grid grid-cols-3 gap-3">
            {HOURS.map(hour => {
            const slotId = getSlotId(activeDate, hour);
            const isSelected = selected.includes(slotId);
            const isPast = isPastTime(activeDate, hour);
            const isBooked = bookedSlots.some(m => m.slot === slotId);
            
            if (isBooked) return (<div key={hour} className="h-14 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border bg-red-50 border-red-200 text-red-500 opacity-90 cursor-not-allowed"><div className="flex items-center gap-1"><CheckSquare size={12}/> {formatTime(hour)}</div><span className="text-[9px]">تم الحجز</span></div>);
            if (isPast) return (<div key={hour} className="h-14 rounded-2xl flex flex-col items-center justify-center bg-gray-50 text-gray-300 cursor-not-allowed opacity-50"><span className="text-xs font-bold line-through">{formatTime(hour)}</span></div>);
            
            return (
                <button key={hour} disabled={isScheduleFrozen && !readOnlyView} onClick={() => toggleSlot(slotId)}
                style={isSelected ? { backgroundColor: themeColor, color: 'white', boxShadow: `0 8px 16px -4px ${themeColor}60`, transform: 'scale(1.05)' } : {}} 
                className={`h-14 rounded-2xl text-sm transition-all duration-200 flex flex-col items-center justify-center border relative overflow-hidden group ${isSelected ? 'font-bold border-transparent' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'} ${isScheduleFrozen && !readOnlyView ? 'cursor-not-allowed opacity-60' : ''}`}>
                {isSelected && <div className="absolute top-1 right-1 opacity-50"><Check size={10} strokeWidth={4}/></div>}
                <span className="flex items-center gap-1">{!isSelected && <Clock size={12} className="opacity-30"/>}{formatTime(hour)}</span>
                </button>
            );
            })}
        </div>
      </div>

      {!isScheduleFrozen && (
         <div className="fixed bottom-24 left-0 right-0 z-30 px-4 pointer-events-none">
             <div className="max-w-lg mx-auto pointer-events-auto">
                <Button onClick={saveChanges} disabled={!hasUnsavedChanges} style={{ backgroundColor: hasUnsavedChanges ? themeColor : '#374151' }} className="w-full h-14 text-lg shadow-xl">
                    {hasUnsavedChanges ? 'حفظ التعديلات' : 'البيانات محفوظة'} <CheckCircle2 size={20} className="ml-2"/>
                </Button>
             </div>
         </div>
      )}
    </div>
  );
};

export default DailyScheduler;

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ChevronRight, ChevronLeft, CheckSquare, Lock, Check, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { getStartOfWeek, getWeekDays, getSlotId, isPastTime, formatDate, formatTime, HOURS } from '../../utils/helpers';
import Button from '../Button';

const AdminScheduler = ({ selected, onToggleSlot, onSave, hasChanges, themeColor, bookedSlots }) => {
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date())); 
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const days = getWeekDays(weekStart);
  const activeDate = days[activeDayIndex];
  const isScheduleFrozen = bookedSlots.length > 0;

  useEffect(() => {
    const today = new Date();
    const todayIdx = days.findIndex(d => d.toDateString() === today.toDateString());
    setActiveDayIndex(todayIdx !== -1 ? todayIdx : 0);
  }, [weekStart]);

  const handleMouseDown = (e) => { setIsDown(true); setStartX(e.pageX - sliderRef.current.offsetLeft); setScrollLeft(sliderRef.current.scrollLeft); };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; const walk = (x - startX) * 2; sliderRef.current.scrollLeft = scrollLeft - walk; };

  return (
    <div className="pb-40">
        {isScheduleFrozen && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>}
        
        <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-lg">{formatDate(weekStart).split(',')[1]}</span>
                <button onClick={() => setWeekStart(getStartOfWeek(new Date()))} className="bg-gray-100 text-xs px-3 py-1.5 rounded-lg text-gray-600 font-bold flex items-center gap-1 hover:bg-gray-200 transition-colors">اليوم <RefreshCw size={12}/></button>
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

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[350px]">
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
                    <button key={hour} disabled={isScheduleFrozen} onClick={() => onToggleSlot(slotId)}
                    style={isSelected ? { backgroundColor: themeColor, color: 'white', boxShadow: `0 8px 16px -4px ${themeColor}60`, transform: 'scale(1.05)' } : {}} 
                    className={`h-14 rounded-2xl text-sm transition-all duration-200 flex flex-col items-center justify-center border relative overflow-hidden group ${isSelected ? 'font-bold border-transparent' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'} ${isScheduleFrozen ? 'cursor-not-allowed opacity-60' : ''}`}>
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
                    <Button onClick={onSave} disabled={!hasChanges} style={{ backgroundColor: hasChanges ? themeColor : '#374151' }} className="w-full h-14 text-lg shadow-xl">
                        {hasChanges ? 'حفظ التعديلات' : 'البيانات محفوظة'} <CheckCircle2 size={20} className="ml-2"/>
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminScheduler;

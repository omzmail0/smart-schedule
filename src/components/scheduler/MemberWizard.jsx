import React, { useState } from 'react';
import { Calendar, Lock, CheckCircle2, UserX, ArrowRight, ArrowLeft, Send, Check } from 'lucide-react';
import { formatDate, formatTime, isPastTime } from '../../utils/helpers';
import Button from '../Button';

const MemberWizard = ({ adminSlots, bookedSlots, selected, onToggleSlot, onSave, onMarkBusy, themeColor, onTriggerConfirm }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isScheduleFrozen = bookedSlots.length > 0;

  // 1. Prepare Data
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
              onTriggerConfirm("تنبيه", "لم تختر أي موعد اليوم، هل أنت متأكد؟", () => setCurrentStep(prev => prev + 1), false);
          } else {
              setCurrentStep(prev => prev + 1);
          }
      } else {
          setCurrentStep(prev => prev + 1);
      }
  };

  // الحالة 1: لا توجد مواعيد
  if (dayKeys.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Calendar size={32}/></div>
            <p className="font-bold text-gray-600">لا توجد مواعيد متاحة حالياً</p>
            <p className="text-xs mt-2 text-gray-400">يرجى انتظار المدير لتحديد المواعيد.</p>
        </div>
      );
  }

  // الحالة 2: الجدول مغلق
  if (isScheduleFrozen) {
      return <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2"><Lock size={16}/> الجدول مغلق (يوجد اجتماع مؤكد)</div>;
  }

  // الحالة 3: الـ Wizard
  return (
    <div className="pb-40 animate-in fade-in">
        {/* Progress Bar */}
        <div className="mb-6 px-2">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>{isFinalStep ? "المراجعة النهائية" : `يوم ${currentStep + 1} من ${totalSteps}`}</span>
                <span>{Math.round(((currentStep) / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep) / totalSteps) * 100}%`, backgroundColor: themeColor }}></div>
            </div>
        </div>

        {!isFinalStep ? (
            // Day View
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
                                <button key={slot} onClick={() => onToggleSlot(slot)} className={`relative h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between px-4 ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-gray-100 hover:border-blue-100'}`}>
                                    <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>{formatTime(hour)}</span>
                                    {isSelected ? <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3}/></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        ) : (
            // Review View
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 text-center animate-in zoom-in-95 duration-300">
                {selected.length > 0 ? (
                    <>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600"><Send size={40}/></div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">مراجعة سريعة 🧐</h3>
                        <p className="text-gray-500 text-sm mb-6">لقد اخترت {selected.length} ساعة. تأكد قبل الإرسال.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setCurrentStep(prev => prev - 1)} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"><ArrowRight size={24}/></button>
                            <Button onClick={onSave} style={{ backgroundColor: themeColor }} className="flex-1 h-14 text-lg shadow-xl text-white">تأكيد المواعيد <CheckCircle2 size={20} className="mr-2"/></Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><UserX size={40}/></div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">لم تجد وقتاً مناسباً؟</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">لم تختر أي ساعة. هل تريد تأكيد أنك "مشغول"؟</p>
                        <div className="flex gap-3">
                            <button onClick={() => setCurrentStep(prev => prev - 1)} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"><ArrowRight size={24}/></button>
                            <button onClick={onMarkBusy} className="flex-1 h-14 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"><UserX size={18}/> تأكيد أني مشغول</button>
                        </div>
                    </>
                )}
            </div>
        )}

        {/* Sticky Nav Buttons */}
        {!isFinalStep && (
            <div className="fixed bottom-24 left-0 right-0 z-30 px-6 pointer-events-none">
                <div className="max-w-lg mx-auto flex justify-between items-center pointer-events-auto">
                    <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${currentStep === 0 ? 'bg-gray-100 border-transparent text-gray-300 opacity-0' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}><ArrowRight size={24}/></button>
                    <button onClick={handleNextStep} style={{ backgroundColor: themeColor }} className="h-12 px-8 rounded-full text-white font-bold shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">التالي <ArrowLeft size={20}/></button>
                </div>
            </div>
        )}
    </div>
  );
};

export default MemberWizard;

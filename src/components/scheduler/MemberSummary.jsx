import React from 'react';
import { UserX, CheckCircle2, CalendarDays, Pencil, LogOut } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';
import Button from '../Button';

const MemberSummary = ({ selected, isBusy, themeColor, onEdit, onLogout }) => {
  // تجميع المواعيد للعرض
  const groupedSelections = selected.reduce((acc, slot) => {
    const [y, m, d, h] = slot.split('-'); 
    const dateKey = `${y}-${m}-${d}`;
    if (!acc[dateKey]) acc[dateKey] = []; 
    acc[dateKey].push(h); 
    return acc;
  }, {});

  return (
    <div className="pb-40 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${isBusy ? 'bg-red-50 shadow-red-100' : 'bg-green-50 shadow-green-100'}`}>
                {isBusy ? <UserX size={48} className="text-red-500"/> : <CheckCircle2 size={48} className="text-green-500"/>}
            </div>
            
            <h2 className="text-2xl font-black text-gray-800 mb-2">
                {isBusy ? "أنت غير متاح" : "تم استلام ردك"}
            </h2>
            
            <p className="text-gray-500 text-sm mb-8 font-medium">
                {isBusy 
                    ? "لقد قمت بالإبلاغ أنك مشغول ولا يوجد مواعيد مناسبة لك في هذه الدورة." 
                    : "هذه هي المواعيد التي قمت بتحديدها وإرسالها للمدير:"
                }
            </p>
            
            {!isBusy && selected.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-right max-h-80 overflow-y-auto space-y-3 border border-gray-100">
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
            )}

            <div className="space-y-4">
                <Button onClick={onEdit} style={{ backgroundColor: themeColor }} className="w-full h-14 text-white shadow-xl">
                    <Pencil size={18} className="mr-2"/> تعديل المواعيد
                </Button>
                
                <button 
                    onClick={onLogout} 
                    className="w-full h-14 bg-white border-2 border-red-500 text-red-600 rounded-xl font-bold flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
                >
                    <LogOut size={18} className="mr-2"/> تسجيل الخروج
                </button>
            </div>
        </div>
    </div>
  );
};

export default MemberSummary;

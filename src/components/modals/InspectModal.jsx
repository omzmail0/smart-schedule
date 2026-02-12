import React from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

const InspectModal = ({ member, onClose, primaryColor, availability }) => {
  if (!member) return null;

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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>{member.name[0]}</div>
                <div>
                    <h3 className="font-bold text-gray-800 leading-tight">{member.name}</h3>
                    <p className="text-[10px] text-gray-400">الأوقات المتاحة</p>
                </div>
             </div>
             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100"><X size={18} className="text-gray-500"/></button>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-gray-50/50">
             {(() => {
                const summary = getMemberScheduleSummary(member.id);
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
             <button onClick={onClose} className="w-full h-12 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50">إغلاق</button>
          </div>
       </div>
    </div>
  );
};

export default InspectModal;

import React from 'react';
import { UserPlus, Pencil, Trash2, Copy, Check } from 'lucide-react';

const MembersTab = ({ user, members, availability, openAddModal, openEditModal, deleteMember, setInspectMember }) => {
  const [copiedId, setCopiedId] = React.useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMemberStatus = (mId) => {
    const userAvail = availability[mId];
    if (!userAvail) return { text: 'لم يدخل', color: 'bg-gray-100 text-gray-400' };
    if (userAvail.status === 'busy') return { text: 'مشغول', color: 'bg-red-100 text-red-600' };
    if (userAvail.slots && userAvail.slots.length > 0) return { text: 'تم التحديد', color: 'bg-green-100 text-green-600' };
    return { text: 'لم يحدد', color: 'bg-yellow-100 text-yellow-600' };
  };

  return (
    <div className="animate-in fade-in space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="font-bold text-lg">الأعضاء ({members.length})</h2>
        {user.role === 'admin' && (
          <button onClick={openAddModal} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-all shadow-md">
            <UserPlus size={14}/> إضافة عضو
          </button>
        )}
      </div>

      {members.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300"><UserPlus size={32}/></div>
             <p className="text-gray-400 font-bold">لا يوجد أعضاء، أضف أول متطوع!</p>
          </div>
      ) : members.map(m => {
        const status = getMemberStatus(m.id);
        return (
          <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-gray-500 text-lg border border-gray-100">{m.name[0]}</div>
                <div>
                    <div className="font-bold text-gray-800 text-base">{m.name}</div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-md w-fit mt-1 font-bold ${status.color}`}>{status.text}</div>
                </div>
                </div>
                
                {/* أزرار التحكم */}
                {user.role === 'admin' && (
                    <div className="flex gap-1">
                    <button onClick={() => openEditModal(m)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-colors"><Pencil size={14}/></button>
                    <button onClick={() => deleteMember(m.id)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
            
            {/* منطقة الكود */}
            {user.role === 'admin' && (
                <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                    <div className="text-xs text-gray-400 font-bold">كود الدخول:</div>
                    <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-gray-700 text-lg tracking-widest">{m.accessCode}</span>
                        <button 
                            onClick={() => copyCode(m.accessCode, m.id)} 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${copiedId === m.id ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            title="نسخ الكود"
                        >
                            {copiedId === m.id ? <Check size={14}/> : <Copy size={14}/>}
                        </button>
                    </div>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MembersTab;

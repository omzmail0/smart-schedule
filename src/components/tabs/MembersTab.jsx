import React from 'react';
import { UserPlus, Eye, Pencil, Trash2 } from 'lucide-react';

const MembersTab = ({ user, members, availability, openAddModal, openEditModal, deleteMember, setInspectMember }) => {
  
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
        <h2 className="font-bold text-lg">الأعضاء</h2>
        {user.role === 'admin' && (
          <button onClick={openAddModal} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-all"><UserPlus size={14}/> إضافة عضو</button>
        )}
      </div>
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
  );
};

export default MembersTab;

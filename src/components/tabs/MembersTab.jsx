import React, { useState } from 'react';
import { UserPlus, Pencil, Trash2, Copy, Check, Eye, RefreshCw, Share2, X } from 'lucide-react';

const MembersTab = ({ user, members, availability, openAddModal, openEditModal, deleteMember, setInspectMember, regenerateUserCode }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [isShareMode, setIsShareMode] = useState(false); // ✅ حالة وضع المشاركة

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMemberStatus = (mId) => {
    const userAvail = availability[mId];
    if (userAvail?.status === 'busy') return 'busy';
    if (userAvail?.slots && userAvail.slots.length > 0) return 'submitted';
    return 'pending';
  };

  const categorizedMembers = {
      submitted: [],
      busy: [],
      pending: []
  };

  members.forEach(member => {
      const status = getMemberStatus(member.id);
      categorizedMembers[status].push(member);
  });

  Object.keys(categorizedMembers).forEach(key => {
      categorizedMembers[key].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  });

  const renderSection = (title, list, colorClass) => {
      if (list.length === 0) return null;
      return (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
              <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg w-fit ${colorClass}`}>
                  <span className="font-bold text-xs">{title}</span>
                  <span className="bg-white/60 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[20px] text-center">{list.length}</span>
              </div>
              <div className="space-y-3">
                  {list.map(m => (
                      <MemberCard key={m.id} m={m} statusKey={getMemberStatus(m.id)} />
                  ))}
              </div>
          </div>
      );
  };

  const MemberCard = ({ m, statusKey }) => {
      const statusConfig = {
          submitted: { text: 'تم التحديد', color: 'bg-green-100 text-green-700' },
          busy: { text: 'مشغول', color: 'bg-red-100 text-red-700' },
          pending: { text: 'لم يحدد', color: 'bg-gray-100 text-gray-500' }
      };
      const config = statusConfig[statusKey];

      return (
        <div className={`bg-white p-4 rounded-2xl border ${isShareMode ? 'border-transparent shadow-sm' : 'border-gray-100 shadow-sm'} flex flex-col gap-3 transition-all`}>
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${isShareMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                        {m.name[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-sm">{m.name}</div>
                        {/* في وضع المشاركة، بنخلي حالة 'لم يحدد' بلون أحمر خفيف عشان تبان كتحذير */}
                        <div className={`text-[9px] px-2 py-0.5 rounded-md w-fit mt-1 font-bold ${isShareMode && statusKey === 'pending' ? 'bg-orange-100 text-orange-700' : config.color}`}>
                            {config.text}
                        </div>
                    </div>
                </div>
                
                {/* إخفاء أزرار التحكم في وضع المشاركة */}
                {!isShareMode && user.role === 'admin' && (
                    <div className="flex gap-1">
                        {statusKey === 'submitted' && (
                            <button onClick={() => setInspectMember(m)} className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><Eye size={14}/></button>
                        )}
                        <button onClick={() => openEditModal(m)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => deleteMember(m.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
            
            {/* إخفاء الكود في وضع المشاركة */}
            {!isShareMode && user.role === 'admin' && (
                <div className="bg-gray-50 rounded-xl p-2 flex justify-between items-center border border-gray-100 mt-1">
                    <div className="flex items-center gap-2 pl-2">
                        <button onClick={() => copyCode(m.accessCode, m.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${copiedId === m.id ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                            {copiedId === m.id ? <Check size={12}/> : <Copy size={12}/>}
                        </button>
                        <span className="font-mono font-bold text-gray-600 text-sm tracking-wider">{m.accessCode}</span>
                    </div>
                    <button onClick={() => regenerateUserCode(m.id)} className="text-[9px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors bg-white px-2 py-1 rounded border border-gray-200">
                        <RefreshCw size={10}/> تغيير
                    </button>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className={`animate-in fade-in space-y-4 pb-20 ${isShareMode ? 'pt-2' : ''}`}>
      
      {/* الهيدر: بيختلف حسب الوضع */}
      <div className="flex justify-between items-center px-1 mb-2">
        {isShareMode ? (
            <div className="flex items-center justify-between w-full bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
                <span className="font-bold text-sm pr-2">📸 وضع لقطة الشاشة</span>
                <button onClick={() => setIsShareMode(false)} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors">
                    إلغاء <X size={14}/>
                </button>
            </div>
        ) : (
            <>
                <h2 className="font-bold text-lg text-gray-800">الأعضاء ({members.length})</h2>
                {user.role === 'admin' && (
                    <div className="flex gap-2">
                        {/* زر تفعيل وضع المشاركة */}
                        <button onClick={() => setIsShareMode(true)} className="bg-white border border-gray-200 text-gray-600 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 transition-all shadow-sm" title="وضع المشاركة (إخفاء الأكواد)">
                            <Share2 size={14}/>
                        </button>
                        <button onClick={openAddModal} className="bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-80 transition-all shadow-md active:scale-95">
                            <UserPlus size={14}/> إضافة
                        </button>
                    </div>
                )}
            </>
        )}
      </div>

      {members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><UserPlus size={32}/></div>
             <p className="text-gray-400 font-bold text-sm">القائمة فارغة!</p>
          </div>
      ) : (
          <div className={isShareMode ? "bg-gray-50 p-4 rounded-3xl border border-gray-200" : ""}>
            {renderSection('أنجزوا المهمة', categorizedMembers.submitted, 'bg-green-100 text-green-800')}
            {renderSection('مشغولين', categorizedMembers.busy, 'bg-red-100 text-red-800')}
            {renderSection('في الانتظار', categorizedMembers.pending, 'bg-gray-100 text-gray-600')}
            
            {/* توقيع بسيط في وضع المشاركة */}
            {isShareMode && (
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest">تحديث الحالة</p>
                </div>
            )}
          </div>
      )}
    </div>
  );
};

export default MembersTab;

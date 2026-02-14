import React, { useState } from 'react';
import { UserPlus, Pencil, Trash2, Copy, Check, Eye, RefreshCw, FileText } from 'lucide-react';

const MembersTab = ({ user, members, availability, openAddModal, openEditModal, deleteMember, setInspectMember, regenerateUserCode }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [isReportCopied, setIsReportCopied] = useState(false);

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

  const generateAndCopyReport = () => {
      // ✅ تعديل العنوان ليكون عام وبسيط
      let report = `📝 *متابعة تحديد مواعيد الاجتماع*\n\n`;

      if (categorizedMembers.submitted.length > 0) {
          report += `✅ *تم التحديد (${categorizedMembers.submitted.length}):*\n`;
          categorizedMembers.submitted.forEach(m => report += `• ${m.name}\n`);
          report += `\n`;
      }

      if (categorizedMembers.busy.length > 0) {
          report += `⛔ *مشغولين (${categorizedMembers.busy.length}):*\n`;
          categorizedMembers.busy.forEach(m => report += `• ${m.name}\n`);
          report += `\n`;
      }

      if (categorizedMembers.pending.length > 0) {
          report += `⏳ *في الانتظار (${categorizedMembers.pending.length}):*\n`;
          categorizedMembers.pending.forEach(m => report += `• ${m.name}\n`);
          report += `\n💡 *يا شباب اللي لسه مخلصش، ياريت يدخل ع الموقع بالكود اللي بعتهوله في الخاص ويختار المواعيد المناسبة معاه عشان نلحق نعتمد المعاد.*\n`;
      }

      report += `\nرابط الموقع 👇\nhttps://smart-schedule.vercel.app/`;

      navigator.clipboard.writeText(report);
      setIsReportCopied(true);
      setTimeout(() => setIsReportCopied(false), 3000);
  };

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
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-500 text-base border border-gray-100">
                        {m.name[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-sm">{m.name}</div>
                        <div className={`text-[9px] px-2 py-0.5 rounded-md w-fit mt-1 font-bold ${config.color}`}>
                            {config.text}
                        </div>
                    </div>
                </div>
                
                {user.role === 'admin' && (
                    <div className="flex gap-1">
                        {statusKey === 'submitted' && (
                            <button onClick={() => setInspectMember(m)} className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><Eye size={14}/></button>
                        )}
                        <button onClick={() => openEditModal(m)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => deleteMember(m.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
            
            {user.role === 'admin' && (
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
    <div className="animate-in fade-in space-y-4 pb-20">
      
      <div className="flex justify-between items-center px-1 mb-2">
        <h2 className="font-bold text-lg text-gray-800">الأعضاء ({members.length})</h2>
        {user.role === 'admin' && (
            <div className="flex gap-2">
                <button 
                    onClick={generateAndCopyReport} 
                    className={`border px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${isReportCopied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    title="نسخ تقرير حالة الفريق"
                >
                    {isReportCopied ? <Check size={14}/> : <FileText size={14}/>}
                    {isReportCopied ? 'تم النسخ' : 'تقرير'}
                </button>

                <button onClick={openAddModal} className="bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-80 transition-all shadow-md active:scale-95">
                    <UserPlus size={14}/> إضافة
                </button>
            </div>
        )}
      </div>

      {members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><UserPlus size={32}/></div>
             <p className="text-gray-400 font-bold text-sm">القائمة فارغة!</p>
          </div>
      ) : (
          <>
            {renderSection('أنجزوا المهمة', categorizedMembers.submitted, 'bg-green-100 text-green-800')}
            {renderSection('مشغولين', categorizedMembers.busy, 'bg-red-100 text-red-800')}
            {renderSection('في الانتظار', categorizedMembers.pending, 'bg-gray-100 text-gray-600')}
          </>
      )}
    </div>
  );
};

export default MembersTab;

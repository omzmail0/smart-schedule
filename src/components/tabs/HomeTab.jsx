import React, { useState, useEffect } from 'react';
import { Info, CheckCircle2, Calendar, Zap, Clock, Timer, Trash2, CalendarClock, Eye, Edit2 } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';
import DailyScheduler from '../DailyScheduler';

const MeetingCard = ({ meet, settings, isAdmin, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('upcoming');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const [y, m, d, h] = meet.slot.split('-');
      const meetingDate = new Date(y, m - 1, d, h);
      const now = new Date();
      const diff = meetingDate - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        let text = '';
        if (days > 0) text += `${days} يوم `;
        if (hours > 0) text += `${hours} ساعة `;
        text += `${minutes} دقيقة`;
        setTimeLeft(text);
        setStatus('upcoming');
      } else if (diff > -3600000) {
        setTimeLeft('الاجتماع جارٍ الآن 🔥');
        setStatus('now');
      } else {
        setTimeLeft('انتهى الاجتماع');
        setStatus('finished');
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [meet.slot]);

  const [y, m, d, h] = meet.slot.split('-');
  const meetingDate = new Date(y, m - 1, d);

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: settings.primaryColor }}></div>
      <div className="flex justify-between items-start mb-4 pr-3">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: settings.primaryColor }}>
              <CalendarClock size={24} strokeWidth={1.5}/>
           </div>
           <div>
              <h4 className="font-bold text-gray-800 text-lg leading-tight">اجتماع الفريق</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{formatDate(meetingDate)}</p>
           </div>
        </div>
        <div className="text-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <span className="block text-xl font-black text-gray-800 leading-none">{formatTime(h).split(':')[0]}</span>
            <span className="text-[10px] text-gray-400 font-bold">{formatTime(h).split(' ')[1]}</span>
        </div>
      </div>
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${status === 'now' ? 'bg-green-50 text-green-700' : status === 'finished' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
          <div className="flex items-center gap-2">
             {status === 'upcoming' ? <Timer size={14} className="animate-pulse"/> : <Info size={14}/>}
             <span>{status === 'upcoming' ? 'باقي:' : ''} {timeLeft}</span>
          </div>
          {isAdmin && (
            <button onClick={() => onCancel(meet.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-red-500 shadow-sm border border-red-100 hover:bg-red-50 transition-colors" title="إلغاء الاجتماع">
                <Trash2 size={14}/>
            </button>
          )}
      </div>
    </div>
  );
};

const HomeTab = ({ user, meetings, adminSlots, settings, availability, showToast, triggerConfirm, onLogout, onCancelMeeting }) => {
  const [isEditingMode, setIsEditingMode] = useState(false);

  // التحقق من وجود مواعيد من المشرف
  const hasAdminSlots = adminSlots && adminSlots.length > 0;

  const isMeetingBooked = meetings && meetings.length > 0;
  const userStatus = availability ? availability[user.id] : null;
  const hasSubmitted = userStatus && (userStatus.status === 'busy' || (userStatus.slots && userStatus.slots.length > 0));

  // ✅ تعديل شرط التنبيه: لازم يكون فيه مواعيد متاحة (hasAdminSlots)
  const showAlert = user.role !== 'admin' && !isMeetingBooked && (!hasSubmitted || isEditingMode) && hasAdminSlots;

  const getHeaderContent = () => {
      if (user.role === 'admin') {
          return { icon: <Zap size={18} style={{ color: settings.primaryColor, fill: `${settings.primaryColor}20` }} />, text: "الأوقات المتاحة للفريق" };
      }
      if (isMeetingBooked) {
          return { icon: <Calendar size={18} style={{ color: settings.primaryColor }} />, text: "الجدول الزمني" };
      }
      if (isEditingMode && hasSubmitted) {
          return { icon: <Edit2 size={18} style={{ color: settings.primaryColor }} />, text: "تعديل المواعيد" };
      }
      if (hasSubmitted && !isEditingMode) {
          return { icon: <Eye size={18} style={{ color: settings.primaryColor }} />, text: "ملخص ردك" };
      }
      return { icon: <Clock size={18} style={{ color: settings.primaryColor }} />, text: "حدد أوقات فراغك" };
  };

  const header = getHeaderContent();

  // ✅ شرط لإظهار العنوان: يظهر دائماً للمدير، أو لو فيه اجتماع، أو لو المستخدم بعت رده، أو لو فيه مواعيد متاحة
  const shouldShowHeader = user.role === 'admin' || isMeetingBooked || hasSubmitted || hasAdminSlots;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        
        {showAlert && (
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="absolute top-0 left-0 p-4 opacity-10"><Info size={80} className="text-blue-600"/></div>
             <h3 className="font-bold text-blue-900 mb-2 relative z-10 flex items-center gap-2"><CheckCircle2 size={18}/> تنبيه هام</h3>
             <p className="text-sm text-blue-800 leading-relaxed relative z-10 font-medium">يرجى تحديد <strong>جميع</strong> الأوقات المناسبة لك، وليس موعداً واحداً فقط. كلما زادت اختياراتك، زادت فرصة التوافق!</p>
          </div>
        )}
        
        {isMeetingBooked && (
           <div className="space-y-3">
             <h3 className="font-bold text-gray-800 text-sm px-1 flex items-center gap-2">
                <Calendar size={18} style={{ color: settings.primaryColor }} />
                المواعيد القادمة
             </h3>
             {meetings.map(meet => (
                <MeetingCard key={meet.id} meet={meet} settings={settings} isAdmin={user.role === 'admin'} onCancel={onCancelMeeting}/>
             ))}
           </div>
        )}
        
        <div>
           {/* ✅ إخفاء العنوان لو مفيش مواعيد متاحة (للعضو الجديد) */}
           {shouldShowHeader && (
               <h3 className="font-bold text-gray-800 text-sm mb-3 px-1 flex items-center gap-2 transition-all duration-300">
                   {header.icon}
                   {header.text}
               </h3>
           )}
           <DailyScheduler 
                userId={user.id} 
                role={user.role} 
                adminSlots={adminSlots} 
                themeColor={settings.primaryColor} 
                bookedSlots={meetings} 
                onShowToast={showToast} 
                onTriggerConfirm={triggerConfirm}
                onLogout={onLogout}
                onEditingStateChange={setIsEditingMode}
           />
        </div>
    </div>
  );
};

export default HomeTab;

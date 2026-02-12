import React from 'react';
import { Info, CheckCircle2, Calendar, Zap, Clock } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';
import DailyScheduler from '../DailyScheduler';

const HomeTab = ({ user, meetings, adminSlots, settings, showToast, triggerConfirm, onLogout, onCancelMeeting }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        
        {/* التنبيه (للأعضاء فقط) */}
        {user.role !== 'admin' && (
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden">
             <div className="absolute top-0 left-0 p-4 opacity-10"><Info size={80} className="text-blue-600"/></div>
             <h3 className="font-bold text-blue-900 mb-2 relative z-10 flex items-center gap-2"><CheckCircle2 size={18}/> تنبيه هام</h3>
             <p className="text-sm text-blue-800 leading-relaxed relative z-10 font-medium">يرجى تحديد <strong>جميع</strong> الأوقات المناسبة لك، وليس موعداً واحداً فقط. كلما زادت اختياراتك، زادت فرصة التوافق مع الفريق!</p>
          </div>
        )}
        
        {/* الاجتماعات المؤكدة */}
        {meetings.length > 0 && (
           <div>
             <h3 className="font-bold text-gray-800 text-sm mb-3 px-1 flex items-center gap-2">
                <Calendar size={18} style={{ color: settings.primaryColor }} />
                اجتماعات مؤكدة
             </h3>
             <div className="space-y-3">
               {meetings.map(meet => {
                 const [y, m, d, h] = meet.slot.split('-');
                 return (
                   <div key={meet.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: settings.primaryColor }}><span className="font-bold text-xl">{formatTime(h).split(':')[0]}</span></div>
                        <div><div className="font-bold text-gray-800 text-lg">اجتماع</div><div className="text-sm font-medium text-gray-400">{formatDate(new Date(y, m-1, d))}</div></div>
                     </div>
                     
                     {user.role === 'admin' && (
                        <button 
                            onClick={() => onCancelMeeting(meet.id)} 
                            className="bg-red-50 text-red-500 p-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                            إلغاء
                        </button>
                     )}
                   </div>
                 )
               })}
             </div>
           </div>
        )}
        
        {/* القسم الرئيسي (الجدول) */}
        <div>
           <h3 className="font-bold text-gray-800 text-sm mb-3 px-1 flex items-center gap-2">
               {user.role === 'admin' ? (
                   <>
                    {/* أيقونة موحدة للمدير */}
                    <Zap size={18} style={{ color: settings.primaryColor, fill: `${settings.primaryColor}20` }} /> 
                    الأوقات المتاحة للفريق
                   </>
               ) : (
                   <>
                    {/* أيقونة موحدة للعضو */}
                    <Clock size={18} style={{ color: settings.primaryColor }} /> 
                    حدد أوقات فراغك
                   </>
               )}
           </h3>
           <DailyScheduler 
                userId={user.id} 
                role={user.role} 
                adminSlots={adminSlots} 
                themeColor={settings.primaryColor} 
                bookedSlots={meetings} 
                onShowToast={showToast} 
                onTriggerConfirm={triggerConfirm}
                onLogout={onLogout}
           />
        </div>
    </div>
  );
};

export default HomeTab;

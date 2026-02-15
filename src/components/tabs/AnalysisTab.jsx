import React, { useState } from 'react';
import { Star, UserX, CheckCircle2, Check, FileText, Clock } from 'lucide-react';
import Button from '../Button';
import { formatDate, formatTime } from '../../utils/helpers';

const AnalysisTab = ({ settings, analyzeSchedule, analysisResult, bookMeeting }) => {
  const [isReportCopied, setIsReportCopied] = useState(false);

  const copyAnalysisReport = () => {
      if (!analysisResult || analysisResult.length === 0) return;

      let report = `📊 *نتائج تحليل المواعيد المقترحة*\n\n`;
      const topResults = analysisResult.slice(0, 3);

      topResults.forEach((res, index) => {
          const rank = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
          const date = formatDate(new Date(res.slot.split('-').slice(0,3).join('-')));
          const time = formatTime(res.slot.split('-')[3]);
          
          report += `${rank} *الخيار ${index + 1}:*\n`;
          report += `📅 ${date} - ${time}\n`;
          report += `✅ متاح: ${res.count} من ${res.total}\n`;
          
          if (res.conflictedNames.length > 0) {
              report += `❌ غير مناسب لـ: ${res.conflictedNames.join('، ')}\n`;
          }
          if (res.pendingNames.length > 0) {
              report += `❓ لم يحدد: ${res.pendingNames.join('، ')}\n`;
          }
          if (res.conflictedNames.length === 0 && res.pendingNames.length === 0) {
              report += `✨ *الجميع متاح!*\n`;
          }
          report += `\n`;
      });

      report += `🔗 للمشاركة في التصويت:\nhttps://smart-schedule-liart.vercel.app/`;

      navigator.clipboard.writeText(report);
      setIsReportCopied(true);
      setTimeout(() => setIsReportCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in pb-20">
        
        {!analysisResult ? (
            <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-gray-100 mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${settings.primaryColor}10`, color: settings.primaryColor }}>
                    <Star size={40}/>
                </div>
                <h2 className="font-bold text-xl mb-2 text-gray-800">تحليل المواعيد</h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    اضغط للبحث عن أفضل وقت يجمع أكبر عدد من أعضاء الفريق.
                </p>
                <Button onClick={analyzeSchedule} style={{ backgroundColor: settings.primaryColor }} className="w-full text-white shadow-lg">
                    بدء التحليل
                </Button>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">النتائج المقترحة</h3>
                        <button 
                            onClick={copyAnalysisReport}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isReportCopied ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            title="نسخ تقرير التحليل"
                        >
                            {isReportCopied ? <Check size={14}/> : <FileText size={14}/>}
                        </button>
                    </div>

                    <button onClick={() => analyzeSchedule()} className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        تحديث
                    </button>
                </div>

                {analysisResult.map((res, i) => {
                    const isPerfect = res.count === res.total && res.total > 0;
                    const percent = Math.round((res.count / res.total) * 100) || 0;

                    return (
                        <div key={i} className={`bg-white p-5 rounded-[20px] border transition-all ${isPerfect ? 'border-green-200 shadow-md ring-1 ring-green-100' : 'border-gray-100 shadow-sm'}`}>
                            
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-gray-800 text-base flex items-center gap-2">
                                        {formatDate(new Date(res.slot.split('-').slice(0,3).join('-')))}
                                        {isPerfect && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> مثالي</span>}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 font-medium">
                                        {/* هنا النسبة مبنية على المشاركين فقط */}
                                        تطابق {percent}% ({res.count} من {res.total})
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className="block font-black text-xl leading-none" style={{ color: settings.primaryColor }}>
                                        {formatTime(res.slot.split('-')[3]).split(' ')[0]}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {formatTime(res.slot.split('-')[3]).split(' ')[1]}
                                    </span>
                                </div>
                            </div>

                            {/* غير مناسب (مشغولين + تعارض) */}
                            {!isPerfect && res.conflictedNames.length > 0 && (
                                <div className="mb-2 bg-red-50/50 p-2 rounded-xl border border-red-50">
                                    <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mb-1">
                                        <UserX size={12}/> غير مناسب لـ ({res.conflictedNames.length}):
                                    </p>
                                    <p className="text-xs text-red-600 leading-relaxed font-medium">
                                        {res.conflictedNames.join('، ')}
                                    </p>
                                </div>
                            )}

                            {/* لم يحددوا */}
                            {!isPerfect && res.pendingNames.length > 0 && (
                                <div className="mb-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1">
                                        <Clock size={12}/> لم يحددوا ({res.pendingNames.length}):
                                    </p>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {res.pendingNames.join('، ')}
                                    </p>
                                </div>
                            )}

                            <button 
                                onClick={() => bookMeeting(res.slot, res.conflictedNames)} 
                                className="w-full h-10 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                اعتماد هذا الموعد
                            </button>
                        </div>
                    );
                })}
                
                {analysisResult.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <p>لا يوجد أي توافق حالياً 😔</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default AnalysisTab;

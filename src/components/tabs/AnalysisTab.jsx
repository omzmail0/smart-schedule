import React from 'react';
import { Star } from 'lucide-react';
import Button from '../Button';
import { formatDate, formatTime } from '../../utils/helpers';

const AnalysisTab = ({ settings, analyzeSchedule, analysisResult, bookMeeting }) => {
  return (
    <div className="animate-in fade-in">
        <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-gray-100 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${settings.primaryColor}20`, color: settings.primaryColor }}><Star size={40}/></div>
            <h2 className="font-bold text-xl mb-2">أفضل وقت</h2>
            <p className="text-gray-400 text-sm mb-6">سيتم مقارنة الجداول المتاحة</p>
            <Button onClick={analyzeSchedule} style={{ backgroundColor: settings.primaryColor }} className="w-full text-white">تحليل الآن</Button>
        </div>
        {analysisResult && (
            <div className="space-y-3">
            {analysisResult.map((res, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                    <div><div className="font-bold text-gray-800">{formatDate(new Date(res.slot.split('-').slice(0,3).join('-')))}</div><div className="text-xs text-gray-400 mt-1">{res.count} من {res.total} متاحين</div></div>
                    <div className="flex items-center gap-3"><span className="font-bold text-lg" style={{ color: settings.primaryColor }}>{formatTime(res.slot.split('-')[3])}</span><button onClick={() => bookMeeting(res.slot)} className="bg-black text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-gray-800">حجز</button></div>
                </div>
            ))}
            </div>
        )}
    </div>
  );
};

export default AnalysisTab;

import React, { useEffect } from 'react';
import { User, KeyRound, RefreshCw, Copy, Check } from 'lucide-react';
import Button from '../Button';
import { generateAccessCode } from '../../utils/helpers';

const MemberModal = ({ isOpen, onClose, isEditing, form, setForm, onSave, primaryColor }) => {
  const [copied, setCopied] = React.useState(false);

  // توليد كود مبدئي عند فتح النافذة لإضافة عضو جديد فقط
  useEffect(() => {
      if (isOpen && !isEditing && !form.accessCode) {
          setForm(prev => ({ ...prev, accessCode: generateAccessCode() }));
      }
  }, [isOpen, isEditing]);

  if (!isOpen) return null;

  const handleCopy = () => {
      navigator.clipboard.writeText(form.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const regenerateCode = () => {
      setForm(prev => ({ ...prev, accessCode: generateAccessCode() }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-[30px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <h3 className="text-xl font-black mb-6 text-center text-gray-800">
            {isEditing ? 'تعديل بيانات العضو' : 'إضافة متطوع جديد'}
        </h3>

        <div className="space-y-6">
          
          {/* حقل الاسم */}
          <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">الاسم الكامل</label>
              <div className="relative">
                  <User size={18} className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400"/>
                  <input 
                    placeholder="مثال: أحمد محمد" 
                    className="w-full h-14 pr-12 pl-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500 font-bold text-gray-700" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
              </div>
          </div>

          {/* حقل الكود (للعرض والنسخ فقط، أو التوليد) */}
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-blue-500 flex items-center gap-1"><KeyRound size={14}/> كود الدخول (تلقائي)</label>
                  {!isEditing && (
                      <button onClick={regenerateCode} className="text-[10px] bg-white px-2 py-1 rounded-md text-gray-500 hover:text-blue-600 flex items-center gap-1 shadow-sm">
                          تغيير الكود <RefreshCw size={10}/>
                      </button>
                  )}
              </div>
              
              <div className="flex items-center gap-3">
                  <div className="flex-1 h-12 bg-white rounded-xl flex items-center justify-center font-mono font-black text-2xl text-gray-800 tracking-[0.2em] shadow-sm border border-blue-100">
                      {form.accessCode}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${copied ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                  >
                      {copied ? <Check size={20}/> : <Copy size={20}/>}
                  </button>
              </div>
              <p className="text-[10px] text-blue-400 mt-2 text-center">أرسل هذا الكود للمتطوع ليمكنه الدخول</p>
          </div>

          <Button onClick={onSave} style={{ backgroundColor: primaryColor }} className="w-full h-14 text-white shadow-xl mt-4">
              {isEditing ? 'حفظ التعديلات' : 'إضافة المتطوع'}
          </Button>
        </div>

        <button onClick={onClose} className="w-full mt-4 h-12 rounded-xl text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
      </div>
    </div>
  );
};

export default MemberModal;

import React from 'react';
import Button from '../Button';

const MemberModal = ({ isOpen, onClose, isEditing, form, setForm, onSave, primaryColor }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-[30px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <h3 className="text-xl font-bold mb-6 text-center">{isEditing ? 'تعديل البيانات' : 'إضافة عضو جديد'}</h3>
        <div className="space-y-4">
          <input placeholder="الاسم الكامل" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="اسم المستخدم" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500" value={form.username} onChange={e => setForm({...form, username: e.target.value.replace(/\s/g, '')})} />
          <input placeholder="كلمة المرور" className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-blue-500" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <Button onClick={onSave} style={{ backgroundColor: primaryColor }} className="w-full mt-2 text-white">{isEditing ? 'حفظ التعديلات' : 'إنشاء الحساب'}</Button>
        </div>
        <button onClick={onClose} className="w-full mt-4 text-gray-400 font-bold text-sm">إلغاء</button>
      </div>
    </div>
  );
};

export default MemberModal;

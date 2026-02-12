import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../utils/firebase';
import AdminScheduler from './scheduler/AdminScheduler';
import MemberWizard from './scheduler/MemberWizard';
import MemberSummary from './scheduler/MemberSummary';

const DailyScheduler = ({ userId, role, adminSlots = [], onSave, themeColor, bookedSlots = [], onShowToast, onTriggerConfirm, onLogout }) => {
  const [selected, setSelected] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "availability", userId), (docSnapshot) => {
      if (docSnapshot.exists()) { 
         const data = docSnapshot.data();
         const slots = data.slots || [];
         
         if (!hasUnsavedChanges) {
             setSelected(slots);
             if (data.status === 'active' || data.status === 'busy') {
                 setIsSubmitted(true);
                 setIsBusy(data.status === 'busy');
             } else {
                 setIsSubmitted(false);
                 setIsBusy(false);
             }
         }
      } else if (!docSnapshot.exists() && !hasUnsavedChanges) {
         setSelected([]); 
         setIsSubmitted(false);
         setIsBusy(false);
      }
    });
    return () => unsub();
  }, [userId]);

  const toggleSlot = (slotId) => {
    if (bookedSlots.some(m => m.slot === slotId)) return onShowToast("هذا الموعد تم اعتماده مسبقاً", "error");
    const newSelected = selected.includes(slotId) ? selected.filter(s => s !== slotId) : [...selected, slotId];
    setSelected(newSelected);
    setHasUnsavedChanges(true);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const saveChanges = async () => {
    try {
      const status = selected.length > 0 ? 'active' : 'busy';
      await setDoc(doc(db, "availability", userId), { slots: selected, status: status, updatedAt: serverTimestamp() }, { merge: true });
      setHasUnsavedChanges(false);
      setIsSubmitted(true);
      setIsBusy(status === 'busy');
      if (onSave) onSave();
      onShowToast(role === 'admin' ? "تم الحفظ بنجاح" : "تم إرسال ردك بنجاح");
    } catch (e) { onShowToast("حدث خطأ أثناء الحفظ", "error"); }
  };

  const markBusy = async () => {
        try {
            await setDoc(doc(db, "availability", userId), { slots: [], status: 'busy', updatedAt: serverTimestamp() }, { merge: true });
            setSelected([]); setHasUnsavedChanges(false); setIsSubmitted(true); setIsBusy(true);
            onShowToast("تم تسجيل أنك مشغول");
        } catch(e) { onShowToast(e.message, "error"); }
  };

  // --- التوجيه حسب الدور والحالة ---
  if (role === 'admin') {
      return <AdminScheduler selected={selected} onToggleSlot={toggleSlot} onSave={saveChanges} hasChanges={hasUnsavedChanges} themeColor={themeColor} bookedSlots={bookedSlots} />;
  }

  if (isSubmitted && bookedSlots.length === 0) { 
      return <MemberSummary selected={selected} isBusy={isBusy} themeColor={themeColor} onEdit={() => setIsSubmitted(false)} onLogout={onLogout} />;
  }

  return <MemberWizard 
      adminSlots={adminSlots} 
      bookedSlots={bookedSlots} 
      selected={selected} 
      onToggleSlot={toggleSlot} 
      onSave={saveChanges} 
      onMarkBusy={markBusy} 
      themeColor={themeColor} 
      onTriggerConfirm={onTriggerConfirm} 
      setSelected={setSelected} // ✅ تم تمرير دالة التحديث (الإضافة الوحيدة)
  />;
};

export default DailyScheduler;

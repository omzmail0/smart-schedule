import { useState } from 'react';
import { db } from '../../utils/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, query, where, serverTimestamp } from "firebase/firestore";
import { generateId, generateAccessCode, isPastTime, formatDate, formatTime } from '../../utils/helpers';

export const useActions = (user, data, ui) => {
  const [analysisResult, setAnalysisResult] = useState(null);

  const getUniqueCode = async () => {
      let isUnique = false;
      let finalCode = '';
      while (!isUnique) {
          finalCode = generateAccessCode();
          const q = query(collection(db, "users"), where("accessCode", "==", finalCode));
          const snap = await getDocs(q);
          if (snap.empty) isUnique = true;
      }
      return finalCode;
  };

  const regenerateUserCode = async (targetUserId) => {
      ui.triggerConfirm("تغيير الكود", "سيتم إلغاء الكود القديم نهائياً. هل أنت متأكد؟", async () => {
          try {
              const newCode = await getUniqueCode();
              await setDoc(doc(db, "users", targetUserId), { accessCode: newCode }, { merge: true });
              if (user.id === targetUserId) {
                  const updatedUser = { ...user, accessCode: newCode };
                  localStorage.setItem('smartScheduleUser', JSON.stringify(updatedUser));
                  window.location.reload(); 
              }
              ui.showToast("تم تغيير الكود بنجاح");
          } catch (e) { ui.showToast("حدث خطأ", "error"); }
      }, true);
  };

  const handleSaveMember = async () => {
    if (!ui.memberForm.name) return ui.showToast("يرجى كتابة الاسم", "error");
    try {
        const id = ui.editingMemberId || generateId();
        let finalCode = ui.memberForm.accessCode;
        if (!ui.editingMemberId && !finalCode) {
            finalCode = await getUniqueCode();
        }
        const role = (ui.editingMemberId === 'admin' || (user && user.id === id && user.role === 'admin')) ? 'admin' : 'member';
        const userData = { id, name: ui.memberForm.name, accessCode: finalCode, role: role, createdAt: serverTimestamp() };
        await setDoc(doc(db, "users", id), userData, { merge: true });
        
        if (user && user.id === id) { 
            localStorage.setItem('smartScheduleUser', JSON.stringify(userData));
            window.location.reload();
        }
        ui.setIsModalOpen(false);
        ui.showToast(ui.editingMemberId ? "تم التحديث" : "تم الإضافة");
    } catch (e) { ui.showToast(e.message, "error"); }
  };

  const deleteMember = (memberId) => { 
      ui.triggerConfirm("حذف العضو", "سيتم حذف العضو وجداوله.", async () => {
        await deleteDoc(doc(db, "users", memberId)); await deleteDoc(doc(db, "availability", memberId)); ui.showToast("تم الحذف");
      }, true);
  };

  const saveSettings = async (newSettings) => { await setDoc(doc(db, "settings", "main"), newSettings); ui.showToast("تم التحديث"); };

  const analyzeSchedule = () => {
    if (data.adminSlots.length === 0) return ui.showToast("حدد الأوقات المتاحة أولاً", "error");
    const bookedSlotIds = data.meetings.map(m => m.slot);
    
    const respondedMembersCount = data.members.filter(m => {
        const userAvail = data.availability[m.id];
        return userAvail && (userAvail.status === 'busy' || (userAvail.slots && userAvail.slots.length > 0));
    }).length;

    const suggestions = data.adminSlots.map(slot => {
      if (bookedSlotIds.includes(slot)) return null; 
      const [y, m, d, h] = slot.split('-');
      if (isPastTime(`${y}-${m}-${d}`, h)) return null;
      
      const availableNames = [];
      const conflictedNames = [];
      const pendingNames = [];

      data.members.forEach(m => {
          const userAvail = data.availability[m.id];
          const hasResponded = userAvail && (userAvail.status === 'busy' || (userAvail.slots && userAvail.slots.length > 0));

          if (!hasResponded) {
              pendingNames.push(m.name); 
          } else if ((userAvail.slots || []).includes(slot)) {
              availableNames.push(m.name); 
          } else {
              conflictedNames.push(m.name); 
          }
      });

      availableNames.sort((a,b) => a.localeCompare(b, 'ar'));
      conflictedNames.sort((a,b) => a.localeCompare(b, 'ar'));
      pendingNames.sort((a,b) => a.localeCompare(b, 'ar'));

      return { slot, count: availableNames.length, total: respondedMembersCount, names: availableNames, conflictedNames, pendingNames };
    }).filter(Boolean);

    suggestions.sort((a, b) => b.count - a.count);
    setAnalysisResult(suggestions);
  };

  const bookMeeting = (slot, conflictedNames = []) => { 
      const msg = `📣 *بصوا بقى يا جماعة..*\n\nتوكلنا على الله واعتمدنا ميعاد الاجتماع الجاي:\n\n🗓 ${formatDate(new Date(slot.split('-').slice(0,3).join('-')))}\n⏱ ${formatTime(slot.split('-')[3])}\n\n${conflictedNames.length > 0 ? `👀 *بالنسبة لـ (${conflictedNames.join('، ')}):*\nمعلش بقى المرة دي جت عليكم عشان خاطر الأغلبية 😄.. حاولوا تحضرو لو عرفتوا،\n\n` : ''}يلا نجهز نفسنا.. أشوفكم على خير 👋`;

      ui.triggerConfirm("تأكيد الحجز", "سيتم نسخ رسالة الاعتماد للمجموعة. هل أنت متأكد؟", async () => {
        navigator.clipboard.writeText(msg); 
        const id = generateId(); 
        await setDoc(doc(db, "meetings", id), { id, slot, createdAt: serverTimestamp() }); 
        setAnalysisResult(null); 
        ui.showToast("تم الاعتماد ونسخ الرسالة");
      });
  };

  const cancelMeeting = (meetingId) => { 
      ui.triggerConfirm("إلغاء", "تأكيد الإلغاء؟", async () => { await deleteDoc(doc(db, "meetings", meetingId)); ui.showToast("تم الإلغاء"); }, true);
  };

  const resetAllAvailability = () => { 
      ui.triggerConfirm("تصفير", "مسح كل الجداول؟", async () => {
        const snap = await getDocs(collection(db, "availability")); const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "availability", d.id))); await Promise.all(deletePromises); ui.showToast("تم التصفير");
      }, true);
  };

  return { analysisResult, regenerateUserCode, handleSaveMember, deleteMember, saveSettings, analyzeSchedule, bookMeeting, cancelMeeting, resetAllAvailability };
};

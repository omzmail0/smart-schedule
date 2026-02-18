import { useEffect } from 'react';
import { useUI } from './logic/useUI';
import { useFirebase } from './logic/useFirebase';
import { useAuth } from './logic/useAuth';
import { useUserData } from './logic/useUserData';
import { useActions } from './logic/useActions';

export const useAppLogic = () => {
  const ui = useUI();
  const firebaseData = useFirebase(ui);
  const auth = useAuth(firebaseData.settings, ui, firebaseData.isLoading);
  const userData = useUserData(auth.user);
  
  // دمج كل البيانات في كائن واحد للأكشنز
  const allData = { 
      settings: firebaseData.settings, 
      setSettings: firebaseData.setSettings,
      adminSlots: firebaseData.adminSlots,
      members: userData.members,
      meetings: userData.meetings,
      availability: userData.availability
  };

  const actions = useActions(auth.user, allData, ui);

  // تأثير تغيير الخط (هنا أو في App.jsx مش هتفرق، بس خليه هنا للتنظيم)
  // لكننا بالفعل نقلناه لـ App.jsx في التحديث اللي فات وده الأصح.

  return {
    // UI
    ...ui,
    
    // Data
    isLoading: firebaseData.isLoading,
    user: auth.user,
    settings: firebaseData.settings,
    setSettings: firebaseData.setSettings,
    adminSlots: firebaseData.adminSlots,
    members: userData.members,
    meetings: userData.meetings,
    availability: userData.availability,
    
    // Results
    analysisResult: actions.analysisResult,

    // Actions
    handleLogin: auth.handleLogin,
    handleLogout: auth.handleLogout,
    finishOnboarding: auth.finishOnboarding,
    
    handleSaveMember: actions.handleSaveMember,
    deleteMember: actions.deleteMember,
    saveSettings: actions.saveSettings,
    analyzeSchedule: actions.analyzeSchedule,
    bookMeeting: actions.bookMeeting,
    cancelMeeting: actions.cancelMeeting,
    resetAllAvailability: actions.resetAllAvailability,
    regenerateUserCode: actions.regenerateUserCode
  };
};

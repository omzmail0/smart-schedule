import React from 'react';
import { useAppLogic } from './hooks/useAppLogic';

// Components
import SplashScreen from './components/common/SplashScreen'; // 1. استيراد شاشة التحميل
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import BottomNav from './components/BottomNav';
import Header from './components/common/Header';
import Toast from './components/common/Toast';
import ConfirmModal from './components/common/ConfirmModal';

// Tabs & Modals
import HomeTab from './components/tabs/HomeTab';
import MembersTab from './components/tabs/MembersTab';
import SettingsTab from './components/tabs/SettingsTab';
import AnalysisTab from './components/tabs/AnalysisTab';
import ProfileTab from './components/tabs/ProfileTab';
import MemberModal from './components/modals/MemberModal';
import InspectModal from './components/modals/InspectModal';

export default function App() {
  const logic = useAppLogic();

  // 2. شرط التحميل: لو بيحمل، اعرض السبلاش سكرين بس
  if (logic.isLoading) {
      return <SplashScreen />;
  }

  const openAddModal = () => { logic.setMemberForm({ name: '', username: '', password: '' }); logic.setEditingMemberId(null); logic.setIsModalOpen(true); };
  const openEditModal = (member) => { logic.setMemberForm({ name: member.name, username: member.username, password: member.password }); logic.setEditingMemberId(member.id); logic.setIsModalOpen(true); };
  const openEditProfile = () => { logic.setMemberForm({ name: logic.user.name, username: logic.user.username, password: logic.user.password }); logic.setEditingMemberId(logic.user.id); logic.setIsModalOpen(true); };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100" dir="rtl">
      {logic.toast && <Toast message={logic.toast.message} type={logic.toast.type} onClose={() => logic.setToast(null)} />}
      
      <ConfirmModal 
        isOpen={!!logic.confirmData} 
        title={logic.confirmData?.title} 
        message={logic.confirmData?.message} 
        isDestructive={logic.confirmData?.isDestructive}
        onConfirm={() => { logic.confirmData.action(); logic.setConfirmData(null); }} 
        onCancel={() => logic.setConfirmData(null)} 
      />

      {logic.view === 'landing' ? (
          <LandingPage onStart={logic.onStart} settings={logic.settings} adminSlots={logic.adminSlots} />
      ) : logic.view === 'login' ? (
          <AuthScreen onLogin={logic.handleLogin} settings={logic.settings} onBack={logic.onBackToLanding} onShowToast={logic.showToast} />
      ) : (
        <>
          <Header user={logic.user} settings={logic.settings} onLogout={logic.handleLogout} />
          
          <div className="p-5 max-w-lg mx-auto pb-24">
            {logic.activeTab === 'home' && <HomeTab user={logic.user} meetings={logic.meetings} adminSlots={logic.adminSlots} settings={logic.settings} showToast={logic.showToast} triggerConfirm={logic.triggerConfirm} onLogout={logic.handleLogout} />}
            {logic.activeTab === 'members' && <MembersTab user={logic.user} members={logic.members} availability={logic.availability} openAddModal={openAddModal} openEditModal={openEditModal} deleteMember={logic.deleteMember} setInspectMember={logic.setInspectMember} />}
            {logic.activeTab === 'settings' && logic.user.role === 'admin' && <SettingsTab settings={logic.settings} setSettings={logic.setSettings} saveSettings={logic.saveSettings} resetAllAvailability={logic.resetAllAvailability} />}
            {logic.activeTab === 'analysis' && <AnalysisTab settings={logic.settings} analyzeSchedule={logic.analyzeSchedule} analysisResult={logic.analysisResult} bookMeeting={logic.bookMeeting} />}
            {logic.activeTab === 'profile' && <ProfileTab user={logic.user} settings={logic.settings} openEditProfile={openEditProfile} handleLogout={logic.handleLogout} />}
          </div>
          
          <MemberModal isOpen={logic.isModalOpen} onClose={() => logic.setIsModalOpen(false)} isEditing={!!logic.editingMemberId} form={logic.memberForm} setForm={logic.setMemberForm} onSave={logic.handleSaveMember} primaryColor={logic.settings.primaryColor} />
          <InspectModal member={logic.inspectMember} onClose={() => logic.setInspectMember(null)} primaryColor={logic.settings.primaryColor} availability={logic.availability} />
          <BottomNav activeTab={logic.activeTab} setActiveTab={logic.setActiveTab} role={logic.user?.role} color={logic.settings.primaryColor} />
        </>
      )}
    </div>
  );
}

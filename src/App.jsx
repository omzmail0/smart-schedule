import React, { useEffect } from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import SplashScreen from './components/common/SplashScreen';
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import MaintenanceScreen from './components/MaintenanceScreen';
import NotFound from './components/NotFound';
import OfflineBanner from './components/common/OfflineBanner';
import BottomNav from './components/BottomNav';
import Header from './components/common/Header';
import Toast from './components/common/Toast';
import ConfirmModal from './components/common/ConfirmModal';
import HomeTab from './components/tabs/HomeTab';
import MembersTab from './components/tabs/MembersTab';
import SettingsTab from './components/tabs/SettingsTab';
import AnalysisTab from './components/tabs/AnalysisTab';
import ProfileTab from './components/tabs/ProfileTab';
import MemberModal from './components/modals/MemberModal';
import InspectModal from './components/modals/InspectModal';

export default function App() {
  const logic = useAppLogic();

  // ✅ التعديل الحاسم: لو الصفحة 404، اعرضها فوراً حتى لو لسه بنحمل
  if (logic.view === '404') {
      return <NotFound />;
  }

  // ✅ تطبيق الخط فوراً
  useEffect(() => {
    if (logic.settings.fontFamily) {
      document.documentElement.style.setProperty('--app-font', `"${logic.settings.fontFamily}", sans-serif`);
    }
  }, [logic.settings.fontFamily]);

  if (logic.isLoading) return <SplashScreen />;

  const openAddModal = () => { logic.setMemberForm({ name: '', accessCode: '' }); logic.setEditingMemberId(null); logic.setIsModalOpen(true); };
  const openEditModal = (member) => { logic.setMemberForm({ name: member.name, accessCode: member.accessCode }); logic.setEditingMemberId(member.id); logic.setIsModalOpen(true); };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100" dir="rtl">
      <OfflineBanner />

      {logic.toast && <Toast message={logic.toast.message} type={logic.toast.type} onClose={() => logic.setToast(null)} />}
      
      <ConfirmModal 
        isOpen={!!logic.confirmData} 
        title={logic.confirmData?.title} 
        message={logic.confirmData?.message} 
        isDestructive={logic.confirmData?.isDestructive}
        onConfirm={() => { logic.confirmData.action(); logic.setConfirmData(null); }} 
        onCancel={() => logic.setConfirmData(null)} 
      />

      {/* باقي الحالات */}
      {logic.view === 'maintenance' ? (
          <MaintenanceScreen settings={logic.settings} />
      ) : logic.view === 'landing' ? (
          <AuthScreen onLogin={logic.handleLogin} settings={logic.settings} onShowToast={logic.showToast} />
      ) : logic.view === 'onboarding' ? (
          <OnboardingScreen onFinish={logic.finishOnboarding} settings={logic.settings} user={logic.user} />
      ) : (
        <>
          <Header user={logic.user} settings={logic.settings} onLogout={logic.handleLogout} />
          
          <div className="p-5 max-w-lg mx-auto pb-24">
            {logic.activeTab === 'home' && (
                <HomeTab 
                    user={logic.user} 
                    meetings={logic.meetings} 
                    adminSlots={logic.adminSlots} 
                    settings={logic.settings} 
                    availability={logic.availability} 
                    showToast={logic.showToast} 
                    triggerConfirm={logic.triggerConfirm} 
                    onLogout={logic.handleLogout} 
                    onCancelMeeting={logic.cancelMeeting} 
                />
            )}
            
            {logic.activeTab === 'members' && (
                <MembersTab 
                    user={logic.user} 
                    members={logic.members} 
                    availability={logic.availability} 
                    openAddModal={openAddModal} 
                    openEditModal={openEditModal} 
                    deleteMember={logic.deleteMember} 
                    setInspectMember={logic.setInspectMember}
                    regenerateUserCode={logic.regenerateUserCode}
                />
            )}
            {logic.activeTab === 'settings' && logic.user.role === 'admin' && <SettingsTab settings={logic.settings} setSettings={logic.setSettings} saveSettings={logic.saveSettings} resetAllAvailability={logic.resetAllAvailability} />}
            {logic.activeTab === 'analysis' && <AnalysisTab settings={logic.settings} analyzeSchedule={logic.analyzeSchedule} analysisResult={logic.analysisResult} bookMeeting={logic.bookMeeting} />}
            {logic.activeTab === 'profile' && (
                <ProfileTab 
                    user={logic.user} 
                    settings={logic.settings} 
                    handleLogout={logic.handleLogout} 
                    regenerateUserCode={logic.regenerateUserCode} 
                />
            )}
          </div>
          
          <MemberModal isOpen={logic.isModalOpen} onClose={() => logic.setIsModalOpen(false)} isEditing={!!logic.editingMemberId} form={logic.memberForm} setForm={logic.setMemberForm} onSave={logic.handleSaveMember} primaryColor={logic.settings.primaryColor} />
          <InspectModal member={logic.inspectMember} onClose={() => logic.setInspectMember(null)} primaryColor={logic.settings.primaryColor} availability={logic.availability} />
          <BottomNav activeTab={logic.activeTab} setActiveTab={logic.setActiveTab} role={logic.user?.role} color={logic.settings.primaryColor} />
        </>
      )}
    </div>
  );
}

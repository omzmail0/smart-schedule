import { useState, useEffect } from 'react';

export const useUI = () => {
  const [view, setView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', accessCode: '' });
  const [inspectMember, setInspectMember] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const showToast = (message, type = 'success') => {
      setToast(null);
      setTimeout(() => setToast({ message, type }), 100);
  };

  const triggerConfirm = (title, message, action, isDestructive = false) => {
      setConfirmData({ title, message, action, isDestructive });
  };

  // Scroll to top on view change
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [activeTab, view]);

  return {
    view, setView,
    activeTab, setActiveTab,
    isModalOpen, setIsModalOpen,
    editingMemberId, setEditingMemberId,
    memberForm, setMemberForm,
    inspectMember, setInspectMember,
    toast, setToast,
    confirmData, setConfirmData,
    showToast, triggerConfirm
  };
};

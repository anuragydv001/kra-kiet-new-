"use client";

import React from 'react';
import { useApp } from '../context/AppContext';

export default function SharedSidebar({
  onOpenSplitScreen,
}: {
  onOpenSplitScreen?: (kraCode: string) => void;
}) {
  const {
    role,
    setRole,
    currentDept,
    activeNavTab,
    setActiveNavTab,
    submissions,
    kras,
    openTimelineModal,
    showToast,
  } = useApp();

  const firstAssignedKra = kras.find((k) => k.assignedDepts.includes(currentDept));

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'Submitted').length;
  const deanPendingCount = submissions.filter(
    (s) => s.dept === currentDept && s.status !== 'Approved'
  ).length;

  const vcTabs = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'KRA Management', icon: 'assignment' },
    { label: 'Submissions', icon: 'fact_check', badge: pendingSubmissionsCount },
    { label: 'Reports', icon: 'analytics' },
    { label: 'Announcements', icon: 'campaign' },
  ];

  const deanTabs = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'My KRAs', icon: 'assignment' },
    { label: 'Submissions', icon: 'history', badge: deanPendingCount },
  ];

  const currentTabs = role === 'vc' ? vcTabs : deanTabs;

  const handleTabClick = (label: string) => {
    setActiveNavTab(label);
  };

  const handleRoleToggle = () => {
    if (role === 'vc') {
      setRole('dean');
      showToast(`Switched to ${currentDept} Dean Workspace`);
    } else {
      setRole('vc');
      showToast('Switched to VC Super Admin Workspace');
    }
    setActiveNavTab('Dashboard');
  };

  return (
    <aside className="fixed left-0 top-24 sm:top-24 bottom-0 w-64 flex flex-col justify-between border-r border-[#c5c5d3]/70 bg-white p-4 overflow-y-auto z-30 shadow-xs">
      <div className="space-y-4">
        {/* Header Info Card */}
        <div className="p-3 bg-[#e5eeff] rounded-lg border border-[#c5c5d3]/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            KIET
          </div>
          <div className="overflow-hidden">
            <h2 className="text-[14px] font-bold text-[#00236f] truncate leading-tight">
              {role === 'vc' ? 'KIET Governance' : `${currentDept} Department`}
            </h2>
            <p className="text-[11px] text-[#515f74] truncate">
              {role === 'vc' ? 'Academic Year 2025-2026' : 'Dean Performance Desk'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {currentTabs.map((tab) => {
            const isActive = activeNavTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => handleTabClick(tab.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#d5e3fc] text-[#0d1c2e] font-bold shadow-xs'
                    : 'text-[#515f74] hover:bg-[#e5eeff]/50 hover:text-[#0b1c30] text-[13px] font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#00236f]' : 'text-[#515f74]'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="bg-[#00236f] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer of Sidebar */}
      <div className="space-y-2 pt-4 border-t border-[#c5c5d3]/70">
        <button
          onClick={() => {
            if (role !== 'dean') {
              setRole('dean');
            }
            if (onOpenSplitScreen) {
              onOpenSplitScreen('KRA 07');
            }
          }}
          className="w-full text-center py-2 px-3 bg-[#00236f] text-white font-semibold rounded text-xs hover:bg-[#001b55] transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">rate_review</span>
          <span>Open KRA 7 Report Builder</span>
        </button>

        {role === 'dean' && firstAssignedKra && onOpenSplitScreen && (
          <button
            onClick={() => onOpenSplitScreen(firstAssignedKra.code)}
            className="w-full text-center py-2 px-3 bg-white text-[#00236f] font-semibold rounded text-xs hover:bg-[#e5eeff] transition flex items-center justify-center gap-2 border border-[#c5c5d3]"
          >
            <span className="material-symbols-outlined text-[16px]">edit_document</span>
            <span>Open KRA Workspace</span>
          </button>
        )}

        <button
          onClick={handleRoleToggle}
          className="w-full text-center py-2 px-3 bg-[#d5e3fc] text-[#00236f] font-semibold rounded text-xs hover:bg-[#c3d7f8] transition flex items-center justify-center gap-2 border border-blue-200"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          <span>{role === 'vc' ? `Switch to Dean (${currentDept})` : 'Switch to VC Portal'}</span>
        </button>

        <button
          onClick={() => openTimelineModal()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#515f74] hover:bg-[#e5eeff]/50 hover:text-[#0b1c30] transition text-[13px] font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>Audit Trail</span>
        </button>

        <button
          onClick={() => showToast('IQAC Technical Helpdesk: ext. 402 / support.kra@kiet.edu')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#515f74] hover:bg-[#e5eeff]/50 hover:text-[#0b1c30] transition text-[13px] font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">support</span>
          <span>Help Desk</span>
        </button>
      </div>
    </aside>
  );
}

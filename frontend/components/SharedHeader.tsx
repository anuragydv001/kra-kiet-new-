"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import NotificationPanel from './NotificationPanel';

export default function SharedHeader() {
  const {
    role,
    currentDept,
    departments,
    announcements,
    notifications,
    openTimelineModal,
    setActiveNavTab,
    showToast,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const currentDeptInfo = departments.find(d => d.code === currentDept);
  const relevantAnnouncements = announcements.filter(a =>
    role === 'vc' ? true : a.targetDepts.includes(currentDept)
  );
  /** Dean notifications: only those addressed to the current department. */
  const deanNotifications = notifications.filter((n) => n.targetDepts.includes(currentDept));
  const unreadCount = deanNotifications.filter((n) => !n.read).length;

  const userName = role === 'vc' ? 'Prof. (Dr.) Preetvanti Singh' : currentDeptInfo?.deanName || 'Department Dean';
  const userSub = role === 'vc' ? 'Vice Chancellor' : `Dean, ${currentDeptInfo?.name || currentDept}`;
  const userInitials = role === 'vc' ? 'VC' : currentDept.slice(0, 2);

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 border-b border-[#c5c5d3]/70 bg-white sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-4">
        {/* KIET Crest */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="KIET Deemed to be University Official Crest"
            className="h-11 object-contain max-w-[210px]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYR3AESqFXbqAe_wFp8-DV3685msef1jOEjYxsVQyydzdH2BG0xvkRbhcVd0hhTKi9n6KuvsakEDkpffLNFBG8J9xje6t8z_nBdz-QoAmVQP6vMmiddz4jMnMGsdnFPPT_CGTubzTfKQ2ssZlnB_T9qEq6YTUnnTesmoDM0bAqcivhZSsh9sDO9iyeqIettXEk5wkgMGqAy9-TPrdkkxSiXaLrNCYOwI-6KXka2qIANVSp3wM51B27e1Ok76M4L9gxew"
            onError={(e) => {
              // Fallback styling if external image is unreachable
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
          <div className="h-8 w-px bg-slate-300 hidden sm:block"></div>
        </div>

        <div className="hidden md:flex flex-col">
          <h1 className="text-[16px] font-bold text-[#00236f] tracking-tight leading-tight">
            KIET University KRA Portal
          </h1>
          <span className="text-[11px] text-[#515f74] font-medium">
            Accreditation & Quality Assurance Directorate (NAAC &apos;A+&apos; & NBA Tier-1)
          </span>
        </div>
      </div>

      {/* Central Navigation Links (Desktop) */}
      <nav className="hidden lg:flex items-center space-x-1">
        <button
          onClick={() => setActiveNavTab('Dashboard')}
          className="px-3 py-2 border-b-2 border-[#00236f] text-[#00236f] font-semibold text-[13px] transition-all"
        >
          Dashboard
        </button>
        <button
          onClick={() => {
            setActiveNavTab(role === 'vc' ? 'KRA Management' : 'My KRAs');
            showToast('Loading university KRA repository');
          }}
          className="px-3 py-2 border-b-2 border-transparent text-[#515f74] hover:text-[#0b1c30] text-[13px] font-medium transition-all"
        >
          KRA Monitor
        </button>
        <button
          onClick={() => openTimelineModal()}
          className="px-3 py-2 border-b-2 border-transparent text-[#515f74] hover:text-[#0b1c30] text-[13px] font-medium transition-all"
        >
          Audit Records
        </button>
        <button
          onClick={() => showToast("Institutional NAAC A+ & NBA Compliance records loaded.")}
          className="px-3 py-2 border-b-2 border-transparent text-[#515f74] hover:text-[#0b1c30] text-[13px] font-medium transition-all"
        >
          Compliance
        </button>
      </nav>

      {/* Trailing Cluster */}
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-[11px] font-semibold text-[#00236f]">Academic Session: 2025-26</span>
          <span className="font-mono text-[11px] text-[#515f74] font-medium">
            {role === 'vc' ? 'Role: VC Super Admin' : `Role: Dean (${currentDept})`}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          {role === 'dean' ? (
            <button
              onClick={() => setNotificationsOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-slate-100 text-[#515f74] relative transition"
              title="Notifications"
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#E11D48] text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setActiveNavTab('Announcements')}
              className="p-2 rounded-full hover:bg-slate-100 text-[#515f74] relative transition"
              title="Institutional Directives & Reminders"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {relevantAnnouncements.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {relevantAnnouncements.length}
                </span>
              )}
            </button>
          )}
          {role === 'dean' && notificationsOpen && (
            <NotificationPanel onClose={() => setNotificationsOpen(false)} />
          )}
        </div>

        {/* Help Desk */}
        <button
          onClick={() => showToast('IQAC Technical Helpdesk: ext. 402 / support.kra@kiet.edu')}
          className="p-2 rounded-full hover:bg-slate-100 text-[#515f74] transition"
          title="Help Desk & Support"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#c5c5d3]/70">
          <div className="w-9 h-9 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-blue-900/20">
            {userInitials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[12px] text-[#0b1c30] font-semibold leading-tight max-w-[170px] truncate">
              {userName}
            </p>
            <p className="text-[10px] text-[#515f74] truncate max-w-[170px]">{userSub}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

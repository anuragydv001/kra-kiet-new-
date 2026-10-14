'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppNotification, NotificationKind } from '../types/kra';

const KIND_META: Record<NotificationKind, { icon: string; label: string }> = {
  announcement: { icon: 'campaign', label: 'VC Announcement' },
  'kra-assigned': { icon: 'assignment', label: 'KRA Assigned' },
  'submission-returned': { icon: 'assignment_return', label: 'Returned by VC' },
  'submission-approved': { icon: 'verified', label: 'Approved' },
  reminder: { icon: 'schedule', label: 'Reminder' },
};

function KindBadge({ kind }: { kind: NotificationKind }) {
  const meta = KIND_META[kind];
  const isAlert = kind === 'submission-returned';
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
        isAlert
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-[#e5eeff] text-[#00236f] border-blue-200'
      }`}
    >
      <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

/**
 * Dean notification panel.
 *  - lists every notification addressed to the current department
 *  - unread items are visually distinct and carry a blue marker
 *  - clicking an unread item marks it READ (badge count decreases); clicking an
 *    already-read item leaves the unread count unchanged
 *  - KRA/submission notifications open the Dean KRA workspace,
 *    announcement notifications open the circular details
 */
export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    currentDept,
    announcements,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveNavTab,
    openSplitEditor,
  } = useApp();

  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  const deptNotifications = notifications.filter((n) => n.targetDepts.includes(currentDept));
  const unreadCount = deptNotifications.filter((n) => !n.read).length;

  const handleClick = (n: AppNotification) => {
    // Marks READ only when it was unread - the count decreases exactly once.
    markNotificationRead(n.id);

    if (n.announcementId) {
      setExpandedAnnouncement((prev) => (prev === n.announcementId ? null : n.announcementId ?? null));
      setActiveNavTab('Dashboard');
      return;
    }
    if (n.kraCode) {
      setActiveNavTab('My KRAs');
      openSplitEditor(n.kraCode);
      onClose();
      return;
    }
    setActiveNavTab('Submissions');
    onClose();
  };

  const expanded = announcements.find((a) => a.id === expandedAnnouncement);
return (
    <>
      {/* click catcher */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

      <div className="absolute right-0 top-12 z-50 w-[92vw] sm:w-[420px] bg-white rounded-xl shadow-2xl border border-[#c5c5d3]/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#c5c5d3]/70 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-[20px]">notifications</span>
            <div>
              <h4 className="text-[13px] font-bold text-[#0b1c30] leading-tight">Notifications</h4>
              <span className="text-[11px] text-[#515f74]">
                {unreadCount} unread of {deptNotifications.length} • {currentDept}
              </span>
            </div>
          </div>
          <button
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
            className="text-[11px] font-bold text-[#00236f] hover:underline disabled:text-slate-300 disabled:no-underline"
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#c5c5d3]/50">
          {deptNotifications.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">
              No notifications for {currentDept} yet.
            </p>
          ) : (
            deptNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 flex gap-3 transition hover:bg-[#eff4ff]/70 ${
                  n.read ? 'bg-white' : 'bg-[#eef3ff]'
                }`}
              >
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    n.read ? 'bg-transparent' : 'bg-[#1e3a8a]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <KindBadge kind={n.kind} />
                    {!n.read && (
                      <span className="text-[10px] font-bold text-[#1e3a8a] bg-white border border-blue-200 rounded px-1.5 py-0.5">
                        NEW
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[12px] mt-1.5 leading-snug ${
                      n.read ? 'text-[#515f74] font-semibold' : 'text-[#0b1c30] font-bold'
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-[11px] text-[#515f74] mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1.5">{n.time}</p>
                </div>
              </button>
            ))
          )}
        </div>
{expanded && (
          <div className="border-t border-[#c5c5d3]/70 bg-[#eff4ff] p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-[#515f74]">
              Announcement Details
            </span>
            <p className="text-[12px] font-bold text-[#0b1c30]">{expanded.title}</p>
            <p className="text-[11px] text-[#515f74] leading-relaxed">{expanded.message}</p>
            <p className="text-[10px] font-mono text-[#515f74]">
              {expanded.author} • Issued {expanded.createdAt} • Deadline {expanded.deadline}
            </p>
          </div>
        )}

        <div className="px-4 py-2 border-t border-[#c5c5d3]/70 flex justify-end">
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-[#515f74] hover:text-[#0b1c30] px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
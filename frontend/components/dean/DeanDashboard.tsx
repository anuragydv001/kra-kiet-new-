"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';
import { KRASubmission } from '../../types/kra';
import { formatProgress, isNumericMetric } from '../../services/kraUtils';

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  Submitted: 'bg-purple-100 text-purple-800 border-purple-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Returned: 'bg-rose-100 text-rose-800 border-rose-300',
  'Not Started': 'bg-slate-100 text-slate-600 border-slate-300',
};

export default function DeanDashboard({
  onOpenSplit,
  onPreviewSubmission,
}: {
  onOpenSplit: (kraCode: string) => void;
  onPreviewSubmission: (submission: KRASubmission) => void;
}) {
  const {
    currentDept,
    departments,
    kras,
    submissions,
    announcements,
    selectedCycle,
    getDepartmentStats,
    getSubmission,
    openTimelineModal,
  } = useApp();

  const deptInfo = departments.find((d) => d.code === currentDept);
  const stats = getDepartmentStats(currentDept);
  const assignedKras = kras.filter((k) => k.assignedDepts.includes(currentDept));
  const deptAnnouncements = announcements.filter((a) => a.targetDepts.includes(currentDept));

  const statCards = [
    { label: 'Assigned KRAs', value: stats.assignedCount, icon: 'assignment', tone: 'text-[#00236f]', bg: 'bg-[#e5eeff]' },
    { label: 'Pending Action', value: stats.pendingCount + stats.draftCount + stats.submittedCount, icon: 'pending_actions', tone: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Approved', value: stats.approvedCount, icon: 'verified', tone: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Returned', value: stats.returnedCount, icon: 'assignment_return', tone: 'text-rose-700', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Dean Welcome Banner */}
      <div className="bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#1e3a8a] text-white text-[11px] font-bold px-2 py-0.5 rounded">
              DEAN DESK
            </span>
            <h2 className="text-[20px] font-bold text-[#0b1c30]">
              {deptInfo?.name || currentDept}
            </h2>
          </div>
          <p className="text-[13px] text-[#515f74] mt-1">
            {deptInfo?.deanName || 'Department Dean'} • Active bimonthly cycle: {selectedCycle} •
            Session 2025-2026
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase text-[#515f74] block">
              Department Progress
            </span>
            <p className="text-[26px] font-bold text-[#00236f] leading-none mt-1">
              {formatProgress(stats.progress)}
            </p>
            <span className="text-[10px] text-[#515f74]">never exceeds 100%</span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-[#e5eeff] flex items-center justify-center bg-[#eff4ff] shrink-0">
            <span className="material-symbols-outlined text-[#00236f] text-2xl">school</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#515f74]">{card.label}</span>
              <span className={`material-symbols-outlined text-lg ${card.tone}`}>{card.icon}</span>
            </div>
            <p className={`text-[26px] font-bold leading-none mt-2 ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs overflow-x-auto">
        <div className="p-4 border-b border-[#c5c5d3]/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0b1c30]">
            Assigned KRAs &amp; Current Cycle Proformas
          </h3>
          <span className="text-xs text-[#515f74]">Cycle: {selectedCycle}</span>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#eff4ff] text-[11px] font-bold text-[#515f74] uppercase border-b border-[#c5c5d3]/70">
            <tr>
              <th className="py-3 px-4">KRA</th>
              <th className="py-3 px-3">Metric Type</th>
              <th className="py-3 px-3">Annual Target</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Progress</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c5c5d3]/50">
            {assignedKras.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No KRAs have been assigned to {currentDept} yet.
                </td>
              </tr>
            ) : (
              assignedKras.map((kra) => {
                const sub = getSubmission(kra.code, currentDept, selectedCycle);
                const status = sub?.status ?? 'Not Started';
                const numeric = isNumericMetric(kra.metricType);
                return (
                  <tr key={kra.code} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4 max-w-sm">
                      <span className="font-mono font-bold text-[#00236f] text-xs mr-1">
                        {kra.code}:
                      </span>
                      <span className="text-xs text-[#0b1c30] font-medium">{kra.title}</span>
                      {sub?.returnReason && (
                        <div className="mt-1 p-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[11px]">
                          <strong>VC Observations:</strong> {sub.returnReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] whitespace-nowrap">
                      {kra.metricType}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#00236f] text-xs whitespace-nowrap">
                      {kra.annualTargetDisplay || kra.annualTarget}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          STATUS_STYLES[status] ?? STATUS_STYLES['Not Started']
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {numeric && sub ? formatProgress(sub.progress) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => onOpenSplit(kra.code)}
                        className={`font-semibold px-2.5 py-1 rounded text-xs transition ${
                          kra.code.replace(/[^0-9]/g, '') === '1'
                            ? 'bg-[#1e3a8a] hover:bg-[#00236f] text-white font-bold shadow-2xs'
                            : 'bg-[#00236f] hover:bg-[#1e3a8a] text-white'
                        }`}
                      >
                        {kra.code.replace(/[^0-9]/g, '') === '1' ? 'Fill KRA Report' : 'Open KRA Workspace'}
                      </button>
                      {sub && (
                        <>
                          <button
                            onClick={() => onPreviewSubmission(sub)}
                            className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#515f74] font-semibold px-2.5 py-1 rounded text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openTimelineModal(sub)}
                            className="text-slate-400 hover:text-slate-700 p-1 align-middle"
                            title="View submission timeline"
                          >
                            <span className="material-symbols-outlined text-[16px]">history</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div className="p-4 border-b border-[#c5c5d3]/70 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00236f] text-lg">campaign</span>
          <h3 className="text-sm font-bold text-[#0b1c30]">
            VC Circulars &amp; Departmental Directives
          </h3>
        </div>
        {deptAnnouncements.length === 0 ? (
          <p className="p-6 text-center text-slate-400 text-sm">
            No active circulars for {currentDept}.
          </p>
        ) : (
          <ul className="divide-y divide-[#c5c5d3]/50">
            {deptAnnouncements.map((a) => (
              <li key={a.id} className="p-4 flex items-start gap-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 mt-0.5 ${
                    a.priority === 'High / Urgent'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : a.priority === 'Normal'
                        ? 'bg-blue-50 text-[#00236f] border-blue-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {a.priority}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#0b1c30]">{a.title}</p>
                  <p className="text-xs text-[#515f74] mt-1">{a.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
                    Issued {a.createdAt} by {a.author} • Deadline: {a.deadline}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


    </div>
  );
}

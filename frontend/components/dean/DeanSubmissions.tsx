"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KRASubmission, SubmissionStatus } from '../../types/kra';
import { formatProgress, isNumericMetric } from '../../services/kraUtils';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  Submitted: 'bg-purple-100 text-purple-800 border-purple-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Returned: 'bg-rose-100 text-rose-800 border-rose-300',
};

export default function DeanSubmissions({
  onPreviewSubmission,
  onOpenSplit,
}: {
  onPreviewSubmission: (submission: KRASubmission) => void;
  onOpenSplit: (kraCode: string) => void;
}) {
  const { currentDept, departments, submissions, kras, openTimelineModal } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | SubmissionStatus>('All');

  const deptInfo = departments.find((d) => d.code === currentDept);
  const filtered = submissions.filter(
    (s) => s.dept === currentDept && (statusFilter === 'All' || s.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div>
          <h2 className="text-[20px] font-bold text-[#0b1c30]">
            {currentDept} Submission History
          </h2>
          <p className="text-[13px] text-[#515f74]">
            Track every bimonthly proforma submitted by {deptInfo?.deanName || currentDept} to the VC
            Office.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | SubmissionStatus)}
          className="text-xs border-[#c5c5d3] rounded bg-white px-3 py-2 font-medium text-[#515f74] border focus:outline-hidden"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#eff4ff] text-[11px] font-bold text-[#515f74] uppercase border-b border-[#c5c5d3]/70">
            <tr>
              <th className="py-3 px-4">KRA</th>
              <th className="py-3 px-3">Cycle</th>
              <th className="py-3 px-3 text-right">Achievement</th>
              <th className="py-3 px-3 text-right">Progress</th>
              <th className="py-3 px-3">Evidence</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c5c5d3]/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No submissions recorded for this department yet.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => {
                const kra = kras.find((k) => k.code === sub.kraCode);
                const numeric = kra ? isNumericMetric(kra.metricType) : false;
                return (
                  <tr key={sub.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono font-bold text-[#00236f] text-xs mr-1">
                        {sub.kraCode}:
                      </span>
                      <span className="text-xs text-[#0b1c30] font-medium">{sub.kraTitle}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] whitespace-nowrap">{sub.cycle}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-[#00236f]">{sub.claim}</div>
                      {sub.isTargetExceeded && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                          ★ Target Exceeded
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {numeric ? formatProgress(sub.progress) : '—'}
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] max-w-[160px]">
                      {sub.formData.evidenceFileName ? (
                        <span className="block truncate">{sub.formData.evidenceFileName}</span>
                      ) : null}
                      {sub.formData.evidenceDriveLink && (
                        <span className="block text-[10px] text-[#00236f] font-mono truncate">
                          Drive link attached
                        </span>
                      )}
                      {!sub.formData.evidenceFileName && !sub.formData.evidenceDriveLink ? '—' : null}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[sub.status]}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => onPreviewSubmission(sub)}
                        className="bg-white border border-[#c5c5d3] hover:bg-slate-100 text-[#515f74] px-2.5 py-1 rounded text-xs font-semibold"
                      >
                        Preview
                      </button>
                      {(sub.status === 'Draft' || sub.status === 'Returned') && (
                        <button
                          onClick={() => onOpenSplit(sub.kraCode)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            sub.status === 'Returned'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-[#00236f] hover:bg-[#1e3a8a] text-white'
                          }`}
                        >
                          {sub.status === 'Returned' ? 'Edit & Resubmit' : 'Continue Draft'}
                        </button>
                      )}
                      <button
                        onClick={() => openTimelineModal(sub)}
                        className="text-slate-400 hover:text-slate-700 p-1 align-middle"
                        title="View audit trail"
                      >
                        <span className="material-symbols-outlined text-[16px]">history</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}

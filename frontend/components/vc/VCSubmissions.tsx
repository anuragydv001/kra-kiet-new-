"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KRASubmission, SubmissionStatus, BIMONTHLY_CYCLES } from '../../types/kra';
import { formatProgress, isNumericMetric } from '../../services/kraUtils';
import { buildSubmissionReportHtml, downloadHtmlFile } from '../../services/reportDoc';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  Submitted: 'bg-purple-100 text-purple-800 border-purple-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Returned: 'bg-rose-100 text-rose-800 border-rose-300',
};

export default function VCSubmissions({
  onPreviewSubmission,
  onOpenReturnModal,
}: {
  onPreviewSubmission: (submission: KRASubmission) => void;
  onOpenReturnModal: (submissionId: string) => void;
}) {
  const {
    submissions,
    kras,
    departments,
    approveSubmission,
    approveAllPending,
    openTimelineModal,
  } = useApp();
  const [deptFilter, setDeptFilter] = useState('All');
  const [cycleFilter, setCycleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesDept = deptFilter === 'All' || sub.dept === deptFilter;
    const matchesCycle = cycleFilter === 'All' || sub.cycle === cycleFilter;
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
    return matchesDept && matchesCycle && matchesStatus;
  });

  const handleDownload = (sub: KRASubmission) => {
    const kra = kras.find((k) => k.code === sub.kraCode);
    if (!kra) return;
    const deptName = departments.find((d) => d.code === sub.dept)?.name || sub.dept;
    const fileName = `${sub.dept}_${sub.kraCode.replace(/\s+/g, '_')}_${sub.cycle.replace(/\s+/g, '')}.html`;
    downloadHtmlFile(buildSubmissionReportHtml(kra, sub, deptName), fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300">
              VERIFICATION DESK
            </span>
            <h2 className="text-[20px] font-bold text-[#0b1c30]">Submissions Verification Desk</h2>
          </div>
          <p className="text-[13px] text-[#515f74] mt-1">
            Scrutinise the department proforma, validate the achievement against the Annual Target,
            then approve or return with VC observations.
          </p>
        </div>
        <button
          onClick={approveAllPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          <span>Approve All Pending</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-[#c5c5d3]/70 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-bold uppercase text-[#515f74]">Filter Records:</span>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium border focus:outline-hidden"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d.code} value={d.code}>
              {d.code}
            </option>
          ))}
        </select>
        <select
          value={cycleFilter}
          onChange={(e) => setCycleFilter(e.target.value)}
          className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium border focus:outline-hidden"
        >
          <option value="All">All Cycles</option>
          {BIMONTHLY_CYCLES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium border focus:outline-hidden"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Returned">Returned</option>
        </select>
        <span className="text-xs text-[#515f74] ml-auto">
          {filteredSubmissions.length} record(s)
        </span>
      </div>

      <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#eff4ff] text-[11px] font-bold text-[#515f74] uppercase border-b border-[#c5c5d3]/70">
            <tr>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">KRA</th>
              <th className="py-3 px-3">Cycle</th>
              <th className="py-3 px-3 text-right">Achievement</th>
              <th className="py-3 px-3 text-right">Progress</th>
              <th className="py-3 px-3">Evidence</th>
              <th className="py-3 px-3">Report / Template</th>
              <th className="py-3 px-3">Dean Remarks</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c5c5d3]/50">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No submissions match the current filters.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub) => {
                const kra = kras.find((k) => k.code === sub.kraCode);
                const numeric = kra ? isNumericMetric(kra.metricType) : false;
                const reportName =
                  kra?.prescribedReportFormats[0]?.name ||
                  kra?.summaryTemplates[0]?.name ||
                  'Standard proforma';
                return (
                  <tr key={sub.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <strong className="text-[#0b1c30] block">{sub.dept}</strong>
                      <span className="text-[11px] text-[#515f74]">{sub.deanName}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono font-bold text-[#00236f] text-xs mr-1">
                        {sub.kraCode}:
                      </span>
                      <span className="text-xs text-[#0b1c30] font-medium">{sub.kraTitle}</span>
                      {sub.returnReason && (
                        <div className="mt-1 p-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[11px]">
                          <strong>Returned:</strong> {sub.returnReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] whitespace-nowrap">
                      {sub.cycle}
                    </td>
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
                    <td className="py-3 px-3 text-xs text-[#515f74] max-w-[140px] truncate">
                      {sub.formData.evidenceFileName || '—'}
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] max-w-[150px] truncate">
                      {reportName}
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] max-w-[180px] truncate">
                      {sub.formData.remarks || '—'}
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
                      <button
                        onClick={() => handleDownload(sub)}
                        className="bg-white border border-[#c5c5d3] hover:bg-slate-100 text-[#00236f] px-2.5 py-1 rounded text-xs font-semibold"
                      >
                        Download
                      </button>
                      {sub.status !== 'Approved' && (
                        <button
                          onClick={() => approveSubmission(sub.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold transition"
                        >
                          Approve
                        </button>
                      )}
                      {sub.status !== 'Returned' && (
                        <button
                          onClick={() => onOpenReturnModal(sub.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition"
                        >
                          Return
                        </button>
                      )}
                      <button
                        onClick={() => openTimelineModal(sub)}
                        className="text-slate-400 hover:text-slate-700 p-1 align-middle"
                        title="View submission timeline"
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

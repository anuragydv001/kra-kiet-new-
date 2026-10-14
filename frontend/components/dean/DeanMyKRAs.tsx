"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';
import { KRASubmission, SubmissionStatus } from '../../types/kra';
import { formatProgress, isNumericMetric } from '../../services/kraUtils';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  Submitted: 'bg-purple-100 text-purple-800 border-purple-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Returned: 'bg-rose-100 text-rose-800 border-rose-300',
};

export default function DeanMyKRAs({
  onOpenSplit,
  onPreviewSubmission,
}: {
  onOpenSplit: (kraCode: string) => void;
  onPreviewSubmission: (submission: KRASubmission) => void;
}) {
  const { currentDept, departments, kras, selectedCycle, getSubmission, openTimelineModal } =
    useApp();

  const deptInfo = departments.find((d) => d.code === currentDept);
  const assigned = kras.filter((k) => k.assignedDepts.includes(currentDept));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#00236f] text-white text-[11px] font-bold px-2 py-0.5 rounded">
            PRESCRIBED KRAs
          </span>
          <h2 className="text-[20px] font-bold text-[#0b1c30]">
            {currentDept} — Assigned Key Result Areas
          </h2>
        </div>
        <p className="text-[13px] text-[#515f74] mt-1">
          {deptInfo?.deanName || 'Department Dean'} • {assigned.length} KRAs mapped by the VC
          Office • Active cycle: {selectedCycle}
        </p>
      </div>

      {assigned.length === 0 ? (
        <div className="bg-white p-10 rounded-lg border border-[#c5c5d3]/70 text-center text-slate-400">
          No KRAs have been assigned to {currentDept} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assigned.map((kra) => {
            const sub = getSubmission(kra.code, currentDept, selectedCycle);
            const numeric = isNumericMetric(kra.metricType);
            return (
              <div
                key={kra.code}
                className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-[#00236f] text-xs">{kra.code}</span>
                    <h3 className="text-[14px] font-bold text-[#0b1c30] leading-snug mt-0.5">
                      {kra.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      sub ? STATUS_STYLES[sub.status] : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {sub ? sub.status : 'Not Started'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#eff4ff] rounded px-2 py-1.5">
                    <span className="block uppercase font-bold text-[#515f74] text-[10px]">
                      Metric Type
                    </span>
                    <span className="text-[#0b1c30] font-medium">{kra.metricType}</span>
                  </div>
                  <div className="bg-[#eff4ff] rounded px-2 py-1.5">
                    <span className="block uppercase font-bold text-[#515f74] text-[10px]">
                      Annual Target
                    </span>
                    <span className="text-[#00236f] font-mono font-bold">
                      {kra.annualTargetDisplay || kra.annualTarget}
                    </span>
                  </div>
                </div>

                {numeric && sub && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#515f74] font-semibold">Progress</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatProgress(sub.progress)}
                        {sub.isTargetExceeded && (
                          <span className="ml-1 text-amber-700">★ Target Exceeded</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#eff4ff] border border-[#c5d5f0] overflow-hidden">
                      <div
                        className="h-full bg-[#1e3a8a] transition-all"
                        style={{ width: `${Math.min(sub.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-[#515f74]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">description</span>
                    {kra.prescribedReportFormats.length} format(s)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                    {kra.summaryTemplates.length} template(s)
                  </span>
                </div>

                {sub?.returnReason && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[11px]">
                    {sub.returnReason}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenSplit(kra.code)}
                    className={`flex-1 font-semibold px-3 py-1.5 rounded text-xs transition flex items-center justify-center gap-1.5 ${
                      kra.code.replace(/[^0-9]/g, '') === '1'
                        ? 'bg-[#1e3a8a] hover:bg-[#00236f] text-white shadow-xs'
                        : 'bg-[#00236f] hover:bg-[#1e3a8a] text-white'
                    }`}
                  >
                    {kra.code.replace(/[^0-9]/g, '') === '1' ? (
                      <>
                        <span className="material-symbols-outlined text-[15px]">edit_document</span>
                        Fill KRA Report
                      </>
                    ) : sub && sub.status !== 'Returned' && sub.status !== 'Draft' ? (
                      'Open KRA Workspace'
                    ) : (
                      'Fill KRA Documents'
                    )}
                  </button>
                  {sub && (
                    <>
                      <button
                        onClick={() => onPreviewSubmission(sub)}
                        className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#515f74] font-semibold px-2.5 py-1.5 rounded text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openTimelineModal(sub)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Audit trail"
                      >
                        <span className="material-symbols-outlined text-[16px]">history</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

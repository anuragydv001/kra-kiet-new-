"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentCode } from '../../types/kra';
import { buildInstitutionalReportHtml, downloadHtmlFile } from '../../services/reportDoc';

export default function VCDashboard({
  onOpenAddKRAModal,
  onInspectDept,
}: {
  onOpenAddKRAModal: () => void;
  onInspectDept: (dept: DepartmentCode) => void;
}) {
  const { departments, getDepartmentStats, getGlobalStats, showToast } = useApp();
  const globalStats = getGlobalStats();

  /** Real export: downloads the consolidated department roster as a printable HTML file. */
  const handleExportSummary = () => {
    const rows = departments.map((d) => {
      const s = getDepartmentStats(d.code);
      return {
        code: d.code,
        name: d.name,
        dean: d.deanName,
        assigned: s.assignedCount,
        approved: s.approvedCount,
        exceeded: s.exceededCount,
        progress: s.progress,
      };
    });
    downloadHtmlFile(buildInstitutionalReportHtml(rows), 'VC_KRA_Master_Summary.html');
    showToast('Institutional Master KRA summary exported.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00236f] text-white text-[11px] font-bold px-2 py-0.5 rounded">
              EXECUTIVE DESK
            </span>
            <h2 className="text-[20px] font-bold text-[#0b1c30]">
              Vice Chancellor KRA Master Dashboard
            </h2>
          </div>
          <p className="text-[13px] text-[#515f74] mt-1">
            Consolidated real-time monitoring of 13 academic departments against institutional NAAC criteria & NBA outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddKRAModal}
            className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-4 py-2 rounded text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add New KRA</span>
          </button>

          <button
            onClick={handleExportSummary}
            className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#0b1c30] px-3 py-2 rounded text-[13px] font-semibold flex items-center gap-1 transition"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs hover:shadow-sm transition">
          <span className="text-[#515f74] text-[11px] font-bold uppercase tracking-wider block">
            Departments
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[28px] text-[#00236f] font-bold leading-none">
              {globalStats.totalDepts}
            </span>
            <span className="material-symbols-outlined text-[#515f74] opacity-50 text-[24px]">
              apartment
            </span>
          </div>
          <span className="text-[11px] text-[#515f74] block mt-1">All Active Engineering & Mgmt</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs hover:shadow-sm transition">
          <span className="text-[#515f74] text-[11px] font-bold uppercase tracking-wider block">
            Total KRAs
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[28px] text-[#0b1c30] font-bold leading-none">
              {globalStats.totalKRAs}
            </span>
            <span className="material-symbols-outlined text-[#515f74] opacity-50 text-[24px]">
              assignment
            </span>
          </div>
          <span className="text-[11px] text-[#515f74] block mt-1">Across Quality Dimensions</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs hover:shadow-sm transition">
          <span className="text-[#515f74] text-[11px] font-bold uppercase tracking-wider block">
            Active KRAs
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[28px] text-[#00236f] font-bold leading-none">
              {globalStats.activeKRAs}
            </span>
            <span className="material-symbols-outlined text-emerald-600 opacity-60 text-[24px]">
              trending_up
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">100% Allocated</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs hover:shadow-sm transition">
          <span className="text-amber-800 text-[11px] font-bold uppercase tracking-wider block">
            Pending Review
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[28px] text-amber-600 font-bold leading-none">
              {globalStats.pendingReview}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-[24px]">
              pending_actions
            </span>
          </div>
          <span className="text-[11px] text-amber-700 block mt-1">Awaiting VC Evaluation</span>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs hover:shadow-sm transition">
          <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider block">
            Approved KRAs
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[28px] text-emerald-600 font-bold leading-none">
              {globalStats.approvedTotal}
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-[24px]">
              verified
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 block mt-1">Verified & Ratified</span>
        </div>

        {/* Card 6 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs hover:shadow-sm transition">
          <span className="text-rose-800 text-[11px] font-bold uppercase tracking-wider block">
            Returned / Action
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-[28px] text-rose-600 font-bold leading-none">
              {globalStats.returnedTotal}
            </span>
            <span className="material-symbols-outlined text-rose-500 text-[24px]">
              assignment_return
            </span>
          </div>
          <span className="text-[11px] text-rose-700 block mt-1">Remarks Dispatched</span>
        </div>
      </div>

      {/* 13 Departments Performance Progress Grid */}
      <div className="bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#c5c5d3]/70 gap-2">
          <div>
            <h3 className="text-[18px] font-bold text-[#0b1c30]">
              Departmental KRA Progression & Accreditation Health
            </h3>
            <p className="text-[13px] text-[#515f74]">
              Institutional progress capped at 100% with star indicators for exceeded thresholds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-[#515f74] bg-[#eff4ff] px-2.5 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> High Performance (&gt;80%)
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[#515f74] bg-[#eff4ff] px-2.5 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Ongoing (60–80%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {departments.map((dept) => {
            const stats = getDepartmentStats(dept.code);
            const cappedProgress = Math.min(stats.progress, 100);

            return (
              <div
                key={dept.code}
                className="bg-[#eff4ff] p-4 rounded-lg border border-[#c5c5d3]/60 hover:border-[#00236f]/60 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[16px] font-bold text-[#0b1c30] block">{dept.code}</span>
                      <span className="text-[10px] text-[#515f74] truncate max-w-[150px] block">{dept.name}</span>
                    </div>

                    {stats.exceededCount > 0 ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                        ★ {stats.exceededCount} Exceeded
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Target Met
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#515f74] font-medium">Accreditation Completion</span>
                      <span className="font-bold text-[#00236f] font-mono">{cappedProgress}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className="bg-[#00236f] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${cappedProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] mt-3 pt-2 border-t border-[#c5c5d3]/40 text-center">
                    <div>
                      <span className="text-[#515f74] block">Assigned</span>
                      <strong className="text-[#0b1c30]">{stats.assignedCount}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 block">Approved</span>
                      <strong className="text-emerald-700">{stats.approvedCount}</strong>
                    </div>
                    <div>
                      <span className="text-amber-700 block">Pending</span>
                      <strong className="text-amber-700">
                        {stats.pendingCount + stats.draftCount + stats.submittedCount}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onInspectDept(dept.code)}
                  className="mt-3 w-full py-1.5 bg-white border border-[#c5c5d3] hover:bg-slate-100 text-xs font-semibold rounded text-[#515f74] hover:text-[#0b1c30] transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>Audit Department KRAs</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

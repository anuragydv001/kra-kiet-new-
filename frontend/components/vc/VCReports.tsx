"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KRASubmission, BIMONTHLY_CYCLES } from '../../types/kra';
import { formatProgress, isNumericMetric } from '../../services/kraUtils';
import {
  buildSubmissionReportHtml,
  buildInstitutionalReportHtml,
  downloadHtmlFile,
  InstitutionalReportRow,
} from '../../services/reportDoc';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function VCReports({
  onPreviewSubmission,
}: {
  onPreviewSubmission: (submission: KRASubmission) => void;
}) {
  const { submissions, kras, departments, getDepartmentStats } = useApp();
  const [deptFilter, setDeptFilter] = useState('All');
  const [kraFilter, setKraFilter] = useState('All');
  const [cycleFilter, setCycleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = submissions.filter((sub) => {
    const matchesDept = deptFilter === 'All' || sub.dept === deptFilter;
    const matchesKra = kraFilter === 'All' || sub.kraCode === kraFilter;
    const matchesCycle = cycleFilter === 'All' || sub.cycle === cycleFilter;
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
    return matchesDept && matchesKra && matchesCycle && matchesStatus;
  });

  const chartData = departments.map((d) => ({
    name: d.code,
    progress: getDepartmentStats(d.code).progress,
  }));

  const institutionalRows: InstitutionalReportRow[] = departments.map((d) => {
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

  const handleDownloadSubmission = (sub: KRASubmission) => {
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
          <h2 className="text-[20px] font-bold text-[#0b1c30]">
            Accreditation &amp; Quality Assurance Reports
          </h2>
          <p className="text-[13px] text-[#515f74]">
            Filter the KRA records, then view or download the individual compliance proformas or the
            institutional roster.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#0b1c30] px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Report</span>
          </button>
          <button
            onClick={() =>
              downloadHtmlFile(
                buildInstitutionalReportHtml(institutionalRows),
                'Institutional_KRA_Compliance_Report.html'
              )
            }
            className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Institutional Dossier</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-[#c5c5d3]/70 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-bold uppercase text-[#515f74]">Filters:</span>
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
          value={kraFilter}
          onChange={(e) => setKraFilter(e.target.value)}
          className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium border focus:outline-hidden"
        >
          <option value="All">All KRAs</option>
          {kras.map((k) => (
            <option key={k.code} value={k.code}>
              {k.code} — {k.title.slice(0, 24)}
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
        <span className="text-xs text-[#515f74] ml-auto">{filtered.length} record(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-[#0b1c30]">
              Department-wise KRA Progress (% capped at 100%)
            </h3>
            <span className="text-[11px] text-[#515f74]">Active cycle</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Progress']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '12px' }}
                />
                <Bar dataKey="progress" fill="#00236f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-[#515f74] block">
              Total Submissions
            </span>
            <p className="text-[28px] font-bold text-[#00236f] leading-none mt-2">
              {submissions.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-emerald-700 block">Approved</span>
            <p className="text-[28px] font-bold text-emerald-700 leading-none mt-2">
              {submissions.filter((s) => s.status === 'Approved').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-rose-700 block">Returned</span>
            <p className="text-[28px] font-bold text-rose-700 leading-none mt-2">
              {submissions.filter((s) => s.status === 'Returned').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs overflow-x-auto">
        <div className="p-4 border-b border-[#c5c5d3]/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0b1c30]">Consolidated KRA Compliance Records</h3>
          <span className="text-xs text-[#515f74]">Academic Session: 2025-2026</span>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#eff4ff] text-[11px] font-bold text-[#515f74] uppercase border-b border-[#c5c5d3]/70">
            <tr>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">KRA</th>
              <th className="py-3 px-3">Cycle</th>
              <th className="py-3 px-3 text-right">Achievement</th>
              <th className="py-3 px-3 text-right">Progress</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-center">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c5c5d3]/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No records match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => {
                const kra = kras.find((k) => k.code === sub.kraCode);
                const numeric = kra ? isNumericMetric(kra.metricType) : false;
                return (
                  <tr key={sub.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#00236f] whitespace-nowrap">
                      {sub.dept}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono font-bold text-[#00236f] text-xs mr-1">
                        {sub.kraCode}:
                      </span>
                      <span className="text-xs text-[#0b1c30] font-medium">{sub.kraTitle}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-[#515f74] whitespace-nowrap">
                      {sub.cycle}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#00236f] whitespace-nowrap">
                      {sub.claim}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {numeric ? formatProgress(sub.progress) : '—'}
                    </td>
                    <td className="py-3 px-3 text-xs font-semibold text-[#515f74] whitespace-nowrap">
                      {sub.status}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => onPreviewSubmission(sub)}
                        className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#00236f] font-semibold px-2.5 py-1 rounded text-xs"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleDownloadSubmission(sub)}
                        className="bg-[#00236f] hover:bg-[#1e3a8a] text-white font-semibold px-2.5 py-1 rounded text-xs"
                      >
                        Download
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

"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentCode, KRAMaster, METRIC_TYPES } from '../../types/kra';

export default function VCKRAManagement({
  onOpenAddKRAModal,
  onPreviewKra,
  onEditKra,
}: {
  onOpenAddKRAModal: () => void;
  onPreviewKra: (kra: KRAMaster) => void;
  onEditKra: (kra: KRAMaster) => void;
}) {
  const { kras, departments, deleteKRA, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [metricFilter, setMetricFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredKras = kras.filter((kra) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      kra.code.toLowerCase().includes(q) ||
      kra.title.toLowerCase().includes(q) ||
      kra.nbaRef.toLowerCase().includes(q) ||
      kra.naacRef.toLowerCase().includes(q) ||
      kra.targetDescription.toLowerCase().includes(q);
    const matchesMetric = metricFilter === 'All' || kra.metricType === metricFilter;
    const matchesDept =
      deptFilter === 'All' ||
      (deptFilter === 'All 13'
        ? kra.assignedDepts.length === departments.length
        : kra.assignedDepts.includes(deptFilter as DepartmentCode));
    const matchesStatus = statusFilter === 'All' || kra.status === statusFilter;
    return matchesSearch && matchesMetric && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#c5c5d3]/70 shadow-xs">
        <div>
          <h2 className="text-[20px] font-bold text-[#0b1c30]">
            KRA Repository &amp; Annual Target Allocation
          </h2>
          <p className="text-[13px] text-[#515f74]">
            Define each KRA, set its Annual Target and metric type, attach the prescribed report
            format and summary template, then assign it to departments.
          </p>
        </div>
        <button
          onClick={onOpenAddKRAModal}
          className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-4 py-2 rounded text-[13px] font-bold flex items-center gap-2 shadow-xs transition shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>+ Add New KRA</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-[#c5c5d3]/70 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-[#f8f9ff] px-3 py-1.5 rounded border border-[#c5c5d3]/60">
          <span className="material-symbols-outlined text-[#515f74] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by KRA Code, Title, NBA/NAAC Ref, Description..."
            className="w-full text-xs bg-transparent border-0 focus:outline-hidden text-[#0b1c30]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium text-[#515f74] border focus:outline-hidden"
          >
            <option value="All">All Metric Types</option>
            {METRIC_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium text-[#515f74] border focus:outline-hidden"
          >
            <option value="All">All Departments</option>
            <option value="All 13">All 13 Depts</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-1.5 font-medium text-[#515f74] border focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() =>
              showToast(`${filteredKras.length} KRA record(s) match the current filters.`, 'info')
            }
            className="text-xs font-semibold text-[#00236f] hover:underline px-1"
          >
            {filteredKras.length} result(s)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#eff4ff] text-[11px] font-bold text-[#515f74] uppercase border-b border-[#c5c5d3]/70">
            <tr>
              <th className="py-3 px-4">KRA Code</th>
              <th className="py-3 px-4">KRA &amp; Target Description</th>
              <th className="py-3 px-3">NBA</th>
              <th className="py-3 px-3">NAAC</th>
              <th className="py-3 px-3">Metric Type</th>
              <th className="py-3 px-3 text-right">Annual Target</th>
              <th className="py-3 px-3">Documents</th>
              <th className="py-3 px-4">Allocated To</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c5c5d3]/50">
            {filteredKras.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No Key Result Areas found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredKras.map((k) => (
                <tr key={k.code} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#00236f] whitespace-nowrap">
                    {k.code}
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <span className="font-semibold text-[#0b1c30] block">{k.title}</span>
                    <span className="text-[11px] text-[#515f74] mt-0.5 block italic line-clamp-2">
                      {k.targetDescription}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="bg-[#e5eeff] px-2 py-0.5 rounded text-xs font-medium text-[#515f74]">
                      {k.nbaRef}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="bg-[#e5eeff] px-2 py-0.5 rounded text-xs font-medium text-[#515f74]">
                      {k.naacRef}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-[#515f74] font-medium whitespace-nowrap">
                    {k.metricType}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                    {k.annualTargetDisplay || k.annualTarget}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[#515f74] whitespace-nowrap">
                    {k.prescribedReportFormats.length} format(s)
                    <br />
                    {k.summaryTemplates.length} template(s)
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className="bg-[#d5e3fc] text-[#00236f] text-xs font-bold px-2 py-0.5 rounded"
                      title={k.assignedDepts.join(', ')}
                    >
                      {k.assignedDepts.length === departments.length
                        ? `All ${departments.length} Depts`
                        : `${k.assignedDepts.length} Depts`}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        k.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : k.status === 'Draft'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap space-x-1">
                    <button
                      onClick={() => onEditKra(k)}
                      className="text-[#00236f] hover:underline text-xs font-bold px-2 py-1 bg-[#e5eeff] rounded border border-blue-200"
                      title="Edit KRA definition, Annual Target, report formats and departments"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onPreviewKra(k)}
                      className="text-[#00236f] hover:underline text-xs font-bold px-2 py-1 bg-blue-50 rounded border border-blue-200"
                    >
                      Inspect Proforma
                    </button>
                    <button
                      onClick={() => deleteKRA(k.code)}
                      className="text-rose-600 hover:text-rose-800 text-xs px-1.5 py-1"
                      title="Delete KRA"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

    </div>
  );
}

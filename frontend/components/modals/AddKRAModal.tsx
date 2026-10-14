"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DepartmentCode,
  KRAMaster,
  MetricType,
  METRIC_TYPES,
  ReportFileType,
  ReportFormat,
} from '../../types/kra';

interface FormatDraft {
  id: string;
  name: string;
  description: string;
  fileName: string;
  fileType: ReportFileType;
}

const emptyFormat = (): FormatDraft => ({
  id: `fmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  description: '',
  fileName: '',
  fileType: 'DOCX',
});

/**
 * Editor for a list of report documents (used for BOTH the prescribed report
 * format and the summary report template, which are two separate concepts).
 */
function FormatSection({
  title,
  hint,
  addLabel,
  formats,
  onAdd,
  onRemove,
  onUpdate,
  onFile,
}: {
  title: string;
  hint: string;
  addLabel: string;
  formats: FormatDraft[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<FormatDraft>) => void;
  onFile: (id: string, file: File | null) => void;
}) {
  return (
    <div className="border border-[#c5c5d3]/70 rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="text-xs font-bold text-[#0b1c30]">{title}</h4>
          <p className="text-[11px] text-[#515f74]">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 text-[11px] font-bold text-[#00236f] bg-[#e5eeff] hover:bg-[#d5e3fc] px-2.5 py-1 rounded border border-blue-200"
        >
          {addLabel}
        </button>
      </div>
      {formats.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">No document added yet.</p>
      ) : (
        <div className="space-y-2">
          {formats.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#f8f9ff] p-2 rounded border border-[#c5c5d3]/60"
            >
              <input
                value={f.name}
                onChange={(e) => onUpdate(f.id, { name: e.target.value })}
                placeholder="Name *"
                className="sm:col-span-4 text-xs rounded border-[#c5c5d3] px-2 py-1.5 bg-white border focus:outline-hidden"
              />
              <input
                value={f.description}
                onChange={(e) => onUpdate(f.id, { description: e.target.value })}
                placeholder="Description"
                className="sm:col-span-4 text-xs rounded border-[#c5c5d3] px-2 py-1.5 bg-white border focus:outline-hidden"
              />
              <select
                value={f.fileType}
                onChange={(e) => onUpdate(f.id, { fileType: e.target.value as ReportFileType })}
                className="sm:col-span-2 text-xs rounded border-[#c5c5d3] px-2 py-1.5 bg-white border focus:outline-hidden"
              >
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="PDF">PDF</option>
              </select>
              <div className="sm:col-span-2 flex items-center gap-1">
                <label
                  className="cursor-pointer text-[11px] font-semibold text-[#00236f] bg-white border border-[#c5c5d3] rounded px-2 py-1.5 flex-1 text-center truncate"
                  title={f.fileName || 'Upload file'}
                >
                  {f.fileName ? 'Change file' : 'Upload file'}
                  <input
                    type="file"
                    accept=".docx,.xlsx,.xls,.pdf"
                    className="hidden"
                    onChange={(e) => onFile(f.id, e.target.files?.[0] ?? null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  className="text-rose-600 hover:text-rose-800 p-1"
                  title="Remove"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              {f.fileName && (
                <p className="sm:col-span-12 text-[10px] text-[#515f74] pl-1">
                  Attached: {f.fileName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddKRAModal({
  isOpen,
  onClose,
  editingKra = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** When set, the modal edits this KRA instead of creating a new one. */
  editingKra?: KRAMaster | null;
}) {
  const { departments, addKRA, updateKRA, showToast } = useApp();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [nbaRef, setNbaRef] = useState('');
  const [naacRef, setNaacRef] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('Direct Numeric');
  const [annualTarget, setAnnualTarget] = useState('90');
  const [annualTargetDisplay, setAnnualTargetDisplay] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [status, setStatus] = useState<KRAMaster['status']>('Active');
  const [reportFormats, setReportFormats] = useState<FormatDraft[]>([]);
  const [summaryTemplates, setSummaryTemplates] = useState<FormatDraft[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<DepartmentCode[]>([]);

  const isEditing = editingKra !== null;

  const toFormatDraft = (f: ReportFormat): FormatDraft => ({
    id: f.id,
    name: f.name,
    description: f.description ?? '',
    fileName: f.fileName ?? '',
    fileType: f.fileType ?? 'DOCX',
  });

  /**
   * Seed the form every time the modal opens:
   *  - "Add New KRA"  -> blank form
   *  - "Edit"         -> values of the KRA being edited
   * Runs before the `!isOpen` early return so hook order stays stable.
   */
  useEffect(() => {
    if (!isOpen) return;

    if (editingKra) {
      setCode(editingKra.code);
      setTitle(editingKra.title);
      setNbaRef(editingKra.nbaRef === 'N/A' ? '' : editingKra.nbaRef);
      setNaacRef(editingKra.naacRef === 'N/A' ? '' : editingKra.naacRef);
      setMetricType(editingKra.metricType);
      setAnnualTarget(String(editingKra.annualTarget));
      setAnnualTargetDisplay(editingKra.annualTargetDisplay ?? '');
      setTargetDescription(editingKra.targetDescription);
      setStatus(editingKra.status);
      setReportFormats(editingKra.prescribedReportFormats.map(toFormatDraft));
      setSummaryTemplates(editingKra.summaryTemplates.map(toFormatDraft));
      setSelectedDepts([...editingKra.assignedDepts]);
    } else {
      setCode('');
      setTitle('');
      setNbaRef('');
      setNaacRef('');
      setMetricType('Direct Numeric');
      setAnnualTarget('90');
      setAnnualTargetDisplay('');
      setTargetDescription('');
      setStatus('Active');
      setReportFormats([]);
      setSummaryTemplates([]);
      setSelectedDepts([]);
    }
  }, [isOpen, editingKra]);

  if (!isOpen) return null;

  const addFormat = (setter: React.Dispatch<React.SetStateAction<FormatDraft[]>>) =>
    setter((prev) => [...prev, emptyFormat()]);
  const removeFormat = (
    setter: React.Dispatch<React.SetStateAction<FormatDraft[]>>,
    id: string
  ) => setter((prev) => prev.filter((f) => f.id !== id));
  const updateFormat = (
    setter: React.Dispatch<React.SetStateAction<FormatDraft[]>>,
    id: string,
    patch: Partial<FormatDraft>
  ) => setter((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const attachFile = (
    setter: React.Dispatch<React.SetStateAction<FormatDraft[]>>,
    id: string,
    file: File | null
  ) => {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toUpperCase();
    const fileType: ReportFileType =
      ext === 'PDF' ? 'PDF' : ext === 'XLSX' || ext === 'XLS' ? 'XLSX' : 'DOCX';
    updateFormat(setter, id, { fileName: file.name, fileType });
  };

  const handleSelectAll = (select: boolean) =>
    setSelectedDepts(select ? departments.map((d) => d.code) : []);
  const handleToggleDept = (dept: DepartmentCode) =>
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((c) => c !== dept) : [...prev, dept]
    );

  const resetForm = () => {
    setCode('');
    setTitle('');
    setNbaRef('');
    setNaacRef('');
    setMetricType('Direct Numeric');
    setAnnualTarget('90');
    setAnnualTargetDisplay('');
    setTargetDescription('');
    setStatus('Active');
    setReportFormats([]);
    setSummaryTemplates([]);
    setSelectedDepts([]);
  };

  const toReportFormats = (list: FormatDraft[]): ReportFormat[] =>
    list
      .filter((f) => f.name.trim())
      .map((f) => ({
        id: f.id,
        name: f.name.trim(),
        description: f.description.trim() || undefined,
        fileName: f.fileName || undefined,
        fileType: f.fileType,
      }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(annualTarget);
    if (!code.trim() || !title.trim()) {
      showToast('Please provide the KRA Code and KRA Title.', 'error');
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      showToast('Please provide a valid numeric Annual Target.', 'error');
      return;
    }
    if (!targetDescription.trim()) {
      showToast('Please provide a target description.', 'error');
      return;
    }
    if (selectedDepts.length === 0) {
      showToast('Please assign this KRA to at least one department.', 'error');
      return;
    }

    const payload: KRAMaster = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      nbaRef: nbaRef.trim() || 'N/A',
      naacRef: naacRef.trim() || 'N/A',
      metricType,
      annualTarget: target,
      annualTargetDisplay:
        annualTargetDisplay.trim() || (metricType === 'Percentage' ? `${target}%` : String(target)),
      targetDescription: targetDescription.trim(),
      prescribedReportFormats: toReportFormats(reportFormats),
      summaryTemplates: toReportFormats(summaryTemplates),
      assignedDepts: selectedDepts,
      status,
    };

    if (editingKra) {
      updateKRA(editingKra.code, payload);
    } else {
      addKRA(payload);
    }

    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c5c5d3]/70 max-w-3xl w-full p-6 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#c5c5d3]/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00236f] text-2xl">post_add</span>
            <h3 className="text-[18px] font-bold text-[#0b1c30]">
              {isEditing ? 'Edit Institutional KRA' : 'Define Institutional KRA'}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#515f74] hover:text-[#0b1c30]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">KRA Code *</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. KRA 24"
                readOnly={isEditing}
                title={isEditing ? 'KRA Code cannot be changed after creation' : undefined}
                className={`w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f] ${
                  isEditing ? 'text-slate-500 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                KRA Title / Objective *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Students Placement in %"
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">NBA Reference</label>
              <input
                value={nbaRef}
                onChange={(e) => setNbaRef(e.target.value)}
                placeholder="e.g. Criterion 4.1"
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">NAAC Reference</label>
              <input
                value={naacRef}
                onChange={(e) => setNaacRef(e.target.value)}
                placeholder="e.g. Criteria 5.2"
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KRAMaster['status'])}
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">Metric Type *</label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value as MetricType)}
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              >
                {METRIC_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">Annual Target *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={annualTarget}
                onChange={(e) => setAnnualTarget(e.target.value)}
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Annual Target Display
              </label>
              <input
                value={annualTargetDisplay}
                onChange={(e) => setAnnualTargetDisplay(e.target.value)}
                placeholder="e.g. 90%"
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b1c30] mb-1">
              Target Description *
            </label>
            <textarea
              rows={2}
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder="Shown to the Dean on the entry workspace (e.g. Every Year)"
              className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              required
            />
          </div>

          <FormatSection
            title="Prescribed Report Format"
            hint="The official report proforma the Dean must complete for this KRA."
            addLabel="+ Add Report Format"
            formats={reportFormats}
            onAdd={() => addFormat(setReportFormats)}
            onRemove={(id) => removeFormat(setReportFormats, id)}
            onUpdate={(id, patch) => updateFormat(setReportFormats, id, patch)}
            onFile={(id, file) => attachFile(setReportFormats, id, file)}
          />

          <FormatSection
            title="Summary Report Template"
            hint="The summary template used to consolidate department submissions."
            addLabel="+ Add Summary Template"
            formats={summaryTemplates}
            onAdd={() => addFormat(setSummaryTemplates)}
            onRemove={(id) => removeFormat(setSummaryTemplates, id)}
            onUpdate={(id, patch) => updateFormat(setSummaryTemplates, id, patch)}
            onFile={(id, file) => attachFile(setSummaryTemplates, id, file)}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0b1c30]">
                Assigned Departments ({selectedDepts.length} selected) *
              </label>
              <div className="space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-[#00236f] hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-[#515f74] hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f8f9ff] p-3 rounded border border-[#c5c5d3]/70 text-xs">
              {departments.map((dept) => (
                <label key={dept.code} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDepts.includes(dept.code)}
                    onChange={() => handleToggleDept(dept.code)}
                    className="text-[#00236f] rounded focus:ring-0"
                  />
                  <span>{dept.code}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c5c5d3]/70">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-[#c5c5d3] text-[#515f74] px-4 py-2 rounded text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-5 py-2 rounded text-xs font-bold shadow-xs transition"
            >
              {isEditing
                ? 'Update KRA & Assign to Departments'
                : 'Save KRA & Assign to Departments'}
            </button>
          </div>


        </form>
      </div>
    </div>
  );
}


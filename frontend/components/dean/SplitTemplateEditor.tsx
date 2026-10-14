"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BIMONTHLY_CYCLES,
  BimonthlyCycle,
  COMPLIANCE_STATUSES,
  CompletedDocument,
  EVIDENCE_STATUSES,
  KRASubmission,
  ReportFormat,
  SubmissionFormData,
} from '../../types/kra';
import {
  claimDisplay,
  computeProgress,
  formatProgress,
  isNumericMetric,
  isValidHttpUrl,
  metricUnit,
  submissionCompletion,
} from '../../services/kraUtils';
import {
  buildCompletedDocumentHtml,
  buildEvidenceSummaryHtml,
  buildSubmissionReportHtml,
  downloadHtmlFile,
} from '../../services/reportDoc';
import TemplateFillEditor from './TemplateFillEditor';
import KRAFormRegistry from '../kra-forms/KRAFormRegistry';
import MultiEvidenceUploader from '../kra-forms/MultiEvidenceUploader';
import SmartVACReportBuilder from '../kra-forms/SmartVACReportBuilder';
import SmartKRA7ReportBuilder from '../kra-forms/SmartKRA7ReportBuilder';
import { getKraRefs } from '../../config/kraRefs';


/**
 * The four working documents of the Dean KRA workspace.
 * Data entered in one tab is never lost when switching to another tab because
 * every tab writes into the SAME formData state object.
 */
type WorkspaceTab = 'proforma' | 'reportFormat' | 'evidence';

const TAB_META: { key: WorkspaceTab; label: string; icon: string; hint: string }[] = [
  {
    key: 'proforma',
    label: 'Performa',
    icon: 'edit_document',
    hint: 'Structured KRA + bimonthly cycle achievement entered by the Dean.',
  },
  {
    key: 'reportFormat',
    label: 'Report Format',
    icon: 'description',
    hint: 'VC-provided prescribed document to be completed.',
  },
  
  {
    key: 'evidence',
    label: 'Evidence',
    icon: 'attach_file',
    hint: 'Uploaded evidence file or a Google Drive link.',
  },
];

export default function SplitTemplateEditor({
  kraCode,
  onClose,
  onPreviewSubmission,
}: {
  kraCode: string;
  onClose: () => void;
  onPreviewSubmission: (submission: KRASubmission) => void;
}) {
  const {
    kras,
    departments,
    currentDept,
    selectedCycle,
    getSubmission,
    saveDraftSubmission,
    submitKRAtoVC,
    resubmitKRA,
    showToast,
  } = useApp();

  const kra = kras.find((k) => k.code === kraCode);
  const deptInfo = departments.find((d) => d.code === currentDept);

  // If KRA 1 (Value Added Courses, Add-on Courses and MOOCs), render the Smart KRA Report Builder
  const cleanKraNum = parseInt(kraCode.replace(/[^0-9]/g, ''), 10);
  const isKRA1 =
    cleanKraNum === 1 ||
    kraCode.trim() === 'KRA 01' ||
    kraCode.trim() === 'KRA 1' ||
    kraCode.toLowerCase().includes('vac') ||
    kraCode.toLowerCase().includes('value added');

  if (isKRA1) {
    return (
      <SmartVACReportBuilder
        kraCode={kraCode}
        departmentCode={currentDept}
        cycle={selectedCycle}
        onClose={onClose}
      />
    );
  }

  const isKRA7 =
    cleanKraNum === 7 ||
    kraCode.trim() === 'KRA 07' ||
    kraCode.trim() === 'KRA 7' ||
    kraCode.toLowerCase().includes('feedback') ||
    kraCode.toLowerCase().includes('curriculum');

  if (isKRA7) {
    return (
      <SmartKRA7ReportBuilder
        kraCode={kraCode}
        departmentCode={currentDept}
        cycle={selectedCycle}
        onClose={onClose}
      />
    );
  }

  const existing = getSubmission(kraCode, currentDept, selectedCycle);
  const [cycle, setCycle] = useState<BimonthlyCycle>(selectedCycle);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('proforma');
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [formData, setFormData] = useState<SubmissionFormData>(
    () => existing?.formData ?? { coordName: deptInfo?.deanName ?? '', remarks: '' }
  );

  const patch = (updates: Partial<SubmissionFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  /** Stores a completed VC-uploaded document into the shared submission state. */
  const patchDoc = (
    slot: 'reportFormatDocs' | 'summaryTemplateDocs',
    format: ReportFormat,
    doc: CompletedDocument
  ) =>
    setFormData((prev) => {
      const list = prev[slot] ?? [];
      const idx = list.findIndex((d) => d.formatId === format.id);
      const next = idx >= 0 ? list.map((d, i) => (i === idx ? doc : d)) : [...list, doc];
      return { ...prev, [slot]: next };
    });

  const numeric = kra ? isNumericMetric(kra.metricType) : false;
  const computed = useMemo(() => (kra ? computeProgress(kra, formData) : null), [kra, formData]);
  const completion = useMemo(() => submissionCompletion(kra, formData), [kra, formData]);

  const previewSub: KRASubmission | null =
    kra && computed
      ? {
          id: existing?.id ?? 'PREVIEW',
          kraCode: kra.code,
          kraTitle: kra.title,
          dept: currentDept,
          deanName: existing?.deanName ?? deptInfo?.deanName ?? '',
          cycle,
          metricType: kra.metricType,
          annualTarget: kra.annualTarget,
          claim: claimDisplay(kra, formData),
          numericClaim: computed.numericClaim,
          progress: computed.progress,
          isTargetExceeded: computed.isTargetExceeded,
          submittedDate: existing?.submittedDate ?? '',
          status: existing?.status ?? 'Draft',
          returnReason: existing?.returnReason,
          formData,
          timeline: existing?.timeline ?? [],
        }
      : null;

  const deptName = deptInfo?.name || currentDept;
  const html = useMemo(
    () => (kra && previewSub ? buildSubmissionReportHtml(kra, previewSub, deptName) : ''),
    [kra, previewSub, deptName]
  );
  const fileName = `${currentDept}_${kraCode.replace(/\s+/g, '_')}_${cycle.replace(/\s+/g, '')}.html`;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    patch({
      evidenceFileName: file.name,
      evidenceFileSize: `${(file.size / 1024).toFixed(1)} KB`,
    });
  };

  /** Google Drive (or any HTTP/HTTPS) evidence link handling. */
  const handleDriveLink = (value: string) => patch({ evidenceDriveLink: value });

  const driveLink = (formData.evidenceDriveLink ?? '').trim();
  const driveLinkValid = driveLink === '' || isValidHttpUrl(driveLink);

  const validate = (): boolean => {
    if (!kra) return false;
    if (!driveLinkValid) {
      showToast('The Google Drive link must be a valid http:// or https:// URL.', 'error');
      setActiveTab('evidence');
      return false;
    }
    switch (kra.metricType) {
      case 'Direct Numeric':
      case 'Percentage':
        if (!formData.achievementClaim?.trim()) {
          showToast('Enter the achievement value against the Annual Target.', 'error');
          setActiveTab('proforma');
          return false;
        }
        break;
      case 'Yes/No':
        if (!formData.yesNoChoice) {
          showToast('Select Yes or No for this metric.', 'error');
          setActiveTab('proforma');
          return false;
        }
        break;
      case 'Descriptive':
        if (!formData.descriptiveText?.trim()) {
          showToast('Provide the descriptive achievement narrative.', 'error');
          setActiveTab('proforma');
          return false;
        }
        break;
      case 'Evidence Based':
        if (!formData.evidenceStatus) {
          showToast('Select the evidence completion status.', 'error');
          setActiveTab('proforma');
          return false;
        }
        break;
      case 'Policy/Compliance':
        if (!formData.complianceStatus) {
          showToast('Select the compliance status for this compliance-based KRA.', 'error');
          setActiveTab('proforma');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (!kra) return;
    if (!driveLinkValid) {
      showToast('The Google Drive link must be a valid http:// or https:// URL.', 'error');
      setActiveTab('evidence');
      return;
    }
    saveDraftSubmission(kra.code, currentDept, cycle, formData);
  };

  const handleSubmit = () => {
    if (!kra || !validate()) return;
    if (!completion.performa) {
      showToast('Complete the Performa before submitting to the VC.', 'error');
      setActiveTab('proforma');
      return;
    }
    if (completion.hasReportFormat && !completion.reportFormat) {
      showToast('Complete the VC-provided Report Format document before submitting.', 'error');
      setActiveTab('reportFormat');
      return;
    }
    
    if (!completion.evidence) {
      showToast('Attach an evidence file or a Google Drive link before submitting.', 'error');
      setActiveTab('evidence');
      return;
    }
    if (existing && existing.status === 'Returned') {
      resubmitKRA(existing.id, formData);
    } else {
      submitKRAtoVC(kra.code, currentDept, cycle, formData);
    }
  };

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleDownload = () => {
    if (!html) return;
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // This triggers the browser's native print dialog which allows saving as PDF
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        showToast(`Preparing PDF document...`);
      } else {
        showToast('Live preview must be open to generate a PDF.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF.', 'error');
    }
  };

  const handlePreview = () => {
    // Toggles the full screen overlay internally
    setShowFullScreenPreview(true);
  };

  /** Preview / download one specific completed VC-uploaded document. */
  const docPreviewHtml = (format: ReportFormat, kind: 'Report Format' | 'Summary Template') => {
    if (!kra) return '';
    const docs = kind === 'Report Format' ? formData.reportFormatDocs : formData.summaryTemplateDocs;
    return buildCompletedDocumentHtml({
      kra,
      format,
      doc: docs?.find((d) => d.formatId === format.id),
      kind: kind === 'Report Format' ? 'Prescribed Report Format' : 'Summary Report Template',
      deptName,
      deptCode: currentDept,
      deanName: previewSub?.deanName ?? deptInfo?.deanName ?? '',
      cycle,
    });
  };

  const downloadDoc = (format: ReportFormat, kind: 'Report Format' | 'Summary Template') => {
    const safeKind = kind === 'Report Format' ? 'Report_Format' : 'Summary_Template';
    const name = `${currentDept}_${kraCode.replace(/\s+/g, '_')}_${safeKind}_${format.name.replace(/\s+/g, '_')}.html`;
    downloadHtmlFile(docPreviewHtml(format, kind), name);
    showToast(`Downloaded ${name}`);
  };

  /** Preview document shown in the right pane, driven by the active tab. */
  const kraRefs = kra ? getKraRefs(kra.code) : { nba: '—', naac: '—' };
  const activePreview = useMemo((): { title: string; html: string } => {
    if (!kra) return { title: 'Preview', html: '' };
    if (activeTab === 'reportFormat' || activeTab === 'proforma') {
      return { title: 'Consolidated Live Preview', html };
    }
    if (activeTab === 'evidence') {
      return {
        title: 'Evidence Preview',
        html: buildEvidenceSummaryHtml({
          kra,
          deptName,
          deptCode: currentDept,
          deanName: previewSub?.deanName ?? deptInfo?.deanName ?? '',
          cycle,
          formData,
        }),
      };
    }
    return { title: 'Live Proforma Preview', html };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, kra, formData, html, deptName, currentDept, cycle, previewSub, deptInfo?.deanName]);

  const [debouncedHtml, setDebouncedHtml] = useState(activePreview.html);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(activePreview.html);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [activePreview.html]);

  if (!kra) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b1c30]/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full text-center space-y-3">
          <span className="material-symbols-outlined text-rose-600 text-4xl">error</span>
          <h3 className="text-[16px] font-bold text-[#0b1c30]">KRA not found</h3>
          <p className="text-[13px] text-[#515f74]">
            {kraCode} is not available in the KRA repository.
          </p>
          <button
            onClick={onClose}
            className="bg-[#00236f] text-white px-4 py-2 rounded text-xs font-bold"
          >
            Close Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/70 backdrop-blur-xs flex flex-col">
      <div className="bg-white border-b border-[#c5c5d3]/70 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="material-symbols-outlined text-[#00236f] text-2xl">edit_document</span>
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-[#0b1c30] truncate">
              {kra.code} — {kra.title}
            </h3>
            <p className="text-[11px] text-[#515f74] truncate">
              KRA Workspace • {currentDept} • {kra.metricType} • Annual Target (read-only):{' '}
              {kra.annualTargetDisplay || kra.annualTarget}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value as BimonthlyCycle)}
            className="text-xs border-[#c5c5d3] rounded bg-white px-2.5 py-2 font-medium border focus:outline-hidden"
          >
            {BIMONTHLY_CYCLES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={handleSaveDraft}
            className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#0b1c30] px-3 py-2 rounded text-xs font-bold transition"
          >
            Save Draft
          </button>
          <button
            onClick={handlePreview}
            className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#00236f] px-3 py-2 rounded text-xs font-bold transition"
          >
            Preview
          </button>
          <button
            onClick={handleDownload}
            className="bg-white border border-[#c5c5d3] hover:bg-slate-50 text-[#00236f] px-3 py-2 rounded text-xs font-bold transition"
          >
            Download
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-3.5 py-2 rounded text-xs font-bold transition shadow-xs"
          >
            {existing && existing.status === 'Returned' ? 'Resubmit to VC' : 'Submit to VC'}
          </button>
          <button
            onClick={onClose}
            className="text-[#515f74] hover:text-[#0b1c30] p-1.5 rounded transition"
            title="Close editor"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Tab bar — Performa / Report Format / Summary Template / Evidence */}
      <div className="bg-white border-b border-[#c5c5d3]/70 px-5 py-2 flex flex-wrap items-center gap-2 shrink-0">
        {TAB_META.map((tab) => {
          const isActive = activeTab === tab.key;
          const done =
            tab.key === 'proforma'
              ? completion.performa
              : tab.key === 'reportFormat'
                ? completion.reportFormat
                  : completion.evidence;
          const notApplicable =
            (tab.key === 'reportFormat' && !completion.hasReportFormat);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              title={tab.hint}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition ${
                isActive
                  ? 'bg-[#00236f] text-white border-[#00236f]'
                  : 'bg-white text-[#515f74] border-[#c5c5d3] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
              {!notApplicable && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    done
                      ? 'bg-emerald-100 text-emerald-700'
                      : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {done ? '✓' : 'Pending'}
                </span>
              )}
            </button>
          );
        })}
        <span className="text-[11px] text-[#515f74] ml-auto hidden lg:block">
          {TAB_META.find((t) => t.key === activeTab)?.hint}
        </span>
      </div>

      <div className={`flex-1 min-h-0 grid ${activeTab === 'reportFormat' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="overflow-y-auto bg-[#eff4ff] p-5 space-y-4 border-r border-[#c5c5d3]/70">
          <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#515f74]">KRA Context</span>
              <span className="bg-[#e5eeff] text-[#00236f] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                {kra.metricType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#515f74] block">NBA Ref</span>
                <p className="text-xs text-[#0b1c30] font-mono">{kraRefs.nba}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#515f74] block">NAAC Ref</span>
                <p className="text-xs text-[#0b1c30] font-mono">{kraRefs.naac}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#515f74] block">
                Target Description
              </span>
              <p className="text-xs text-[#0b1c30] leading-relaxed">
                {kra.targetDescription || '—'}
              </p>
            </div>

            {/* Annual Target is READ-ONLY for the Dean */}
            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                Annual Target (read-only)
              </label>
              <div className="w-full text-xs rounded border border-[#c5c5d3] bg-slate-100 text-slate-600 px-3 py-2 font-mono font-bold cursor-not-allowed">
                {kra.annualTargetDisplay || kra.annualTarget}
                {numeric && metricUnit(kra.metricType) ? ` (${metricUnit(kra.metricType)})` : ''}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                KRA Coordinator
              </label>
              <input
                type="text"
                value={formData.coordName ?? ''}
                onChange={(e) => patch({ coordName: e.target.value })}
                placeholder="Coordinator name"
                className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-white border focus:outline-hidden focus:border-[#00236f]"
              />
            </div>
          </div>

          {existing?.returnReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-800 space-y-1">
              <strong className="block text-[11px] uppercase">Returned by VC</strong>
              <span>{existing.returnReason}</span>
            </div>
          )}

          {activeTab === 'proforma' && (
            <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#515f74]">
                  Performa — Achievement Entry
                </span>
                <span className="text-[10px] text-[#515f74] font-mono">{kra.metricType}</span>
              </div>
              <p className="text-[11px] text-[#515f74] -mt-1">
                The Performa captures the structured achievement for this KRA and bimonthly cycle.
                It is <strong>not</strong> a replacement for the Report Format.
              </p>

            {(kra.metricType === 'Direct Numeric' || kra.metricType === 'Percentage') && (
              <div>
                <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                  Achievement vs Annual Target
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.achievementClaim ?? ''}
                    onChange={(e) => patch({ achievementClaim: e.target.value })}
                    placeholder="e.g. 30"
                    className="flex-1 text-xs rounded border-[#c5c5d3] px-3 py-2 bg-white border font-mono focus:outline-hidden focus:border-[#00236f]"
                  />
                  <span className="text-xs font-bold text-[#00236f] w-10 text-right">
                    {kra.metricType === 'Percentage' ? '%' : 'count'}
                  </span>
                </div>
                <p className="text-[11px] text-[#515f74] mt-1.5">
                  Annual Target: <strong>{kra.annualTargetDisplay || kra.annualTarget}</strong> •
                  Live progress:{' '}
                  <strong className="text-emerald-700 font-mono">
                    {computed ? formatProgress(computed.progress) : '0%'}
                  </strong>
                  {computed?.isTargetExceeded && (
                    <span className="ml-1 text-amber-700 font-bold">★ Target Exceeded</span>
                  )}
                </p>
              </div>
            )}

            {kra.metricType === 'Yes/No' && (
              <div>
                <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                  Target Achieved?
                </label>
                <div className="flex gap-2">
                  {(['Yes', 'No'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => patch({ yesNoChoice: value })}
                      className={`px-4 py-2 rounded text-xs font-bold border transition ${
                        formData.yesNoChoice === value
                          ? 'bg-[#00236f] text-white border-[#00236f]'
                          : 'bg-white text-[#515f74] border-[#c5c5d3] hover:bg-slate-50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {kra.metricType === 'Descriptive' && (
              <div>
                <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                  Achievement Narrative
                </label>
                <textarea
                  rows={5}
                  value={formData.descriptiveText ?? ''}
                  onChange={(e) => patch({ descriptiveText: e.target.value })}
                  placeholder="Describe the achievement against the annual target…"
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-white border focus:outline-hidden focus:border-[#00236f]"
                />
              </div>
            )}

            {kra.metricType === 'Evidence Based' && (
              <div>
                <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                  Evidence Completion Status
                </label>
                <select
                  value={formData.evidenceStatus ?? ''}
                  onChange={(e) => patch({ evidenceStatus: e.target.value })}
                  className="w-full text-xs border-[#c5c5d3] rounded bg-white px-3 py-2 border focus:outline-hidden"
                >
                  <option value="">Select status…</option>
                  {EVIDENCE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {kra.metricType === 'Policy/Compliance' && (
              <div className="pt-3 border-t border-[#c5c5d3]/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#515f74] block">
                  Compliance Status
                </span>
                <p className="text-[11px] text-[#515f74]">
                  Compliance KRAs are assessed by policy status, not by a numeric target. No
                  achievement / annual target percentage is calculated for this KRA.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {COMPLIANCE_STATUSES.map((status) => {
                    const selected = formData.complianceStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => patch({ complianceStatus: status })}
                        className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-semibold transition ${
                          selected
                            ? 'bg-[#00236f] text-white border-[#00236f]'
                            : 'bg-white text-[#515f74] border-[#c5c5d3] hover:bg-[#eff4ff]'
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full border shrink-0 ${
                            selected ? 'bg-white border-white' : 'border-[#c5c5d3]'
                          }`}
                        />
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          )}

          {activeTab === 'reportFormat' && (
            <div className="space-y-3">
              <div className="bg-[#eff4ff] border border-blue-200 rounded-lg p-3 text-[11px] text-[#0b1c30]">
                <strong>Data Entry Required</strong> — Fill out the report details below. The live preview updates on the right as you type.
              </div>
              <KRAFormRegistry
                kraCode={kra.code}
                formData={formData}
                patchFormData={patch}
                departmentName={deptName}
                hodName={deptInfo?.deanName}
                cycle={cycle}
              />
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs space-y-4">
              <div className="flex items-center justify-between mb-2 border-b pb-3">
                <span className="text-[12px] font-bold uppercase text-[#0b1c30] flex items-center gap-2">
                  Required Evidence
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    completion.evidence
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {completion.evidence ? 'Added' : 'Not added'}
                </span>
              </div>

              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <MultiEvidenceUploader formData={formData} patchFormData={patch} />
              </div>

              <div className="pt-3 border-t border-[#c5c5d3]/60">
                <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                  Dean Remarks
                </label>
                <textarea
                  rows={4}
                  value={formData.remarks ?? ''}
                  onChange={(e) => patch({ remarks: e.target.value })}
                  placeholder="Add supporting observations for the VC…"
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-white border focus:outline-hidden focus:border-[#00236f]"
                />
              </div>
            </div>
          )}


        </div>
        {activeTab === 'reportFormat' && (
        <div className="overflow-hidden flex flex-col bg-white">
          <div className="px-4 py-3 border-b border-[#c5c5d3]/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#00236f]">visibility</span>
              <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                {activePreview.title}
              </span>
            </div>
            <span className="text-[11px] text-[#515f74] shrink-0">updates as you type</span>
          </div>
          <div className="flex-1 min-h-0 bg-slate-100 p-3">
            {activePreview.html ? (
              <iframe
                ref={iframeRef}
                title={activePreview.title}
                srcDoc={debouncedHtml}
                className="w-full h-full bg-white rounded border border-[#c5c5d3]"
              />
            ) : (
              <div className="w-full h-full bg-white rounded border border-[#c5c5d3] flex items-center justify-center text-xs text-slate-400">
                No document has been uploaded by the VC for this section.
              </div>
            )}
          </div>

        </div>
        )}
      </div>

      {showFullScreenPreview && (
        <div className="fixed inset-0 z-[60] bg-[#0b1c30]/90 backdrop-blur-xs flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4 bg-white border-b border-[#c5c5d3]">
            <h2 className="text-sm font-bold text-[#00236f] flex items-center gap-2">
              <span className="material-symbols-outlined">visibility</span>
              Full Screen Preview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="bg-[#eff4ff] text-[#00236f] border border-blue-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-[#dbeafe] transition"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowFullScreenPreview(false)}
                className="bg-white border border-[#c5c5d3] text-[#0b1c30] px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-slate-100 overflow-hidden">
            {activePreview.html ? (
              <iframe
                title="Full Screen Preview"
                srcDoc={debouncedHtml}
                className="w-full h-full bg-white rounded shadow-lg border border-[#c5c5d3]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 bg-white rounded shadow-lg">
                Preview not available
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

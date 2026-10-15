"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentCode, BimonthlyCycle, SubmissionFormData } from '../../types/kra';
import { getKraRefs } from '../../config/kraRefs';
import { downloadKRAGenericDocx, downloadKRAGenericPdf } from '../../services/kraReportService';
import OfficialKRAReportPreview from './OfficialKRAReportPreview';
import KRAFeedbackSurveyForm from './KRAFeedbackSurveyForm';
import KRAActivityReportForm, { KRA_ACTIVITY_CONFIGS } from './KRAActivityReportForm';
import KRATemplateDataForm, { KRA_PRESETS } from './KRATemplateDataForm';

interface SmartUniversalReportBuilderProps {
  kraCode: string;
  departmentCode: DepartmentCode;
  cycle: BimonthlyCycle;
  onClose: () => void;
}

export default function SmartUniversalReportBuilder({
  kraCode,
  departmentCode,
  cycle,
  onClose,
}: SmartUniversalReportBuilderProps) {
  const {
    kras,
    departments,
    getSubmission,
    saveDraftSubmission,
    submitKRAtoVC,
    showToast,
  } = useApp();

  const kra = useMemo(() => kras.find((k) => k.code === kraCode), [kras, kraCode]);
  const deptInfo = useMemo(() => departments.find((d) => d.code === departmentCode), [departments, departmentCode]);
  const existingSub = getSubmission(kraCode, departmentCode, cycle);
  const currentStatus = existingSub?.status || 'Draft';
  const cleanNum = kraCode.replace(/[^0-9]/g, '');
  const kraNum = parseInt(cleanNum, 10) || 1;
  const kraRefs = getKraRefs(kraCode);

  const [formData, setFormData] = useState<SubmissionFormData>(() => {
    return (
      existingSub?.formData || {
        coordName: deptInfo?.deanName || '',
        remarks: '',
        customFields: {},
        customEvidence: [],
      }
    );
  });

  const [previewScale, setPreviewScale] = useState(0.85);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const patchFormData = (updates: Partial<SubmissionFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
      customFields: {
        ...(prev.customFields || {}),
        ...(updates.customFields || {}),
      },
    }));
  };

  const custom = formData.customFields || {};

  // Form classification
  const isFeedbackSurvey = [8, 9, 10].includes(kraNum);
  const isActivityReport = [11, 12, 13, 18, 19, 23, 33, 36, 37, 44, 45].includes(kraNum);

  // Auto-build data payload for the live preview & exports
  const previewData = useMemo(() => {
    const templatePreset = KRA_PRESETS[cleanNum];
    const activityConfig = KRA_ACTIVITY_CONFIGS[cleanNum];

    let defaultCols: { key: string; label: string }[] = [];
    let defaultRowsData: any[] = [];
    let defaultTableTitle = 'Activity & Performance Records';

    if (templatePreset) {
      defaultCols = templatePreset.columns;
      defaultRowsData = [templatePreset.sampleRow];
      defaultTableTitle = templatePreset.title;
    } else if (activityConfig) {
      defaultCols = activityConfig.columns;
      defaultRowsData = activityConfig.defaultRows;
      defaultTableTitle = activityConfig.tableTitle;
    }

    const rawRows = (custom.rows && custom.rows.length > 0) ? custom.rows : defaultRowsData;

    let columnLabels: string[] = [];
    if (custom.columns && custom.columns.length > 0) {
      columnLabels = custom.columns;
    } else if (defaultCols.length > 0) {
      columnLabels = defaultCols.map(c => c.label);
    } else if (rawRows.length > 0 && typeof rawRows[0] === 'object' && !Array.isArray(rawRows[0])) {
      columnLabels = Object.keys(rawRows[0]).filter((k) => k !== 'id');
    } else {
      columnLabels = ['Details'];
    }

    const colKeys = defaultCols.length > 0 ? defaultCols.map(c => c.key) : [];
    const formattedRows = rawRows.map((r: any, idx: number) => {
      if (Array.isArray(r)) return r;
      if (colKeys.length > 0) {
        return [
          String(idx + 1),
          ...colKeys.map((k: string) => String(r[k] !== undefined && r[k] !== null ? r[k] : (r[k.toLowerCase()] !== undefined ? r[k.toLowerCase()] : '—'))),
        ];
      }
      const objKeys = Object.keys(r).filter(k => k !== 'id');
      return [
        String(idx + 1),
        ...objKeys.map((c: string) => String(r[c] !== undefined && r[c] !== null ? r[c] : '—')),
      ];
    });

    return {
      kraNumber: cleanNum,
      kraCode,
      reportTitle: kra?.title || `${kraCode} Official Report`,
      department: deptInfo?.name || departmentCode,
      academicYear: '2026-2027',
      cycle,
      reportDate: custom.reportDate || new Date().toLocaleDateString('en-GB'),
      preparedBy: custom.preparedBy || custom.coordinatorName || custom.respondentName || deptInfo?.deanName || 'Faculty Coordinator',
      designation: custom.designation || 'Professor & Dean',
      organization: custom.organization || 'KIET University Partner',
      email: custom.email || deptInfo?.deanEmail || '',
      mobileNumber: custom.mobileNumber || custom.contactNumber || '',
      subject: custom.subject || `B.Tech (${departmentCode}) Syllabus Review`,
      tableTitle: custom.tableTitle || defaultTableTitle,
      columns: ['S.No.', ...columnLabels],
      rows: formattedRows,
      ratings: custom.ratings || {},
      overallSatisfaction: custom.overallSatisfaction || 8,
      suggestions: custom.suggestions || '',
      extraSections: custom.extraSections || [],
      narrative: custom.narrative || formData.remarks || '',
      customFields: custom,
      ...custom,
    };
  }, [cleanNum, kraCode, kra?.title, deptInfo?.name, deptInfo?.deanName, deptInfo?.deanEmail, departmentCode, cycle, custom, formData.remarks]);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      saveDraftSubmission(kraCode, departmentCode, cycle, formData);
      showToast(`${kraCode} draft saved successfully`);
    } catch (e) {
      console.error(e);
      showToast('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit to VC
  const handleSubmitToVC = () => {
    setIsSaving(true);
    try {
      submitKRAtoVC(kraCode, departmentCode, cycle, {
        ...formData,
        targetDesc: kra?.title || `${kraCode} Report`,
        achievementClaim: formData.achievementClaim || 'Completed',
        remarks: formData.remarks || custom.narrative || 'Official report submitted to Vice Chancellor.',
      });
      showToast(`${kraCode} report submitted to Vice Chancellor successfully!`);
      onClose();
    } catch (e) {
      console.error(e);
      showToast('Submission error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Download Word (.docx)
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await downloadKRAGenericDocx(previewData, `KIET_${kraCode.replace(' ', '_')}_Report_${departmentCode}.docx`);
      showToast(`Official ${kraCode} DOCX downloaded successfully`);
    } catch (e) {
      console.error(e);
      showToast('Failed to export DOCX. Ensure backend is running.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Download PDF
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadKRAGenericPdf(previewData, `KIET_${kraCode.replace(' ', '_')}_Report_${departmentCode}.pdf`);
      showToast(`Official ${kraCode} PDF downloaded successfully`);
    } catch (e) {
      console.error(e);
      showToast('Backend PDF export failed, opening browser print view.');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/75 backdrop-blur-xs flex flex-col overflow-hidden text-[#0b1c30]">
      {/* Top Banner Navigation — Exactly matching KRA 7 Smart Builder */}
      <header className="h-14 bg-white border-b border-[#c5c5d3] px-3 md:px-5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Back to KRA Dashboard"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>

          <div className="w-8 h-8 rounded-lg bg-[#00236f] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {cleanNum}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[13px] md:text-[14px] text-[#00236f] tracking-tight truncate">
                {kraCode}: {kra?.title || 'Report Builder'}
              </h2>
              <span className="hidden sm:inline bg-blue-50 text-[#00236f] border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                Official Proforma
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                  currentStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : currentStatus === 'Submitted'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-medium truncate hidden sm:block">
              Department: <strong className="text-slate-700">{deptInfo?.name || departmentCode}</strong> &bull; Cycle: <strong className="text-slate-700">{cycle}</strong> &bull; NBA: {kraRefs.nba} &bull; NAAC: {kraRefs.naac}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Mobile Tab Toggle (<lg screens) */}
          <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setMobileTab('form')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                mobileTab === 'form' ? 'bg-white text-[#00236f] shadow-xs' : 'text-slate-600'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                mobileTab === 'preview' ? 'bg-white text-[#00236f] shadow-xs' : 'text-slate-600'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1 px-2 md:px-3 py-1.5 text-xs font-semibold text-[#00236f] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded transition cursor-pointer disabled:opacity-50"
            title="Download official editable Word (.docx) document"
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span className="hidden md:inline">{isExportingDocx ? 'Exporting...' : 'Export DOCX'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1 px-2 md:px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded transition cursor-pointer disabled:opacity-50"
            title="Download official PDF document"
          >
            <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
            <span className="hidden md:inline">{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-300 mx-0.5 hidden sm:block" />

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1 px-2 md:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            onClick={handleSubmitToVC}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 md:px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded transition cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">send</span>
            <span>Submit to VC</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Body: Left Panel (Form) + Right Panel (A4 Live Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT PANEL: FORM INPUTS ================= */}
        <section
          className={`w-full lg:w-[48%] xl:w-[45%] bg-[#f8f9ff] border-r border-[#c5c5d3] flex flex-col shrink-0 overflow-hidden ${
            mobileTab === 'form' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {isFeedbackSurvey ? (
            <KRAFeedbackSurveyForm
              kraCode={kraCode}
              departmentName={deptInfo?.name || departmentCode}
              cycle={cycle}
              hodName={deptInfo?.deanName}
              formData={formData}
              patchFormData={patchFormData}
            />
          ) : isActivityReport ? (
            <KRAActivityReportForm
              kraCode={kraCode}
              departmentName={deptInfo?.name || departmentCode}
              cycle={cycle}
              hodName={deptInfo?.deanName}
              formData={formData}
              patchFormData={patchFormData}
            />
          ) : (
            <KRATemplateDataForm
              kraCode={kraCode}
              departmentName={deptInfo?.name || departmentCode}
              cycle={cycle}
              hodName={deptInfo?.deanName}
              formData={formData}
              patchFormData={patchFormData}
            />
          )}
        </section>

        {/* ================= RIGHT PANEL: LIVE A4 SHEET PREVIEW ================= */}
        <section
          className={`flex-1 bg-[#475569]/10 overflow-y-auto flex flex-col relative ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Preview Toolbar */}
          <div className="bg-white border-b border-[#c5c5d3] px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#00236f]">
                visibility
              </span>
              <span className="text-xs font-bold text-slate-800">
                Official {kraCode} Report Live Preview
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono hidden sm:inline">
                Exact Official Proforma
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-100 rounded border border-slate-200 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.5, s - 0.1))}
                  className="px-2 py-0.5 hover:bg-white rounded transition text-slate-700"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-2 text-[11px] font-mono font-medium">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.4, s + 0.1))}
                  className="px-2 py-0.5 hover:bg-white rounded transition text-slate-700"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(0.85)}
                  className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 border-l border-slate-200 ml-1"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>

              {/* Fullscreen Preview Toggle */}
              <button
                type="button"
                onClick={() => setShowFullScreenPreview(true)}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition"
                title="Fullscreen Preview"
              >
                <span className="material-symbols-outlined text-[18px]">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Live Document Preview Sheet Area */}
          <div className="flex-1 p-6 flex justify-center overflow-x-auto">
            <OfficialKRAReportPreview reportData={previewData} scale={previewScale} />
          </div>
        </section>
      </div>

      {/* Fullscreen Document Preview Modal */}
      {showFullScreenPreview && (
        <div className="fixed inset-0 z-60 bg-[#0b1c30]/90 backdrop-blur-sm flex flex-col">
          <div className="h-12 bg-white border-b px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00236f]">description</span>
              <span className="text-sm font-bold text-[#00236f]">{kraCode} Full-Screen Official Report Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Export PDF
              </button>
              <button
                onClick={() => setShowFullScreenPreview(false)}
                className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <OfficialKRAReportPreview reportData={previewData} scale={1} />
          </div>
        </div>
      )}
    </div>
  );
}

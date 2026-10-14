"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentCode, BimonthlyCycle, KRA7ReportData } from '../../types/kra';
import {
  getInitialKRA7ReportData,
  validateKRA7Report,
  downloadKRA7Docx,
  downloadKRA7Pdf,
  KRA7_SURVEY_QUESTIONS,
  KRA7_RATING_OPTIONS,
} from '../../services/kra7ReportService';
import OfficialKRA7ReportPreview from './OfficialKRA7ReportPreview';
import { uploadEvidenceFile } from '../../services/vacReportService';

interface SmartKRA7ReportBuilderProps {
  kraCode: string;
  departmentCode: DepartmentCode;
  cycle: BimonthlyCycle;
  onClose: () => void;
}

export default function SmartKRA7ReportBuilder({
  kraCode,
  departmentCode,
  cycle,
  onClose,
}: SmartKRA7ReportBuilderProps) {
  const {
    departments,
    getSubmission,
    saveDraftSubmission,
    submitKRAtoVC,
    showToast,
    role,
  } = useApp();

  const deptInfo = useMemo(
    () => departments.find((d) => d.code === departmentCode),
    [departments, departmentCode]
  );

  const existingSub = getSubmission(kraCode, departmentCode, cycle);
  const currentStatus = existingSub?.status || 'Draft';

  // Initialize report state from existing submission or defaults
  const [reportData, setReportData] = useState<KRA7ReportData>(() => {
    const existingKRA7 = existingSub?.formData?.kra7Report;
    return getInitialKRA7ReportData(
      deptInfo?.name || departmentCode,
      deptInfo?.deanName || '',
      deptInfo?.deanEmail || '',
      '2026-2027',
      existingKRA7
    );
  });

  const [activeSection, setActiveSection] = useState<'details' | 'survey' | 'satisfaction' | 'evidence'>('details');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Sync department name and email if available
  useEffect(() => {
    if (deptInfo?.name && (!reportData.department || reportData.department === '')) {
      setReportData((prev) => ({
        ...prev,
        department: deptInfo.name,
      }));
    }
  }, [deptInfo]);

  const patchField = <K extends keyof KRA7ReportData>(field: K, val: KRA7ReportData[K]) => {
    setReportData((prev) => ({ ...prev, [field]: val }));
    if (validationErrors[field as string]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleRatingChange = (questionId: number, ratingVal: number) => {
    setReportData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [questionId]: ratingVal,
      },
    }));

    if (validationErrors[`q_${questionId}`]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[`q_${questionId}`];
        return next;
      });
    }
  };

  const handleSatisfactionChange = (score: number) => {
    setReportData((prev) => ({
      ...prev,
      overallSatisfaction: score,
    }));

    if (validationErrors['overallSatisfaction']) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next['overallSatisfaction'];
        return next;
      });
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const ratedCount = Object.keys(reportData.ratings).length;
      saveDraftSubmission(kraCode, departmentCode, cycle, {
        coordName: reportData.facultyName,
        targetDesc: 'Curriculum Feedback (Faculty Members)',
        achievementClaim: `${ratedCount}/10 evaluated`,
        remarks: reportData.suggestions ? reportData.suggestions.slice(0, 100) : '',
        kra7Report: reportData,
      });
      showToast('KRA 7 draft saved successfully');
    } catch (e) {
      console.error(e);
      showToast('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit to VC
  const handleSubmitToVC = () => {
    const valResult = validateKRA7Report(reportData);
    if (!valResult.isValid) {
      setValidationErrors(valResult.errors);
      showToast('Please fill all required fields before submitting to VC');
      // Jump to first section with errors
      if (valResult.errors['mobileNumber'] || valResult.errors['subject']) {
        setActiveSection('details');
      } else if (Object.keys(valResult.errors).some((k) => k.startsWith('q_'))) {
        setActiveSection('survey');
      } else if (valResult.errors['overallSatisfaction']) {
        setActiveSection('satisfaction');
      }
      return;
    }

    setValidationErrors({});
    setIsSaving(true);
    try {
      submitKRAtoVC(kraCode, departmentCode, cycle, {
        coordName: reportData.facultyName,
        targetDesc: 'Curriculum Feedback (Faculty Members)',
        achievementClaim: `Completed (Rating: ${reportData.overallSatisfaction}/10)`,
        remarks: reportData.suggestions || 'Structured curriculum feedback submitted by faculty.',
        kra7Report: reportData,
      });
      showToast('KRA 7 report submitted to Vice Chancellor successfully!');
      onClose();
    } catch (e) {
      console.error(e);
      showToast('Submission error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Download DOCX
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await downloadKRA7Docx(reportData, deptInfo?.name || departmentCode);
      showToast('Official KRA 7 DOCX downloaded successfully');
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
      await downloadKRA7Pdf(reportData, deptInfo?.name || departmentCode);
      showToast('Official KRA 7 PDF downloaded successfully');
    } catch (e) {
      console.error(e);
      showToast('Backend PDF export failed, using browser print view.');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Upload Evidence File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEvidence(true);
    try {
      const uploaded = await uploadEvidenceFile(
        file,
        'KRA 7 Curriculum Feedback Sheet',
        kraCode,
        cycle
      );
      setReportData((prev) => ({
        ...prev,
        evidenceFile: {
          id: uploaded.id,
          fileName: uploaded.filename,
          fileUrl: uploaded.file_url,
          fileSize: `${uploaded.file_size_kb} KB`,
        },
      }));
      showToast(`Evidence uploaded: ${uploaded.filename}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to upload evidence file');
    } finally {
      setUploadingEvidence(false);
    }
  };

  // Progress metrics
  const completedQuestionsCount = useMemo(() => {
    return Object.keys(reportData.ratings).length;
  }, [reportData.ratings]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/70 backdrop-blur-xs flex flex-col overflow-hidden text-[#0b1c30]">
      {/* Top Banner Navigation */}
      <header className="h-14 bg-white border-b border-[#c5c5d3] px-5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00236f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            7
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[14px] text-[#00236f] tracking-tight">
                KRA 7: Curriculum Feedback Survey Form (for Faculty Members)
              </h2>
              <span className="bg-blue-50 text-[#00236f] border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Official Report Builder
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
            <p className="text-[11px] text-slate-500 font-medium">
              Department: <strong className="text-slate-700">{deptInfo?.name || departmentCode}</strong> &bull; Cycle: <strong className="text-slate-700">{cycle}</strong> &bull; NBA Ref: 3 &bull; NAAC Ref: 1.4.1
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Export Buttons */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00236f] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded transition cursor-pointer"
            title="Download the official Microsoft Word (.docx) document"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>{isExportingDocx ? 'Exporting...' : 'Export DOCX'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded transition cursor-pointer"
            title="Download the official PDF document"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          <div className="h-6 w-px bg-slate-300 mx-1"></div>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmitToVC}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">send</span>
            <span>Submit to VC</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition ml-1"
            title="Close editor"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </header>

      {/* Main Two-Panel Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT PANEL: USER INPUT FORM ================= */}
        <section className="w-full lg:w-[48%] xl:w-[45%] bg-[#f8f9ff] border-r border-[#c5c5d3] flex flex-col shrink-0 overflow-hidden">
          {/* Form Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 pt-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveSection('details')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeSection === 'details'
                    ? 'border-[#00236f] text-[#00236f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>Faculty Details</span>
                {(validationErrors['mobileNumber'] || validationErrors['subject']) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('survey')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeSection === 'survey'
                    ? 'border-[#00236f] text-[#00236f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">quiz</span>
                <span>Evaluation (10 Qs)</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
                  {completedQuestionsCount}/10
                </span>
                {Object.keys(validationErrors).some((k) => k.startsWith('q_')) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('satisfaction')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeSection === 'satisfaction'
                    ? 'border-[#00236f] text-[#00236f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">stars</span>
                <span>Rating &amp; Suggestions</span>
                {validationErrors['overallSatisfaction'] && (
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('evidence')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeSection === 'evidence'
                    ? 'border-[#00236f] text-[#00236f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">attach_file</span>
                <span>Evidence</span>
              </button>
            </div>
          </div>

          {/* Form Scroll Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Auto-populated Institutional Information (Read-only Summary) */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  Automatically Populated Institutional Information
                </span>
                <span className="text-[10px] text-slate-500 italic">Retrieved from system profile</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">Department:</span>
                  <span className="font-semibold text-slate-800 truncate block" title={reportData.department}>
                    {reportData.department || 'Not specified'}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">Academic Year:</span>
                  <span className="font-semibold text-slate-800 block">
                    {reportData.academicYear}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">Faculty Name:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {reportData.facultyName || 'Faculty Coordinator'}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">Email ID:</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px] truncate block">
                    {reportData.email || '—'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 italic">
                * Note: The fields above are pre-filled automatically by the system and appear on the official report without requiring repetitive manual input.
              </p>
            </div>

            {/* TAB 1: FACULTY DETAILS */}
            {activeSection === 'details' && (
              <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                    Required Faculty Member Input
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Please provide the missing contact and course-specific details.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mobile No. (REQUIRED USER INPUT) */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile No. <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      value={reportData.mobileNumber}
                      onChange={(e) => patchField('mobileNumber', e.target.value)}
                      placeholder="e.g., +91 9876543210"
                      className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 ${
                        validationErrors['mobileNumber']
                          ? 'border-rose-500 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-[#00236f] focus:ring-blue-100'
                      }`}
                    />
                    {validationErrors['mobileNumber'] && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {validationErrors['mobileNumber']}
                      </p>
                    )}
                  </div>

                  {/* Subject (REQUIRED USER INPUT) */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={reportData.subject}
                      onChange={(e) => patchField('subject', e.target.value)}
                      placeholder="e.g., Data Structures & Algorithms (KCS-301)"
                      className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 ${
                        validationErrors['subject']
                          ? 'border-rose-500 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-[#00236f] focus:ring-blue-100'
                      }`}
                    />
                    {validationErrors['subject'] && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {validationErrors['subject']}
                      </p>
                    )}
                  </div>

                  {/* Semester */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={reportData.semester}
                      onChange={(e) => patchField('semester', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00236f] focus:ring-1 focus:ring-blue-100 bg-white"
                    >
                      <option value="Odd Semester (3rd, 5th, 7th)">Odd Semester (3rd, 5th, 7th)</option>
                      <option value="Even Semester (4th, 6th, 8th)">Even Semester (4th, 6th, 8th)</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="3rd Semester">3rd Semester</option>
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                      <option value="7th Semester">7th Semester</option>
                      <option value="8th Semester">8th Semester</option>
                    </select>
                  </div>

                  {/* Designation Confirmation */}
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={reportData.designation}
                      onChange={(e) => patchField('designation', e.target.value)}
                      placeholder="e.g., Professor & Dean / Associate Professor"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    onClick={() => setActiveSection('survey')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Proceed to 10 Survey Questions</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: 10 EVALUATION QUESTIONS */}
            {activeSection === 'survey' && (
              <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
                <div className="border-b pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                      Feedback Survey Form for Faculty Member
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rate each of the 10 statements from 1 (Poor) to 5 (Excellent).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#00236f]">
                      {completedQuestionsCount}/10 Evaluated
                    </span>
                  </div>
                </div>

                {/* Rating Guide */}
                <div className="flex flex-wrap items-center gap-2 py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                  <span className="font-semibold text-slate-600">Grading Scale:</span>
                  {KRA7_RATING_OPTIONS.map((opt) => (
                    <span key={opt.value} className="text-slate-600 font-medium">
                      <strong style={{ color: opt.color }}>({opt.value})</strong> {opt.shortLabel}
                    </span>
                  ))}
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {KRA7_SURVEY_QUESTIONS.map((q) => {
                    const currentRating = reportData.ratings[q.id];
                    const hasError = !!validationErrors[`q_${q.id}`];

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-lg border transition ${
                          hasError
                            ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-200'
                            : currentRating
                            ? 'border-blue-200 bg-blue-50/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {q.id}
                          </span>
                          <p className="text-xs font-medium text-slate-800 leading-snug">
                            {q.statement}
                          </p>
                        </div>

                        {/* 1 to 5 Selector */}
                        <div className="grid grid-cols-5 gap-1.5 pl-7">
                          {KRA7_RATING_OPTIONS.map((opt) => {
                            const isSelected = currentRating === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleRatingChange(q.id, opt.value)}
                                className={`py-1.5 px-2 rounded text-center text-xs font-semibold transition cursor-pointer border flex flex-col items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#00236f] text-white border-[#00236f] shadow-xs'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                <span className="text-[12px] font-bold">{opt.value}</span>
                                <span
                                  className={`text-[9.5px] truncate max-w-full ${
                                    isSelected ? 'text-white/90' : 'text-slate-500'
                                  }`}
                                >
                                  {opt.shortLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {hasError && (
                          <p className="text-[10px] text-rose-600 mt-1 pl-7 flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">error</span>
                            {validationErrors[`q_${q.id}`]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t flex justify-between">
                  <button
                    onClick={() => setActiveSection('details')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={() => setActiveSection('satisfaction')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Proceed to Satisfaction &amp; Suggestions</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: OVERALL SATISFACTION & SUGGESTIONS */}
            {activeSection === 'satisfaction' && (
              <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-5 shadow-xs">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                    Overall Satisfaction &amp; Faculty Suggestions
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Rate on a scale of 1 to 10 and enter constructive curriculum feedback.
                  </p>
                </div>

                {/* Scale 1 to 10 */}
                <div
                  className={`p-3.5 rounded-lg border ${
                    validationErrors['overallSatisfaction']
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <label className="block text-xs font-semibold text-slate-800 mb-2 leading-relaxed">
                    On a scale of 1 to 10 how do you rate your overall satisfaction with the prescribed syllabus and the curriculum? <span className="text-rose-600 font-bold">*</span>
                  </label>

                  <div className="grid grid-cols-10 gap-1 my-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = reportData.overallSatisfaction === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSatisfactionChange(num)}
                          className={`py-2 text-center rounded text-xs font-bold transition cursor-pointer border flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-[#00236f] text-white border-[#00236f] shadow-md ring-2 ring-blue-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <span className="text-[13px]">{num}</span>
                          {isSelected && (
                            <span className="text-[10px] leading-none mt-0.5">✔</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
                    <span>1: Lowest Satisfaction</span>
                    <span>5: Moderate</span>
                    <span>10: Highest Satisfaction</span>
                  </div>

                  {validationErrors['overallSatisfaction'] && (
                    <p className="text-[11px] text-rose-600 mt-2 flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {validationErrors['overallSatisfaction']}
                    </p>
                  )}
                </div>

                {/* Suggestions if Any */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suggestions if Any (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={reportData.suggestions}
                    onChange={(e) => patchField('suggestions', e.target.value)}
                    placeholder="Enter any curriculum recommendations, syllabus revisions, laboratory improvements, or reference book additions..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Optional suggestions appear in the official document&apos;s suggestions box.
                  </p>
                </div>

                {/* Digital Verification */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    Faculty Signature Record
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Signatory: </span>
                      <strong className="text-slate-800">{reportData.facultyName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Date: </span>
                      <strong className="text-slate-800">{reportData.signatureDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-between">
                  <button
                    onClick={() => setActiveSection('survey')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition"
                  >
                    Back to Survey
                  </button>
                  <button
                    onClick={() => setActiveSection('evidence')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Proceed to Evidence &amp; Submit</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: EVIDENCE ATTACHMENT */}
            {activeSection === 'evidence' && (
              <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                    Supporting Documents &amp; Evidence (Optional)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Attach signed physical feedback forms, minutes of meetings, or analysis sheets if applicable.
                  </p>
                </div>

                {reportData.evidenceFile ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                        check_circle
                      </span>
                      <div>
                        <p className="text-xs font-bold text-emerald-900 m-0">
                          {reportData.evidenceFile.fileName}
                        </p>
                        <p className="text-[10px] text-emerald-700 m-0">
                          {reportData.evidenceFile.fileSize} &bull; Attached to KRA 7
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => patchField('evidenceFile', undefined)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#00236f] transition bg-slate-50/50">
                    <span className="material-symbols-outlined text-[32px] text-slate-400">
                      cloud_upload
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      Upload Signed Feedback Document or PDF
                    </p>
                    <p className="text-[10px] text-slate-400 mb-3">
                      Permitted formats: PDF, DOCX, JPG, PNG (Max 10 MB)
                    </p>
                    <label className="inline-block px-3 py-1.5 text-xs font-semibold text-[#00236f] bg-white border border-[#00236f] rounded hover:bg-blue-50 transition cursor-pointer">
                      <span>{uploadingEvidence ? 'Uploading...' : 'Browse File'}</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploadingEvidence}
                        className="hidden"
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1 m-0">
                    <span className="material-symbols-outlined text-[15px]">info</span>
                    Submission Checklist
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                    <li>Mobile No. and Subject filled</li>
                    <li>All 10 Survey questions evaluated ({completedQuestionsCount}/10 completed)</li>
                    <li>Overall satisfaction score selected ({reportData.overallSatisfaction ? `${reportData.overallSatisfaction}/10` : 'Pending'})</li>
                  </ul>
                </div>

                <div className="pt-3 border-t flex justify-between">
                  <button
                    onClick={() => setActiveSection('satisfaction')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition"
                  >
                    Back to Satisfaction
                  </button>
                  <button
                    onClick={handleSubmitToVC}
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Submit KRA 7 to VC</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT PANEL: LIVE REPORT PREVIEW ================= */}
        <section className="flex-1 bg-[#475569]/10 overflow-y-auto flex flex-col relative">
          {/* Preview Toolbar */}
          <div className="bg-white border-b border-[#c5c5d3] px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#00236f]">
                visibility
              </span>
              <span className="text-xs font-bold text-slate-800">
                Official KRA 7 Report Live Preview
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Exact Official Template
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-100 rounded border border-slate-200 p-0.5 text-xs">
                <button
                  onClick={() => setPreviewScale((s) => Math.max(0.6, s - 0.1))}
                  className="px-2 py-0.5 hover:bg-white rounded transition text-slate-700"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-2 text-[11px] font-mono font-medium">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.4, s + 0.1))}
                  className="px-2 py-0.5 hover:bg-white rounded transition text-slate-700"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setPreviewScale(1)}
                  className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 border-l border-slate-200 ml-1"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>

              {/* Fullscreen Preview Toggle */}
              <button
                onClick={() => setShowFullScreenPreview(!showFullScreenPreview)}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                title="Fullscreen Preview"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showFullScreenPreview ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>
          </div>

          {/* Live Document Preview Sheet Area */}
          <div className="flex-1 p-6 flex justify-center overflow-x-auto">
            <OfficialKRA7ReportPreview reportData={reportData} scale={previewScale} />
          </div>
        </section>
      </div>

      {/* Fullscreen Preview Modal */}
      {showFullScreenPreview && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/90 p-6 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center max-w-[840px] mx-auto w-full mb-4 text-white">
            <h3 className="font-bold text-sm">Full-Screen Official KRA 7 Report Preview</h3>
            <button
              onClick={() => setShowFullScreenPreview(false)}
              className="p-1 rounded hover:bg-white/10 text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <OfficialKRA7ReportPreview reportData={reportData} scale={1} />
          </div>
        </div>
      )}
    </div>
  );
}

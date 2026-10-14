"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentCode, BimonthlyCycle, VACReportData, VACCourseRow, VACSyllabusRow } from '../../types/kra';
import {
  getInitialVACReportData,
  validateVACReport,
  downloadVACDocx,
  downloadVACPdf,
  uploadEvidenceFile,
  deleteEvidenceFile,
  VACValidationResult
} from '../../services/vacReportService';
import OfficialVACReportPreview from './OfficialVACReportPreview';
import { api, isMockMode } from '../../services/api';

interface SmartVACReportBuilderProps {
  kraCode: string;
  departmentCode: DepartmentCode;
  cycle: BimonthlyCycle;
  onClose: () => void;
}

export default function SmartVACReportBuilder({
  kraCode,
  departmentCode,
  cycle,
  onClose,
}: SmartVACReportBuilderProps) {
  const {
    departments,
    getSubmission,
    saveDraftSubmission,
    submitKRAtoVC,
    showToast,
    role
  } = useApp();

  const deptInfo = useMemo(
    () => departments.find((d) => d.code === departmentCode),
    [departments, departmentCode]
  );

  const existingSub = getSubmission(kraCode, departmentCode, cycle);
  const currentStatus = existingSub?.status || 'Draft';

  // Initialize report state from existing submission or defaults
  const [reportData, setReportData] = useState<VACReportData>(() => {
    const existingVac = existingSub?.formData?.vacReport;
    return getInitialVACReportData(
      deptInfo?.name || departmentCode,
      deptInfo?.deanName || '',
      '2026-2027',
      existingVac
    );
  });

  const [activeSection, setActiveSection] = useState<string>('courses');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
  const [customIntroEnabled, setCustomIntroEnabled] = useState(false);

  // Auto-fill department name if missing
  useEffect(() => {
    if (deptInfo?.name && (!reportData.hodName || reportData.hodName === '')) {
      setReportData((prev) => ({
        ...prev,
        hodName: deptInfo.deanName,
      }));
    }
  }, [deptInfo]);

  // Patch report data state and clear specific field error
  const updateReport = (updater: (prev: VACReportData) => VACReportData) => {
    setReportData(updater);
  };

  const patchField = <K extends keyof VACReportData>(field: K, val: VACReportData[K]) => {
    setReportData((prev) => ({ ...prev, [field]: val }));
    if (validationErrors[field as string]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // Course row management
  const handleAddCourse = () => {
    const newCourse: VACCourseRow = {
      id: `c-${Date.now()}`,
      courseName: '',
      durationHours: 30,
      mode: 'Offline',
      resourcePerson: '',
      enrolled: '',
      completed: '',
    };
    updateReport((prev) => ({ ...prev, courses: [...prev.courses, newCourse] }));
  };

  const handleUpdateCourse = (idx: number, patch: Partial<VACCourseRow>) => {
    updateReport((prev) => {
      const nextCourses = [...prev.courses];
      nextCourses[idx] = { ...nextCourses[idx], ...patch };
      return { ...prev, courses: nextCourses };
    });
  };

  const handleRemoveCourse = (idx: number) => {
    if (reportData.courses.length <= 1) {
      showToast('At least one course is required.', 'info');
      return;
    }
    updateReport((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== idx),
    }));
  };

  // Syllabus row management
  const handleAddSyllabus = () => {
    const nextModNum = reportData.syllabus.length + 1;
    const newRow: VACSyllabusRow = {
      id: `s-${Date.now()}`,
      module: `Module ${nextModNum}`,
      topic: '',
      hours: 8,
    };
    updateReport((prev) => ({ ...prev, syllabus: [...prev.syllabus, newRow] }));
  };

  const handleUpdateSyllabus = (idx: number, patch: Partial<VACSyllabusRow>) => {
    updateReport((prev) => {
      const nextSyl = [...prev.syllabus];
      nextSyl[idx] = { ...nextSyl[idx], ...patch };
      return { ...prev, syllabus: nextSyl };
    });
  };

  const handleRemoveSyllabus = (idx: number) => {
    updateReport((prev) => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== idx),
    }));
  };

  // Learning Outcomes
  const handleAddOutcome = () => {
    updateReport((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, ''],
    }));
  };

  const handleUpdateOutcome = (idx: number, val: string) => {
    updateReport((prev) => {
      const nextLo = [...prev.learningOutcomes];
      nextLo[idx] = val;
      return { ...prev, learningOutcomes: nextLo };
    });
  };

  const handleRemoveOutcome = (idx: number) => {
    updateReport((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== idx),
    }));
  };

  // Feedback suggestions
  const handleAddSuggestion = () => {
    updateReport((prev) => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        suggestions: [...prev.feedback.suggestions, ''],
      },
    }));
  };

  const handleUpdateSuggestion = (idx: number, val: string) => {
    updateReport((prev) => {
      const nextSugs = [...prev.feedback.suggestions];
      nextSugs[idx] = val;
      return {
        ...prev,
        feedback: { ...prev.feedback, suggestions: nextSugs },
      };
    });
  };

  const handleRemoveSuggestion = (idx: number) => {
    updateReport((prev) => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        suggestions: prev.feedback.suggestions.filter((_, i) => i !== idx),
      },
    }));
  };

  // File Upload handling for Section J
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: number, docTitle: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB.', 'error');
      return;
    }

    setUploadingDocId(docId);
    try {
      let uploadedMeta: { id?: number; filename?: string; file_url?: string; file_size_kb?: number } = {};
      if (!isMockMode()) {
        const res = await uploadEvidenceFile(file, docTitle, kraCode, cycle);
        uploadedMeta = res;
      } else {
        uploadedMeta = {
          id: Date.now(),
          filename: file.name,
          file_size_kb: Math.round(file.size / 1024),
          file_url: '#'
        };
      }

      updateReport((prev) => {
        const nextDocs = prev.supportingDocuments.map((doc) => {
          if (doc.id === docId) {
            return {
              ...doc,
              attached: true,
              fileName: file.name,
              fileSize: `${Math.round(file.size / 1024)} KB`,
              fileUrl: uploadedMeta.file_url,
              fileId: uploadedMeta.id,
            };
          }
          return doc;
        });
        return { ...prev, supportingDocuments: nextDocs };
      });

      showToast(`Attached: ${file.name}`);
    } catch (err: any) {
      console.error('File upload error:', err);
      showToast(err?.response?.data?.error || 'Failed to upload file.', 'error');
    } finally {
      setUploadingDocId(null);
      e.target.value = '';
    }
  };

  const handleRemoveFile = async (docId: number) => {
    const targetDoc = reportData.supportingDocuments.find((d) => d.id === docId);
    if (targetDoc?.fileId && !isMockMode()) {
      try {
        await deleteEvidenceFile(targetDoc.fileId);
      } catch (err) {
        console.warn('Failed to delete file from backend:', err);
      }
    }

    updateReport((prev) => {
      const nextDocs = prev.supportingDocuments.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            attached: false,
            fileName: undefined,
            fileSize: undefined,
            fileUrl: undefined,
            fileId: undefined,
          };
        }
        return doc;
      });
      return { ...prev, supportingDocuments: nextDocs };
    });
    showToast('Attachment removed.', 'info');
  };

  // Save Draft action
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const totalCompleted = reportData.courses.reduce((sum, c) => sum + (Number(c.completed) || 0), 0);
      const submissionData = {
        ...existingSub?.formData,
        coordName: reportData.facultyCoordinator,
        achievementClaim: String(reportData.courses.length),
        remarks: `Value Added Courses Report (${reportData.courses.length} course(s), ${totalCompleted} student(s) completed)`,
        vacReport: reportData,
      };

      saveDraftSubmission(kraCode, departmentCode, cycle, submissionData);
      showToast('Draft report saved to institutional database.');
    } catch (e) {
      showToast('Error saving draft report.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Validate action
  const handleValidate = () => {
    const result: VACValidationResult = validateVACReport(reportData);
    setValidationErrors(result.errors);
    if (result.isValid) {
      showToast('All report validation requirements satisfied! Ready to submit.', 'success');
    } else {
      const firstError = Object.values(result.errors)[0];
      showToast(`Validation check failed: ${firstError}`, 'error');
    }
    return result.isValid;
  };

  // Submit to VC action
  const handleSubmit = async () => {
    const isValid = handleValidate();
    if (!isValid) return;

    if (!confirm('Are you sure you want to submit this official KRA Report to the VC Office for verification?')) {
      return;
    }

    setIsSaving(true);
    try {
      const totalCompleted = reportData.courses.reduce((sum, c) => sum + (Number(c.completed) || 0), 0);
      const submissionData = {
        ...existingSub?.formData,
        coordName: reportData.facultyCoordinator,
        achievementClaim: String(reportData.courses.length),
        remarks: `Value Added Courses Report (${reportData.courses.length} course(s), ${totalCompleted} student(s) completed)`,
        vacReport: reportData,
      };

      submitKRAtoVC(kraCode, departmentCode, cycle, submissionData);
      showToast('Report successfully submitted to the VC Office.');
      onClose();
    } catch (e) {
      showToast('Error submitting report.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export handlers
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadVACPdf(reportData, deptInfo?.name || departmentCode);
      showToast('Official PDF downloaded successfully.');
    } catch (e) {
      // Fallback: browser print dialog
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await downloadVACDocx(reportData, deptInfo?.name || departmentCode);
      showToast('Official editable Word (.docx) downloaded successfully.');
    } catch (e) {
      showToast('Error exporting Word document.', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/70 backdrop-blur-xs flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Navigation & Action Toolbar */}
      <header className="bg-white border-b border-[#c5c5d3] px-6 py-3 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-[#515f74] hover:text-[#0b1c30] transition flex items-center gap-1 text-xs font-semibold"
            title="Return to KRA dashboard"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to KRAs
          </button>
          <div className="h-5 w-px bg-slate-300" />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#00236f] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide font-mono">
                {kraCode}
              </span>
              <h1 className="text-sm font-bold text-[#0b1c30] truncate max-w-md md:max-w-xl">
                Smart KRA Report Builder: Value Added Courses, Add-on Courses &amp; MOOCs
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  currentStatus === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : currentStatus === 'Submitted'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : currentStatus === 'Returned'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#515f74] mt-0.5">
              {deptInfo?.name || departmentCode} &bull; Academic Cycle: {cycle}
            </p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded border border-[#c5c5d3] hover:bg-slate-50 text-[#0b1c30] text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
            Validate
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-[#00236f] text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Download official PDF report"
          >
            <span className="material-symbols-outlined text-[16px] text-red-600">picture_as_pdf</span>
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-blue-300 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Download editable Microsoft Word .docx report"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-700">description</span>
            {isExportingDocx ? 'Exporting...' : 'Export Word'}
          </button>

          {role !== 'vc' && currentStatus !== 'Approved' && (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-1.5 rounded bg-[#00236f] hover:bg-[#1e3a8a] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Submit to VC
            </button>
          )}
        </div>
      </header>

      {/* Main 2-Panel Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT PANEL: Required Inputs Only ================= */}
        <section className="w-full lg:w-[48%] border-r border-[#c5c5d3] bg-[#f8f9ff] flex flex-col overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className="bg-white border-b border-[#c5c5d3] px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            {[
              { id: 'courses', label: '1. Courses', icon: 'school' },
              { id: 'syllabus', label: '2. Syllabus', icon: 'menu_book' },
              { id: 'outcomes', label: '3. Outcomes', icon: 'psychology' },
              { id: 'assessment', label: '4. Assessment', icon: 'fact_check' },
              { id: 'impact', label: '5. Impact', icon: 'trending_up' },
              { id: 'feedback', label: '6. Feedback', icon: 'rate_review' },
              { id: 'signatories', label: '7. Signatures', icon: 'draw' },
              { id: 'evidence', label: '8. Evidence (18)', icon: 'attachment' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                  activeSection === tab.id
                    ? 'bg-[#00236f] text-white'
                    : 'bg-slate-50 text-[#515f74] hover:bg-slate-100 hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Scroll Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Auto-Populated Institutional Context Card */}
            <div className="bg-white p-4 rounded-lg border border-[#c5c5d3] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider">
                  Section A: Institutional Context (Auto-Populated)
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  System Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Department</span>
                  <span className="font-bold text-[#0b1c30]">{deptInfo?.name || departmentCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Academic Session</span>
                  <span className="font-bold text-[#0b1c30]">{reportData.academicSession}</span>
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">Semester</label>
                  <input
                    type="text"
                    value={reportData.semester}
                    onChange={(e) => patchField('semester', e.target.value)}
                    placeholder="e.g. Odd Semester (3rd, 5th, 7th)"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">Faculty Coordinator</label>
                  <input
                    type="text"
                    value={reportData.facultyCoordinator}
                    onChange={(e) => patchField('facultyCoordinator', e.target.value)}
                    placeholder="Coordinator Name"
                    className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                  />
                  {validationErrors['facultyCoordinator'] && (
                    <span className="text-rose-600 text-[10px] block mt-0.5">{validationErrors['facultyCoordinator']}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION C: DETAILS OF COURSES */}
            {activeSection === 'courses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#0b1c30]">Section C: Detail of Value Added Courses</h2>
                    <p className="text-xs text-slate-500">Provide details for all VAC/Add-on courses conducted.</p>
                  </div>
                  <button
                    onClick={handleAddCourse}
                    className="px-3 py-1.5 bg-[#00236f] text-white text-xs font-bold rounded hover:bg-[#1e3a8a] flex items-center gap-1 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Course
                  </button>
                </div>

                {reportData.courses.map((course, idx) => (
                  <div key={course.id || idx} className="bg-white p-4 rounded-lg border border-[#c5c5d3] shadow-2xs space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-[#00236f]">Course #{idx + 1}</span>
                      {reportData.courses.length > 1 && (
                        <button
                          onClick={() => handleRemoveCourse(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Course Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={course.courseName}
                          onChange={(e) => handleUpdateCourse(idx, { courseName: e.target.value })}
                          placeholder="e.g. Advanced Full Stack Web Development with Next.js & Python"
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none font-medium"
                        />
                        {validationErrors[`course_${idx}_name`] && (
                          <span className="text-rose-600 text-[10px] mt-0.5 block">{validationErrors[`course_${idx}_name`]}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Duration (Hours) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={course.durationHours}
                          onChange={(e) => handleUpdateCourse(idx, { durationHours: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="30"
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Mode <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={course.mode}
                          onChange={(e) => handleUpdateCourse(idx, { mode: e.target.value as any })}
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none bg-white"
                        >
                          <option value="Offline">Offline</option>
                          <option value="Online">Online</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Resource Person / Agency <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={course.resourcePerson}
                          onChange={(e) => handleUpdateCourse(idx, { resourcePerson: e.target.value })}
                          placeholder="e.g. Dr. Vineet Sharma / Industry Partner AWS"
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                        />
                        {validationErrors[`course_${idx}_resource`] && (
                          <span className="text-rose-600 text-[10px] mt-0.5 block">{validationErrors[`course_${idx}_resource`]}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          No. of Students Enrolled <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={course.enrolled}
                          onChange={(e) => handleUpdateCourse(idx, { enrolled: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="120"
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          No. of Students Completed <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={course.completed}
                          onChange={(e) => handleUpdateCourse(idx, { completed: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="115"
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                        />
                        {validationErrors[`course_${idx}_completed_exceed`] && (
                          <span className="text-rose-600 text-[10px] mt-0.5 block font-bold">{validationErrors[`course_${idx}_completed_exceed`]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION D: SYLLABUS */}
            {activeSection === 'syllabus' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#0b1c30]">Section D: Course Content / Syllabus</h2>
                    <p className="text-xs text-slate-500">Structured topic distribution with contact hours.</p>
                  </div>
                  <button
                    onClick={handleAddSyllabus}
                    className="px-3 py-1.5 bg-[#00236f] text-white text-xs font-bold rounded hover:bg-[#1e3a8a] flex items-center gap-1 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Module
                  </button>
                </div>

                <div className="space-y-3">
                  {reportData.syllabus.map((s, idx) => (
                    <div key={s.id || idx} className="bg-white p-3 rounded-lg border border-[#c5c5d3] flex items-center gap-3">
                      <div className="w-28 shrink-0">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Module</label>
                        <input
                          type="text"
                          value={s.module}
                          onChange={(e) => handleUpdateSyllabus(idx, { module: e.target.value })}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded font-semibold"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Topic Details</label>
                        <input
                          type="text"
                          value={s.topic}
                          onChange={(e) => handleUpdateSyllabus(idx, { topic: e.target.value })}
                          placeholder="e.g. Modern Web Architecture & REST API Design"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded"
                        />
                      </div>
                      <div className="w-20 shrink-0">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={s.hours}
                          onChange={(e) => handleUpdateSyllabus(idx, { hours: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded text-center"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSyllabus(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 shrink-0 mt-3"
                        title="Remove row"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION E: LEARNING OUTCOMES */}
            {activeSection === 'outcomes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#0b1c30]">Section E: Learning Outcomes</h2>
                    <p className="text-xs text-slate-500">What students will be able to do upon course completion.</p>
                  </div>
                  <button
                    onClick={handleAddOutcome}
                    className="px-3 py-1.5 bg-[#00236f] text-white text-xs font-bold rounded hover:bg-[#1e3a8a] flex items-center gap-1 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Outcome
                  </button>
                </div>

                <div className="space-y-3">
                  {reportData.learningOutcomes.map((lo, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-[#c5c5d3] flex items-start gap-2">
                      <span className="font-bold text-xs text-[#00236f] mt-1.5">{idx + 1}.</span>
                      <textarea
                        value={lo}
                        onChange={(e) => handleUpdateOutcome(idx, e.target.value)}
                        placeholder="State clear, measurable learning outcome..."
                        rows={2}
                        className="flex-1 p-2 text-xs border border-slate-300 rounded focus:border-[#00236f] outline-none"
                      />
                      <button
                        onClick={() => handleRemoveOutcome(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION F: ASSESSMENT AND CERTIFICATION */}
            {activeSection === 'assessment' && (
              <div className="space-y-4 bg-white p-5 rounded-lg border border-[#c5c5d3]">
                <div>
                  <h2 className="text-sm font-bold text-[#0b1c30]">Section F: Assessment and Certification</h2>
                  <p className="text-xs text-slate-500">Prescribed evaluation and certification parameters.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Assessment Method</label>
                    <input
                      type="text"
                      value={reportData.assessment.method}
                      onChange={(e) => patchField('assessment', { ...reportData.assessment, method: e.target.value })}
                      placeholder="e.g. Continuous Evaluation, Capstone Project, and Final Test"
                      className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Minimum Attendance Requirement</label>
                    <input
                      type="text"
                      value={reportData.assessment.minAttendance}
                      onChange={(e) => patchField('assessment', { ...reportData.assessment, minAttendance: e.target.value })}
                      placeholder="e.g. 75%"
                      className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Passing / Completion Criteria</label>
                    <input
                      type="text"
                      value={reportData.assessment.passingCriteria}
                      onChange={(e) => patchField('assessment', { ...reportData.assessment, passingCriteria: e.target.value })}
                      placeholder="e.g. Minimum 50% in final assessment and 75% attendance"
                      className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Certificate Issuing Authority</label>
                    <input
                      type="text"
                      value={reportData.assessment.issuingAuthority}
                      onChange={(e) => patchField('assessment', { ...reportData.assessment, issuingAuthority: e.target.value })}
                      placeholder="e.g. KIET Deemed to be University"
                      className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Number of Certificates Issued</label>
                    <input
                      type="number"
                      min="0"
                      value={reportData.assessment.certificatesIssued}
                      onChange={(e) => patchField('assessment', { ...reportData.assessment, certificatesIssued: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="115"
                      className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION G: OUTCOME AND IMPACT */}
            {activeSection === 'impact' && (
              <div className="space-y-4 bg-white p-5 rounded-lg border border-[#c5c5d3]">
                <div>
                  <h2 className="text-sm font-bold text-[#0b1c30]">Section G: Outcomes and Impact</h2>
                  <p className="text-xs text-slate-500">Highlight applicable institutional impact indicators (leave blank if not applicable).</p>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { key: 'technicalSkills', label: 'Improvement in technical/professional skills', placeholder: 'e.g. Mastery in React, Next.js, and API security' },
                    { key: 'employability', label: 'Improvement in employability skills', placeholder: 'e.g. Enhanced problem solving in recruitment test' },
                    { key: 'industryCert', label: 'Industry certification obtained', placeholder: 'e.g. 115 certificates awarded' },
                    { key: 'completionRate', label: 'Successful completion/certification rate', placeholder: 'e.g. 95.8% completion' },
                    { key: 'internships', label: 'Internship opportunities', placeholder: 'e.g. 18 students shortlisted for tech internships' },
                    { key: 'placementSupport', label: 'Placement support/outcomes', placeholder: 'e.g. Directly mapped to campus recruitment drives' },
                    { key: 'studentProjects', label: 'Student projects developed', placeholder: 'e.g. 24 production capstone projects built' },
                    { key: 'hackathons', label: 'Participation in competitions/hackathons', placeholder: 'e.g. 3 teams qualified in Smart India Hackathon' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{field.label}</label>
                      <input
                        type="text"
                        value={(reportData.outcomeAndImpact as any)?.[field.key] || ''}
                        onChange={(e) =>
                          patchField('outcomeAndImpact', {
                            ...reportData.outcomeAndImpact,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        className="w-full p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION H: FEEDBACK */}
            {activeSection === 'feedback' && (
              <div className="space-y-4 bg-white p-5 rounded-lg border border-[#c5c5d3]">
                <div>
                  <h2 className="text-sm font-bold text-[#0b1c30]">Section H: Student Feedback Summary</h2>
                  <p className="text-xs text-slate-500">Consolidated participant feedback metrics and suggestions.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Overall Feedback Score (Out of 5.0) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={reportData.feedback.score}
                        onChange={(e) =>
                          patchField('feedback', {
                            ...reportData.feedback,
                            score: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        className="w-28 p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none font-bold text-sm"
                      />
                      <span className="text-slate-500 font-bold text-sm">/ 5.0</span>
                    </div>
                    {validationErrors['feedback_score'] && (
                      <span className="text-rose-600 text-[10px] block mt-1 font-bold">{validationErrors['feedback_score']}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-bold text-slate-700">Major Suggestions Received</label>
                      <button
                        onClick={handleAddSuggestion}
                        className="text-xs text-[#00236f] font-bold flex items-center gap-0.5 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Add Suggestion
                      </button>
                    </div>

                    <div className="space-y-2">
                      {reportData.feedback.suggestions.map((sug, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-bold text-slate-500 w-4">{idx + 1}.</span>
                          <input
                            type="text"
                            value={sug}
                            onChange={(e) => handleUpdateSuggestion(idx, e.target.value)}
                            placeholder="e.g. Include more practical hands-on exercises"
                            className="flex-1 p-2 border border-slate-300 rounded focus:border-[#00236f] outline-none"
                          />
                          <button
                            onClick={() => handleRemoveSuggestion(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION I: SIGNATORIES */}
            {activeSection === 'signatories' && (
              <div className="space-y-4 bg-white p-5 rounded-lg border border-[#c5c5d3]">
                <div>
                  <h2 className="text-sm font-bold text-[#0b1c30]">Section I: Prepared By and Approved By</h2>
                  <p className="text-xs text-slate-500">Signatory and authorization details for official compliance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Prepared By */}
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                    <span className="font-bold text-[#00236f] block">Prepared By</span>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block">Name</label>
                      <input
                        type="text"
                        value={reportData.preparedBy.name}
                        onChange={(e) =>
                          patchField('preparedBy', { ...reportData.preparedBy, name: e.target.value })
                        }
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block">Designation</label>
                      <input
                        type="text"
                        value={reportData.preparedBy.designation}
                        onChange={(e) =>
                          patchField('preparedBy', { ...reportData.preparedBy, designation: e.target.value })
                        }
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block">Date</label>
                      <input
                        type="text"
                        value={reportData.preparedBy.date}
                        onChange={(e) =>
                          patchField('preparedBy', { ...reportData.preparedBy, date: e.target.value })
                        }
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  {/* Approved By */}
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                    <span className="font-bold text-[#00236f] block">Approved By (HOD / Dean)</span>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block">Name</label>
                      <input
                        type="text"
                        value={reportData.approvedBy.name}
                        onChange={(e) =>
                          patchField('approvedBy', { ...reportData.approvedBy, name: e.target.value })
                        }
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block">Designation</label>
                      <input
                        type="text"
                        value={reportData.approvedBy.designation}
                        onChange={(e) =>
                          patchField('approvedBy', { ...reportData.approvedBy, designation: e.target.value })
                        }
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block">Date</label>
                      <input
                        type="text"
                        value={reportData.approvedBy.date}
                        onChange={(e) =>
                          patchField('approvedBy', { ...reportData.approvedBy, date: e.target.value })
                        }
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION J: SUPPORTING DOCUMENTS (18 ITEMS) */}
            {activeSection === 'evidence' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]">
                  <h2 className="text-sm font-bold text-[#0b1c30]">Section J: List of Supporting Documents (18 Items)</h2>
                  <p className="text-xs text-slate-500">
                    Upload official evidence files for mandatory and applicable audit items.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {reportData.supportingDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-3 rounded-lg border border-[#c5c5d3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2 max-w-md">
                        <span className="font-bold text-slate-400 mt-0.5">{doc.id}.</span>
                        <div>
                          <span className="font-medium text-[#0b1c30] leading-snug">{doc.title}</span>
                          {doc.attached && (
                            <div className="text-[11px] text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              {doc.fileName} {doc.fileSize && `(${doc.fileSize})`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {doc.attached ? (
                          <div className="flex items-center gap-2">
                            {doc.fileUrl && doc.fileUrl !== '#' && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#00236f] text-xs font-semibold rounded border border-slate-300 transition"
                              >
                                View
                              </a>
                            )}
                            <button
                              onClick={() => handleRemoveFile(doc.id)}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded transition"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[11px] font-bold px-3 py-1.5 rounded transition inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                            {uploadingDocId === doc.id ? 'Uploading...' : 'Attach File'}
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, doc.id, doc.title)}
                              className="hidden"
                              disabled={uploadingDocId === doc.id}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT PANEL: Live Official Report Preview ================= */}
        <section className="hidden lg:flex flex-1 flex-col bg-[#515f74]/15 overflow-hidden">
          {/* Preview Controls Bar */}
          <div className="bg-white border-b border-[#c5c5d3] px-6 py-2.5 flex items-center justify-between text-xs shrink-0 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0b1c30] font-bold">
              <span className="material-symbols-outlined text-[18px] text-[#00236f]">visibility</span>
              Live Official Report Preview (Exact 3-Page Template)
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Auto-Synchronized
              </span>
              <span>Prints directly to official A4 proforma</span>
            </div>
          </div>

          {/* Document Preview Viewport with natural paper scrolling */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center">
            <div className="w-full max-w-[850px]">
              <OfficialVACReportPreview
                reportData={reportData}
                departmentName={deptInfo?.name || departmentCode}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

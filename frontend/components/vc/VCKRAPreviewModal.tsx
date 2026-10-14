'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompletedDocument, KRASubmission, ReportFormat } from '../../types/kra';
import {
  formatProgress,
  isDocFilled,
  isNumericMetric,
  isValidHttpUrl,
  submissionCompletion,
} from '../../services/kraUtils';
import { buildSubmissionReportHtml, downloadHtmlFile } from '../../services/reportDoc';
import OfficialVACReportPreview from '../kra-forms/OfficialVACReportPreview';
import { downloadVACPdf, downloadVACDocx } from '../../services/vacReportService';

type DocTab = 'vac_report' | 'proforma' | 'template' | 'format';

function InfoCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-[#f8f9ff] rounded px-3 py-2 border border-[#c5c5d3]/50">
      <span className="block text-[10px] font-bold uppercase text-[#515f74]">{label}</span>
      <span className="text-[#0b1c30]">{value && value.trim() ? value : '—'}</span>
    </div>
  );
}

/** Read-only rendering of one completed VC-uploaded document. */
function CompletedDocumentView({
  format,
  doc,
}: {
  format: ReportFormat;
  doc?: CompletedDocument;
}) {
  const fields = Object.entries(doc?.fields ?? {}).filter(([, v]) => String(v ?? '').trim());
  const rows = doc?.table?.rows ?? [];
  const cols = doc?.table?.columns ?? [];

  return (
    <div className="border border-[#c5c5d3]/70 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-[#eff4ff] border-b border-[#c5c5d3]/70 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[13px] font-bold text-[#0b1c30]">{format.name}</h4>
          {format.fileName && (
            <p className="text-[11px] font-mono text-[#515f74] truncate">
              Original template: {format.fileName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {format.fileType && (
            <span className="bg-white text-[#00236f] text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
              {format.fileType}
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              isDocFilled(doc)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isDocFilled(doc) ? 'Completed' : 'Not completed'}
          </span>
        </div>
      </div>

      {!doc ? (
        <p className="p-5 text-center text-xs text-amber-700">
          This document was not completed by the Dean.
        </p>
      ) : (
        <div className="p-4 space-y-3 bg-white">
          {fields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {fields.map(([label, value]) => (
                <div key={label} className="bg-[#f8f9ff] rounded px-3 py-2 border border-[#c5c5d3]/50">
                  <span className="block text-[10px] font-bold uppercase text-[#515f74]">{label}</span>
                  <span className="text-xs text-[#0b1c30]">{value}</span>
                </div>
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto border border-[#c5c5d3]/70 rounded">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#eff4ff] text-[#515f74] uppercase text-[10px] font-bold">
                  <tr>
                    {cols.map((c) => (
                      <th key={c} className="py-2 px-2 border-b border-[#c5c5d3]/70">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/50">
                  {rows.map((r, i) => (
                    <tr key={i}>
                      {cols.map((_, ci) => (
                        <td key={ci} className="py-2 px-2 text-[#0b1c30] align-top">
                          {r[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(doc.narrative ?? '').trim() && (
            <div>
              <span className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
                Completed Content
              </span>
              <p className="text-xs text-[#0b1c30] leading-relaxed whitespace-pre-wrap">
                {doc.narrative}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * SINGLE consolidated VC KRA preview.
 * Shows the KRA information, all submitted documents (Performa, Report Template,
 * Report Format), completion status, evidence including the Google Drive link,
 * and the Preview / Download / Approve / Return actions in one interface.
 * All content comes from the same submission state the Dean filled.
 */
export default function VCKRAPreviewModal({
  submission,
  onClose,
  onOpenReturnModal,
}: {
  submission: KRASubmission | null;
  onClose: () => void;
  onOpenReturnModal: (submissionId: string) => void;
}) {
  const { kras, departments, approveSubmission, showToast, openTimelineModal } = useApp();
  if (!submission) return null;

  const sub = submission;
  const kra = kras.find((k) => k.code === sub.kraCode);
  const dept = departments.find((d) => d.code === sub.dept);
  const isKRA1 = (sub.kraCode || '').replace(/[^0-9]/g, '') === '1' || !!sub.formData?.vacReport;
  const [tab, setTab] = useState<DocTab>(isKRA1 && sub.formData?.vacReport ? 'vac_report' : 'proforma');
  const [showFullReport, setShowFullReport] = useState(false);
  const numeric = kra ? isNumericMetric(kra.metricType) : false;
  const completion = submissionCompletion(kra, sub.formData);
  const driveLink = (sub.formData.evidenceDriveLink ?? '').trim();
  const driveValid = isValidHttpUrl(driveLink);

  const handleDownload = () => {
    if (!kra) return;
    const deptName = dept?.name || sub.dept;
    const name = `${sub.dept}_${sub.kraCode.replace(/\s+/g, '_')}_${sub.cycle.replace(/\s+/g, '')}.html`;
    downloadHtmlFile(buildSubmissionReportHtml(kra, sub, deptName), name);
    showToast(`Downloaded ${name}`);
  };

  const statusItems = [
    ...(isKRA1
      ? [
          {
            label: 'Official VAC Report (3-Page)',
            done: !!sub.formData?.vacReport,
            note: sub.formData?.vacReport ? 'Completed' : 'Not filled yet',
          },
        ]
      : []),
    { label: 'Performa', done: completion.performa, note: completion.performa ? 'Completed' : 'Not completed' },
    {
      label: 'Report Template',
      done: completion.reportTemplate,
      note: completion.hasReportTemplate
        ? completion.reportTemplate
          ? 'Completed'
          : 'Not completed'
        : 'No template uploaded',
    },
    {
      label: 'Report Format',
      done: completion.reportFormat,
      note: completion.hasReportFormat
        ? completion.reportFormat
          ? 'Completed'
          : 'Not completed'
        : 'No format uploaded',
    },
    { label: 'Evidence', done: completion.evidence, note: completion.evidence ? 'Added' : 'Not added' },
  ];

  const tabBtn = (key: DocTab, label: string, icon: string) => {
    const active = tab === key;
    const done =
      key === 'vac_report'
        ? !!sub.formData?.vacReport
        : key === 'proforma'
          ? completion.performa
          : key === 'template'
            ? completion.reportTemplate
            : completion.reportFormat;
    return (
      <button
        key={key}
        onClick={() => setTab(key)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-bold border-b-2 transition ${
          active
            ? 'bg-white text-[#00236f] border-[#00236f]'
            : 'bg-[#f8f9ff] text-[#515f74] border-transparent hover:bg-white'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {done ? '✓' : '⚠'}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs flex flex-col p-3 sm:p-5">
      <div className="relative bg-white rounded-xl shadow-2xl border border-[#c5c5d3]/70 w-full max-w-[1400px] mx-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#c5c5d3]/70 flex items-center justify-between gap-3 bg-[#f8f9ff]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#00236f] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                CONSOLIDATED KRA PREVIEW
              </span>
              <h3 className="text-[16px] font-bold text-[#0b1c30] truncate">
                {sub.kraCode} — {sub.kraTitle}
              </h3>
              <span className="text-[11px] font-bold text-[#515f74]">
                Department: {dept?.name || sub.dept} ({sub.dept}) • Cycle: {sub.cycle}
              </span>
            </div>
            <p className="text-[11px] text-[#515f74] mt-0.5">
              Dean: {sub.deanName} • Submitted: {sub.submittedDate || 'Draft (not yet submitted)'} • Status:{' '}
              <strong>{sub.status}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openTimelineModal(sub)}
              className="bg-white border border-[#c5c5d3] hover:bg-slate-100 text-[#515f74] px-3 py-2 rounded text-xs font-bold transition"
              title="View audit trail"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#515f74] hover:text-[#0b1c30] p-1.5 rounded transition"
              title="Close preview"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* KRA Information */}
          <div className="bg-white rounded-lg border border-[#c5c5d3]/70 shadow-xs p-4">
            <span className="text-[11px] font-bold uppercase text-[#515f74] block mb-2">
              KRA Information
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#eff4ff] rounded px-3 py-2">
                <span className="block text-[10px] font-bold uppercase text-[#515f74]">Annual Target</span>
                <span className="font-mono font-bold text-[#00236f]">
                  {kra ? kra.annualTargetDisplay || kra.annualTarget : sub.annualTarget}
                </span>
              </div>
              <div className="bg-[#eff4ff] rounded px-3 py-2">
                <span className="block text-[10px] font-bold uppercase text-[#515f74]">
                  Target Description
                </span>
                <span className="text-[#0b1c30]">{kra?.targetDescription ?? '—'}</span>
              </div>
              <div className="bg-[#eff4ff] rounded px-3 py-2">
                <span className="block text-[10px] font-bold uppercase text-[#515f74]">Metric Type</span>
                <span className="text-[#0b1c30] font-semibold">{sub.metricType}</span>
              </div>
              <div className="bg-[#eff4ff] rounded px-3 py-2">
                <span className="block text-[10px] font-bold uppercase text-[#515f74]">
                  Current Cycle Achievement
                </span>
                <span className="font-mono font-bold text-[#00236f]">{sub.claim}</span>
                {numeric ? (
                  <span className="block font-mono text-[11px] font-bold text-emerald-700">
                    Progress: {formatProgress(sub.progress)}
                    {sub.isTargetExceeded ? ' • ★ Target Exceeded' : ''}
                  </span>
                ) : (
                  <span className="block text-[10px] text-[#515f74]">
                    Status-based metric — no numeric progress applied
                  </span>
                )}
              </div>
            </div>
            {sub.returnReason && (
              <div className="mt-3 bg-rose-50 border border-rose-200 rounded p-3 text-xs text-rose-800">
                <strong className="block text-[10px] uppercase mb-0.5">VC Return Remark</strong>
                {sub.returnReason}
              </div>
            )}
          </div>

          {/* SUBMITTED DOCUMENTS */}
          <div>
            <span className="text-[11px] font-bold uppercase text-[#515f74] block mb-2">
              Submitted Documents
            </span>
            <div className="flex items-end gap-1 border-b border-[#c5c5d3]/70">
              {isKRA1 && tabBtn('vac_report', 'Official VAC Report (3-Page)', 'menu_book')}
              {tabBtn('proforma', 'Performa', 'edit_document')}
              {tabBtn('template', 'Report Template', 'analytics')}
              {tabBtn('format', 'Report Format', 'description')}
            </div>

            <div className="bg-white border border-t-0 border-[#c5c5d3]/70 rounded-b-lg p-4 min-h-[220px]">
              {tab === 'vac_report' && (
                <div className="space-y-4">
                  {sub.formData?.vacReport ? (
                    <div className="max-w-[950px] mx-auto border border-[#c5c5d3] rounded-lg p-3 bg-[#f4f5f9]">
                      <div className="mb-3 flex items-center justify-between pb-2 border-b border-[#c5c5d3]">
                        <span className="text-xs font-bold text-[#00236f] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          Official Institutional VAC / Add-on / MOOCs Report (Exact 3-Page Format)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await downloadVACPdf(sub.formData.vacReport!, dept?.name || sub.dept);
                                showToast('Official VAC PDF downloaded successfully');
                              } catch {
                                showToast('Failed to download Official VAC PDF');
                              }
                            }}
                            className="bg-red-700 hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition"
                          >
                            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                            PDF
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await downloadVACDocx(sub.formData.vacReport!, dept?.name || sub.dept);
                                showToast('Official VAC DOCX downloaded successfully');
                              } catch {
                                showToast('Failed to download Official VAC Word document');
                              }
                            }}
                            className="bg-blue-800 hover:bg-blue-900 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition"
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            Word (.docx)
                          </button>
                        </div>
                      </div>
                      <OfficialVACReportPreview
                        reportData={sub.formData.vacReport}
                        departmentName={dept?.name || sub.dept}
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-lg border border-dashed border-[#c5c5d3]">
                      <span className="material-symbols-outlined text-4xl text-[#515f74] mb-2">article</span>
                      <p className="text-sm font-semibold text-[#0b1c30]">No Official VAC Report Draft Available</p>
                      <p className="text-xs text-[#515f74] mt-1">The department has not yet submitted or saved the official 3-page VAC report for this cycle.</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'proforma' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <InfoCell label="KRA Coordinator" value={sub.formData.coordName} />
                    <InfoCell label="Bimonthly Cycle" value={sub.cycle} />
                    <InfoCell label="Coordinator Target Narrative" value={sub.formData.targetDesc} />
                    <InfoCell label="Dean Remarks" value={sub.formData.remarks} />
                  </div>

                  {sub.metricType === 'Policy/Compliance' && (
                    <div className="border border-[#c5c5d3]/70 rounded p-3">
                      <span className="text-[10px] font-bold uppercase text-[#515f74] block">
                        Compliance Status
                      </span>
                      <span className="text-sm font-bold text-[#00236f]">
                        {sub.formData.complianceStatus || '—'}
                      </span>
                      <p className="text-[10px] text-[#515f74] mt-1">
                        Compliance-based KRA — evaluated on policy status, not achievement ÷ annual target.
                      </p>
                    </div>
                  )}

                  <div className="border border-[#c5c5d3]/70 rounded p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#515f74] block">Evidence</span>
                    <div className="text-xs">
                      <span className="text-[#515f74]">Uploaded file: </span>
                      <span className="font-mono text-[#0b1c30]">
                        {sub.formData.evidenceFileName || '—'}
                        {sub.formData.evidenceFileSize ? ` (${sub.formData.evidenceFileSize})` : ''}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#515f74]">Google Drive link: </span>
                      {!driveLink ? (
                        <span className="text-slate-400">—</span>
                      ) : driveValid ? (
                        <a
                          href={driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[#00236f] hover:underline break-all"
                        >
                          {driveLink}
                        </a>
                      ) : (
                        <span className="font-mono text-rose-600">Invalid URL — {driveLink}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'template' &&
                ((kra?.summaryTemplates.length ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No Summary Report Template was uploaded by the VC for this KRA.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {kra!.summaryTemplates.map((f) => (
                      <CompletedDocumentView
                        key={f.id}
                        format={f}
                        doc={sub.formData.summaryTemplateDocs?.find((d) => d.formatId === f.id)}
                      />
                    ))}
                  </div>
                ))}

              {tab === 'format' &&
                ((kra?.prescribedReportFormats.length ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No Prescribed Report Format was uploaded by the VC for this KRA.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {kra!.prescribedReportFormats.map((f) => (
                      <CompletedDocumentView
                        key={f.id}
                        format={f}
                        doc={sub.formData.reportFormatDocs?.find((d) => d.formatId === f.id)}
                      />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer: completion status + VC actions */}
        <div className="px-5 py-3 border-t border-[#c5c5d3]/70 bg-[#f8f9ff] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {statusItems.map((s) => (
              <span key={s.label} className="flex items-center gap-1.5 text-xs">
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    s.done ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {s.done ? 'check_circle' : 'warning'}
                </span>
                <span className="font-bold text-[#0b1c30]">{s.label}</span>
                <span className={s.done ? 'text-emerald-700' : 'text-amber-700'}>{s.note}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isKRA1 && sub.formData?.vacReport && (
              <>
                <button
                  onClick={async () => {
                    try {
                      await downloadVACPdf(sub.formData.vacReport!, dept?.name || sub.dept);
                      showToast('Official VAC PDF downloaded successfully');
                    } catch {
                      showToast('Failed to download Official VAC PDF');
                    }
                  }}
                  className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
                  title="Download Official 3-Page PDF Report"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  Official PDF
                </button>
                <button
                  onClick={async () => {
                    try {
                      await downloadVACDocx(sub.formData.vacReport!, dept?.name || sub.dept);
                      showToast('Official VAC DOCX downloaded successfully');
                    } catch {
                      showToast('Failed to download Official VAC Word document');
                    }
                  }}
                  className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
                  title="Download Official Word (.docx) Document"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Official DOCX
                </button>
              </>
            )}
            <button
              onClick={() => setShowFullReport((v) => !v)}
              className="bg-white border border-[#c5c5d3] hover:bg-slate-100 text-[#00236f] px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="bg-white border border-[#c5c5d3] hover:bg-slate-100 text-[#00236f] px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download
            </button>
            <button
              onClick={() => approveSubmission(sub.id)}
              disabled={sub.status === 'Approved'}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Approve
            </button>
            <button
              onClick={() => onOpenReturnModal(sub.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_return</span>
              Return
            </button>
          </div>
        </div>

        {showFullReport && kra && (
          <div className="absolute inset-0 z-10 bg-white flex flex-col">
            <div className="px-5 py-3 border-b border-[#c5c5d3]/70 flex items-center justify-between gap-3">
              <h4 className="text-[14px] font-bold text-[#0b1c30]">
                Printable Proforma — {sub.kraCode} • {sub.dept} • {sub.cycle}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </button>
                <button
                  onClick={() => setShowFullReport(false)}
                  className="text-[#515f74] hover:text-[#0b1c30] p-1.5 rounded"
                  title="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#eff4ff] p-3">
              <iframe
                title="Printable proforma"
                srcDoc={buildSubmissionReportHtml(kra, sub, dept?.name || sub.dept)}
                className="w-full h-full bg-white rounded border border-[#c5c5d3]/70"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

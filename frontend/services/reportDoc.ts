import {
  CompletedDocument,
  KRAMaster,
  KRASubmission,
  ReportFormat,
} from '../types/kra';
import { formatProgress, isNumericMetric } from './kraUtils';
import { KIET_LOGO_BASE64 } from '../config/kietLogo';

const STYLE = `
  * { box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #0b1c30; margin: 0; padding: 28px; background: #ffffff; }
  .doc { max-width: 820px; margin: 0 auto; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1e3a8a; padding-bottom: 10px; }
  .head h1 { font-size: 18px; margin: 0; color: #1e3a8a; letter-spacing: .3px; }
  .head h2 { font-size: 10.5px; margin: 3px 0 0; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; }
  .badge { background: #1e3a8a; color: #fff; font-size: 10px; font-weight: 700; padding: 4px 9px; border-radius: 4px; text-transform: uppercase; }
  .title { margin: 18px 0 2px; font-size: 15px; color: #00236f; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th, td { border: 1px solid #c5c5d3; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #eff4ff; width: 34%; color: #475569; font-weight: 700; }
  .section { margin-top: 16px; }
  .section h3 { font-size: 11.5px; text-transform: uppercase; letter-spacing: .6px; color: #1e3a8a; margin: 0 0 6px; }
  ul { margin: 0; padding-left: 18px; font-size: 12px; }
  li { margin-bottom: 4px; }
  .progress-wrap { background: #eff4ff; border: 1px solid #c5d5f0; border-radius: 8px; height: 16px; overflow: hidden; }
  .progress-bar { background: #1e3a8a; height: 16px; }
  .exceeded { color: #b45309; font-weight: 700; }
  .muted { color: #475569; }
  .pill { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #e5eeff; color: #00236f; }
  .status { font-weight: 700; }
  .sign { display: flex; justify-content: space-between; margin-top: 42px; font-size: 11px; }
  .sign div { text-align: center; border-top: 1px solid #475569; padding-top: 6px; width: 42%; }
  .bool { font-size: 12px; }
`;

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function docShell(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>${esc(title)}</title><style>${STYLE}</style></head><body><div class="doc">${body}</div></body></html>`;
}

function headerBlock(subtitle: string): string {
  return `<div class="head"><div><h1>KIET Deemed to be University</h1><h2>Key Result Area (KRA) Management System &middot; ${esc(subtitle)}</h2></div><span class="badge">IQAC &middot; NBA &middot; NAAC</span></div>`;
}

function row(label: string, value: string): string {
  return `<tr><th>${esc(label)}</th><td>${value}</td></tr>`;
}

function formatList(list: ReportFormat[]): string {
  if (!list || list.length === 0) {
    return '<p class="muted" style="font-size:12px;margin:4px 0;">No document attached.</p>';
  }
  return `<ul>${list
    .map(
      (f) =>
        `<li><strong>${esc(f.name)}</strong>${
          f.fileType ? ` <span class="pill">${esc(f.fileType)}</span>` : ''
        }${f.description ? ` — <span class="muted">${esc(f.description)}</span>` : ''}${
          f.fileName ? ` <span class="muted">(${esc(f.fileName)})</span>` : ''
        }</li>`
    )
    .join('')}</ul>`;
}

/** VC-facing KRA definition proforma (used by "Inspect Proforma"). */
export function buildKraDefinitionHtml(kra: KRAMaster): string {
  const body = `
    ${headerBlock('KRA Definition Proforma')}
    <h2 class="title">${esc(kra.code)} — ${esc(kra.title)}</h2>
    <table>
      ${row('KRA Code', esc(kra.code))}
      ${row('KRA Title / Objective', esc(kra.title))}
      ${row('NBA Reference', esc(kra.nbaRef || '—'))}
      ${row('NAAC Reference', esc(kra.naacRef || '—'))}
      ${row('Metric Type', esc(kra.metricType))}
      ${row('Annual Target', esc(kra.annualTargetDisplay || kra.annualTarget))}
      ${row('Target Description', esc(kra.targetDescription))}
      ${row('Assigned Departments', esc(kra.assignedDepts.join(', ')))}
      ${row('Status', esc(kra.status))}
    </table>
    <div class="section"><h3>Prescribed Report Format</h3>${formatList(kra.prescribedReportFormats)}</div>
    <div class="section"><h3>Summary Report Template</h3>${formatList(kra.summaryTemplates)}</div>
    <div class="sign"><div>Prepared By<br/><strong>IQAC Directorate</strong></div><div>Approved By<br/><strong>Vice Chancellor</strong></div></div>
  `;
  return docShell(`${kra.code} Definition`, body);
}

/** Renders the values the Dean entered for one VC-uploaded template. */
function completedDocBody(format: ReportFormat, doc?: CompletedDocument): string {
  const filled = Boolean(doc);
  if (!filled) {
    return '<p class="muted" style="font-size:12px;margin:4px 0;">Not completed by the Dean.</p>';
  }
  const d = doc as CompletedDocument;
  const fieldRows = Object.entries(d.fields ?? {})
    .filter(([, value]) => String(value ?? '').trim())
    .map(([key, value]) => row(key, esc(value)))
    .join('');
  const tableHtml =
    d.table && d.table.rows.length > 0
      ? `<table><tr>${d.table.columns
          .map((c) => `<th style="width:auto">${esc(c)}</th>`)
          .join('')}</tr>${d.table.rows
          .map(
            (r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`
          )
          .join('')}</table>`
      : '';
  return `
    <table>
      ${row('Document', `<strong>${esc(format.name)}</strong>`)}
      ${format.fileName ? row('Original Template File', esc(format.fileName)) : ''}
      ${format.fileType ? row('Template Type', `<span class="pill">${esc(format.fileType)}</span>`) : ''}
      ${fieldRows}
    </table>
    ${tableHtml}
    ${
      d.narrative?.trim()
        ? `<div class="section"><h3>Completed Content</h3><p class="bool">${esc(d.narrative)}</p></div>`
        : ''
    }`;
}

/** Sections appended to the submission report so the VC download contains the filled documents. */
function completedDocsSection(kra: KRAMaster, sub: KRASubmission): string {
  const blocks: string[] = [];
  if (kra.prescribedReportFormats.length > 0) {
    blocks.push(
      `<div class="section"><h3>Prescribed Report Format — Completed</h3>${kra.prescribedReportFormats
        .map((f) => completedDocBody(f, sub.formData.reportFormatDocs?.find((d) => d.formatId === f.id)))
        .join('')}</div>`
    );
  }
  if (kra.summaryTemplates.length > 0) {
    blocks.push(
      `<div class="section"><h3>Summary Report Template — Completed</h3>${kra.summaryTemplates
        .map((f) => completedDocBody(f, sub.formData.summaryTemplateDocs?.find((d) => d.formatId === f.id)))
        .join('')}</div>`
    );
  }
  return blocks.join('');
}

/** Standalone preview / download for ONE completed VC-uploaded document. */
export function buildCompletedDocumentHtml(options: {
  kra: KRAMaster;
  format: ReportFormat;
  doc?: CompletedDocument;
  kind: 'Prescribed Report Format' | 'Summary Report Template';
  deptName: string;
  deptCode: string;
  deanName: string;
  cycle: string;
}): string {
  const { kra, format, doc, kind, deptName, deptCode, deanName, cycle } = options;
  const body = `
    ${headerBlock(kind)}
    <h2 class="title">${esc(kra.code)} — ${esc(kra.title)}</h2>
    <table>
      ${row('Department', `${esc(deptName)} (${esc(deptCode)})`)}
      ${row('Dean / HOD', esc(deanName))}
      ${row('Bimonthly Cycle', esc(cycle))}
      ${row('Document', `<strong>${esc(format.name)}</strong>`)}
      ${format.description ? row('Template Description', esc(format.description)) : ''}
      ${format.fileName ? row('Original Template File', esc(format.fileName)) : ''}
      ${
        format.fileType
          ? row('Template Type', `<span class="pill">${esc(format.fileType)}</span>`)
          : ''
      }
    </table>
    ${completedDocBody(format, doc)}
    <div class="sign"><div>Completed By<br/><strong>${esc(deanName)}</strong></div><div>Verified By<br/><strong>Pending VC Verification</strong></div></div>
  `;
  return docShell(`${kra.code} · ${kind} · ${deptCode}`, body);
}

/** Evidence-only preview (uploaded file + Google Drive link) shown by the Dean workspace. */
export function buildEvidenceSummaryHtml(options: {
  kra: KRAMaster;
  deptName: string;
  deptCode: string;
  deanName: string;
  cycle: string;
  formData: KRASubmission['formData'];
}): string {
  const { kra, deptName, deptCode, deanName, cycle, formData } = options;
  const driveLink = (formData.evidenceDriveLink ?? '').trim();
  const validDrive = /^https?:\/\//i.test(driveLink);
  const body = `
    ${headerBlock('Evidence Summary')}
    <h2 class="title">${esc(kra.code)} — ${esc(kra.title)}</h2>
    <table>
      ${row('Department', `${esc(deptName)} (${esc(deptCode)})`)}
      ${row('Dean / HOD', esc(deanName))}
      ${row('Bimonthly Cycle', esc(cycle))}
      ${row(
        'Uploaded Evidence File',
        formData.evidenceFileName
          ? `${esc(formData.evidenceFileName)}${
              formData.evidenceFileSize ? ` <span class="muted">(${esc(formData.evidenceFileSize)})</span>` : ''
            }`
          : '<span class="muted">No file uploaded.</span>'
      )}
      ${row(
        'Google Drive Link',
        validDrive
          ? `<a href="${esc(driveLink)}" target="_blank" rel="noopener noreferrer">${esc(driveLink)}</a>`
          : driveLink
            ? `<span style="color:#b91c1c;">Invalid link — must start with http:// or https://</span>`
            : '<span class="muted">No link provided.</span>'
      )}
      ${row('Dean Remarks', formData.remarks ? esc(formData.remarks) : '<span class="muted">—</span>')}
    </table>
    <div class="sign"><div>Submitted By<br/><strong>${esc(deanName)}</strong></div><div>Verified By<br/><strong>Pending VC Verification</strong></div></div>
  `;
  return docShell(`${kra.code} · Evidence · ${deptCode}`, body);
}

/** Dean/VC-facing achievement proforma, rendered live from form data. */
export function buildSubmissionReportHtml(
  kra: KRAMaster,
  sub: KRASubmission,
  deptName: string
): string {
  const kraNum = parseInt(kra.code.replace(/[^0-9]/g, ''), 10);
  if (kraNum === 1 || kra.code.trim() === 'KRA 01' || kra.code.trim() === 'KRA 1' || !!sub.formData?.vacReport) {
    return buildVACOfficialHtml(kra, sub, deptName);
  }
  if (kra.code.includes('KRA 12')) {
    return buildKRA12Html(kra, sub, deptName);
  }
  const numeric = isNumericMetric(kra.metricType);

  const achievementRows = numeric
    ? `
      ${row('Achievement', esc(sub.claim))}
      ${row(
        'Progress',
        `<div class="progress-wrap"><div class="progress-bar" style="width:${Math.min(
          Math.max(sub.progress, 0),
          100
        )}%"></div></div>
         <div style="margin-top:6px;font-weight:700;">${esc(formatProgress(sub.progress))}${
          sub.isTargetExceeded ? ' <span class="exceeded">&#9733; Target Exceeded</span>' : ''
        }</div>`
      )}`
    : row('Achievement / Status', `<span class="status">${esc(sub.claim)}</span>`);

  const narrative =
    sub.formData.descriptiveText ||
    sub.formData.remarks ||
    sub.formData.targetDesc ||
    'No narrative provided.';

  const body = `
    ${headerBlock('KRA Achievement Proforma')}
    <h2 class="title">${esc(sub.kraCode)} — ${esc(sub.kraTitle)}</h2>
    <table>
      ${row('Department', `${esc(deptName)} (${esc(sub.dept)})`)}
      ${row('Dean / HOD', esc(sub.deanName))}
      ${row('Bimonthly Cycle', esc(sub.cycle))}
      ${row('Metric Type', esc(kra.metricType))}
      ${row('Annual Target (read-only)', esc(kra.annualTargetDisplay || kra.annualTarget))}
      ${achievementRows}
      ${row(
        'Evidence Document',
        sub.formData.evidenceFileName
          ? `${esc(sub.formData.evidenceFileName)}${
              sub.formData.evidenceFileSize
                ? ` <span class="muted">(${esc(sub.formData.evidenceFileSize)})</span>`
                : ''
            }`
          : '<span class="muted">—</span>'
      )}
      ${row(
        'Google Drive Evidence Link',
        sub.formData.evidenceDriveLink
          ? `<a href="${esc(sub.formData.evidenceDriveLink)}" target="_blank" rel="noopener noreferrer">${esc(
              sub.formData.evidenceDriveLink
            )}</a>`
          : '<span class="muted">—</span>'
      )}
      ${row('Dean Remarks', sub.formData.remarks ? esc(sub.formData.remarks) : '<span class="muted">—</span>')}
      ${row(
        'Prescribed Report Format',
        kra.prescribedReportFormats[0]?.name
          ? esc(kra.prescribedReportFormats[0].name)
          : '<span class="muted">Standard proforma</span>'
      )}
      ${row(
        'Summary Report Template',
        kra.summaryTemplates[0]?.name
          ? esc(kra.summaryTemplates[0].name)
          : '<span class="muted">Standard summary</span>'
      )}
      ${row('Current Status', `<span class="status">${esc(sub.status)}</span>`)}
    </table>
    ${
      sub.returnReason
        ? `<div class="section"><h3>VC Return Remarks</h3><p style="font-size:12px;color:#b91c1c;">${esc(sub.returnReason)}</p></div>`
        : ''
    }
    <div class="section"><h3>Achievement Narrative</h3><p class="bool">${esc(narrative)}</p></div>
    ${completedDocsSection(kra, sub)}
    <div class="section"><h3>Audit Trail</h3><ul>${sub.timeline
      .map(
        (e) =>
          `<li><strong>${esc(e.stage)}</strong> — <span class="muted">${esc(e.date)} &middot; ${esc(
            e.actor
          )}</span>${e.remarks ? `<br/><span class="muted">${esc(e.remarks)}</span>` : ''}</li>`
      )
      .join('')}</ul></div>
    <div class="sign"><div>Dean / HOD<br/><strong>${esc(sub.deanName)}</strong></div><div>Vice Chancellor<br/><strong>${
    sub.status === 'Approved' ? 'RATIFIED' : 'Pending Verification'
  }</strong></div></div>
  `;
  return docShell(`${sub.kraCode} · ${sub.dept} · ${sub.cycle}`, body);
}

export interface InstitutionalReportRow {
  code: string;
  name: string;
  dean: string;
  assigned: number;
  approved: number;
  exceeded: number;
  progress: number;
}

/** Institution-wide summary used by the Reports page export. */
export function buildInstitutionalReportHtml(rows: InstitutionalReportRow[]): string {
  const tableRows = rows
    .map(
      (r) =>
        `<tr><td>${esc(r.code)}</td><td>${esc(r.name)}</td><td>${esc(r.dean)}</td><td style="text-align:center">${r.assigned}</td><td style="text-align:center">${r.approved}</td><td style="text-align:center">${r.exceeded}</td><td style="text-align:right">${esc(formatProgress(r.progress))}</td></tr>`
    )
    .join('');
  const body = `
    ${headerBlock('Institutional KRA Compliance Report')}
    <h2 class="title">Consolidated Department Performance Roster — Academic Session 2025-2026</h2>
    <table>
      <tr><th style="width:auto">Department</th><th style="width:auto">Name</th><th style="width:auto">Dean / HOD</th><th style="width:auto;text-align:center">Assigned</th><th style="width:auto;text-align:center">Approved</th><th style="width:auto;text-align:center">Target Exceeded</th><th style="width:auto;text-align:right">Progress</th></tr>
      ${tableRows}
    </table>
    <div class="sign"><div>Prepared By<br/><strong>IQAC Directorate</strong></div><div>Approved By<br/><strong>Vice Chancellor</strong></div></div>
  `;
  return docShell('Institutional KRA Compliance Report', body);
}

/** Triggers a real file download of the generated HTML report (printable / save-as-PDF ready). */
export function downloadHtmlFile(html: string, fileName: string): void {
  if (typeof window === 'undefined') return;
  const safeName = /\.[a-z0-9]+$/i.test(fileName) ? fileName : `${fileName}.html`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}




export function buildKRA12Html(kra: KRAMaster, sub: KRASubmission, deptName: string): string {
  const fields = sub.formData.customFields || {};
  const evidences = sub.formData.customEvidence || [];

  const body = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${KIET_LOGO_BASE64}" alt="KIET Group of Institutions" style="max-height: 100px;" />
    </div>
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin:0; font-size: 16px; color: #00236f;">Awards and Recognition for Research/Innovations by Faculty/Students/Dept./Institute</h2>
    </div>
    
    <table style="margin-bottom: 30px;">
      <tr><th style="width: 30%">School/Department:</th><td>${esc(deptName)}</td></tr>
      <tr><th>Academic Session:</th><td>2026-2027</td></tr>
      <tr><th>Reporting Period:</th><td>${esc(sub.cycle)}</td></tr>
      <tr><th>Coordinator (if any):</th><td>${esc(fields.coordinator || '')}</td></tr>
      <tr><th>Date:</th><td>${esc(fields.date || '')}</td></tr>
      <tr><th>Complete Detail of Award/ Recognition:</th><td>${esc(fields.awardDetails || '')}</td></tr>
    </table>

    <h3 style="color: #00236f; font-size: 14px; border-bottom: 1px solid #c5c5d3; padding-bottom: 4px; margin-bottom: 16px;">Documentary Evidence to Maintain</h3>
    
    <p style="font-size: 11px; margin-bottom: 12px;"><strong>For every award, maintain:</strong></p>
    <table style="margin-bottom: 30px;">
      <tr><th style="width: 40%">1. Award certificate.</th><td>${evidences.find((e: any) => e.type === 'Award certificate') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>2. Award notification/letter from awarding organization.</th><td>${evidences.find((e: any) => e.type === 'Award notification/letter from awarding organization') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>3. Details of awarding body.</th><td>${esc(fields.awardingBody || '')}</td></tr>
      <tr><th>4. Official webpage/link of the award, wherever available.</th><td>${evidences.find((e: any) => e.type === 'Official webpage/link of the award, wherever available') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>5. Event brochure/announcement.</th><td>${evidences.find((e: any) => e.type === 'Event brochure/announcement') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>6. Photograph of award ceremony, wherever applicable.</th><td>${evidences.find((e: any) => e.type === 'Photograph of award ceremony, wherever applicable') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>7. Research paper/project/patent/prototype details forming the basis of the award.</th><td>${evidences.find((e: any) => e.type === 'Research paper/project/patent/prototype details forming the basis of the award') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>8. Details of the recipient.</th><td>${esc(fields.recipientDetails || '')}</td></tr>
      <tr><th>9. Department verification.</th><td>${esc(fields.deptVerification || '')}</td></tr>
      <tr><th>10. Institutional approval/record, where applicable.</th><td>${esc(fields.institutionalApproval || '')}</td></tr>
      <tr><th>11. Newspaper/media coverage, if available.</th><td>${evidences.find((e: any) => e.type === 'Newspaper/media coverage, if available') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
      <tr><th>12. Award citation/trophy details.</th><td>${esc(fields.citationDetails || '')}</td></tr>
      <tr><th>13. Prize/funding details, where applicable.</th><td>${esc(fields.prizeDetails || '')}</td></tr>
      <tr><th>14. Evidence of national/international level, where claimed.</th><td>${evidences.find((e: any) => e.type === 'Evidence of national/international level, where claimed') ? '&#10003; Uploaded' : 'Pending'}</td></tr>
    </table>
    
    ${evidences.length > 0 ? `
    <h3 style="color: #00236f; font-size: 14px; border-bottom: 1px solid #c5c5d3; padding-bottom: 4px; margin-bottom: 16px;">Uploaded Files Reference</h3>
    <ul style="font-size: 12px; margin-bottom: 30px;">
      ${evidences.map((e: any) => `<li><strong>${esc(e.type)}:</strong> ${esc(e.name)}</li>`).join('')}
    </ul>
    ` : ''}

    <div class="sign" style="margin-top: 60px;">
      <div>Prepared By<br/><strong>${esc(sub.deanName)}</strong></div>
      <div>Verified By<br/><strong>${sub.status === 'Approved' ? 'VC Verified' : 'Pending'}</strong></div>
      <div>Approved By<br/><strong>${sub.status === 'Approved' ? 'VC Approved' : 'Pending'}</strong></div>
    </div>
  `;
  return docShell(`${sub.kraCode} — Report — ${sub.dept}`, body);
}

const SUPPORTING_DOCS_OFFICIAL = [
  "Approval/permission for conducting the course",
  "Course proposal/concept note",
  "Course syllabus/content",
  "Academic calendar/activity schedule",
  "Course timetable",
  "Resource person/faculty details",
  "Expert profile/CV, wherever applicable",
  "Attendance records",
  "Registration/enrolment records",
  "Assessment records",
  "Result/score sheet",
  "Student feedback",
  "Sample certificates",
  "Photographs with date and caption",
  "Geo-tagged photographs, wherever applicable",
  "Course completion report",
  "List of students who completed the course",
  "Any other relevant supporting document"
];

export function buildVACOfficialHtml(
  kra: KRAMaster,
  sub: KRASubmission,
  deptName: string
): string {
  const vac = sub.formData?.vacReport;
  const courses = vac?.courses && vac.courses.length > 0 ? vac.courses : [
    { courseName: 'Full Stack Web Development with Next.js', durationHours: 30, mode: 'Offline', resourcePerson: 'Dr. Vineet Sharma', enrolled: 120, completed: 115 }
  ];
  const syllabus = vac?.syllabus && vac.syllabus.length > 0 ? vac.syllabus : [
    { module: 'Module 1', topic: 'Modern Web Architecture & REST APIs', hours: 8 },
    { module: 'Module 2', topic: 'Frontend State & UI Engineering', hours: 8 },
    { module: 'Module 3', topic: 'Backend Services & Database ORM', hours: 8 },
    { module: 'Module 4', topic: 'Deployment, Testing & CI/CD', hours: 6 }
  ];
  const outcomes = vac?.learningOutcomes && vac.learningOutcomes.length > 0 ? vac.learningOutcomes : [
    'Demonstrate practical proficiency in emerging tools and standard engineering practices.',
    'Analyze real-world problem scenarios and synthesize comprehensive solutions.'
  ];
  const assess = vac?.assessment || {
    method: 'Continuous Lab Evaluation, Hands-on Project, and Final Objective Assessment',
    minAttendance: '75%',
    passingCriteria: 'Minimum 50% marks in assessment and minimum 75% attendance',
    issuingAuthority: 'KIET Deemed to be University',
    certificatesIssued: 115
  };
  const impact = vac?.outcomeAndImpact || {};
  const feedback = vac?.feedback || { score: 4.5, suggestions: ['Include more hands-on lab sessions.', 'Provide industry mock interviews.'] };
  const prep = vac?.preparedBy || { name: sub.deanName, designation: 'Faculty Coordinator', date: sub.submittedDate || '12/10/2026' };
  const appr = vac?.approvedBy || { name: 'Prof. (Dr.) Arun Sharma', designation: 'Head of Department', date: sub.status === 'Approved' ? (sub.submittedDate || '12/10/2026') : '' };
  const attachedDocs = vac?.supportingDocuments || [];

  const body = `
    <!-- PAGE 1 -->
    <div style="page-break-after: always; min-height: 980px; position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #00236f; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-size: 22px; font-weight: 900; color: #00236f; font-family: serif;">KIET</div>
        <div style="text-align: right;">
          <div style="font-size: 16px; font-weight: 800; color: #00236f; letter-spacing: 0.5px;">KIET UNIVERSITY</div>
          <div style="font-size: 9px; color: #555;">DELHI-NCR, INDIA &bull; (Under Section 3 of the UGC Act, 1956)</div>
        </div>
      </div>

      <div style="text-align: center; margin: 12px 0 16px 0;">
        <h2 style="font-size: 13px; font-weight: 800; text-decoration: underline; margin: 0; color: #0b1c30;">REPORT ON VALUE ADDED COURSES, ADD-ON COURSES AND MOOCs</h2>
        <div style="font-size: 11px; font-weight: 700; color: #00236f; margin-top: 4px;">KIET Deemed to be University, Ghaziabad</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
        <tr><td style="width: 35%; font-weight: bold; background: #f8f9ff; border: 1px solid #111; padding: 5px 8px;">Name of the Department</td><td style="border: 1px solid #111; padding: 5px 8px; font-weight: 600;">${esc(deptName)}</td></tr>
        <tr><td style="font-weight: bold; background: #f8f9ff; border: 1px solid #111; padding: 5px 8px;">Academic Session / Year/ Semester</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(vac?.academicSession || '2026-2027')} &bull; ${esc(vac?.semester || sub.cycle)}</td></tr>
        <tr><td style="font-weight: bold; background: #f8f9ff; border: 1px solid #111; padding: 5px 8px;">Faculty Coordinator(s)</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(vac?.facultyCoordinator || sub.deanName)}</td></tr>
        <tr><td style="font-weight: bold; background: #f8f9ff; border: 1px solid #111; padding: 5px 8px;">Head of the Department</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(vac?.hodName || sub.deanName)}</td></tr>
      </table>

      <div style="border: 1px solid #111; padding: 8px; font-size: 10.5px; line-height: 1.45; margin-bottom: 10px;">
        <p style="margin: 0 0 6px 0;"><strong>Introduction - </strong>KIET Deemed to be University is committed to providing students with opportunities for holistic development and enhancing their employability, professional competencies, interdisciplinary knowledge and lifelong learning skills.</p>
        <p style="margin: 0 0 6px 0;">In addition to the prescribed curriculum, the University offers <strong>Value Added Courses (VACs), Add-on Courses and Massive Open Online Courses (MOOCs)</strong> to provide students with exposure to emerging technologies, industry practices, professional skills, interdisciplinary learning and global learning resources.</p>
        <p style="margin: 0 0 2px 10px;">&bull; These courses are designed to complement the regular curriculum and contribute to the development of graduate attributes, employability skills and overall student development.</p>
      </div>

      <div style="border: 1px solid #111; padding: 8px; font-size: 10.5px; line-height: 1.45; margin-bottom: 12px;">
        <div style="font-weight: bold; margin-bottom: 4px;">Objectives of Value Added Courses - The major objectives of the Value Added Courses are:</div>
        <ol style="margin: 2px 0 2px 20px; padding: 0;">
          <li>To supplement the knowledge acquired through the regular curriculum.</li>
          <li>To provide exposure to emerging technologies and industry practices.</li>
          <li>To develop employability and professional skills.</li>
          <li>To promote interdisciplinary and experiential learning.</li>
        </ol>
      </div>

      <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px;">Detail of Value Added Courses</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 14px;">
        <thead>
          <tr style="background: #f0f4fa; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #111; padding: 4px; width: 6%;">S. No.</th>
            <th style="border: 1px solid #111; padding: 4px; width: 28%; text-align: left;">Course Name</th>
            <th style="border: 1px solid #111; padding: 4px; width: 10%;">Duration (Hours)</th>
            <th style="border: 1px solid #111; padding: 4px; width: 12%;">Mode Offline/Online/Hybrid</th>
            <th style="border: 1px solid #111; padding: 4px; width: 20%; text-align: left;">Resource Person/Agency</th>
            <th style="border: 1px solid #111; padding: 4px; width: 12%;">No. of Students Enrolled</th>
            <th style="border: 1px solid #111; padding: 4px; width: 12%;">No. of Students Completed</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map((c: any, i: number) => `
            <tr>
              <td style="border: 1px solid #111; padding: 4px; text-align: center;">${i + 1}</td>
              <td style="border: 1px solid #111; padding: 4px;">${esc(c.courseName)}</td>
              <td style="border: 1px solid #111; padding: 4px; text-align: center;">${esc(c.durationHours)}</td>
              <td style="border: 1px solid #111; padding: 4px; text-align: center;">${esc(c.mode)}</td>
              <td style="border: 1px solid #111; padding: 4px;">${esc(c.resourcePerson)}</td>
              <td style="border: 1px solid #111; padding: 4px; text-align: center;">${esc(c.enrolled)}</td>
              <td style="border: 1px solid #111; padding: 4px; text-align: center; font-weight: bold; color: #00236f;">${esc(c.completed)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px;">Course Content/Syllabus</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 16px;">
        <thead>
          <tr style="background: #f0f4fa; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #111; padding: 4px; width: 15%;">Module</th>
            <th style="border: 1px solid #111; padding: 4px; width: 65%; text-align: left;">Topic</th>
            <th style="border: 1px solid #111; padding: 4px; width: 20%;">No. of Hours</th>
          </tr>
        </thead>
        <tbody>
          ${syllabus.map((s: any, i: number) => `
            <tr>
              <td style="border: 1px solid #111; padding: 4px; text-align: center; font-weight: 600;">${esc(s.module || `Module ${i + 1}`)}</td>
              <td style="border: 1px solid #111; padding: 4px;">${esc(s.topic)}</td>
              <td style="border: 1px solid #111; padding: 4px; text-align: center;">${esc(s.hours)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 10px; color: #666; margin-top: 20px;">Page 1 | 3</div>
    </div>

    <!-- PAGE 2 -->
    <div style="page-break-after: always; min-height: 980px; position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #00236f; padding-bottom: 8px; margin-bottom: 14px;">
        <div style="font-size: 18px; font-weight: 900; color: #00236f; font-family: serif;">KIET</div>
        <div style="font-size: 12px; font-weight: 700; color: #00236f;">REPORT ON VALUE ADDED COURSES &bull; KIET UNIVERSITY</div>
      </div>

      <div style="font-weight: bold; font-size: 11.5px; margin-bottom: 6px;">Learning Outcomes: - After successful completion of the course, students will be able to:</div>
      <ul style="font-size: 11px; margin: 0 0 16px 20px; line-height: 1.5;">
        ${outcomes.map((lo: string) => `<li>${esc(lo)}</li>`).join('')}
      </ul>

      <div style="font-weight: bold; font-size: 11.5px; margin-bottom: 4px;">Assessment and Certification</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
        <thead>
          <tr style="background: #f0f4fa; font-weight: bold;">
            <th style="border: 1px solid #111; padding: 5px 8px; width: 45%;">Particular</th>
            <th style="border: 1px solid #111; padding: 5px 8px; width: 55%;">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="border: 1px solid #111; padding: 5px 8px; font-weight: bold;">Assessment Method</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(assess.method || '—')}</td></tr>
          <tr><td style="border: 1px solid #111; padding: 5px 8px; font-weight: bold;">Minimum Attendance Requirement</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(assess.minAttendance || '75%')}</td></tr>
          <tr><td style="border: 1px solid #111; padding: 5px 8px; font-weight: bold;">Passing/Completion Criteria</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(assess.passingCriteria || '—')}</td></tr>
          <tr><td style="border: 1px solid #111; padding: 5px 8px; font-weight: bold;">Certificate Issuing Authority</td><td style="border: 1px solid #111; padding: 5px 8px;">${esc(assess.issuingAuthority || 'KIET Deemed to be University')}</td></tr>
          <tr><td style="border: 1px solid #111; padding: 5px 8px; font-weight: bold;">Number of Certificates Issued</td><td style="border: 1px solid #111; padding: 5px 8px; font-weight: bold; color: #00236f;">${esc(assess.certificatesIssued || '—')}</td></tr>
        </tbody>
      </table>

      <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">OUTCOME AND IMPACT</div>
      <div style="font-weight: bold; font-size: 10.5px; color: #475569; margin-bottom: 6px;">Suggested Impact Indicators</div>
      <ul style="font-size: 11px; margin: 0 0 16px 20px; line-height: 1.5;">
        <li>&bull; Improvement in technical/professional skills: <strong>${esc(impact.technicalSkills || 'Competency acquired')}</strong></li>
        <li>&bull; Improvement in employability skills: <strong>${esc(impact.employability || 'Problem solving & interview readiness')}</strong></li>
        <li>&bull; Industry certification obtained: <strong>${esc(impact.industryCert || 'Standard certificates awarded')}</strong></li>
        <li>&bull; Successful completion/certification rate: <strong>${esc(impact.completionRate || 'High completion index')}</strong></li>
        <li>&bull; Internship opportunities: <strong>${esc(impact.internships || 'Summer intern mapping')}</strong></li>
        <li>&bull; Placement support/outcomes: <strong>${esc(impact.placementSupport || 'Directly aligned to recruiters')}</strong></li>
        <li>&bull; Student projects developed: <strong>${esc(impact.studentProjects || 'Applied capstone prototypes')}</strong></li>
        <li>&bull; Participation in competitions/hackathons: <strong>${esc(impact.hackathons || 'Hackathon participants')}</strong></li>
      </ul>

      <div style="background: #fbfcfe; border: 1px solid #c5c5d3; padding: 10px; margin-bottom: 16px; font-size: 11px;">
        <div style="font-weight: bold; margin-bottom: 6px;">
          Student Feedback Summary: - Overall Feedback Score: <span style="font-size: 13px; color: #00236f; text-decoration: underline;">&nbsp;${esc(feedback.score || '4.5')}&nbsp;</span> / 5.0
        </div>
        <div style="font-weight: bold; margin-bottom: 4px;">Major Suggestions Received:</div>
        <ol style="margin: 0 0 0 20px; padding: 0;">
          ${(feedback.suggestions || []).map((sug: string) => `<li>${esc(sug)}</li>`).join('')}
        </ol>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px;">
        <tr>
          <td style="border: 1px solid #111; padding: 8px 12px; width: 50%; vertical-align: top;">
            <div style="font-weight: bold; color: #00236f; margin-bottom: 4px;">Prepared By:</div>
            <div>Name: <strong>${esc(prep.name)}</strong></div>
            <div>Designation: ${esc(prep.designation)}</div>
            <div>Signature: ${esc(prep.signature || 'Digitally verified on portal')}</div>
            <div>Date: ${esc(prep.date)}</div>
          </td>
          <td style="border: 1px solid #111; padding: 8px 12px; width: 50%; vertical-align: top;">
            <div style="font-weight: bold; color: #00236f; margin-bottom: 4px;">Approved By:</div>
            <div>Name: <strong>${esc(appr.name)}</strong></div>
            <div>Designation: ${esc(appr.designation)}</div>
            <div>Signature: ${esc(appr.signature || (sub.status === 'Approved' ? 'Verified by VC Office' : '___________________________'))}</div>
            <div>Date: ${esc(appr.date || (sub.status === 'Approved' ? (sub.submittedDate || '12/10/2026') : '_______________________________'))}</div>
          </td>
        </tr>
      </table>

      <div style="text-align: right; font-size: 10px; color: #666; margin-top: 20px;">Page 2 | 3</div>
    </div>

    <!-- PAGE 3 -->
    <div style="min-height: 980px; position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #00236f; padding-bottom: 8px; margin-bottom: 14px;">
        <div style="font-size: 18px; font-weight: 900; color: #00236f; font-family: serif;">KIET</div>
        <div style="font-size: 12px; font-weight: 700; color: #00236f;">SUPPORTING DOCUMENTS REPOSITORY &bull; KIET UNIVERSITY</div>
      </div>

      <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">List of Supporting Documents: - The following documents shall be maintained for each VAC/Add-on Course:</div>
      <div style="font-size: 10.5px; color: #555; margin-bottom: 12px; font-style: italic;">Official institutional audit checklist for NBA / NAAC compliance verification.</div>

      <ul style="font-size: 11px; margin: 0 0 0 10px; padding: 0; list-style: none; line-height: 1.6;">
        ${SUPPORTING_DOCS_OFFICIAL.map((docTitle, idx) => {
          const match = attachedDocs.find((d: any) => d.title === docTitle && d.attached);
          return `
            <li style="margin-bottom: 6px;">
              &bull; ${esc(docTitle)}
              ${match ? `<span style="color: #0b6623; font-weight: bold; font-size: 10px;"> [Attached: ${esc(match.fileName || 'Verified Document')}]</span>` : ''}
            </li>
          `;
        }).join('')}
      </ul>

      <div style="text-align: right; font-size: 10px; color: #666; margin-top: 40px;">Page 3 | 3</div>
    </div>
  `;

  return docShell(`REPORT ON VALUE ADDED COURSES &bull; ${deptName}`, body);
}


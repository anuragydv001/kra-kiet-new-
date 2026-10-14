// Core domain types for the KIET KRA Management System.
//
// IMPORTANT: This system has exactly TWO login experiences:
//   1. 'vc'    -> Vice Chancellor / Super Admin
//   2. 'dean'  -> Department Dean
// There is intentionally NO faculty role anywhere in the application.

export type DepartmentCode =
  | 'CSE'
  | 'CSE (AI)'
  | 'CSE (AIML)'
  | 'IT'
  | 'CS'
  | 'CSIT'
  | 'EEE'
  | 'ECE'
  | 'ME'
  | 'KSOM'
  | 'MCA'
  | 'KSOP'
  | 'ASH';

export interface DepartmentInfo {
  code: DepartmentCode;
  name: string;
  deanName: string;
  deanEmail: string;
  facultyStrength: number;
  studentStrength: number;
}

/**
 * Metric types supported by the KRA engine. The metric type drives which input
 * the Dean sees in the split-screen proforma.
 *  - Direct Numeric    -> number input
 *  - Percentage        -> percentage input
 *  - Yes/No            -> Yes/No selector
 *  - Descriptive       -> text / status input
 *  - Evidence Based    -> status + evidence
 *  - Policy/Compliance -> compliance status + remarks / evidence
 */
export type MetricType =
  | 'Direct Numeric'
  | 'Percentage'
  | 'Yes/No'
  | 'Descriptive'
  | 'Evidence Based'
  | 'Policy/Compliance';

export const METRIC_TYPES: MetricType[] = [
  'Direct Numeric',
  'Percentage',
  'Yes/No',
  'Descriptive',
  'Evidence Based',
  'Policy/Compliance',
];

export const EVIDENCE_STATUSES = ['Not Started', 'In Progress', 'Completed'] as const;

export const COMPLIANCE_STATUSES = ['Compliant', 'Partially Compliant', 'Non-Compliant'] as const;

export type ReportFileType = 'DOCX' | 'XLSX' | 'PDF';

/**
 * A prescribed report format OR a summary report template.
 * Both are uploaded documents (DOCX / XLSX / PDF) but they are two completely
 * separate concepts and live in two separate collections on the KRA.
 */
export interface ReportFormat {
  id: string;
  name: string;
  description?: string;
  fileName?: string;
  fileType?: ReportFileType;
}

export interface KRAMaster {
  code: string;
  title: string;
  nbaRef: string;
  naacRef: string;
  metricType: MetricType;
  /** The Annual Target for this KRA. Read-only for Deans. */
  annualTarget: number;
  /** Optional human-friendly display form (e.g. "90%", "4 Patents"). */
  annualTargetDisplay?: string;
  targetDescription: string;
  /** Prescribed report format documents defined by the VC. */
  prescribedReportFormats: ReportFormat[];
  /** Summary report template documents defined by the VC. */
  summaryTemplates: ReportFormat[];
  assignedDepts: DepartmentCode[];
  status: 'Active' | 'Draft' | 'Inactive';
}

export type BimonthlyCycle =
  | 'July – August'
  | 'September – October'
  | 'November – December'
  | 'January – February'
  | 'March – April'
  | 'May – June';

export const BIMONTHLY_CYCLES: BimonthlyCycle[] = [
  'July – August',
  'September – October',
  'November – December',
  'January – February',
  'March – April',
  'May – June',
];

/** Submission lifecycle. A returned submission can be edited and resubmitted. */
export type SubmissionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Returned';

export interface TimelineEvent {
  id: string;
  stage: string;
  date: string;
  actor: string;
  remarks?: string;
}

/** Form data captured by the Dean. Only fields relevant to the metric type are used. */
export interface SubmissionFormData {
  coordName?: string;
  targetDesc?: string;
  /** Direct Numeric / Percentage achievement value (numeric string). */
  achievementClaim?: string;
  yesNoChoice?: 'Yes' | 'No';
  descriptiveText?: string;
  evidenceStatus?: string;
  complianceStatus?: string;
  remarks?: string;
  evidenceFileName?: string;
  evidenceFileSize?: string;
  customFields?: any;
  customEvidence?: any[];
  /** Optional Google Drive (or any HTTP/HTTPS) evidence link supplied by the Dean. */
  evidenceDriveLink?: string;
  /** Completed Prescribed Report Format documents filled by the Dean. */
  reportFormatDocs?: CompletedDocument[];
  /** Completed Summary Report Template documents filled by the Dean. */
  summaryTemplateDocs?: CompletedDocument[];
  /** Official Value Added Courses (VAC) Report Data for KRA 1 */
  vacReport?: VACReportData;
  /** Official Curriculum Feedback (Faculty Members) Report Data for KRA 7 */
  kra7Report?: KRA7ReportData;
  /** Generic JSON data from the Dynamic Engine schemas (Phase 5). */
  dynamicData?: Record<string, any>;
  /** Toggle for whether evidence is required for this specific submission. */
  isEvidenceNeeded?: boolean;
}

export interface VACCourseRow {
  id: string;
  courseName: string;
  durationHours: number | '';
  mode: 'Offline' | 'Online' | 'Hybrid';
  resourcePerson: string;
  enrolled: number | '';
  completed: number | '';
}

export interface VACSyllabusRow {
  id: string;
  module: string;
  topic: string;
  hours: number | '';
}

export interface VACAssessmentData {
  method: string;
  minAttendance: string;
  passingCriteria: string;
  issuingAuthority: string;
  certificatesIssued: number | '';
}

export interface VACOutcomeImpact {
  technicalSkills?: string;
  employability?: string;
  industryCert?: string;
  completionRate?: string;
  internships?: string;
  placementSupport?: string;
  studentProjects?: string;
  hackathons?: string;
}

export interface VACFeedbackData {
  score: number | '';
  suggestions: string[];
}

export interface VACSignatory {
  name: string;
  designation: string;
  signature?: string;
  date: string;
}

export interface VACSupportingDocItem {
  id: number;
  title: string;
  attached: boolean;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  fileId?: number;
}

export interface VACReportData {
  academicSession: string;
  semester: string;
  facultyCoordinator: string;
  hodName: string;
  courses: VACCourseRow[];
  syllabus: VACSyllabusRow[];
  learningOutcomes: string[];
  assessment: VACAssessmentData;
  outcomeAndImpact: VACOutcomeImpact;
  feedback: VACFeedbackData;
  preparedBy: VACSignatory;
  approvedBy: VACSignatory;
  supportingDocuments: VACSupportingDocItem[];
}

export interface KRA7ReportData {
  academicYear: string;
  semester: string;
  department: string;
  facultyName: string;
  designation: string;
  email: string;
  mobileNumber: string;
  subject: string;
  ratings: Record<number, number>;
  overallSatisfaction: number | null;
  suggestions: string;
  signatureName: string;
  signatureDate: string;
  evidenceFile?: {
    id?: number;
    fileName?: string;
    fileUrl?: string;
    fileSize?: string;
  };
}


export interface KRASubmission {
  id: string;
  kraCode: string;
  kraTitle: string;
  dept: DepartmentCode;
  deanName: string;
  cycle: BimonthlyCycle;
  metricType: MetricType;
  /** Snapshot of the Annual Target at submission time. */
  annualTarget: number;
  /** Human readable achievement claim (e.g. "30%", "5", "Yes"). */
  claim: string;
  /** Numeric achievement (0 for non-numeric metrics). */
  numericClaim: number;
  /** 0..100 (2 decimal precision). Only meaningful for numeric/percentage metrics. */
  progress: number;
  isTargetExceeded: boolean;
  submittedDate: string;
  status: SubmissionStatus;
  returnReason?: string;
  formData: SubmissionFormData;
  timeline: TimelineEvent[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'High / Urgent' | 'Normal' | 'Informational';
  deadline: string;
  targetDepts: DepartmentCode[];
  createdAt: string;
  author: string;
}

export interface UserSession {
  role: 'vc' | 'dean';
  deptCode: DepartmentCode;
  name: string;
  title: string;
  initials: string;
  email: string;
}

/**
 * A VC-uploaded document (Prescribed Report Format OR Summary Report Template)
 * after the Dean has completed it through the structured in-app editor.
 *
 * NOTE: the browser cannot turn an arbitrary DOCX/XLSX/PDF into a live Microsoft
 * Office document. Instead the uploaded file's metadata is preserved and the Dean
 * fills a structured interface whose values are stored here (frontend state).
 */
export interface CompletedDocument {
  /** Matches the ReportFormat.id of the VC-uploaded document. */
  formatId: string;
  /** Small key/value header fields of the template (e.g. Reference No., Prepared By). */
  fields: Record<string, string>;
  /** Free-form completed content for DOCX / PDF style templates. */
  narrative: string;
  /** Tabular content for XLSX style templates. */
  table: TemplateTable;
  /** Timestamp of the last save. */
  completedAt?: string;
}

export interface TemplateTable {
  columns: string[];
  rows: string[][];
}

export type NotificationKind =
  | 'announcement'
  | 'kra-assigned'
  | 'submission-returned'
  | 'submission-approved'
  | 'reminder';

/**
 * A single item shown in the Dean notification panel.
 * `targetDepts` decides which Dean(s) can see it; `read` tracks read/unread state.
 */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  /** Human readable timestamp, e.g. "01 Oct 2026, 10:30 AM". */
  time: string;
  read: boolean;
  kind: NotificationKind;
  targetDepts: DepartmentCode[];
  /** When set, clicking the notification opens that KRA in the Dean workspace. */
  kraCode?: string;
  submissionId?: string;
  /** When set, clicking the notification opens the announcement details. */
  announcementId?: string;
}

import {
  CompletedDocument,
  KRAMaster,
  MetricType,
  ReportFormat,
  SubmissionFormData,
  SubmissionStatus,
} from '../types/kra';

/** Numeric / Percentage metrics support achievement-vs-target progress math. */
export function isNumericMetric(metric: MetricType): boolean {
  return metric === 'Direct Numeric' || metric === 'Percentage';
}

export function parseAchievement(formData: SubmissionFormData): number {
  const value = parseFloat(formData.achievementClaim ?? '');
  return Number.isFinite(value) ? value : 0;
}

/**
 * progress = min(achievement / annualTarget * 100, 100)
 * Never exceeds 100. Only meaningful for numeric / percentage metrics.
 */
export function computeProgress(
  kra: KRAMaster,
  formData: SubmissionFormData
): { numericClaim: number; progress: number; isTargetExceeded: boolean } {
  if (!isNumericMetric(kra.metricType)) {
    return { numericClaim: 0, progress: 0, isTargetExceeded: false };
  }
  const numericClaim = parseAchievement(formData);
  const target = kra.annualTarget > 0 ? kra.annualTarget : 100;
  const raw = (numericClaim / target) * 100;
  const progress = Math.min(Math.round(raw * 100) / 100, 100);
  return { numericClaim, progress, isTargetExceeded: numericClaim > target };
}

/** Formats a progress value for display, e.g. 33.33% or 100%. */
export function formatProgress(progress: number): string {
  const rounded = Math.round(progress * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}%`;
}

/** Human readable achievement claim for any metric type. */
export function claimDisplay(kra: KRAMaster, formData: SubmissionFormData): string {
  switch (kra.metricType) {
    case 'Direct Numeric':
      return formData.achievementClaim ? `${formData.achievementClaim}` : '—';
    case 'Percentage':
      return formData.achievementClaim ? `${formData.achievementClaim}%` : '—';
    case 'Yes/No':
      return formData.yesNoChoice ?? '—';
    case 'Descriptive': {
      const text = (formData.descriptiveText ?? '').trim();
      if (!text) return '—';
      return text.length > 48 ? `${text.slice(0, 48)}…` : text;
    }
    case 'Evidence Based':
      return formData.evidenceStatus || '—';
    case 'Policy/Compliance':
      return formData.complianceStatus || '—';
    default:
      return '—';
  }
}

/**
 * Progress contribution used for department-level aggregation.
 *  - numeric/percentage -> capped achievement progress (returned claims reset to 0)
 *  - everything else    -> status based completion (no meaningless percentages)
 */
export function contributionProgress(
  kra: KRAMaster,
  status: SubmissionStatus,
  progress: number
): number {
  if (isNumericMetric(kra.metricType)) {
    return status === 'Returned' ? 0 : progress;
  }
  switch (status) {
    case 'Approved':
      return 100;
    case 'Submitted':
      return 75;
    case 'Draft':
      return 40;
    default:
      return 0;
  }
}

/** Short unit label for the metric (used in input suffixes). */
export function metricUnit(metric: MetricType): string {
  switch (metric) {
    case 'Percentage':
      return '%';
    case 'Direct Numeric':
      return 'count';
    default:
      return '';
  }
}

/**
 * Policy/Compliance KRAs are status based — achievement is a compliance status,
 * never a numeric value divided by the annual target. Never show
 * achievement / annualTarget style progress for these KRAs.
 */
export function hasNumericProgress(metric: MetricType): boolean {
  return isNumericMetric(metric);
}

/** Validates an external evidence URL — only http:// or https:// values are accepted. */
export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Default column layout for an XLSX-style tabular template. */
export function defaultTableColumns(): string[] {
  return ['S.No.', 'Parameter', 'Target', 'Achieved', 'Remarks'];
}

/** A completed document has real content in its narrative or its table grid. */
export function isDocFilled(doc?: CompletedDocument): boolean {
  if (!doc) return false;
  if ((doc.narrative ?? '').trim().length > 0) return true;
  const rows = doc.table?.rows ?? [];
  // Column 0 is the auto "S.No." column — it never counts as real content.
  return rows.some((row) => row.some((cell, idx) => idx > 0 && cell.trim().length > 0));
}

function findDoc(docs: CompletedDocument[] | undefined, formatId: string): CompletedDocument | undefined {
  return docs?.find((d) => d.formatId === formatId);
}

/** True when every VC-uploaded document of this kind has been completed by the Dean. */
export function documentsCompleted(
  formats: ReportFormat[],
  docs: CompletedDocument[] | undefined
): boolean {
  if (formats.length === 0) return true;
  return formats.every((f) => isDocFilled(findDoc(docs, f.id)));
}

/** Is the current bimonthly achievement entry complete for this metric type? */
export function performaCompleted(kra: KRAMaster | undefined, formData: SubmissionFormData): boolean {
  if (!kra) return false;
  switch (kra.metricType) {
    case 'Direct Numeric':
    case 'Percentage':
      return Boolean(formData.achievementClaim?.trim());
    case 'Yes/No':
      return Boolean(formData.yesNoChoice);
    case 'Descriptive':
      return Boolean(formData.descriptiveText?.trim());
    case 'Evidence Based':
      return Boolean(formData.evidenceStatus);
    case 'Policy/Compliance':
      return Boolean(formData.complianceStatus);
    default:
      return false;
  }
}

export interface SubmissionCompletion {
  performa: boolean;
  reportFormat: boolean;
  reportTemplate: boolean;
  evidence: boolean;
  /** True when the KRA actually has VC-uploaded documents of that kind. */
  hasReportFormat: boolean;
  hasReportTemplate: boolean;
}

/**
 * Completion status used by the consolidated VC KRA preview.
 * A document kind that the VC never uploaded is reported as not applicable.
 */
export function submissionCompletion(
  kra: KRAMaster | undefined,
  formData: SubmissionFormData
): SubmissionCompletion {
  const hasReportFormat = Boolean(kra && kra.prescribedReportFormats.length > 0);
  const hasReportTemplate = Boolean(kra && kra.summaryTemplates.length > 0);
  return {
    performa: performaCompleted(kra, formData),
    reportFormat: hasReportFormat
      ? documentsCompleted(kra!.prescribedReportFormats, formData.reportFormatDocs)
      : false,
    reportTemplate: hasReportTemplate
      ? documentsCompleted(kra!.summaryTemplates, formData.summaryTemplateDocs)
      : false,
    evidence: Boolean(formData.customEvidence && formData.customEvidence.length > 0),
    hasReportFormat,
    hasReportTemplate,
  };
}

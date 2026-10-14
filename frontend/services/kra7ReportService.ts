import { api } from './api';
import { KRA7ReportData } from '../types/kra';

export interface KRA7QuestionItem {
  id: number;
  statement: string;
}

export const KRA7_SURVEY_QUESTIONS: KRA7QuestionItem[] = [
  {
    id: 1,
    statement: "Curriculum is designed as per current industry need and OBE practices.",
  },
  {
    id: 2,
    statement: "Curriculum has good balance between theory and practical courses.",
  },
  {
    id: 3,
    statement: "The Curriculum enhanced employability",
  },
  {
    id: 4,
    statement: "The course content fulfils the need of students",
  },
  {
    id: 5,
    statement: "Syllabus has made me interested in the subject area",
  },
  {
    id: 6,
    statement: "The books prescribed/listed as reference materials are relevant, updated and appropriate.",
  },
  {
    id: 7,
    statement: "Freedom to propose, modify, suggest and incorporate new topics in the syllabus.",
  },
  {
    id: 8,
    statement: "The course content of the subjects increased my knowledge and perspective",
  },
  {
    id: 9,
    statement: "The laboratory experiments enhance understanding of theory concepts and enabled the students to relate with the real life problems.",
  },
  {
    id: 10,
    statement: "Institute provides adequate funding, resources and support to faculty members for upgrading their skills and qualifications.",
  },
];

export const KRA7_RATING_OPTIONS = [
  { value: 1, label: "Poor (1)", shortLabel: "Poor", color: "#e11d48" },
  { value: 2, label: "Satisfactory (2)", shortLabel: "Satisfactory", color: "#ea580c" },
  { value: 3, label: "Good (3)", shortLabel: "Good", color: "#ca8a04" },
  { value: 4, label: "Very Good (4)", shortLabel: "Very Good", color: "#2563eb" },
  { value: 5, label: "Excellent (5)", shortLabel: "Excellent", color: "#16a34a" },
];

export function getInitialKRA7ReportData(
  departmentName: string = '',
  deanName: string = '',
  deanEmail: string = '',
  academicYear: string = '2026-2027',
  existingData?: Partial<KRA7ReportData>
): KRA7ReportData {
  return {
    academicYear: existingData?.academicYear || academicYear,
    semester: existingData?.semester || 'Odd Semester (3rd, 5th, 7th)',
    department: existingData?.department || departmentName,
    facultyName: existingData?.facultyName || deanName || '',
    designation: existingData?.designation || 'Professor & Dean',
    email: existingData?.email || deanEmail || '',
    mobileNumber: existingData?.mobileNumber || '',
    subject: existingData?.subject || '',
    ratings: existingData?.ratings || {},
    overallSatisfaction: existingData?.overallSatisfaction ?? null,
    suggestions: existingData?.suggestions || '',
    signatureName: existingData?.signatureName || deanName || '',
    signatureDate: existingData?.signatureDate || new Date().toLocaleDateString('en-GB'),
    evidenceFile: existingData?.evidenceFile,
  };
}

export interface KRA7ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateKRA7Report(data: KRA7ReportData): KRA7ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.mobileNumber || !data.mobileNumber.trim()) {
    errors['mobileNumber'] = 'Mobile No. is required.';
  } else if (!/^[0-9+\s-]{8,15}$/.test(data.mobileNumber.trim())) {
    errors['mobileNumber'] = 'Please enter a valid mobile number (at least 8-10 digits).';
  }

  if (!data.subject || !data.subject.trim()) {
    errors['subject'] = 'Subject is required.';
  }

  // Validate that all 10 questions have been evaluated
  KRA7_SURVEY_QUESTIONS.forEach((q) => {
    const r = data.ratings[q.id];
    if (r === undefined || r === null || r < 1 || r > 5) {
      errors[`q_${q.id}`] = `Question #${q.id}: Please select a rating from 1 to 5.`;
    }
  });

  if (
    data.overallSatisfaction === null ||
    data.overallSatisfaction === undefined ||
    data.overallSatisfaction < 1 ||
    data.overallSatisfaction > 10
  ) {
    errors['overallSatisfaction'] = 'Overall satisfaction rating (scale of 1 to 10) is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function downloadKRA7Docx(reportData: KRA7ReportData, deptName: string) {
  try {
    const res = await api.post(
      '/api/tracker/export-kra7-docx/',
      { ...reportData, department: deptName },
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KRA_7_Curriculum_Feedback_Faculty_${deptName.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading KRA 7 DOCX export:', error);
    throw error;
  }
}

export async function downloadKRA7Pdf(reportData: KRA7ReportData, deptName: string) {
  try {
    const res = await api.post(
      '/api/tracker/export-kra7-pdf/',
      { ...reportData, department: deptName },
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KRA_7_Curriculum_Feedback_Faculty_${deptName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading KRA 7 PDF export:', error);
    throw error;
  }
}

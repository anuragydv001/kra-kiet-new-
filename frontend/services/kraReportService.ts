import { api } from './api';

export interface GenericKRAReportData {
  kraNumber: string;
  reportTitle: string;
  department: string;
  academicYear: string;
  cycle: string;
  reportDate?: string;
  preparedBy: string;
  designation: string;
  coordinatorName?: string;
  respondentName?: string;
  organization?: string;
  email?: string;
  mobileNumber?: string;
  subject?: string;
  tableTitle?: string;
  columns?: string[];
  rows?: (string | number)[][];
  surveyQuestions?: { id: number; statement: string; rating?: number | null }[];
  ratings?: Record<string | number, number>;
  ratingOptions?: string[];
  overallSatisfaction?: number | string;
  suggestions?: string;
  extraSections?: { title: string; items: { label: string; value: string }[] }[];
  narrative?: string;
  // Specific KRA custom payload fields
  [key: string]: any;
}

export async function downloadKRAGenericDocx(data: GenericKRAReportData, filename?: string) {
  try {
    const res = await api.post('/api/tracker/export-kra-docx/', data, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `KIET_KRA_${data.kraNumber}_Report.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading KRA ${data.kraNumber} DOCX:`, error);
    throw error;
  }
}

export async function downloadKRAGenericPdf(data: GenericKRAReportData, filename?: string) {
  try {
    const res = await api.post('/api/tracker/export-kra-pdf/', data, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `KIET_KRA_${data.kraNumber}_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading KRA ${data.kraNumber} PDF:`, error);
    throw error;
  }
}

import { api, isMockMode } from './api';
import { VACReportData, VACSupportingDocItem } from '../types/kra';

export const VAC_SUPPORTING_DOCS_DEFAULTS = [
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

export function getInitialVACReportData(
  departmentName: string = '',
  deanName: string = '',
  academicYear: string = '2026-2027',
  existingData?: Partial<VACReportData>
): VACReportData {
  const supportingDocuments: VACSupportingDocItem[] = VAC_SUPPORTING_DOCS_DEFAULTS.map((title, idx) => {
    const matched = existingData?.supportingDocuments?.find(d => d.title === title);
    return {
      id: idx + 1,
      title,
      attached: matched ? matched.attached : false,
      fileName: matched?.fileName,
      fileSize: matched?.fileSize,
      fileUrl: matched?.fileUrl,
      fileId: matched?.fileId
    };
  });

  return {
    academicSession: existingData?.academicSession || academicYear,
    semester: existingData?.semester || 'Odd Semester (3rd, 5th, 7th)',
    facultyCoordinator: existingData?.facultyCoordinator || deanName || '',
    hodName: existingData?.hodName || deanName || '',
    courses: existingData?.courses && existingData.courses.length > 0 ? existingData.courses : [
      {
        id: 'c-1',
        courseName: '',
        durationHours: 30,
        mode: 'Offline',
        resourcePerson: '',
        enrolled: '',
        completed: ''
      }
    ],
    syllabus: existingData?.syllabus && existingData.syllabus.length > 0 ? existingData.syllabus : [
      { id: 's-1', module: 'Module 1', topic: '', hours: 8 },
      { id: 's-2', module: 'Module 2', topic: '', hours: 8 },
      { id: 's-3', module: 'Module 3', topic: '', hours: 8 },
      { id: 's-4', module: 'Module 4', topic: '', hours: 6 },
    ],
    learningOutcomes: existingData?.learningOutcomes && existingData.learningOutcomes.length > 0
      ? existingData.learningOutcomes
      : [
          'Demonstrate practical proficiency in emerging tools and standard engineering practices.',
          'Analyze real-world problem scenarios and synthesize comprehensive solutions.',
          'Exhibit enhanced professional competencies, communication, and collaborative skills.'
        ],
    assessment: {
      method: existingData?.assessment?.method || 'Continuous Lab Evaluation, Hands-on Project, and Final Objective Assessment',
      minAttendance: existingData?.assessment?.minAttendance || '75%',
      passingCriteria: existingData?.assessment?.passingCriteria || 'Minimum 50% marks in assessment and minimum 75% attendance',
      issuingAuthority: existingData?.assessment?.issuingAuthority || 'KIET Deemed to be University',
      certificatesIssued: existingData?.assessment?.certificatesIssued ?? ''
    },
    outcomeAndImpact: {
      technicalSkills: existingData?.outcomeAndImpact?.technicalSkills || '',
      employability: existingData?.outcomeAndImpact?.employability || '',
      industryCert: existingData?.outcomeAndImpact?.industryCert || '',
      completionRate: existingData?.outcomeAndImpact?.completionRate || '',
      internships: existingData?.outcomeAndImpact?.internships || '',
      placementSupport: existingData?.outcomeAndImpact?.placementSupport || '',
      studentProjects: existingData?.outcomeAndImpact?.studentProjects || '',
      hackathons: existingData?.outcomeAndImpact?.hackathons || ''
    },
    feedback: {
      score: existingData?.feedback?.score ?? 4.5,
      suggestions: existingData?.feedback?.suggestions && existingData.feedback.suggestions.length > 0
        ? existingData.feedback.suggestions
        : [
            'Increase duration of hands-on laboratory exercises.',
            'Include more industry real-life case studies and code walkthroughs.'
          ]
    },
    preparedBy: {
      name: existingData?.preparedBy?.name || deanName || '',
      designation: existingData?.preparedBy?.designation || 'Faculty Coordinator',
      signature: existingData?.preparedBy?.signature || 'Digitally verified on portal',
      date: existingData?.preparedBy?.date || new Date().toLocaleDateString('en-GB')
    },
    approvedBy: {
      name: existingData?.approvedBy?.name || deanName || '',
      designation: existingData?.approvedBy?.designation || 'Head of Department',
      signature: existingData?.approvedBy?.signature || '',
      date: existingData?.approvedBy?.date || ''
    },
    supportingDocuments
  };
}

export interface VACValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateVACReport(data: VACReportData): VACValidationResult {
  const errors: Record<string, string> = {};

  if (!data.facultyCoordinator || !data.facultyCoordinator.trim()) {
    errors['facultyCoordinator'] = 'Faculty Coordinator name is required.';
  }

  if (!data.courses || data.courses.length === 0) {
    errors['courses'] = 'At least one Value Added Course row is required.';
  } else {
    data.courses.forEach((c, idx) => {
      if (!c.courseName || !c.courseName.trim()) {
        errors[`course_${idx}_name`] = `Course #${idx + 1}: Name cannot be empty.`;
      }
      if (c.durationHours === '' || Number(c.durationHours) <= 0) {
        errors[`course_${idx}_duration`] = `Course #${idx + 1}: Duration must be greater than 0.`;
      }
      if (!c.resourcePerson || !c.resourcePerson.trim()) {
        errors[`course_${idx}_resource`] = `Course #${idx + 1}: Resource Person/Agency is required.`;
      }
      if (c.enrolled === '' || Number(c.enrolled) < 0) {
        errors[`course_${idx}_enrolled`] = `Course #${idx + 1}: Enrolled students must be 0 or more.`;
      }
      if (c.completed === '' || Number(c.completed) < 0) {
        errors[`course_${idx}_completed`] = `Course #${idx + 1}: Completed students must be 0 or more.`;
      } else if (Number(c.completed) > Number(c.enrolled)) {
        errors[`course_${idx}_completed_exceed`] = `Course #${idx + 1}: Completed students (${c.completed}) cannot exceed enrolled (${c.enrolled}).`;
      }
    });
  }

  // Validate Syllabus
  if (data.syllabus && data.syllabus.length > 0) {
    data.syllabus.forEach((s, idx) => {
      if (s.hours !== '' && Number(s.hours) < 0) {
        errors[`syl_${idx}_hours`] = `Module #${idx + 1}: Hours cannot be negative.`;
      }
    });
  }

  // Feedback score validation (0 to 5)
  if (data.feedback && data.feedback.score !== '') {
    const sc = Number(data.feedback.score);
    if (isNaN(sc) || sc < 0 || sc > 5) {
      errors['feedback_score'] = 'Overall feedback score must be between 0.0 and 5.0.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export async function uploadEvidenceFile(
  file: File,
  documentType: string,
  kraCode: string = 'KRA 1',
  cycle: string = 'July - August'
): Promise<{ id: number; filename: string; file_url: string; file_size_kb: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('kra_code', kraCode);
  formData.append('cycle', cycle);

  const res = await api.post('/api/tracker/evidence-file/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteEvidenceFile(fileId: number): Promise<void> {
  await api.delete(`/api/tracker/evidence-file/${fileId}/`);
}

export async function downloadVACDocx(reportData: VACReportData, deptName: string) {
  try {
    const res = await api.post(
      '/api/tracker/export-vac-docx/',
      { ...reportData, department: deptName },
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KIET_VAC_Report_${deptName.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading DOCX export:', error);
    throw error;
  }
}

export async function downloadVACPdf(reportData: VACReportData, deptName: string) {
  try {
    const res = await api.post(
      '/api/tracker/export-vac-pdf/',
      { ...reportData, department: deptName },
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KIET_VAC_Report_${deptName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF export:', error);
    throw error;
  }
}
